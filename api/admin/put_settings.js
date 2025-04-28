/* eslint-disable no-useless-escape */

const Joi = require('@hapi/joi');
const storage = require('../../lib/storage');

const logoPathRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const colorRegex = /^#[A-Fa-f0-9]{6}/;

// For validation, keep existing required
// fields, but let users send a customDomain
// only if they'd like
module.exports = () => ({
  method: 'PUT',
  options: {
    auth: {
      strategies: ['jwt']
    },
    validate: {
      payload: Joi.object({
        template: Joi.string(),
        locale: Joi.string(),
        title: Joi.string(),
        color: Joi.string().regex(colorRegex),
        logoPath: Joi.string()
          .regex(logoPathRegex)
          .allow(''),
        removeOverlay: Joi.bool().default(false),
        customDomain: Joi.string().allow('')
      }).and('template', 'locale', 'title', 'color') // If one exists, all are required
    }
  },
  path: '/admin/settings',
  handler: async (req, h) => {
    const settings = await storage.setSettings(req.payload);

    return h.response(settings).code(200);
  }
});
