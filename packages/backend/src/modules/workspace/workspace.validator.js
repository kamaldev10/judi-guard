import Joi from 'joi';

export const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': `"email" harus berupa alamat email yang valid`,
    'any.required': `"email" tidak boleh kosong`,
  }),
});

export const assignRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'member').required().messages({
    'any.only': `"role" harus bernilai admin atau member`,
    'any.required': `"role" tidak boleh kosong`,
  }),
});

export const assignPermissionsSchema = Joi.object({
  grant: Joi.array().items(Joi.string()).default([]),
  deny: Joi.array().items(Joi.string()).default([]),
});
