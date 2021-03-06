# @ucreix/typeorm-seeds-generator
 
This little plugin lets typeorm generates seeds files to add custom data to databases.
Right now it only supports: **MySql, Postgres and Mongodb**.

How it works
----
This lib adds some useful commands which can be used in your node.js CLI (these commands similiar to typeorm migrations) will help you create, run, show and revert seeds for an specific database.

It uses lowdb which generates a little json database file in which we store all data related to seeds files, in this way it can keep track of remaining seeds files needed to be processed or the ones already processed.

Also Typescript is required for Cli commands.

Install
----
    npm install https://github.com/Matfork/ucreix-typeorm-seeds-generator.git    

Config
----
In your `ormconfig.{json,ts,js}` add the following lines:
```ts
    module.exports  =  [
    {
        ...
        seeds:  [PATH_TO_SEEDS_FILES],
        ...
        cli:  {
            ...
            seeds: {
                dir: PATH_TO_SEEDS_DIR,
                db: PATH_TO_STORAGE_FILE,
            } 
            ...
        }
    },
```

Example:
```ts
    module.exports  =  [
    {
        ...
        seeds: [`config/db/seed/**/*.{ts,js}`],
        ...
        cli:  {
            ...
            seeds: {
                dir: `config/db/seed/`,
                db: `config/db/seedDb.json`
            }
            ...
        }
    },
```

When running or reverting commands a files named `seedsDb.json` will be generated in `cli.seedsDir`, this file will beceome your seeds database. So, always keep it and if moved remember to also change `cli.seedsDir` path.

If you need to set up allocate an specific seeds.db using an absolute path (e.g. outse path app), you can use SEED_DB_PATH env variable. If provided, it will be used as seed path instead of ormconfig seeds.dir path.
```sh
SEED_DB_PATH=/home/user/seed/seedDb.json
```

Commands
----
##### Create Seed
```sh
./node_modules/ts-node/dist/bin.js ./node_modules/@ucreix/typeorm-seeds-generator/dist/cli.js seed:create -n SeedExmapleFile
```

#### Show Seeds
```sh
./node_modules/ts-node/dist/bin.js ./node_modules/@ucreix/typeorm-seeds-generator/dist/cli.js seed:show
```

#### Run Seeds
```sh
./node_modules/ts-node/dist/bin.js ./node_modules/@ucreix/typeorm-seeds-generator/dist/cli.js seed:run
```
#### Revert Seed
```sh
./node_modules/ts-node/dist/bin.js ./node_modules/@ucreix/typeorm-seeds-generator/dist/cli.js seed:revert
```

CLI Options
----
| Command | Option | Default | Description
| ------ | ------ | ------ | ------ |
| * | --connection or -c | default | Name of the connection on which run a query.
| * | --config or -f | default | Name of the file with connection configuration.
| seed:create | --name or -n | [Required] | Name of seed to be created.
| seed:run | --length or -l | 0 | Length of next pending seeds to be executed .

License
----
MIT