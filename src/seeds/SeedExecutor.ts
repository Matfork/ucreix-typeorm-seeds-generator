import { Seed } from './Seed';
import { importClassesFromDirectories } from '../util/DirectoryExportedClassesLoader';
import { SeedInterface } from './SeedInterface';
import { getFromContainer } from './Container';
import {
  getConnectionOptions,
  PromiseUtils,
  getConnection,
  QueryRunner
} from 'typeorm';
import { OrmUtils } from '../util/OrmUtils';

const baseDir = require('app-root-path').path;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(`${baseDir}/config/db/seedsDb.json`);
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({
  seeds: [],
  mongoSeeds: [],
  sequences: { seeds: 0, mongoSeeds: 0 }
}).write();

const TABLE_SEEDS = 'seeds';
const TABLE_MONGO_SEEDS = 'mongoSeeds';
const TABLE_SEQUENCES = 'sequences';

/**
 * Executes Seeds: runs pending and reverts previously executed Seeds.
 */
export class SeedExecutor {
  /**
   * Indicates if seeds must be executed in a transaction.
   */
  protected transaction: boolean = true;

  protected tblToSeed: string;

  constructor(
    protected connectionOptions: any,
    protected queryRunner?: QueryRunner
  ) {
    this.tblToSeed = !(getConnection(connectionOptions.name).driver as any)
      .mongodb
      ? TABLE_SEEDS
      : TABLE_MONGO_SEEDS;
  }

  /**
   * Runs all pending seeds.
   * Can be used only after connection to the database is established.
   */
  public async runUndoLastSeed(options?: {
    transaction?: boolean;
  }): Promise<void> {
    if (options && options.transaction === false) {
      this.transaction = false;
    }
    await this.undoLastSeed();
  }

