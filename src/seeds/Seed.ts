import { SeedInterface } from './SeedInterface';

/**
 * Represents entity of the seed in the database.
 */
export class Seed {
  // -------------------------------------------------------------------------
  // Public Properties
  // -------------------------------------------------------------------------

  /**
   * Seed id.
   * Indicates order of the executed seeds.
   */
  id: number | undefined;

  /**
   * Timestamp of the seed.
   */
  timestamp: number;

  /**
   * Name of the seed (class name).
   */
  name: string;

  /**
   * Seed instance that needs to be run.
   */
  instance?: SeedInterface;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(
    id: number | undefined,
    timestamp: number,
    name: string,
    instance?: SeedInterface
  ) {
    this.id = id;
    this.timestamp = timestamp;
    this.name = name;
    this.instance = instance;
  }
}
