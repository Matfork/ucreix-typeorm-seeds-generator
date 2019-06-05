import * as yargs from 'yargs';
export declare class SeedCreateCommand implements yargs.CommandModule {
    command: string;
    describe: string;
    builder(args: yargs.Argv): yargs.Argv<{
        c: string;
    } & {
        n: unknown;
    } & {
        d: unknown;
    } & {
        f: string;
    }>;
    handler(args: yargs.Arguments): Promise<void>;
    protected static getTemplate(name: string, timestamp: number): string;
    protected static getMongoTemplate(name: string, timestamp: number): string;
}
