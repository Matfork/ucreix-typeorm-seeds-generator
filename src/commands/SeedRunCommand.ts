import { createConnection, Connection } from 'typeorm';
import { ConnectionOptionsReader } from '../connection/ConnectionOptionsReader';
import * as process from 'process';
import * as yargs from 'yargs';
import { SeedExecutor } from '../seeds/SeedExecutor';
import { DatabaseStorage } from '../util/DatabaseStorage';
const chalk = require('chalk');

/**
 * Runs seeds command.
 */
export class SeedRunCommand implements yargs.CommandModule {
  command = 'seed:run';
  describe = 'Runs all pending seeds.';

  builder(args: yargs.Argv) {
    return args
      .option('connection', {
        alias: 'c',
        default: 'default',
        describe: 'Name of the connection on which run a query.'
      })
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for seed run. Enabled by default.'
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

      const options = {
        transaction: args['t'] === 'false' ? false : true
      };

      await DatabaseStorage.initialize();
      const seedExecutor = new SeedExecutor(
        connectionOptions,
        connection.createQueryRunner()
      );

      await seedExecutor.runSeeds(options);
      await connection.close();
      // exit process if no errors
      process.exit(0);
    } catch (err) {
      if (connection) await (connection as Connection).close();

      console.log(chalk.black.bgRed('Error during seed run:'));
      console.error(err);
      process.exit(1);
    }
  }
}
