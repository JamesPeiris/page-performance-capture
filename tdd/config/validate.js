const Joi = require('joi');

const configSchema = Joi.object().keys({
    pages: Joi.array().items().required().error(() => 'A "pages" array is required.'),
}).required().error((errors) => console.log(errors));

// TODO: Whyyyy won't the errors get thrown as expected!?
module.exports = {
    validate: (config) => {
        // console.log(config);
        const result = configSchema.validate(config);
        // console.log(result);

        // if (result) throw new Error(result);
    },
    validateDefaults: () => {}, // TODO
};
