const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const nexus5X = devices['Nexus 5X'];

const getAveragesTDD = require('./tdd/utils/averages');
const createSequentialRun = require('./utils/promises');

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
    url,
    timeout,
    viewPort,
    getRequestStatsFor,
    pageWaitOnLoad,
    headless,
    showDevTools,
    throttle,
    emulateMobile,
    cookie,
}) => {
    const browser = await startChromium({ headless, viewPort, showDevTools });

    const [page] = await browser.pages();

    if (emulateMobile) {
        await page.emulate(nexus5X);
    } else {
        await page.setViewport(viewPort);
    }

    if (cookie) {
        await page.setCookie(cookie);
    }

    await page.setDefaultNavigationTimeout(timeout * 1000); // (seconds -> ms)

    const customRequestRegExp = new RegExp(getRequestStatsFor);

    const devToolsResponses = {
        all: {},
        custom: {},
    };

    // Do NOT use with (await page.setRequestInterception(true))
    const devTools = await page.target().createCDPSession();
    await devTools.send('Network.enable');

    if (throttle) {
        // Network Options as Lighthouse uses
        // https://github.com/GoogleChrome/lighthouse/blob/9600b5053b3706836e33b78950500c1af235558f/docs/throttling.md

        const networkOptions = {
            offline: false,
            latency: 150,
            downloadThroughput: 1.6 * 1024 * 1024,
            uploadThroughput: 0.75 * 1024 * 1024,
        };

        await devTools.send('Network.emulateNetworkConditions', networkOptions);
        await devTools.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    }

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

module.exports = async (pageTestConfig) => {
    const { url, repetitions, throttle, emulateMobile } = pageTestConfig;

    // Create a (sequential) chain of promises (of "individual page runs")
    const runs = await createSequentialRun(
        repetitions,
        async (statsArray) => {
            const currentStats = await startRun(pageTestConfig);
            return [...statsArray, currentStats];
        },
    );

    return {
        url,
        runs,
        averages: getAveragesTDD(runs),
        throttle,
        emulateMobile,
    };
};

// TODO: Make remove the module exports from the above function
// And add the function that calls this one to this file.
