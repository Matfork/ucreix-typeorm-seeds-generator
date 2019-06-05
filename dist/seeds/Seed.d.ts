import { SeedInterface } from './SeedInterface';
export declare class Seed {
    id: number | undefined;
    timestamp: number;
    name: string;
    instance?: SeedInterface;
    constructor(id: number | undefined, timestamp: number, name: string, instance?: SeedInterface);
}
