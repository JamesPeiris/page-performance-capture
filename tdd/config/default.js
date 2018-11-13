module.exports = {
    timeout: 30,
    repetitions: 3,
    pageWaitOnLoad: 2,
    headless: false,
    showDevTools: false,
    viewPort: {
        width: 1440,
        height: 900,
    },
    lighthouse: [],
    ppc: [
        { emulateMobile: false, throttle: false },
    ],
};
