const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const getAveragesTDD = require('./tdd/utils/averages');
const createSequentialRun = require('./utils/promises');

const startRunLighthouse = async ({ url, emulateMobile }) => {
    const chrome = await chromeLauncher.launch();

    const opts = {
        port: chrome.port,
    };

    if (!emulateMobile) opts.emulatedFormFactor = 'none';

    const { lhr } = await lighthouse(url, opts);

    await chrome.kill();

    const results = {};

    Object.keys(lhr.categories)
        .forEach((category) => {
            const { title, score } = lhr.categories[category];
            results[title] = score;
        });

    return results;
};

module.exports = async ({ url, repetitions, emulateMobile }) => {
    // Create a (sequential) chain of promises (of "individual page runs")
    const runs = await createSequentialRun(
        repetitions,
        async (statsArray) => {
            const currentStats = await startRunLighthouse({ url, emulateMobile });
            return [...statsArray, currentStats];
        },
    );

    const averages = getAveragesTDD(runs);

    return {
        url,
        runs,
        averages,
        emulateMobile,
    };
};
