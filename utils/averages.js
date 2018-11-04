module.exports = ({ runs, repetitions }) => {
    const totals = runs.reduce((acc, currentRunStats) => {
        const {
            pageLoadTime,
            domContentLoadedTime,
            totalRequests,
            totalCustomRequests,
        } = acc;

        return {
            pageLoadTime: pageLoadTime + currentRunStats.pageLoadTime,
            domContentLoadedTime: domContentLoadedTime + currentRunStats.domContentLoadedTime,
            totalRequests: totalRequests + currentRunStats.totalRequests,
            totalCustomRequests: totalCustomRequests + currentRunStats.totalCustomRequests,
        };
    }, {
        pageLoadTime: 0,
        domContentLoadedTime: 0,
        totalRequests: 0,
        totalCustomRequests: 0,
    });

    return {
        pageLoadTime: totals.pageLoadTime / repetitions,
        domContentLoadedTime: totals.domContentLoadedTime / repetitions,
        totalRequests: totals.totalRequests / repetitions,
        totalCustomRequests: totals.totalCustomRequests / repetitions,
    };
};
