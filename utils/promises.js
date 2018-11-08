module.exports = (repetitions, callback) => {
    const iterable = Array.from(Array(repetitions));

    return iterable.reduce(acc => acc.then(callback), Promise.resolve([]))
        .catch(err => console.error(err));
};
