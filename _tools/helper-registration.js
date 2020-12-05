import fs from "fs";

import {
  FRONTEND_HELPERS_TARGET_DIRECTORY,
  FRONTEND_HELPERS_REGISTRATION_FILE,
  GSCAN_KNOWN_HELPERS_TARGET_FILE,
} from "./ghost.paths.js";

/**
 *
 * @param {string} fileLocation
 * @param {Function} lineFinderFunction - takes the lines as array<string> as param
 * @param {Array<string>} linesToAdd - the lines that are going to be added at matching point
 */
function addLinesToFile_afterMatchedLine(fileLocation, lineFinderFunction, linesToAdd) {
  const fileContents = fs.readFileSync(fileLocation);
  const fileLines = fileContents.toString().split("\n");
  const lineIndex = lineFinderFunction(fileLines);
  // linesToAdd could be a string only, in that case we simply wrap it:
  const _linesToAdd = Array.isArray(linesToAdd) ? linesToAdd : [linesToAdd];

  if (typeof lineIndex != "number") {
    throw new Error("lineIndex is not a number");
  }

  [].splice.apply(fileLines, [
    lineIndex + 1, // starting point
    0, // delete ZERO entries
    ..._linesToAdd,
  ]);

  fs.writeFileSync(fileLocation, fileLines.join("\n"));
}

function copyHelperFilesFromSrcToTarget(srcDir, helperFiles) {
  helperFiles.forEach((fileName) => {
    fs.copyFileSync(`${srcDir}/${fileName}`, `${FRONTEND_HELPERS_TARGET_DIRECTORY}/${fileName}`);
  });
}

function getLastMatchedLineIndexFunction(matcherFunc) {
  return function(lineByLineArray) {
    return lineByLineArray.reduce((prev, lineStr, lineIndex) => {
      if (matcherFunc(lineStr)) {
        return lineIndex; // since we want the last one we always just overwrite
      }
      return prev;
    }, -1);
  }
}

function getFirstMatchedLineIndexFunction(matcherFunc) {
  return function(lineByLineArray) {
    return lineByLineArray.reduce((prevIndex, lineStr, lineIndex) => {
      if (prevIndex < 0 && matcherFunc(lineStr)) {
        // prev < 0 check makes sure that only the first match is matched!
        return lineIndex;
      }
      return prevIndex;
    }, -1);
  }
}

// pre-checks first
if (!fs.existsSync(FRONTEND_HELPERS_REGISTRATION_FILE)) {
  throw new Error(`Could not find the file ${FRONTEND_HELPERS_REGISTRATION_FILE}`);
} else if (!fs.existsSync(FRONTEND_HELPERS_TARGET_DIRECTORY)) {
  throw new Error(`Could not find the file ${FRONTEND_HELPERS_TARGET_DIRECTORY}`);
} else if (!fs.existsSync(GSCAN_KNOWN_HELPERS_TARGET_FILE)) {
  throw new Error(`Could not find the file ${GSCAN_KNOWN_HELPERS_TARGET_FILE}`);
}


function _registerHelpers({ srcDirPath, helperFilesArray, registerMethodName, matchedLineStartsWith }) {
  const helperExportNames = helperFilesArray.map((helperFileName) => helperFileName.slice(0, -3)); // removes .js

  if (helperExportNames.length === 0) {
    // nothing to do
    console.log(`Did not register any helper from ${srcDirPath} since there were none`);
    return;
  }

  console.log(`Registering files from ${srcDirPath} with method ${registerMethodName} now`);

  // Step 1: copy them over to the ghost helpers
  copyHelperFilesFromSrcToTarget(srcDirPath, helperFilesArray);

  // Step 2: Add the "register" lines to the registering ghost service
  addLinesToFile_afterMatchedLine(
    FRONTEND_HELPERS_REGISTRATION_FILE,
    getLastMatchedLineIndexFunction(lineStr => lineStr.trim().startsWith(matchedLineStartsWith)),
    helperExportNames.map((exportName) => {
      return `${registerMethodName}('${exportName}', coreHelpers.${exportName});`;
    })
  );

  // Step 3: Add the registered helpers to gscans `knownHelpers` such that it will not fail on validation
  addLinesToFile_afterMatchedLine(
    GSCAN_KNOWN_HELPERS_TARGET_FILE,
    getFirstMatchedLineIndexFunction(lineStr => lineStr.trim().startsWith("let knownHelpers")),
    `knownHelpers.push(${helperExportNames.map(_ => `'${_}'`).join(',')});`
  );
}

export function registerSyncHelpers({ srcDir: srcDirPath, helperFiles: helperFilesArray }) {
  _registerHelpers({
    srcDirPath,
    helperFilesArray,
    registerMethodName: "registerThemeHelper",
    matchedLineStartsWith: "registerThemeHelper('",
  });
}

export function registerAsyncHelpers({ srcDir: srcDirPath, helperFiles: helperFilesArray }) {
  _registerHelpers({
    srcDirPath,
    helperFilesArray,
    registerMethodName: "registerAsyncThemeHelper",
    matchedLineStartsWith: "registerAsyncThemeHelper('",
  });
}
