const defaultConfig = require('./default');
const { validateDefaults } = require('./validate');

describe('Default Config', () => {
    it('Must pass the config validation', () => {
        expect(() => validateDefaults(defaultConfig)).not.toThrow();
    });
});
