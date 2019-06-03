/**
 * Seeds should implement this interface and all its methods.
 */
export interface SeedInterface {
  /**
   * Run the migrations.
   */
  up(queryRunner: any): Promise<any>;
  /**
   * Reverse the migrations.
   */
  down(queryRunner: any): Promise<any>;
}
