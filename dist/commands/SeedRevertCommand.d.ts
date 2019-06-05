import * as yargs from 'yargs';
export declare class SeedRevertCommand implements yargs.CommandModule {
    command: string;
    describe: string;
    builder(args: yargs.Argv): yargs.Argv<{
        c: string;
    } & {
        transaction: string;
    } & {
        f: string;
    }>;
    handler(args: yargs.Arguments): Promise<void>;
}
