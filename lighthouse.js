const lighthouse = require('lighthouse');
const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');

const getAveragesTDD = require('./tdd/utils/averages');
const createSequentialRun = require('./utils/promises');

const startRunLighthouse = async ({ url, cookie, emulateMobile }) => {
    const chrome = await chromeLauncher.launch();

    const opts = {
        port: chrome.port,
    };

    if (cookie) {
        const client = await CDP({ port: opts.port });
        const { Network } = client;

        await Network.enable();
        await Network.setCookie(cookie);
    }

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

module.exports = async ({ url, cookie, repetitions, emulateMobile }) => {
    // Create a (sequential) chain of promises (of "individual page runs")
    const runs = await createSequentialRun(
        repetitions,
        async (statsArray) => {
            const currentStats = await startRunLighthouse({ url, cookie, emulateMobile });
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
