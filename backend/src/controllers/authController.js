const authService = require('../services/authService');
const { sendResponse } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');

class AuthController {
  async register(req, res, next) {
    try {
      const data = { ...req.body };
      if (!data.institution_id && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(token);
          if (decoded) {
            if (decoded.institution_id) {
              data.institution_id = decoded.institution_id;
            } else if (decoded.id) {
              // Fallback for older tokens: get from DB
              const { getClient } = require('../config/db');
              const dbClient = await getClient();
              try {
                const resDb = await dbClient.query('SELECT institution_id FROM users WHERE id = $1', [decoded.id]);
                if (resDb.rows.length > 0 && resDb.rows[0].institution_id) {
                  data.institution_id = resDb.rows[0].institution_id;
                }
              } finally {
                dbClient.release();
              }
            }
          }
        }
      }
      
      if (!data.institution_id || data.institution_id === "") {
        // Fallback for Platform Admins testing the School Dashboard
        // If they still don't have an institution_id, assign them to the first available institution
        const { getClient } = require('../config/db');
        const fallbackClient = await getClient();
        try {
          const fallbackRes = await fallbackClient.query('SELECT id FROM institutions LIMIT 1');
          if (fallbackRes.rows.length > 0) {
            data.institution_id = fallbackRes.rows[0].id;
          } else {
            data.institution_id = null;
          }
        } finally {
          fallbackClient.release();
        }
      }
      
      const user = await authService.registerUser(data);
      sendResponse(res, 201, 'User registered successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      sendResponse(res, 200, 'Login successful', data);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new ApiError(400, 'Refresh token is required');
      const data = await authService.refresh(refreshToken);
      sendResponse(res, 200, 'Token refreshed successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];
      
      await authService.logout(accessToken, refreshToken);
      sendResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const { getClient } = require('../config/db');
      const client = await getClient();
      let fullUser;
      try {
        const userRes = await client.query('SELECT id, first_name as "firstName", last_name as "lastName", email, phone, bio, address, cover_image, profile_photo, role_id, laura_state, app_state FROM users WHERE id = $1', [req.user.id]);
        fullUser = userRes.rows[0];
      } finally {
        client.release();
      }
      sendResponse(res, 200, 'Current user data', { user: { ...req.user, ...fullUser } });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      sendResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) throw new ApiError(400, 'Old and new passwords are required');
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      sendResponse(res, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
