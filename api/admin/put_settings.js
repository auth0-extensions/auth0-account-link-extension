/* eslint-disable no-useless-escape */

const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const storage = require('../../lib/storage');

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const colorRegex = /^#[A-Fa-f0-9]{6}/;

module.exports = () => ({
  method: 'PUT',
  options: {
    auth: {
      strategies: ['jwt'],
      scope: ['profile']
    },
    validate: {
      payload: {
        template: Joi.string().required(),
        locale: Joi.string().required(),
        title: Joi.string().required(),
        color: Joi.string()
          .regex(colorRegex)
          .required(),
        logoPath: Joi.string()
          .regex(urlRegex)
          .allow(''),
        removeOverlay: Joi.bool().default(false)
      }
    }
  },
  path: '/admin/settings',
  handler: async (req, h) => {
    try {
      const settings = await storage.setSettings(req.payload);

      return h.response(settings).code(200);
    } catch (error) {
      return Boom.serverUnavailable(error);
    }
  }
});
