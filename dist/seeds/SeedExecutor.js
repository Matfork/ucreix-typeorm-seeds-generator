"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Seed_1 = require("./Seed");
var DirectoryExportedClassesLoader_1 = require("../util/DirectoryExportedClassesLoader");
var Container_1 = require("./Container");
var typeorm_1 = require("typeorm");
var OrmUtils_1 = require("../util/OrmUtils");
var DatabaseStorage_1 = require("../util/DatabaseStorage");
var TABLE_SEEDS = 'seeds';
var TABLE_MONGO_SEEDS = 'mongoSeeds';
var TABLE_SEQUENCES = 'sequences';
var SeedExecutor = (function () {
    function SeedExecutor(connectionOptions, queryRunner) {
        this.connectionOptions = connectionOptions;
        this.queryRunner = queryRunner;
        this.transaction = true;
        this.db = DatabaseStorage_1.DatabaseStorage.db;
        this.tblToSeed = !typeorm_1.getConnection(connectionOptions.name).driver
            .mongodb
            ? TABLE_SEEDS
            : TABLE_MONGO_SEEDS;
    }
    SeedExecutor.prototype.runUndoLastSeed = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (options && options.transaction === false) {
                            this.transaction = false;
                        }
                        return [4, this.undoLastSeed()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    SeedExecutor.prototype.runSeeds = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var successSeeds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (options && options.transaction === false) {
                            this.transaction = false;
                        }
                        return [4, this.executePendingSeeds()];
                    case 1:
                        successSeeds = _a.sent();
                        return [2, successSeeds];
                }
            });
        });
    };
    SeedExecutor.prototype.showSeeds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasUnappliedSeeds, queryRunner, executedSeeds, allSeeds, _loop_1, _i, allSeeds_1, seed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hasUnappliedSeeds = false;
                        queryRunner = this.queryRunner ||
                            typeorm_1.getConnection(this.connectionOptions.name).createQueryRunner();
                        executedSeeds = this.db.get(this.tblToSeed).value();
                        return [4, this.getSeeds()];
                    case 1:
                        allSeeds = _a.sent();
                        _loop_1 = function (seed) {
                            var es = executedSeeds.find(function (es) { return es.name === seed.name; });
                            if (es) {
                                console.log(" [X] " + seed.name);
                            }
                            else {
                                hasUnappliedSeeds = true;
                                console.log(" [ ] " + seed.name);
                            }
                        };
                        for (_i = 0, allSeeds_1 = allSeeds; _i < allSeeds_1.length; _i++) {
                            seed = allSeeds_1[_i];
                            _loop_1(seed);
                        }
                        if (allSeeds.length === 0) {
                            console.log("There are no seeds available.");
                        }
                        if (!!this.queryRunner) return [3, 3];
                        return [4, queryRunner.release()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2, hasUnappliedSeeds];
                }
            });
        });
    };
    SeedExecutor.prototype.executePendingSeeds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, allSeeds, successSeeds, executedSeeds, pendingSeeds, transactionStartedByUs, currSequence, nextSequence, err_1, rollbackError_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.queryRunner ||
                            typeorm_1.getConnection(this.connectionOptions.name).createQueryRunner();
                        return [4, this.getSeeds()];
                    case 1:
                        allSeeds = _a.sent();
                        successSeeds = [];
                        executedSeeds = this.db.get(this.tblToSeed).value();
                        pendingSeeds = allSeeds.filter(function (seed) {
                            var executedSeed = executedSeeds.find(function (es) { return es.name === seed.name; });
                            if (executedSeed)
                                return false;
                            return true;
                        });
                        if (!!pendingSeeds.length) return [3, 4];
                        console.log("No seeds are pending");
                        if (!!this.queryRunner) return [3, 3];
                        return [4, queryRunner.release()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2, []];
                    case 4:
                        console.log(executedSeeds.length + " seeds are already loaded in the database.");
                        console.log(allSeeds.length + " seeds were found in the source code.");
                        console.log(pendingSeeds.length + " seeds are new seeds that needs to be executed.");
                        transactionStartedByUs = false;
                        if (!(this.transaction && !queryRunner.isTransactionActive)) return [3, 6];
                        return [4, queryRunner.startTransaction()];
                    case 5:
                        _a.sent();
                        transactionStartedByUs = true;
                        _a.label = 6;
                    case 6:
                        currSequence = this.db.get(TABLE_SEQUENCES).value()[this.tblToSeed];
                        nextSequence = currSequence + 1;
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 11, 16, 19]);
                        return [4, typeorm_1.PromiseUtils.runInSequence(pendingSeeds, function (seed) {
                                return seed
                                    .instance.up(queryRunner)
                                    .then(function () {
                                    return _this.db
                                        .get(_this.tblToSeed)
                                        .push({
                                        id: _this.db
                                            .get(_this.tblToSeed)
                                            .size()
                                            .value() + 1,
                                        sequence: nextSequence,
                                        name: seed.name,
                                        timestamp: seed.timestamp
                                    })
                                        .write();
                                })
                                    .then(function () {
                                    successSeeds.push(seed);
                                    console.log("Seed " + seed.name + " has been executed successfully.");
                                });
                            })];
                    case 8:
                        _a.sent();
                        if (!transactionStartedByUs) return [3, 10];
                        return [4, queryRunner.commitTransaction()];
                    case 9:
                        _a.sent();
                        this.db
                            .update(TABLE_SEQUENCES + "." + this.tblToSeed, function (n) { return n + 1; })
                            .write();
                        _a.label = 10;
                    case 10: return [3, 19];
                    case 11:
                        err_1 = _a.sent();
                        this.db
                            .get(this.tblToSeed)
                            .remove({ sequence: nextSequence })
                            .write();
                        if (!transactionStartedByUs) return [3, 15];
                        _a.label = 12;
                    case 12:
                        _a.trys.push([12, 14, , 15]);
                        return [4, queryRunner.rollbackTransaction()];
                    case 13:
                        _a.sent();
                        return [3, 15];
                    case 14:
                        rollbackError_1 = _a.sent();
                        return [3, 15];
                    case 15: throw err_1;
                    case 16:
                        if (!!this.queryRunner) return [3, 18];
                        return [4, queryRunner.release()];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18: return [7];
                    case 19: return [2, successSeeds];
                }
            });
        });
    };
    SeedExecutor.prototype.undoLastSeed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, executedSeeds, lastTimeExecutedSeed, allSeeds, seedToRevert, transactionStartedByUs, err_2, rollbackError_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.queryRunner ||
                            typeorm_1.getConnection(this.connectionOptions.name).createQueryRunner();
                        executedSeeds = this.db.get(this.tblToSeed).value();
                        lastTimeExecutedSeed = this.getLatestExecutedSeed(executedSeeds);
                        if (!lastTimeExecutedSeed) {
                            console.log("No seeds was found in the database. Nothing to revert!");
                            return [2];
                        }
                        return [4, this.getSeeds()];
                    case 1:
                        allSeeds = _a.sent();
                        seedToRevert = allSeeds.find(function (seed) { return seed.name === lastTimeExecutedSeed.name; });
                        if (!seedToRevert)
                            throw new Error("No seed " + lastTimeExecutedSeed.name + " was found in the source code. Make sure you have this seed in your codebase and its included in the connection options.");
                        console.log(executedSeeds.length + " seeds are already loaded in the database.");
                        console.log(lastTimeExecutedSeed.name + " is the last executed seed. It was executed on " + new Date(lastTimeExecutedSeed.timestamp).toString() + ".");
                        console.log("Now reverting it...");
                        transactionStartedByUs = false;
                        if (!(this.transaction && !queryRunner.isTransactionActive)) return [3, 3];
                        return [4, queryRunner.startTransaction()];
                    case 2:
                        _a.sent();
                        transactionStartedByUs = true;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, 13, 16]);
                        return [4, seedToRevert.instance.down(queryRunner)];
                    case 4:
                        _a.sent();
                        return [4, this.deleteExecutedSeed(seedToRevert)];
                    case 5:
                        _a.sent();
                        console.log("Seed " + seedToRevert.name + " has been reverted successfully.");
                        if (!transactionStartedByUs) return [3, 7];
                        return [4, queryRunner.commitTransaction()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3, 16];
                    case 8:
                        err_2 = _a.sent();
                        if (!transactionStartedByUs) return [3, 12];
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4, queryRunner.rollbackTransaction()];
                    case 10:
                        _a.sent();
                        return [3, 12];
                    case 11:
                        rollbackError_2 = _a.sent();
                        return [3, 12];
                    case 12: throw err_2;
                    case 13:
                        if (!!this.queryRunner) return [3, 15];
                        return [4, queryRunner.release()];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15: return [7];
                    case 16: return [2];
                }
            });
        });
    };
    SeedExecutor.prototype.getSeeds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connOptions, seedsDir, seedsBuilt, seeds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, typeorm_1.getConnectionOptions(this.connectionOptions.name)];
                    case 1:
                        connOptions = _a.sent();
                        seedsDir = connOptions.seeds
                            ? connOptions.seeds
                            : [];
                        seedsBuilt = this.buildSeeds(seedsDir);
                        seeds = seedsBuilt.map(function (seed) {
                            var seedClassName = seed.constructor.name;
                            var seedTimestamp = parseInt(seedClassName.substr(-13));
                            if (!seedTimestamp)
                                throw new Error(seedClassName + " Seed name is wrong. Seed class name should have a JavaScript timestamp appended.");
                            return new Seed_1.Seed(undefined, seedTimestamp, seedClassName, seed);
                        });
                        return [2, seeds.sort(function (a, b) { return a.timestamp - b.timestamp; })];
                }
            });
        });
    };
    SeedExecutor.prototype.buildSeeds = function (seeds) {
        var _a = OrmUtils_1.OrmUtils.splitClassesAndStrings(seeds), seedClasses = _a[0], seedDirectories = _a[1];
        var allSeedClasses = seedClasses.concat(DirectoryExportedClassesLoader_1.importClassesFromDirectories(seedDirectories));
        return allSeedClasses.map(function (seedClass) {
            return Container_1.getFromContainer(seedClass);
        });
    };
    SeedExecutor.prototype.getLatestExecutedSeed = function (seeds) {
        var sortedSeeds = seeds
            .map(function (seed) { return seed; })
            .sort(function (a, b) { return ((a.id || 0) - (b.id || 0)) * -1; });
        return sortedSeeds.length > 0 ? sortedSeeds[0] : undefined;
    };
    SeedExecutor.prototype.deleteExecutedSeed = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var lastSequence, newSequence;
            var _a;
            return __generator(this, function (_b) {
                this.db
                    .get(this.tblToSeed)
                    .remove({ name: seed.name, timestamp: seed.timestamp })
                    .write();
                lastSequence = this.db
                    .get(this.tblToSeed)
                    .orderBy('sequence', 'desc')
                    .take(1)
                    .map(function (el) { return el.sequence; })
                    .value();
                newSequence = lastSequence[0] ? lastSequence[0] : 0;
                this.db
                    .get("" + TABLE_SEQUENCES)
                    .assign((_a = {}, _a[this.tblToSeed] = newSequence, _a))
                    .write();
                return [2];
            });
        });
    };
    return SeedExecutor;
}());
exports.SeedExecutor = SeedExecutor;
//# sourceMappingURL=SeedExecutor.js.map