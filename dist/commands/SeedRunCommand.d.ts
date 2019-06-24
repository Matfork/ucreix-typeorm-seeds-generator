import * as yargs from 'yargs';
export declare class SeedRunCommand implements yargs.CommandModule {
    command: string;
    describe: string;
    builder(args: yargs.Argv): yargs.Argv<{
        connection: string;
    } & {
        transaction: string;
    } & {
        config: string;
    } & {
        length: string;
    }>;
    handler(args: yargs.Arguments): Promise<void>;
}
