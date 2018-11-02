const tableHeadings = '|    | No. Image Reqs | No. Total Reqs | Image MBs | Total MBs | DOMContentLoaded (s) | Page Load (s) |';
const divider       = '|----|----------------|----------------|-----------|-----------|----------------------|---------------|';

module.exports = ({ results }) => {
    const markdown = '';

    return `
# Results

${
    results.map((page) => {
        const header = `## ${page.url}`;

        const runData = page.runs.map((run, index) => {
            return `| ${index + 1} | ${run.totalImagesDownloaded.toFixed(3)} | ${run.totalFilesDownloaded.toFixed(3)} | ${run.totalImagesDownloadedSize.toFixed(3)} | ${run.totalFilesDownloadedSize.toFixed(3)} | ${run.domContentLoadedTime.toFixed(3)} | ${run.pageLoadTime.toFixed(3)} |`;
        }).join('\n');

        const averageData = `| _AVG_ | **${page.averages.totalImagesDownloaded.toFixed(3)}** | **${page.averages.totalFilesDownloaded.toFixed(3)}** | **${page.averages.totalImagesDownloadedSize.toFixed(3)}** | **${page.averages.totalFilesDownloadedSize.toFixed(3)}** | **${page.averages.domContentLoadedTime.toFixed(3)}** | **${page.averages.pageLoadTime.toFixed(3)}** |`;

        const markdown = `
${header}

${tableHeadings}
${divider}
${runData}
${page.runs.length > 1 ? averageData : ''}
        `;

        return markdown;
    }).join('\n')
}
    `
}

[ { url: 'http://sky.com/watch/channel/sky-cinema',
    runs: [ [Object] ],
    averages:
     { totalFilesDownloaded: 146,
       totalFilesDownloadedSize: 1.4629650115966797,
       totalImagesDownloaded: 88,
       totalImagesDownloadedSize: 0.10311412811279297,
       domContentLoadedTime: 1539592818678.682 } } ]