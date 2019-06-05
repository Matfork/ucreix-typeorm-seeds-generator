export interface SeedInterface {
    up(queryRunner: any): Promise<any>;
    down(queryRunner: any): Promise<any>;
}
