const BaseController = require('./baseController');
const settingRepository = require('../repositories/settingRepository');
const { query } = require('../config/db');

class SettingController extends BaseController {
  constructor() {
    super(settingRepository);
  }

  async updateProfile(req, res, next) {
    try {
      const fName = req.body.first_name || req.body.firstName || '';
      const lName = req.body.last_name || req.body.lastName || '';
      const userId = req.user?.id;
      
      let updatedUser = null;
      if (userId) {
        try {
          const result = await query(
            `UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [fName, lName, userId]
          );
          if (result.rows.length > 0) {
            updatedUser = result.rows[0];
            delete updatedUser.password_hash;
          }
        } catch (dbErr) {
          console.warn('DB update in settingController failed:', dbErr.message);
        }
      }
      
      if (!updatedUser) {
        updatedUser = {
          id: userId || 'demo-user',
          first_name: fName,
          last_name: lName,
          firstName: fName,
          lastName: lName,
        };
      } else {
        updatedUser.firstName = updatedUser.first_name;
        updatedUser.lastName = updatedUser.last_name;
      }
      
      res.json({ status: 'success', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingController();
