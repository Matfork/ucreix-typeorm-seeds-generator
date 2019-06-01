const a = require("./classes/clase1.js");
const path = require("path");

function importClassesFromDirectories(directories, formats = [".js", ".ts"]) {
  function loadFileClasses(exported, allLoaded) {
    if (typeof exported === "function") {
      allLoaded.push(exported);
    } else if (Array.isArray(exported)) {
      exported.forEach(i => loadFileClasses(i, allLoaded));
    } else if (typeof exported === "object" && exported !== null) {
      Object.keys(exported).forEach(key =>
        loadFileClasses(exported[key], allLoaded)
      );
    }
    return allLoaded;
  }

  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(require("glob").sync(path.normalize(dir)));
  }, []);

  const dirs = allFiles
    .filter(file => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return (
        formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== ".d.ts"
      );
    })
    .map(file => {
      return require(path.resolve(file));
    });

  return loadFileClasses(dirs, []);
}

const data = importClassesFromDirectories(["./classes/**.*"]);
console.log("-->", data);
