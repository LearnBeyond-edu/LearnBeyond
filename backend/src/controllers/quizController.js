const BaseController = require('./baseController');
const quizRepository = require('../repositories/quizRepository');

class QuizController extends BaseController {
  constructor() {
    super(quizRepository);
    
    const originalCreate = this.create;
    const originalUpdate = this.update;
    
    this.create = async (req, res, next) => {
      try {
        if (req.body.questions && typeof req.body.questions !== 'string') {
          req.body.questions = JSON.stringify(req.body.questions);
        }
        return await originalCreate(req, res, next);
      } catch (error) {
        next(error);
      }
    };

    this.update = async (req, res, next) => {
      try {
        if (req.body.questions && typeof req.body.questions !== 'string') {
          req.body.questions = JSON.stringify(req.body.questions);
        }
        return await originalUpdate(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = new QuizController();
