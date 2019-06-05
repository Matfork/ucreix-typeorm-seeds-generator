import { Seed } from './Seed';
import { SeedInterface } from './SeedInterface';
import { QueryRunner } from 'typeorm';
export declare class SeedExecutor {
    protected connectionOptions: any;
    protected queryRunner?: QueryRunner | undefined;
    protected transaction: boolean;
    protected tblToSeed: string;
    protected db: any;
    constructor(connectionOptions: any, queryRunner?: QueryRunner | undefined);
    runUndoLastSeed(options?: {
        transaction?: boolean;
    }): Promise<void>;
    runSeeds(options?: {
        transaction?: boolean;
    }): Promise<Seed[]>;
    showSeeds(): Promise<boolean>;
    executePendingSeeds(): Promise<Seed[]>;
    undoLastSeed(): Promise<void>;
    protected getSeeds(): Promise<Seed[]>;
    protected buildSeeds(seeds: (Function | string)[]): SeedInterface[];
    protected getLatestExecutedSeed(seeds: Seed[]): Seed | undefined;
    protected deleteExecutedSeed(seed: Seed): Promise<void>;
}
