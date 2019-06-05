import { QueryRunner } from 'typeorm';
export interface SeedInterface {
    up(queryRunner?: QueryRunner): Promise<any>;
    down(queryRunner?: QueryRunner): Promise<any>;
}
