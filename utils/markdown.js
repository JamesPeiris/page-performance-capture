const tableHeadings = '|    | No. Custom Reqs | No. Total Reqs | DOMContentLoaded (s) | Page Load (s) |';
const divider = '|----|-----------------|----------------|----------------------|---------------|';

module.exports = ({ results }) => (`
# Results

${
    results.map(({ url, runs, averages }) => {
        const header = `## ${url}`;

        const runData = runs.map((run, index) => {
            const {
                totalCustomRequests, totalRequests, domContentLoadedTime, pageLoadTime,
            } = run;
            return `| ${index + 1} | ${totalCustomRequests.toFixed(3)} | ${totalRequests.toFixed(3)} | ${domContentLoadedTime.toFixed(3)} | ${pageLoadTime.toFixed(3)} |`;
        }).join('\n');

        const averageData = `| _AVG_ | **${averages.totalCustomRequests.toFixed(3)}** | **${averages.totalRequests.toFixed(3)}** | **${averages.domContentLoadedTime.toFixed(3)}** | **${averages.pageLoadTime.toFixed(3)}** |`;

        const markdown = `
${header}

${tableHeadings}
${divider}
${runData}
${runs.length > 1 ? averageData : ''}
        `;

        return markdown;
    }).join('\n')
    }
`);
