const getAverages = require('./averages');

describe('Averages', () => {
    it('Given a non-array input, throws an error', () => {
        expect(() => getAverages()).toThrow('Input must be an array.');
        expect(() => getAverages(1)).toThrow('Input must be an array.');
        expect(() => getAverages({})).toThrow('Input must be an array.');
        expect(() => getAverages('')).toThrow('Input must be an array.');
        expect(() => getAverages(null)).toThrow('Input must be an array.');
    });

    it('Given an array of one empty object, returns with the empty object', () => {
        const input = [{}];
        expect(getAverages(input)).toEqual({});
    });

    it('Given an array of one object, returns with the object', () => {
        const input = [{
            scoreA: 5,
            scoreB: 4,
        }];

        expect(getAverages(input)).toEqual({
            scoreA: 5,
            scoreB: 4,
        });
    });

    it('Given an array of multiple objects, returns with an object containing the averages', () => {
        const input = [
            {
                scoreA: 5,
                scoreB: 4,
            },
            {
                scoreA: 7,
                scoreB: 2,
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 6,
            scoreB: 3,
        });
    });

    it('Given an array of multiple objects where not all properties match, returns the correct averages for each individual property', () => {
        const input = [
            {
                scoreA: 5,
                scoreB: 4,
            },
            {
                scoreA: 7,
                scoreB: 2,
            },
            {
                scoreA: 18,
                scoreC: 4,
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 10,
            scoreB: 3,
            scoreC: 4,
        });
    });

    it('Ignores non-number properties', () => {
        const input = [
            {
                scoreA: '5',
                scoreB: true,
                scoreC: 6,
            },
            {
                scoreA: 6,
                scoreB: 2,
            },
            {
                scoreA: 18,
                scoreC: 4,
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 12,
            scoreB: 2,
            scoreC: 5,
        });
    });

    it('If an average couldn\'t be taken, return null to indicate an attempt, but also a failure', () => {
        const input = [
            {
                scoreA: 5,
                scoreB: '',
            },
            {
                scoreA: 7,
                scoreB: true,
            },
            {
                scoreA: 9,
                scoreB: {},
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 7,
            scoreB: null,
        });
    });

    it('Same as above but different scenario - ensure null averages are returned', () => {
        const input = [
            {
                scoreA: 5,
                scoreB: undefined,
            },
            {
                scoreA: 7,
            },
            {
                scoreA: 9,
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 7,
            scoreB: null,
        });
    });

    it('Ensure averages of 0 are returned', () => {
        const input = [
            {
                scoreA: 5,
                scoreB: 0,
            },
            {
                scoreA: 7,
                scoreB: -1,
            },
            {
                scoreA: 9,
                scoreB: 1,
            },
        ];

        expect(getAverages(input)).toEqual({
            scoreA: 7,
            scoreB: 0,
        });
    });
});
