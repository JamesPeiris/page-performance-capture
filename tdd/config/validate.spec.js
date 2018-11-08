const { validate } = require('./validate');

describe('Validate', () => {
    it.only('Should fail validation if given a non object type', () => {
        expect(() => validate()).toThrow('Unexpected non-object type.');
        expect(() => validate(1)).toThrow('Unexpected non-object type.');
        expect(() => validate('')).toThrow('Unexpected non-object type.');
        expect(() => validate([])).toThrow('Unexpected non-object type.');
        expect(() => validate(true)).toThrow('Unexpected non-object type.');
        expect(() => validate(null)).toThrow('Unexpected non-object type.');
    });

    it('Should fail validation if no "pages" property is defined', () => {
        expect(() => validate({})).toThrow('A "pages" array is required.');
    });

    it('Should fail validation if "pages" property is not an array', () => {
        const config = { pages: undefined };

        expect(() => validate(config)).toThrow('The "pages" property must contain an array.');
        config.pages = 1;
        expect(() => validate(config)).toThrow('The "pages" property must contain an array.');
        config.pages = 'not an array';
        expect(() => validate(config)).toThrow('The "pages" property must contain an array.');
        config.pages = true;
        expect(() => validate(config)).toThrow('The "pages" property must contain an array.');
        config.pages = null;
        expect(() => validate(config)).toThrow('The "pages" property must contain an array.');
    });

    it('Should fail validation if "pages" array contains less than 1 item', () => {
        const config = { pages: [] };
        expect(() => validate(config)).toThrow('The "pages" array must contain at least one item.');
    });

    describe('Page Test Individual Items', () => {
        it('Should fail validation if a "url" is not provided', () => {
            const config = {
                pages: [{}],
            };
            expect(() => validate(config)).toThrow('A "pages" property is required.');
        });

        it('Should pass validation if a "url" is provided', () => {
            const config = {
                pages: [
                    { url: 'http://example.com' },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        it('If an optional "repetitions" value is given, fail validation if not a number type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    repetitions: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "repetitions" property must be a number.');
            config.pages[0].repetitions = 'not a number';
            expect(() => validate(config)).toThrow('The "repetitions" property must be a number.');
            config.pages[0].repetitions = [];
            expect(() => validate(config)).toThrow('The "repetitions" property must be a number.');
            config.pages[0].repetitions = {};
            expect(() => validate(config)).toThrow('The "repetitions" property must be a number.');
            config.pages[0].repetitions = false;
            expect(() => validate(config)).toThrow('The "repetitions" property must be a number.');
        });

        it('If an optional "repetitions" value is given, fail validation if number is less than one', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    repetitions: 0,
                }],
            };

            expect(() => validate(config)).toThrow('The "repetitions" number must be greater than zero.');
        });

        it('Should pass validation if optional "repetitions" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        repetitions: 2,
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "timeout" value is given, fail validation if not a number type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    timeout: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "timeout" property must be a number.');
            config.pages[0].timeout = 'not a number';
            expect(() => validate(config)).toThrow('The "timeout" property must be a number.');
            config.pages[0].timeout = [];
            expect(() => validate(config)).toThrow('The "timeout" property must be a number.');
            config.pages[0].timeout = {};
            expect(() => validate(config)).toThrow('The "timeout" property must be a number.');
            config.pages[0].timeout = false;
            expect(() => validate(config)).toThrow('The "timeout" property must be a number.');
        });

        it('If an optional "timeout" value is given, fail validation if number is less than one', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    timeout: null,
                }],
            };

            expect(() => validate(config)).toThrow('The "timeout" number must be greater than zero.');
        });

        it('Should pass validation if optional "timeout" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        timeout: 2,
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "getRequestStatsFor" value is given, fail validation if not a string type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    getRequestStatsFor: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "getRequestStatsFor" property must be a string.');
            config.pages[0].getRequestStatsFor = 1;
            expect(() => validate(config)).toThrow('The "getRequestStatsFor" property must be a string.');
            config.pages[0].getRequestStatsFor = [];
            expect(() => validate(config)).toThrow('The "getRequestStatsFor" property must be a string.');
            config.pages[0].getRequestStatsFor = {};
            expect(() => validate(config)).toThrow('The "getRequestStatsFor" property must be a string.');
            config.pages[0].getRequestStatsFor = false;
            expect(() => validate(config)).toThrow('The "getRequestStatsFor" property must be a string.');
        });

        it('Should pass validation if optional "getRequestStatsFor" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        getRequestStatsFor: '.*image.*',
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "pageWaitOnLoad" value is given, fail validation if not a number type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    pageWaitOnLoad: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" property must be a number.');
            config.pages[0].pageWaitOnLoad = 'not a number';
            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" property must be a number.');
            config.pages[0].pageWaitOnLoad = [];
            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" property must be a number.');
            config.pages[0].pageWaitOnLoad = {};
            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" property must be a number.');
            config.pages[0].pageWaitOnLoad = false;
            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" property must be a number.');
        });

        it('If an optional "pageWaitOnLoad" value is given, fail validation if number is less than one', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    pageWaitOnLoad: null,
                }],
            };

            expect(() => validate(config)).toThrow('The "pageWaitOnLoad" number must be greater than zero.');
        });

        it('Should pass validation if optional "pageWaitOnLoad" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        pageWaitOnLoad: 1,
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "headless" value is given, fail validation if not a boolean type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    headless: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "headless" property must be a boolean.');
            config.pages[0].headless = 'not a boolean';
            expect(() => validate(config)).toThrow('The "headless" property must be a boolean.');
            config.pages[0].headless = [];
            expect(() => validate(config)).toThrow('The "headless" property must be a boolean.');
            config.pages[0].headless = {};
            expect(() => validate(config)).toThrow('The "headless" property must be a boolean.');
            config.pages[0].headless = 1;
            expect(() => validate(config)).toThrow('The "headless" property must be a boolean.');
        });

        it('Should pass validation if optional "headless" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        headless: true,
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "showDevTools" value is given, fail validation if not a boolean type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    showDevTools: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "showDevTools" property must be a boolean.');
            config.pages[0].showDevTools = 'not a boolean';
            expect(() => validate(config)).toThrow('The "showDevTools" property must be a boolean.');
            config.pages[0].showDevTools = [];
            expect(() => validate(config)).toThrow('The "showDevTools" property must be a boolean.');
            config.pages[0].showDevTools = {};
            expect(() => validate(config)).toThrow('The "showDevTools" property must be a boolean.');
            config.pages[0].showDevTools = 1;
            expect(() => validate(config)).toThrow('The "showDevTools" property must be a boolean.');
        });

        it('Should pass validation if optional "showDevTools" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        showDevTools: true,
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });

        // ///////////////////////////////////////////////////////////////////////////////// //

        it('If an optional "viewPort" value is given, fail validation if not a object type', () => {
            const config = {
                pages: [{
                    url: 'http://example.com',
                    viewPort: null,
                }],
            };
            expect(() => validate(config)).toThrow('The "viewPort" property must be a object.');
            config.pages[0].viewPort = 'not a object';
            expect(() => validate(config)).toThrow('The "viewPort" property must be a object.');
            config.pages[0].viewPort = [];
            expect(() => validate(config)).toThrow('The "viewPort" property must be a object.');
            config.pages[0].viewPort = 1;
            expect(() => validate(config)).toThrow('The "viewPort" property must be a object.');
            config.pages[0].viewPort = false;
            expect(() => validate(config)).toThrow('The "viewPort" property must be a object.');
        });

        describe('Optional ViewPort', () => {
            it('If an optional "viewPort" value is given, fail validation if empty object provided', () => {
                const config = {
                    pages: [{
                        url: 'http://example.com',
                        viewPort: {},
                    }],
                };

                expect(() => validate(config)).toThrow('The "viewPort" property must contain "width" and "height" values.');
            });

            it('If an optional "viewPort" value is given, fail validation if only one of the required properties is provided', () => {
                const config = {
                    pages: [{
                        url: 'http://example.com',
                        viewPort: {
                            width: 500,
                        },
                    }],
                };

                expect(() => validate(config)).toThrow('The "viewPort" property must contain a "height" value.');

                delete config.pages[0].viewPort.width;
                config.pages[0].viewPort.height = 500;

                expect(() => validate(config)).toThrow('The "viewPort" property must contain a "width" value.');
            });

            it('If an optional "viewPort" value is given, fail validation if any of the required properties are not numbers', () => {
                const config = {
                    pages: [{
                        url: 'http://example.com',
                        viewPort: {
                            width: [],
                            height: 100,
                        },
                    }],
                };

                expect(() => validate(config)).toThrow('The viewPort "width" property must be a number.');

                config.pages[0].viewPort.width = 500;
                config.pages[0].viewPort.height = null;

                expect(() => validate(config)).toThrow('The viewPort "height" property must be a number.');
            });
        });

        it('Should pass validation if optional "viewPort" is valid', () => {
            const config = {
                pages: [
                    {
                        url: 'http://example.com',
                        viewPort: {
                            width: 500,
                            height: 500,
                        },
                    },
                ],
            };
            expect(() => validate(config)).not.toThrow();
        });
    });

    it('Should fail validation if "pages" array contains non-unique items', () => {
        const config = {
            pages: [
                { url: 'http://example.com' },
                { url: 'http://example.com' },
            ],
        };
        expect(() => validate(config)).toThrow('The "pages" array cannot contain duplicate items.');
    });

    it('Should pass validation if "pages" array meets the previous criteria', () => {
        const config = {
            pages: [
                { url: 'http://example.com' },
                { url: 'http://example.com/about' },
            ],
        };
        expect(() => validate(config)).not.toThrow();
    });

    // TODO: The default config prop
});
