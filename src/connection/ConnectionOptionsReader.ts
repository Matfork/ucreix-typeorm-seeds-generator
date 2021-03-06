import * as fs from 'fs';

/**
 * Reads connection options from the ormconfig.
 * Can read from multiple file extensions including env, json, js, xml and yml.
 */
export class ConnectionOptionsReader {
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(
    protected options?: {
      /**
       * Directory where ormconfig should be read from.
       * By default its your application root (where your app package.json is located).
       */
      root?: string;

      /**
       * Filename of the ormconfig configuration. By default its equal to "ormconfig".
       */
      configName?: string;
    }
  ) {}

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Returns all connection options read from the ormconfig.
   */
  async all(): Promise<any[]> {
    const options = await this.load();

    if (!options)
      throw new Error(
        `No connection options were found in any of configurations file.`
      );

    return options;
  }

  /**
   * Gets a connection with a given name read from ormconfig.
   * If connection with such name would not be found then it throw error.
   */
  async get(name: string): Promise<any> {
    const allOptions = await this.all();
    const targetOptions = allOptions.find(
      options => options.name === name || (name === 'default' && !options.name)
    );
    if (!targetOptions)
      throw new Error(
        `Cannot find connection ${name} because its not defined in any orm configuration files.`
      );

    return targetOptions;
  }

  /**
   * Checks if there is a TypeORM configuration file.
   */
  async has(name: string): Promise<boolean> {
    const allOptions = await this.load();
    if (!allOptions) return false;

    const targetOptions = allOptions.find(
      options => options.name === name || (name === 'default' && !options.name)
    );
    return !!targetOptions;
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Loads all connection options from a configuration file.
   *
   * todo: get in count NODE_ENV somehow
   */
  protected async load(): Promise<any[] | undefined> {
    let connectionOptions: any | any[] | undefined = undefined;

    const fileFormats = ['env', 'js', 'ts', 'json'];

    // Detect if baseFilePath contains file extension
    const possibleExtension = this.baseFilePath.substr(
      this.baseFilePath.lastIndexOf('.')
    );
    const fileExtension = fileFormats.find(
      extension => `.${extension}` === possibleExtension
    );

    // try to find any of following configuration formats
    const foundFileFormat =
      fileExtension ||
      fileFormats.find(format => {
        return fs.existsSync(this.baseFilePath + '.' + format);
      });

    // if .env file found then load all its variables into process.env using dotenv package
    if (foundFileFormat === 'env') {
      const dotenv = require('dotenv');
      dotenv.config({ path: this.baseFilePath });
    } else if (fs.existsSync('.env')) {
      const dotenv = require('dotenv');
      dotenv.config({ path: '.env' });
    }

    // Determine config file name
    const configFile = fileExtension
      ? this.baseFilePath
      : this.baseFilePath + '.' + foundFileFormat;

    // try to find connection options from any of available sources of configuration
    if (foundFileFormat === 'js') {
      connectionOptions = require(configFile);
    } else if (foundFileFormat === 'ts') {
      connectionOptions = require(configFile);
    } else if (foundFileFormat === 'json') {
      connectionOptions = require(configFile);
    }

    // normalize and return connection options
    if (connectionOptions) {
      return this.normalizeConnectionOptions(connectionOptions);
    }

    return undefined;
  }

  /**
   * Normalize connection options.
   */
  protected normalizeConnectionOptions(connectionOptions: any[]): any[] {
    if (!(connectionOptions instanceof Array))
      connectionOptions = [connectionOptions];

    connectionOptions.forEach((options: any) => {
      if (options.seeds) {
        const seeds = (options.seeds as any[]).map(seed => {
          if (typeof seed === 'string' && seed.substr(0, 1) !== '/')
            return this.baseDirectory + '/' + seed;

          return seed;
        });
        Object.assign(connectionOptions, { seeds: seeds });
      }
    });

    return connectionOptions;
  }

  /**
   * Gets directory where configuration file should be located and configuration file name.
   */
  protected get baseFilePath(): string {
    return this.baseDirectory + '/' + this.baseConfigName;
  }

  /**
   * Gets directory where configuration file should be located.
   */
  protected get baseDirectory(): string {
    if (this.options && this.options.root) return this.options.root;

    return require('app-root-path').path;
  }

  /**
   * Gets configuration file name.
   */
  protected get baseConfigName(): string {
    if (this.options && this.options.configName) return this.options.configName;

    return 'ormconfig';
  }
}
