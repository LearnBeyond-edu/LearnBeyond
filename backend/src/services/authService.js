const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const { getClient } = require('../config/db');
const redis = require('../config/redis');

class AuthService {
  async registerUser(userData) {
    const { email, password, role, ...profileData } = userData;
    let { role_id } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const client = await getClient();
    let roleName = null;

    if (!role_id && role) {
      const res = await client.query('SELECT id FROM roles WHERE role_name = $1', [role]);
      if (res.rows.length > 0) role_id = res.rows[0].id;
      roleName = role;
    } else if (role_id) {
      roleName = await userRepository.getRoleNameById(role_id);
    }

    if (!role_id || !roleName) {
      client.release();
      throw new ApiError(400, 'Invalid role or role_id');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await client.query('BEGIN');
      
      if (roleName === 'Student' && profileData.institution_id) {
        const instRes = await client.query('SELECT subscription_plan FROM institutions WHERE id = $1', [profileData.institution_id]);
        if (instRes.rows.length > 0) {
          const plan = instRes.rows[0].subscription_plan || 'Starter';
          let limit = 100;
          if (plan === 'Professional') limit = 500;
          if (plan === 'Enterprise') limit = Infinity;
          
          const countRes = await client.query('SELECT COUNT(*) as cnt FROM student_profiles WHERE institution_id = $1', [profileData.institution_id]);
          const currentCount = parseInt(countRes.rows[0].cnt);
          if (currentCount >= limit) {
            throw new ApiError(403, `Institution has reached its ${plan} plan limit of ${limit} students.`);
          }
        }
      }
      
      const newUser = await userRepository.createUser({ 
        email, 
        passwordHash, 
        role_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        institution_id: profileData.institution_id
      }, client);
      
      await userRepository.createProfile(newUser.id, profileData, roleName, client);

      await client.query('COMMIT');
      
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.is_active) {
      throw new ApiError(403, 'Account is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload = {
      id: user.id,
      role_name: user.role_name,
      institution_id: user.institution_id
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    const refreshToken = uuidv4();
    // Store refresh token in Redis mapped to user ID, valid for 7 days
    await redis.set(`refresh_token:${refreshToken}`, user.id, 'EX', 7 * 24 * 60 * 60);

    delete user.password_hash;

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    const userId = await redis.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.is_active) {
      throw new ApiError(401, 'User no longer valid');
    }

    // Refresh Token Rotation (invalidate old, create new)
    await redis.del(`refresh_token:${refreshToken}`);
    const newRefreshToken = uuidv4();
    await redis.set(`refresh_token:${newRefreshToken}`, user.id, 'EX', 7 * 24 * 60 * 60);

    const payload = {
      id: user.id,
      role_name: user.role_name,
      institution_id: user.institution_id
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(accessToken, refreshToken) {
    if (refreshToken) {
      await redis.del(`refresh_token:${refreshToken}`);
    }
    if (accessToken) {
      // Decode without verifying to get expiration
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redis.set(`blocklist:${accessToken}`, 'revoked', 'EX', ttl);
        }
      }
    }
  }

  async logoutAllDevices(userId) {
    // Requires keeping track of all refresh tokens per user in a Redis SET
    // For simplicity, we could implement a session generation ID in the JWT payload
    // and store the current active session generation in Redis, incrementing it here.
    const currentGen = await redis.incr(`user_session_gen:${userId}`);
    return currentGen;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) throw new ApiError(401, 'Incorrect old password');

    const newHash = await bcrypt.hash(newPassword, 10);
    const client = await getClient();
    try {
      await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
    } finally {
      client.release();
    }
  }

  async updateProfile(userId, profileData) {
    const { bio, phone, address, cover_image, profile_photo, laura_state, app_state } = profileData;
    const client = await getClient();
    try {
      const updates = [];
      const values = [];
      let i = 1;
      
      if (bio !== undefined) { updates.push(`bio = $${i++}`); values.push(bio); }
      if (phone !== undefined) { updates.push(`phone = $${i++}`); values.push(phone); }
      if (address !== undefined) { updates.push(`address = $${i++}`); values.push(address); }
      if (cover_image !== undefined) { updates.push(`cover_image = $${i++}`); values.push(cover_image); }
      if (profile_photo !== undefined) { updates.push(`profile_photo = $${i++}`); values.push(profile_photo); }
      if (laura_state !== undefined) { updates.push(`laura_state = $${i++}`); values.push(laura_state); }
      if (app_state !== undefined) { updates.push(`app_state = $${i++}`); values.push(app_state); }
      
      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`;
        await client.query(query, values);
      }
      
      const userRes = await client.query('SELECT id, first_name as "firstName", last_name as "lastName", email, phone, bio, address, cover_image, profile_photo, laura_state, app_state FROM users WHERE id = $1', [userId]);
      return userRes.rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = new AuthService();
