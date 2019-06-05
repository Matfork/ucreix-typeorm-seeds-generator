/**
 * Seeds should implement this interface and all its methods.
 */
export interface SeedInterface {
  /**
   * Run the seeds.
   */
  up(queryRunner: any): Promise<any>;
  /**
   * Reverse the seeds.
   */
  down(queryRunner: any): Promise<any>;
}
