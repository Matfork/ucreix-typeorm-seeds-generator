export declare class OrmUtils {
    static chunk<T>(array: T[], size: number): T[][];
    static splitClassesAndStrings<T>(clsesAndStrings: (string | T)[]): [T[], string[]];
    static groupBy<T, R>(array: T[], propertyCallback: (item: T) => R): {
        id: R;
        items: T[];
    }[];
    static uniq<T>(array: T[], criteria?: (item: T) => any): T[];
    static uniq<T, K extends keyof T>(array: T[], property: K): T[];
    static isObject(item: any): boolean;
    static mergeDeep(target: any, ...sources: any[]): any;
    static deepCompare(...args: any[]): boolean;
    static toBoolean(value: any): boolean;
    static isArraysEqual(arr1: any[], arr2: any[]): boolean;
    private static compare2Objects;
}
