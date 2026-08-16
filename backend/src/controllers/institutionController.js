const institutionRepository = require('../repositories/institutionRepository');
const { sendResponse } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');

class InstitutionController {
  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      
      const { data, total } = await institutionRepository.findAll(limit, offset);
      sendResponse(res, 200, 'Institutions retrieved successfully', data, { total, limit, offset });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      
      const { data, total } = await institutionRepository.findAllWithHistory(limit, offset);
      sendResponse(res, 200, 'Institutions history retrieved successfully', data, { total, limit, offset });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const institution = await institutionRepository.findById(req.params.id);
      if (!institution) throw new ApiError(404, 'Institution not found');
      
      sendResponse(res, 200, 'Institution retrieved successfully', institution);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { password, contact_email, name, ...rest } = req.body;
      const institution = await institutionRepository.create({ ...rest, contact_email, name });
      
      if (password && contact_email) {
        // Fetch role_id for Institution Admin
        const { query } = require('../config/db');
        const roleRes = await query(`SELECT id FROM roles WHERE role_name = 'Institution Admin'`);
        if (roleRes.rows.length > 0) {
          const authService = require('../services/authService');
          await authService.registerUser({
            email: contact_email,
            password: password,
            role_id: roleRes.rows[0].id,
            first_name: 'School',
            last_name: 'Admin',
            institution_id: institution.id
          });
        }
      }

      sendResponse(res, 201, 'Institution created successfully', institution);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const institution = await institutionRepository.update(req.params.id, req.body);
      if (!institution) throw new ApiError(404, 'Institution not found');
      
      sendResponse(res, 200, 'Institution updated successfully', institution);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await institutionRepository.delete(req.params.id);
      sendResponse(res, 200, 'Institution deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstitutionController();
