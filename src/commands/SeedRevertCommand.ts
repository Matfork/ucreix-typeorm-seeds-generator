import { ConnectionOptionsReader } from '../connection/ConnectionOptionsReader';
import * as yargs from 'yargs';
import { Connection, createConnection } from 'typeorm';
import { SeedExecutor } from '../seeds/SeedExecutor';
import { DatabaseStorage } from '../util/DatabaseStorage';
const chalk = require('chalk');

/**
 * Reverts last seed command.
 */
export class SeedRevertCommand implements yargs.CommandModule {
  command = 'seed:revert';
  describe = 'Reverts last executed seed.';

  builder(args: yargs.Argv) {
    return args
      .option('c', {
        alias: 'connection',
        default: 'default',
        describe: 'Name of the connection on which run a query.'
      })
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for seed revert. Enabled by default.'
      })
      .option('f', {
        alias: 'config',
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
      await seedExecutor.runUndoLastSeed(options);

      await connection.close();
    } catch (err) {
      if (connection) await (connection as Connection).close();

      console.log(chalk.black.bgRed('Error during seed revert:'));
      console.error(err);
      process.exit(1);
    }
  }
}
