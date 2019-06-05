export declare class CommandUtils {
    static createDirectories(directory: string): Promise<unknown>;
    static createFile(filePath: string, content: string, override?: boolean): Promise<void>;
    static readFile(filePath: string): Promise<string>;
    static fileExists(filePath: string): Promise<boolean>;
}
