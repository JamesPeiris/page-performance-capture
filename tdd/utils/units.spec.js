const secondsToMillis = require('./units');

describe('Units', () => {
    it('Given a value in seconds should convert it to milliseconds', () => {
        expect(secondsToMillis(21)).toEqual(21000);
    });
});
