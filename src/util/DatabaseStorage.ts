import { getConnectionOptions } from 'typeorm';

const baseDir = require('app-root-path').path;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

export class DatabaseStorage {
  public static db: any;

  public static async initialize() {
    const opts: any = await getConnectionOptions();
    const separator = '/';
    const dbPath = process.env.SEED_DB_PATH
      ? process.env.SEED_DB_PATH
      : `${baseDir}${separator}${opts.cli.seeds.db}`;

    const adapter = new FileSync(dbPath);

    DatabaseStorage.db = low(adapter);

    // Set some defaults (required if your JSON file is empty)
    DatabaseStorage.db
      .defaults({
        seeds: [],
        mongoSeeds: [],
        sequences: { seeds: 0, mongoSeeds: 0 }
      })
      .write();
  }
}
