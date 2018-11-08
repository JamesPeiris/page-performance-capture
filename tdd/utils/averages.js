module.exports = (array) => {
    if (!Array.isArray(array)) throw new Error('Input must be an array.');

    const baseObject = {};

    // Populate base object with all properties in each object of the input array
    array.forEach((object) => {
        Object.keys(object).forEach((key) => {
            baseObject[key] = { value: 0, inputSetLength: 0 };
        });
    });

    // Get totals for each object in the input array
    const totals = array.reduce((acc, curr) => {
        const newObject = { ...acc };

        // Do the following for each property in the current object
        Object.keys(curr).forEach((key) => {
            // Ignore value if it is not a number
            if ((typeof curr[key]) !== 'number') return;

            // Add previous and new values
            const newValue = acc[key].value + curr[key];
            const newInputSetLength = acc[key].inputSetLength + 1;

            // Assign new values for this property
            newObject[key] = {
                value: newValue,
                inputSetLength: newInputSetLength,
            };
        });

        // Return the object with its accumulated totals
        return newObject;
    }, baseObject);

    const averages = {};

    Object.keys(totals).forEach((key) => {
        // If no values from the set could be used, return null to indicate an attempt
        if (totals[key].inputSetLength === 0) {
            averages[key] = null;
            return;
        }

        averages[key] = totals[key].value / totals[key].inputSetLength;
    });

    return averages;
};
