#!/usr/bin/env node
import 'reflect-metadata';
import * as yargs from 'yargs';
import { SeedCreateCommand } from './commands/SeedCreateCommand';

yargs
  .usage('Usage: $0 <command> [options]')
  .command(new SeedCreateCommand())
//   .command(new SeedRunCommand())
//   .command(new SeedRevertCommand())
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
