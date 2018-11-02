# Page Performance Capture

## Info
In short, a CLI tool for capturing simple performance metrics for a defined set of pages, able to output to json, markdown, or output in a terminal.

This uses `puppeteer` to launch a Chrome web browser and capture specific data.

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

The test file should conform to the following structure:
``` json
{
    "pages": [
        {
            "repetitions": 3,
            "url": "http://example.com"
        },
        {
            "repetitions": 3,
            "url": "http://example.com/about"
        }
    ],
    "global": {
        "repetitions": 1
    },
    "timeout": 10
}
```

- `pages` defines which pages you would like to test in the form of objects.
  - `repetitions` defines how many times a test against this URL should be performed
  - `url` defines the URL that will be navigated to for the test/s
- `global` - defines a default repetition value if none is specified for a page. (currently unused)
- `timeout` - defines the time after which to kill the browser if the test is hanging. (currently unused)

You can pass additional flags to the programme.

`-o` or `--output` will allow you to specify an output file to write the results to (JSON and Markdown are the only types currently supported).

```
ppc run <test_file>.json -o <output_file>.md
```