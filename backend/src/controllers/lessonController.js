const BaseController = require('./baseController');
const lessonRepository = require('../repositories/lessonRepository');
const { sendResponse } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');

class LessonController extends BaseController {
  constructor() {
    super(lessonRepository);
  }
}

module.exports = new LessonController();
