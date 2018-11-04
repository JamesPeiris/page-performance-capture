const fs = require('fs');
const puppeteer = require('puppeteer');

const getAverages = require('./utils/averages');
const validateConfig = require('./utils/validate');
const markdownConverter = require('./utils/markdown');
const combineConfigs = require('./utils/combine-configs');

const programDefaults = {
    timeout: 30,
    repetitions: 3,
    pageWaitOnLoad: 2,
    headless: false,
    showDevTools: false,
    viewPort: {
        width: 1440,
        height: 900,
    },
};

// /////////////////////////////////////////////////////////////// //

const startChromium = ({ headless, viewPort: { width, height }, showDevTools }) => (
    puppeteer.launch({
        devtools: showDevTools,
        headless: Boolean(headless),
        args: [
            `--window-size=${width},${height}`,
        ],
    })
);

// /////////////////////////////////////////////////////////////// //

const startRun = async ({
    url, timeout, viewPort, getRequestStatsFor, pageWaitOnLoad, headless, showDevTools,
}) => {
    const browser = await startChromium({ headless, viewPort, showDevTools });

    const [page] = await browser.pages();

    await page.setViewport(viewPort);
    await page.setDefaultNavigationTimeout(timeout * 1000); // (seconds -> ms)

    const customRequestRegExp = new RegExp(getRequestStatsFor);

    const devToolsResponses = {
        all: {},
        custom: {},
    };

    // Do NOT use with (await page.setRequestInterception(true))
    const devTools = await page.target().createCDPSession();
    await devTools.send('Network.enable');

    devTools.on('Network.responseReceived', ({ response, requestId }) => {
        const responseData = {
            url: response.url,
        };

        if (customRequestRegExp.test(response.url)) {
            devToolsResponses.custom[requestId] = responseData;
        }

        devToolsResponses.all[requestId] = responseData;
    });

    await page.goto(url);
    await page.waitFor(pageWaitOnLoad * 1000); // (seconds -> ms)

    const totalRequests = Object.keys(devToolsResponses.all).length;
    const totalCustomRequests = Object.keys(devToolsResponses.custom).length;

    const pagePerformanceData = JSON.parse(
        await page.evaluate(() => JSON.stringify(performance.toJSON())), // eslint-disable-line
    );

    const {
        loadEventEnd,
        navigationStart,
        domContentLoadedEventEnd,
    } = pagePerformanceData.timing;

    const pageLoadTime = (loadEventEnd - navigationStart) / 1000; // (seconds)
    const domContentLoadedTime = (domContentLoadedEventEnd - navigationStart) / 1000; // (seconds)

    const stats = {
        pageLoadTime,
        domContentLoadedTime,
        totalRequests,
        totalCustomRequests,
    };

    await browser.close();

    return stats;
};

// /////////////////////////////////////////////////////////////// //

const testPage = async (pageTestConfig) => {
    const {
        url,
        timeout,
        viewPort,
        headless,
        repetitions,
        showDevTools,
        pageWaitOnLoad,
        getRequestStatsFor,
    } = pageTestConfig;

    const iterable = Array.from(Array(repetitions));

    // Create a (sequential) chain of promises (of "individual page runs")
    const runs = await iterable.reduce(
        (acc, _) => acc.then(async (statsArray) => {
            const currentStats = await startRun({
                url, timeout, viewPort, getRequestStatsFor, pageWaitOnLoad, headless, showDevTools,
            });
            return [...statsArray, currentStats];
        }),
        Promise.resolve([]),
    )
        .catch(err => console.error(err));

    return {
        url,
        runs,
        averages: getAverages({ runs, repetitions }),
    };
};

// /////////////////////////////////////////////////////////////// //

module.exports = async ({ config, output = '' }) => {
    let configData;

    try {
        if (typeof config === 'string') {
            if (config.slice(-5) === '.json') {
                configData = JSON.parse(fs.readFileSync(config, 'utf8'));
            } else {
                configData = JSON.parse(config);
            }
        } else {
            configData = config;
        }
    } catch (error) {
        console.error('Aborting: Could not read config - please check your config file exists and contains no syntax errors.');
        process.exit(1);
    }

    try {
        await validateConfig(configData);
    } catch (error) {
        console.error('Aborting: Error(s) with config.');
        console.error(error.name, error.details);
        process.exit(1);
    }

    const { pages = [], defaults: userDefaults = {} } = configData;

    const defaultConfig = combineConfigs(userDefaults, programDefaults);

    // Create a (sequential) chain of promises (of "whole pages runs")
    const results = await pages.reduce(
        (acc, page) => acc.then(async (pageStatsArray) => {
            const pageConfig = combineConfigs(page, defaultConfig);
            const currentPageStats = await testPage(pageConfig);
            return [...pageStatsArray, currentPageStats];
        }),
        Promise.resolve([]),
    ).catch(error => error);

    if (results.error) {
        console.error(results.error);
        process.exit(1);
    }

    const data = { results };

    if (output.slice(-5) === '.json') {
        console.info(`Outputting stats to ${output}`);
        fs.writeFileSync(output, JSON.stringify(data, null, 3));
    } else if (output.slice(-3) === '.md') {
        console.info(`Outputting stats to ${output}`);
        const markdown = markdownConverter(data);
        fs.writeFileSync(output, markdown);
    } else {
        console.info('Outputting stats to console');
        console.log(JSON.stringify(data, null, 3));
    }
};
