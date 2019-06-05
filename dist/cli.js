#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var yargs = require("yargs");
var SeedCreateCommand_1 = require("./commands/SeedCreateCommand");
var SeedRunCommand_1 = require("./commands/SeedRunCommand");
var SeedRevertCommand_1 = require("./commands/SeedRevertCommand");
var SeedShowCommand_1 = require("./commands/SeedShowCommand");
yargs
    .usage('Usage: $0 <command> [options]')
    .command(new SeedCreateCommand_1.SeedCreateCommand())
    .command(new SeedShowCommand_1.SeedShowCommand())
    .command(new SeedRunCommand_1.SeedRunCommand())
    .command(new SeedRevertCommand_1.SeedRevertCommand())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help').argv;
require('yargonaut')
    .style('blue')
    .style('yellow', 'required')
    .helpStyle('green')
    .errorsStyle('red');
//# sourceMappingURL=cli.js.map