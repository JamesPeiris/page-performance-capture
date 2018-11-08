# Page Performance Capture

## Info
In short, a CLI tool for capturing simple performance metrics for a defined set of pages, able to output to json, markdown, or output in a terminal.

This uses `puppeteer` to launch a Chrome web browser and capture specific data (including averages.)

The data currently captured includes:
- DOM Content Loaded times
- Page load times
- No. network requests
- No. filtered network requests (given a user-defined Regular Expression)

## Installation
To install, simply:
```
npm i -g page-performance-capture
```

## Running
To run, provide a json file as the first argument in the following command:
```
ppc run <test_file>.json
```

Otherwise it will look for a `ppc-config.json` file by default when running only
```
ppc run
```

Each test in the test file should conform to the following structure (although only "url" is a required property)
``` json
{
    "repetitions": 2,
    "url": "https://www.example.com",
    "getRequestStatsFor": "/.*png.*/",
    "timeout": 20,
    "viewPort": {
        "width": 1440,
        "height": 500
    },
    "headless": false
}
```

This structure can be replicated across items in an array to specify the tests:

``` json
{
    "pages": {
        "repetitions": 2,
        "url": "https://www.example.com",
        "getRequestStatsFor": "/.*png.*/",
        "timeout": 20,
        "viewPort": {
            "width": 1440,
            "height": 500
        },
        "headless": false
    }
}
```

Note: `pages` is a required field.


The defaults are as follows:

| Name                 | Purpose                                                                               | Type    | Required?   | Default Value                  |
|----------------------|---------------------------------------------------------------------------------------|---------|-------------|--------------------------------|
| `url`                | Specifies the URL of the page to test                                                 | String  | Yes         | none                           |
| `repetitions`        | Specifies the number of times a given URL should be tested                            | Number  | No          | `3`                            |
| `timeout`            | Specifies a time in seconds after which to terminate the browser                      | Number  | No          | `30`                           |
| `getRequestStatsFor` | Specifies a regular expression to obtain stats for matching network requests          | String  | No          |  `undefined`                   |
| `viewPort`           | An object that specifies the viewport height & width to use for the test/s            | Object  | No          | `{ width: 1440, height: 900 }` |
| `pageWaitOnLoad`     | Specifies how many seconds to keep a page open after page load before capturing stats | Number  | No          | `2`                            |
| `headless`           | Specifies whether to run the tests with/without a visible user interface              | Boolean | No          | `false`                        |
| `showDevTools`       | Specifies whether to auto-open Chrome Dev Tools for the test                          | Boolean | No          | `false`                        |

You may wish to override these defaults if a lot of your test pages require the same configuration.

Thie can be achieved by using the root-level `defaults` object, which conforms to the same structure as the object per-page
(the only difference being that there is no `url` property).

``` json
{
    "pages": [
        {
            "url": "http://example.com",
            "getRequestStatsFor": "/.*png.*/",
        },
        {
            "repetitions": 2,
            "url": "http://example.com/about",
        },
        {
            "repetitions": 3,
            "url": "http://example.com/contact",
        }
    ],
    "defaults": {
        "repetitions": 1,
        "getRequestStatsFor": "/.*jpeg.*/",
        "timeout": 20,
        "headless": false,
        "viewPort": {
            "width": 1440,
            "height": 500
        }
    },
}
```

You can pass additional flags to the programme.

`-o` or `--output` will allow you to specify an output file to write the results to (JSON and Markdown are the only types currently supported).

```
ppc run <test_file>.json -o <output_file>.md
```

## A note on request size data

Unfortunately, the tools don't exist to obtain accurate results on network request sizes.
- Performance API requires `Timings-Allow-Origin: *` header on all page resources (of which some third party apps do not have this)
- Puppeteer can accurately capture the requests and allow for accurate counting, however there are discrepancies between the `transferSize` / `dataLength` / `encodedDataLength` / `Content-Length` values when compared at both a page level and (from what I found) on an individual resource basis.
- Attempted to re-request images directly via Node using the captured list from Puppeteer, however CORS policies will make obtaining accurate results impossible for real world sites.

The best recommendation I can make is to set the `showDevTools` to `true` and set the `pageWaitOnLoad` value to as many seconds as you need to capture the size data for network requests directly from the Chrome Dev Tools "Networks" tab.

## Other notes
Currently `lighthouse` tests are only supported in an all-or-nothing way.
That is lighthouse cannot yet be specified per-test, only in the default config.