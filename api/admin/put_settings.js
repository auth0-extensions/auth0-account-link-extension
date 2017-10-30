import Joi from 'joi';
import { setSettings } from '../../lib/storage';

module.exports = () => ({
  method: 'PUT',
  config: {
    auth: 'jwt',
    validate: {
      payload: {
        template: Joi.string().required(),
        locale: Joi.string().required(),
        title: Joi.string().required(),
        color: Joi.string().required(),
        logoPath: Joi.string().allow('')
      }
    }
  },
  path: '/admin/settings',
  handler: (req, reply) => {
    setSettings(req.payload).then((response) => {
      reply(response);
    });
  }
});
