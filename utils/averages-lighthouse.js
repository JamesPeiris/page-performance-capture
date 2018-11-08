module.exports = ({ runs, repetitions }) => {
    const totals = runs.reduce((acc, currentRunStats) => ({
        SEO: acc.SEO + currentRunStats.SEO,
        Performance: acc.Performance + currentRunStats.Performance,
        Accessibility: acc.Accessibility + currentRunStats.Accessibility,
        'Best Practices': acc['Best Practices'] + currentRunStats['Best Practices'],
        'Progressive Web App': acc['Progressive Web App'] + currentRunStats['Progressive Web App'],
    }), {
        SEO: 0,
        Performance: 0,
        Accessibility: 0,
        'Best Practices': 0,
        'Progressive Web App': 0,
    });

    return {
        SEO: totals.SEO / repetitions,
        Performance: totals.Performance / repetitions,
        Accessibility: totals.Accessibility / repetitions,
        'Best Practices': totals['Best Practices'] / repetitions,
        'Progressive Web App': totals['Progressive Web App'] / repetitions,
    };
};