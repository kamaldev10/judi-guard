const Joi = require("joi");

const submitVideoSchema = Joi.object({
  videoUrl: Joi.string()
    .uri({
      scheme: ["http", "https"],
    })
    .required()
    .messages({
      "string.uri": '"videoUrl" harus berupa URL yang valid (http atau https)',
      "any.required": '"videoUrl" tidak boleh kosong',
    }),
  //   userId: Joi.string().required().messages({ ... }),
});

module.exports = {
  submitVideoSchema,
};
