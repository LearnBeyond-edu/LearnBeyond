const { sendResponse } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');

class BaseController {
  constructor(repository) {
    this.repository = repository;
  }

  getAll = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const cursor = req.query.cursor || null;
      
      let additionalWhere = '';
      const params = [];

      // Global Data Isolation (IDOR Protection)
      if (req.user && req.user.role_name !== 'Platform Admin') {
        const table = this.repository.tableName;
        
        // Isolate personal data by user_id
        if (['conversations', 'laura_memory', 'settings', 'notifications', 'feedback'].includes(table)) {
          additionalWhere = 'user_id = $1';
          params.push(req.user.id);
        }
        // Isolate institutional data by institution_id
        else if (req.user.institution_id && ['classes', 'student_profiles', 'staff_profiles', 'parent_profiles', 'therapist_profiles', 'users', 'institutions'].includes(table)) {
          if (table === 'student_profiles' && req.user.role_name === 'Parent') {
            additionalWhere = 'institution_id = $1 AND user_id IN (SELECT student_id FROM parent_profiles WHERE user_id = $2)';
            params.push(req.user.institution_id, req.user.id);
          } else if (table === 'institutions') {
             additionalWhere = 'id = $1';
             params.push(req.user.institution_id);
          } else {
             additionalWhere = 'institution_id = $1';
             params.push(req.user.institution_id);
          }
        }
      }

      // Generic query filters
      const filterKeys = Object.keys(req.query).filter(k => k !== 'limit' && k !== 'cursor');
      filterKeys.forEach(key => {
         if (additionalWhere) {
             additionalWhere += ` AND ${key} = $${params.length + 1}`;
         } else {
             additionalWhere = `${key} = $${params.length + 1}`;
         }
         params.push(req.query[key]);
      });

      const { data, meta } = await this.repository.findAll(limit, cursor, additionalWhere, params);
      sendResponse(res, 200, 'Data retrieved successfully', data, meta);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req, res, next) => {
    try {
      const record = await this.repository.findById(req.params.id);
      if (!record) throw new ApiError(404, 'Record not found');

      // IDOR Protection on GET
      if (req.user && req.user.role_name !== 'Platform Admin') {
         const table = this.repository.tableName;
         const isPersonalTable = ['conversations', 'laura_memory', 'settings', 'notifications', 'feedback'].includes(table);
         if (isPersonalTable && record.user_id && record.user_id !== req.user.id) {
            throw new ApiError(403, 'Access denied: Data isolation violation');
         }
         
         const isInstitutionTable = ['classes', 'student_profiles', 'staff_profiles', 'parent_profiles', 'therapist_profiles', 'users'].includes(table);
         if (isInstitutionTable && record.institution_id && req.user.institution_id && record.institution_id !== req.user.institution_id) {
            throw new ApiError(403, 'Access denied: Tenant isolation violation');
         }
      }

      sendResponse(res, 200, 'Record retrieved successfully', record);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      // IDOR Protection on DELETE
      if (req.user && req.user.role_name !== 'Platform Admin') {
         const record = await this.repository.findById(req.params.id);
         if (record) {
            const table = this.repository.tableName;
            const isPersonalTable = ['conversations', 'laura_memory', 'settings', 'notifications', 'feedback'].includes(table);
            if (isPersonalTable && record.user_id && record.user_id !== req.user.id) {
               throw new ApiError(403, 'Access denied: Data isolation violation');
            }
            const isInstitutionTable = ['classes', 'student_profiles', 'staff_profiles', 'parent_profiles', 'therapist_profiles', 'users'].includes(table);
            if (isInstitutionTable && record.institution_id && req.user.institution_id && record.institution_id !== req.user.institution_id) {
               throw new ApiError(403, 'Access denied: Tenant isolation violation');
            }
         }
      }

      await this.repository.delete(req.params.id);
      sendResponse(res, 200, 'Record deleted successfully');
    } catch (error) {
      next(error);
    }
  };
  create = async (req, res, next) => {
    try {
      // Automatically assign created_by or institution_id if available and applicable
      const data = { ...req.body };
      const table = this.repository.tableName;
      const excludeCreatedBy = ['notifications', 'settings', 'laura_memory', 'feedback'];
      const excludeInstitutionId = ['notifications', 'settings', 'laura_memory', 'feedback', 'institutions'];

      if (req.user && !data.created_by && !excludeCreatedBy.includes(table)) {
         data.created_by = req.user.id;
      }
      if (req.user && req.user.institution_id && !data.institution_id && !excludeInstitutionId.includes(table)) {
         data.institution_id = req.user.institution_id;
      }

      const record = await this.repository.create(data);
      res.status(201).json({ status: 'success', data: record });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      // IDOR Protection on UPDATE
      if (req.user && req.user.role_name !== 'Platform Admin') {
         const existingRecord = await this.repository.findById(req.params.id);
         if (existingRecord) {
            const table = this.repository.tableName;
            const isPersonalTable = ['conversations', 'laura_memory', 'settings', 'notifications', 'feedback'].includes(table);
            if (isPersonalTable && existingRecord.user_id && existingRecord.user_id !== req.user.id) {
               throw new ApiError(403, 'Access denied: Data isolation violation');
            }
            const isInstitutionTable = ['classes', 'student_profiles', 'staff_profiles', 'parent_profiles', 'therapist_profiles', 'users'].includes(table);
            if (isInstitutionTable && existingRecord.institution_id && req.user.institution_id && existingRecord.institution_id !== req.user.institution_id) {
               throw new ApiError(403, 'Access denied: Tenant isolation violation');
            }
         }
      }

      const record = await this.repository.update(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ status: 'error', message: 'Record not found' });
      }
      res.json({ status: 'success', data: record });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BaseController;
