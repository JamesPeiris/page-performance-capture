const table = require('markdown-table');

const formatDataset = data => (
    Object.keys(data).map((key) => {
        if (data[key]) return data[key].toFixed(3);
        return 'N/A';
    })
);

const formatForTable = (data, placeholder = '') => [`_${placeholder}_`, ...formatDataset(data)];

const formatForTableData = runs => runs.map((run, index) => formatForTable(run, index + 1));
const formatForTableHeadings = object => ['', ...Object.keys(object)];

const generateMarkdown = (pageResults, title) => {
    const resultsMarkdown = pageResults.map(({ url, runs, averages }) => {
        const headings = formatForTableHeadings(averages);
        const runsForTable = formatForTableData(runs);
        const averagesForTable = formatForTable(averages, 'AVG');

        const tableData = [
            headings,
            ...runsForTable,
            averagesForTable,
        ];

        return [
            `### ${url}`,
            '',
            table(tableData),
            '',
        ].join('\n');
    });

    return [
        `## ${title}`,
        '',
        ...resultsMarkdown,
    ].join('\n');
};

const ppcMiddleman = (results) => {
    const throttledMobileResults = results.filter(result => result.emulateMobile && result.throttle);
    const throttledDesktopResults = results.filter(result => !result.emulateMobile && result.throttle);
    const unthrottledMobileResults = results.filter(result => result.emulateMobile && !result.throttle);
    const unthrottledDesktopResults = results.filter(result => !result.emulateMobile && !result.throttle);

    return [
        generateMarkdown(throttledMobileResults, 'Page Performance Capture (Throttled - Mobile)'),
        '---',
        generateMarkdown(throttledDesktopResults, 'Page Performance Capture (Throttled - Desktop)'),
        '---',
        generateMarkdown(unthrottledMobileResults, 'Page Performance Capture (Unthrottled - Mobile)'),
        '---',
        generateMarkdown(unthrottledDesktopResults, 'Page Performance Capture (Unthrottled - Desktop)'),
        '---',
    ].join('\n');
};

const lighthouseMiddleman = (results) => {
    const desktopResults = results.filter(result => !result.emulateMobile);
    const emulatedMobileResults = results.filter(result => result.emulateMobile);

    return [
        generateMarkdown(desktopResults, 'Lighthouse (Desktop)'),
        '---',
        generateMarkdown(emulatedMobileResults, 'Lighthouse (Mobile + Throttled)'),
    ].join('\n');
};

// TODO can make this more generic by not extracting names here
// Simply Object.keys() over each item and pass to generateMarkdown()
// Then flatten the resultant array
module.exports = ({ ppcResults, lighthouseResults }) => {
    // console.log('--------------------------------------');
    // console.log(ppcResults);
    // console.log('--------------------------------------');
    // console.log(lighthouseResults);
    // console.log('--------------------------------------');

    const markdown = [
        '# Results',
        '',
    ];

    if (ppcResults) {
        markdown.push(ppcMiddleman(ppcResults));
    }

    markdown.push('');

    if (lighthouseResults) {
        markdown.push(lighthouseMiddleman(lighthouseResults));
    }

    markdown.push('');

    return markdown.join('\n');
};
