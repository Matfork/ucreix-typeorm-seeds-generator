import { QueryRunner } from 'typeorm';

/**
 * Seeds should implement this interface and all its methods.
 */
export interface SeedInterface {
  /**
   * Run the seeds.
   */
  up(queryRunner?: QueryRunner): Promise<any>;

  /**
   * Reverse the seed.
   */
  down(queryRunner?: QueryRunner): Promise<any>;
}
