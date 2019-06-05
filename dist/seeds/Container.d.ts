export interface UseContainerOptions {
    fallback?: boolean;
    fallbackOnErrors?: boolean;
}
export declare type ContainedType<T> = {
    new (...args: any[]): T;
} | Function;
export interface ContainerInterface {
    get<T>(someClass: ContainedType<T>): T;
}
export declare function useContainer(iocContainer: ContainerInterface, options?: UseContainerOptions): void;
export declare function getFromContainer<T>(someClass: ContainedType<T>): T;
