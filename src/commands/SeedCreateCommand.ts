import { ConnectionOptionsReader } from '../connection/ConnectionOptionsReader';
import { CommandUtils } from './CommandUtils';
import { camelCase } from '../util/StringUtils';
import * as yargs from 'yargs';
const chalk = require('chalk');

/**
 * Creates a new seed file.
 */
export class SeedCreateCommand implements yargs.CommandModule {
  command = 'seed:create';
  describe = 'Creates a new seed file.';

  builder(args: yargs.Argv) {
    return args
      .option('c', {
        alias: 'connection',
        default: 'default',
        describe: 'Name of the connection on which run a query.'
      })
      .option('n', {
        alias: 'name',
        describe: 'Name of the seeds class.',
        demand: true
      })
      .option('d', {
        alias: 'dir',
        describe: 'Directory where seeds should be created.'
      })
      .option('f', {
        alias: 'config',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.'
      });
  }

  async handler(args: yargs.Arguments) {
    try {
      const timestamp = new Date().getTime();
      const fileContent = SeedCreateCommand.getTemplate(
        args.name as any,
        timestamp
      );
      const filename = timestamp + '-' + args.name + '.ts';
      let directory = args.dir;

      // if directory is not set then try to open tsconfig and find default path there
      if (!directory) {
        try {
          const connectionOptionsReader = new ConnectionOptionsReader({
            root: process.cwd(),
            configName: args.config as any
          });

          const connectionOptions = await connectionOptionsReader.get(
            args.connection as any
          );
          directory = connectionOptions.cli
            ? connectionOptions.cli.seedsDir
            : undefined;
        } catch (err) {}
      }
      console.log(directory);

      const path =
        process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
      await CommandUtils.createFile(path, fileContent);
      console.log(`Seed ${chalk.blue(path)} has been generated successfully.`);
    } catch (err) {
      console.log(chalk.black.bgRed('Error during seed creation:'));
      console.error(err);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------------------
  // Protected Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets contents of the seed file.
   */
  protected static getTemplate(name: string, timestamp: number): string {
    return `import { QueryRunner} from "typeorm";
    import { SeedInterface } from "seeds-generator";
export class ${camelCase(name, true)}${timestamp} implements SeedInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
    }
    public async down(queryRunner: QueryRunner): Promise<any> {
    }
}
`;
  }
}
