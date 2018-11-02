const fs = require('fs');
const puppeteer = require('puppeteer');

const markdownConverter = require('./markdown');

// /////////////////////////////////////////////////////////////// //

const startChromium = () => (
    puppeteer.launch({
        headless: (process.env.NODE_ENV === 'production')
    })
);

// /////////////////////////////////////////////////////////////// //

const startRun = async ({ url }) => {    
    const browser = await startChromium();
    
    const page = await browser.newPage();

    await page.goto(url);
    
    const performanceEntries = JSON.parse(
        await page.evaluate( () => JSON.stringify(performance.getEntries()) )
    );

    const performanceToJSON = JSON.parse(
        await page.evaluate( () => JSON.stringify(performance.toJSON()) )
    );

    // Gets size of ALL network requests combined
    const networkRequestsSize = performanceEntries.reduce((acc, curr) => {
        if (!curr.transferSize) return acc;
        return acc + curr.transferSize;
    }, 0);

    // Filters for IMAGE ONLY requests
   const imageNetworkRequests = performanceEntries.filter(({ initiatorType }) => initiatorType === 'img');

    // Gets size of ALL images combined
    const imageNetworkRequestsSize = imageNetworkRequests.reduce((acc, curr) => acc + curr.transferSize, 0)

    const {
        loadEventEnd,
        navigationStart,
        domContentLoadedEventEnd
    } = performanceToJSON.timing;

    const pageLoadTime = loadEventEnd - navigationStart / 1000; // (seconds)
    const domContentLoadedTime = domContentLoadedEventEnd - navigationStart / 1000; // (seconds)

    // TODO: Review these stats - mechanisms that consume this are fine, but not sure how trustworthy the data is currently.
    const stats = {
        pageLoadTime,
        domContentLoadedTime,
        totalFilesDownloaded: performanceEntries.length,
        totalFilesDownloadedSize: networkRequestsSize / 1024 / 1024, // Bytes -> KB -> MB
        totalImagesDownloaded: imageNetworkRequests.length,
        totalImagesDownloadedSize: imageNetworkRequestsSize / 1024 / 1024 // Bytes -> KB -> MB
    };

    await browser.close();

    return stats;
}

// /////////////////////////////////////////////////////////////// //

const testPage = async ({ url, repetitions }) => {
    const iterable = Array.from(Array(repetitions));

    // Create a (sequential) chain of promises (of "individual page runs")
    const runs = await iterable.reduce(
        (acc, _) => acc.then(async (statsArray) => {
            const currentStats = await startRun({ url });
            return [ ...statsArray, currentStats];
        }),
        Promise.resolve([])
    )
    .catch(err => console.error(err));
    
    // Calculate average of each stat from runs
    const totals = runs.reduce((acc, currentRunStats) => {
        const {
            totalFilesDownloaded,
            totalFilesDownloadedSize,
            totalImagesDownloaded,
            totalImagesDownloadedSize
        } = acc;

        const accumulatedStats = ({
            pageLoadTime: acc.pageLoadTime + currentRunStats.pageLoadTime,
            domContentLoadedTime: acc.domContentLoadedTime + currentRunStats.domContentLoadedTime,
            totalFilesDownloaded: totalFilesDownloaded + currentRunStats.totalFilesDownloaded,
            totalFilesDownloadedSize: totalFilesDownloadedSize + currentRunStats.totalFilesDownloadedSize,
            totalImagesDownloaded: totalImagesDownloaded + currentRunStats.totalImagesDownloaded,
            totalImagesDownloadedSize: totalImagesDownloadedSize + currentRunStats.totalImagesDownloadedSize 
        });

        return accumulatedStats;
    }, {
        pageLoadTime: 0,
        domContentLoadedTime: 0,
        totalFilesDownloaded: 0,
        totalFilesDownloadedSize: 0,
        totalImagesDownloaded: 0,
        totalImagesDownloadedSize: 0,
    });
    
    const averages = {
        pageLoadTime: totals.pageLoadTime / repetitions,
        totalFilesDownloaded: totals.totalFilesDownloaded / repetitions,
        totalFilesDownloadedSize: totals.totalFilesDownloadedSize / repetitions,
        totalImagesDownloaded: totals.totalImagesDownloaded / repetitions,
        totalImagesDownloadedSize: totals.totalImagesDownloadedSize / repetitions,
        domContentLoadedTime: totals.domContentLoadedTime / repetitions
    }

    return {
        url,
        runs,
        averages
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
    } catch (err) {
        console.error('Could not read config - please check your config file exists.');
        return;
    }

    const { pages = [] } = configData;

    // Create a (sequential) chain of promises (of "whole pages runs")
    const results = await pages.reduce(
        (acc, page) => acc.then(async (pageStatsArray) => {
            const currentPageStats = await testPage(page);
            return [ ...pageStatsArray, currentPageStats];
        }),
        Promise.resolve([])
    ).catch(error => error);

    if (results.error) {
        console.error(results.error);
        return;
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