  /**
   * Runs all pending seeds.
   * Can be used only after connection to the database is established.
   */
  public async runSeeds(options?: { transaction?: boolean }): Promise<Seed[]> {
    if (options && options.transaction === false) {
      this.transaction = false;
    }
    const successSeeds = await this.executePendingSeeds();
    return successSeeds;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Lists all seeds and whether they have been executed or not
   * returns true if there are unapplied seeds
   */
  async showSeeds(): Promise<boolean> {
    let hasUnappliedSeeds = false;
    const queryRunner =
      this.queryRunner ||
      getConnection(this.connectionOptions.name).createQueryRunner();

    // get all seeds that are executed and saved in the database
    const executedSeeds = db.get(this.tblToSeed).value();

    // get all user's seeds in the source code
    const allSeeds = await this.getSeeds();

    for (const seed of allSeeds) {
      const es = executedSeeds.find((es: any) => es.name === seed.name);

      if (es) {
        console.log(` [X] ${seed.name}`);
      } else {
        hasUnappliedSeeds = true;
        console.log(` [ ] ${seed.name}`);
      }
    }

    // if query runner was created by us then release it
    if (!this.queryRunner) {
      await queryRunner.release();
    }

    return hasUnappliedSeeds;
  }

  /**
   * Executes all pending Seeds. Pending Seeds are Seeds that are not yet executed,
   * thus not saved in the database.
   */
  async executePendingSeeds(): Promise<Seed[]> {
    const queryRunner =
      this.queryRunner ||
      getConnection(this.connectionOptions.name).createQueryRunner();

    // get all user's seeds in the source code
    const allSeeds = await this.getSeeds();

    // variable to store all seeds we did successefuly
    const successSeeds: Seed[] = [];

    // get all seeds that are executed and saved in the database
    const executedSeeds = db.get(this.tblToSeed).value();

    // find all seeds that needs to be executed
    const pendingSeeds = allSeeds.filter(seed => {
      // check if we already have executed seed
      const executedSeed = executedSeeds.find(
        (es: any) => es.name === seed.name
      );
      if (executedSeed) return false;

      return true;
    });

    // if no seeds are pending then nothing to do here
    if (!pendingSeeds.length) {
      console.log(`No seeds are pending`);
      // if query runner was created by us then release it
      if (!this.queryRunner) await queryRunner.release();
      return [];
    }

    // log information about seed execution
    console.log(
      `${executedSeeds.length} seeds are already loaded in the database.`
    );
    console.log(`${allSeeds.length} seeds were found in the source code.`);

    console.log(
      `${pendingSeeds.length} seeds are new seeds that needs to be executed.`
    );

    // start transaction if its not started yet
    let transactionStartedByUs = false;
    if (this.transaction && !queryRunner.isTransactionActive) {
      await queryRunner.startTransaction();
      transactionStartedByUs = true;
    }

    const currSequence: number = db.get(TABLE_SEQUENCES).value()[
      this.tblToSeed
    ];
    const nextSequence = currSequence + 1;

    // run all pending seeds in a sequence
    try {
      await PromiseUtils.runInSequence(pendingSeeds, seed => {
        return seed
          .instance!.up(queryRunner)
          .then(() => {
            // now when seed is executed we need to insert record about it into the database
            return db
              .get(this.tblToSeed)
              .push({
                id:
                  db
                    .get(this.tblToSeed)
                    .size()
                    .value() + 1,
                sequence: nextSequence,
                name: seed.name,
                timestamp: seed.timestamp
              })
              .write();
          })
          .then(() => {
            // informative log about seed success
            successSeeds.push(seed);
            console.log(`Seed ${seed.name} has been executed successfully.`);
          });
      });

      // commit transaction if we started it
      if (transactionStartedByUs) {
        await queryRunner.commitTransaction();
        db.update(
          `${TABLE_SEQUENCES}.${this.tblToSeed}`,
          (n: number) => n + 1
        ).write();
      }
    } catch (err) {
      db.get(this.tblToSeed)
        .remove({ sequence: currSequence })
        .write();

      // rollback transaction if we started it
      if (transactionStartedByUs) {
        try {
          // we throw original error even if rollback thrown an error
          await queryRunner.rollbackTransaction();
        } catch (rollbackError) {}
      }

      throw err;
    } finally {
      // if query runner was created by us then release it
      if (!this.queryRunner) await queryRunner.release();
    }
    return successSeeds;
  }

  /**
   * Reverts last seed that were run.
   */
  async undoLastSeed(): Promise<void> {
    const queryRunner =
      this.queryRunner ||
      getConnection(this.connectionOptions.name).createQueryRunner();

    // get all seeds that are executed and saved in the database
    const executedSeeds = db.get(this.tblToSeed).value();

    // get the time when last seed was executed
    let lastTimeExecutedSeed = this.getLatestExecutedSeed(executedSeeds);

    // if no seeds found in the database then nothing to revert
    if (!lastTimeExecutedSeed) {
      console.log(`No seeds was found in the database. Nothing to revert!`);
      return;
    }

    // get all user's seeds in the source code
    const allSeeds = await this.getSeeds();

    // find the instance of the seed we need to remove
    const seedToRevert = allSeeds.find(
      seed => seed.name === lastTimeExecutedSeed!.name
    );

    // if no seeds found in the database then nothing to revert
    if (!seedToRevert)
      throw new Error(
        `No seed ${
          lastTimeExecutedSeed.name
        } was found in the source code. Make sure you have this seed in your codebase and its included in the connection options.`
      );

    // log information about seed execution
    console.log(
      `${executedSeeds.length} seeds are already loaded in the database.`
    );
    console.log(
      `${
        lastTimeExecutedSeed.name
      } is the last executed seed. It was executed on ${new Date(
        lastTimeExecutedSeed.timestamp
      ).toString()}.`
    );
    console.log(`Now reverting it...`);

    // start transaction if its not started yet
    let transactionStartedByUs = false;
    if (this.transaction && !queryRunner.isTransactionActive) {
      await queryRunner.startTransaction();
      transactionStartedByUs = true;
    }

    try {
      await seedToRevert.instance!.down(queryRunner);
      await this.deleteExecutedSeed(seedToRevert);
      console.log(`Seed ${seedToRevert.name} has been reverted successfully.`);

      // commit transaction if we started it
      if (transactionStartedByUs) await queryRunner.commitTransaction();
    } catch (err) {
      // rollback transaction if we started it
      if (transactionStartedByUs) {
        try {
          // we throw original error even if rollback thrown an error
          await queryRunner.rollbackTransaction();
        } catch (rollbackError) {}
      }

      throw err;
    } finally {
      // if query runner was created by us then release it
      if (!this.queryRunner) await queryRunner.release();
    }
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Gets all Seeds that setup for this connection.
   */
  protected async getSeeds(): Promise<Seed[]> {
    const connOptions = await getConnectionOptions(this.connectionOptions.name);

    const seedsDir = (connOptions as any).seeds
      ? (connOptions as any).seeds
      : [];

    const seedsBuilt = this.buildSeeds(seedsDir);

    const seeds = seedsBuilt.map(seed => {
      const seedClassName = (seed.constructor as any).name;
      const seedTimestamp = parseInt(seedClassName.substr(-13));
      if (!seedTimestamp)
        throw new Error(
          `${seedClassName} Seed name is wrong. Seed class name should have a JavaScript timestamp appended.`
        );

      return new Seed(undefined, seedTimestamp, seedClassName, seed);
    });

    // sort them by timestamp
    return seeds.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Builds Seed instances for the given classes or directories.
   */
  protected buildSeeds(seeds: (Function | string)[]): SeedInterface[] {
    const [seedClasses, seedDirectories] = OrmUtils.splitClassesAndStrings(
      seeds
    );

    const allSeedClasses = [
      ...seedClasses,
      ...importClassesFromDirectories(seedDirectories)
    ];

    return allSeedClasses.map(seedClass =>
      getFromContainer<SeedInterface>(seedClass)
    );
  }

  /**
   * Finds the latest seed (sorts by id) in the given array of seeds.
   */
  protected getLatestExecutedSeed(seeds: Seed[]): Seed | undefined {
    const sortedSeeds = seeds
      .map(seed => seed)
      .sort((a, b) => ((a.id || 0) - (b.id || 0)) * -1);
    return sortedSeeds.length > 0 ? sortedSeeds[0] : undefined;
  }

  /**
   * Delete previously executed seed's data from the seeds table.
   */
  protected async deleteExecutedSeed(seed: Seed): Promise<void> {
    db.get(this.tblToSeed)
      .remove({ name: seed.name, timestamp: seed.timestamp })
      .write();

    const lastSequence = db
      .get(this.tblToSeed)
      .orderBy('sequence', 'desc')
      .take(1)
      .map((el: any) => el.sequence)
      .value();

    const newSequence = lastSequence[0] ? lastSequence[0] : 0;

    db.get(`${TABLE_SEQUENCES}`)
      .assign({ [this.tblToSeed]: newSequence })
      .write();
  }
}
