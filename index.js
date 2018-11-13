const fs = require('fs');

const validateConfig = require('./utils/validate');
const markdownConverter = require('./utils/markdown');
const programDefaults = require('./tdd/config/default');
const combineConfigs = require('./utils/combine-configs');

const testPagePPC = require('./ppc');
const testPageLighthouse = require('./lighthouse');

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

    const defaultConfig = combineConfigs(programDefaults, userDefaults);

    // Create a (sequential) chain of promises (of "whole pages runs")
    const ppcResults = await defaultConfig.ppc.reduce(
        (acc, { emulateMobile, throttle }) => acc.then(async (prevResults) => {
            const innerResults = await pages.reduce(
                (accPage, page) => accPage.then(async (pageStatsArray) => {
                    const pageConfig = combineConfigs(defaultConfig, page);
                    const currentPageStats = await testPagePPC({
                        ...pageConfig,
                        throttle,
                        emulateMobile,
                    });
                    return [...pageStatsArray, currentPageStats];
                }),
                Promise.resolve([]),
            ).catch(error => error);

            return [...prevResults, ...innerResults];
        }),
        Promise.resolve([]),
    );

    const data = { ppcResults };

    if (ppcResults.error) {
        console.error(ppcResults.error); // Does this error obj ever exist?
        delete data.lighthouseResults;
        // Don't end in case the Lighthouse results are still generated.
    }

    // Wow this needs tidying. Find a way to flatten - async/await at the reduce level
    data.lighthouseResults = defaultConfig.lighthouse ? (
        await defaultConfig.lighthouse.reduce(
            (acc, { emulateMobile }) => acc.then(async (prevResults) => {
                const innerResults = await pages.reduce(
                    (accPage, page) => accPage.then(async (pageStatsArray) => {
                        const { url, cookie, repetitions } = combineConfigs(defaultConfig, page);
                        const currentPageStats = await testPageLighthouse({
                            url,
                            cookie,
                            repetitions,
                            emulateMobile,
                        });
                        return [...pageStatsArray, currentPageStats];
                    }),
                    Promise.resolve([]),
                ).catch(error => error);

                return [...prevResults, ...innerResults];
            }),
            Promise.resolve([]),
        )
    ) : null;

    if (data.lighthouseResults && data.lighthouseResults.error) {
        console.error(data.lighthouseResults.error); // Does this error obj ever exist?
        delete data.lighthouseResults;
        // Don't end in case the PPC results are still generated.
    }

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
