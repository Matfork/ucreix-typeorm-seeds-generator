"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var glob = require("glob");
function importClassesFromDirectories(directories, formats) {
    if (formats === void 0) { formats = ['.js', '.ts']; }
    function loadFileClasses(exported, allLoaded) {
        if (typeof exported === 'function') {
            allLoaded.push(exported);
        }
        else if (Array.isArray(exported)) {
            exported.forEach(function (i) { return loadFileClasses(i, allLoaded); });
        }
        else if (typeof exported === 'object' && exported !== null) {
            Object.keys(exported).forEach(function (key) {
                return loadFileClasses(exported[key], allLoaded);
            });
        }
        return allLoaded;
    }
    var allFiles = directories.reduce(function (allDirs, dir) {
        return allDirs.concat(glob.sync(path.normalize(dir)));
    }, []);
    var dirs = allFiles
        .filter(function (file) {
        var dtsExtension = file.substring(file.length - 5, file.length);
        return (formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts');
    })
        .map(function (file) { return require(path.resolve(file)); });
    return loadFileClasses(dirs, []);
}
exports.importClassesFromDirectories = importClassesFromDirectories;
//# sourceMappingURL=DirectoryExportedClassesLoader.js.map