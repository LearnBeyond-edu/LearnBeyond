const BaseController = require('./baseController');
const classRepository = require('../repositories/classRepository');
const { sendResponse } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');

class ClassController extends BaseController {
  constructor() {
    super(classRepository);
  }

  create = async (req, res, next) => {
    try {
      const newClass = await this.repository.create(req.body);
      sendResponse(res, 201, 'Class created successfully', newClass);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const updatedClass = await this.repository.update(req.params.id, req.body);
      if (!updatedClass) throw new ApiError(404, 'Class not found');
      sendResponse(res, 200, 'Class updated successfully', updatedClass);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ClassController();
