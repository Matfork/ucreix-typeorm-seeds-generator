import { ConnectionOptionsReader } from '../connection/ConnectionOptionsReader';
import * as process from 'process';
import * as yargs from 'yargs';
import { createConnection, Connection } from 'typeorm';
import { SeedExecutor } from '../seeds/SeedExecutor';
const chalk = require('chalk');

/**
 * Runs seed command.
 */
export class SeedShowCommand implements yargs.CommandModule {
  command = 'seed:show';
  describe = 'Show all seeds and whether they have been run or not';

  builder(args: yargs.Argv) {
    return args
      .option('connection', {
        alias: 'c',
        default: 'default',
        describe: 'Name of the connection on which run a query.'
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.'
      });
  }

  async handler(args: yargs.Arguments) {
    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = new ConnectionOptionsReader({
        root: process.cwd(),
        configName: args.config as any
      });
      const connectionOptions = await connectionOptionsReader.get(
        args.connection as any
      );
      Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: ['query', 'error', 'schema']
      });
      connection = await createConnection(connectionOptions);

      const seedExecutor = new SeedExecutor(
        connectionOptions,
        connection.createQueryRunner()
      );
      const unappliedSeeds = await seedExecutor.showSeeds();

      await connection.close();

      // return error code if there are unapplied seeds for CI
      process.exit(unappliedSeeds ? 1 : 0);
    } catch (err) {
      if (connection) await (connection as Connection).close();

      console.log(chalk.black.bgRed('Error during seed show:'));
      console.error(err);
      process.exit(1);
    }
  }
}
