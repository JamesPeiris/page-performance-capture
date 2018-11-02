#!/usr/bin/env node

if (process.argv.length < 3) {
    console.error('Aborting: Please specify a configuration JSON file');
    return;
}

const index = require('./index');
const { Command } = require('commander');
const { version } = require('./package.json');

const cli = new Command();

cli.version(version)

cli.command('run [config]')
    .option('-o, --output [output]', 'specify an output format [ <filename>.json | <filename>.md ] - defaults to console output', '')
    .description('specify a test config file (defaults to ppc-config.json)')
    .action(async (config = 'ppc-config.json', { output }) => {
        await index({ config, output })
    });

cli.parse(process.argv)