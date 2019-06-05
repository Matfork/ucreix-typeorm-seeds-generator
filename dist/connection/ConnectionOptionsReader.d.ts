export declare class ConnectionOptionsReader {
    protected options?: {
        root?: string | undefined;
        configName?: string | undefined;
    } | undefined;
    constructor(options?: {
        root?: string | undefined;
        configName?: string | undefined;
    } | undefined);
    all(): Promise<any[]>;
    get(name: string): Promise<any>;
    has(name: string): Promise<boolean>;
    protected load(): Promise<any[] | undefined>;
    protected normalizeConnectionOptions(connectionOptions: any[]): any[];
    protected readonly baseFilePath: string;
    protected readonly baseDirectory: string;
    protected readonly baseConfigName: string;
}
