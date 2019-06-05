import * as path from 'path';
import * as glob from 'glob';

/**
 * Loads all exported classes from the given directory.
 */
export function importClassesFromDirectories(
  directories: string[],
  formats = ['.js', '.ts']
): Function[] {
  function loadFileClasses(exported: any, allLoaded: Function[]) {
    if (typeof exported === 'function') {
      allLoaded.push(exported);
    } else if (Array.isArray(exported)) {
      exported.forEach((i: any) => loadFileClasses(i, allLoaded));
    } else if (typeof exported === 'object' && exported !== null) {
      Object.keys(exported).forEach(key =>
        loadFileClasses(exported[key], allLoaded)
      );
    }
    return allLoaded;
  }

  const allFiles = directories.reduce(
    (allDirs, dir) => {
      return allDirs.concat(glob.sync(path.normalize(dir)));
    },
    [] as string[]
  );

  const dirs = allFiles
    .filter(file => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return (
        formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts'
      );
    })
    .map(file => require(path.resolve(file)));

  return loadFileClasses(dirs, []);
}
