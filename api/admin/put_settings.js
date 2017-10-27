import Joi from 'joi';
import { setSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'PUT',
  config: {
    auth: 'jwt',
    validate: {
      payload: {
        template: Joi.string().required(),
        locale: Joi.string().required()
      }
    }
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    reply(setSettings(req.payload));
  }
});
