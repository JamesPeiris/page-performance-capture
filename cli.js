#!/usr/bin/env node

if (process.argv[2] && process.argv[2] !== 'run') {
    console.error('Aborting: No matching ppc command.');
    console.error('Did you mean "ppc run <config>"?');
    process.exit(1);
}

if (process.argv.length < 3) {
    console.error('Aborting: Not enough args.');
    console.error('Did you mean "ppc run <config>"?');
    process.exit(1);
}

const { Command } = require('commander');

const index = require('./index');
const { version } = require('./package.json');

const cli = new Command();

cli.version(version);

cli.command('run [config]')
    .option('-o, --output [output]', 'specify an output format [ <filename>.json | <filename>.md ] - defaults to console output', '')
    .description('specify a test config file (defaults to ppc-config.json)')
    .action(async (config = 'ppc-config.json', { output }) => {
        await index({ config, output });
    });

cli.parse(process.argv);
