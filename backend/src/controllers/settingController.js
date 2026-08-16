const BaseController = require('./baseController');
const settingRepository = require('../repositories/settingRepository');
const { query } = require('../config/db');

class SettingController extends BaseController {
  constructor() {
    super(settingRepository);
  }

  async updateProfile(req, res, next) {
    try {
      const { first_name, last_name } = req.body;
      const userId = req.user.id;
      
      const result = await query(
        `UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [first_name, last_name, userId]
      );
      
      const updatedUser = result.rows[0];
      delete updatedUser.password_hash;
      
      res.json({ status: 'success', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingController();
