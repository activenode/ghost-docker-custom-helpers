import fs from "fs";

import {
  FRONTEND_HELPERS_TARGET_DIRECTORY,
  FRONTEND_HELPERS_REGISTRATION_FILE,
  GSCAN_KNOWN_HELPERS_TARGET_FILE,
} from "./ghost.paths.js";

// pre-checks first
if (!fs.existsSync(FRONTEND_HELPERS_REGISTRATION_FILE)) {
  console.error(
    `Could not find the file ${FRONTEND_HELPERS_REGISTRATION_FILE}`
  );
} else if (!fs.existsSync(FRONTEND_HELPERS_TARGET_DIRECTORY)) {
  console.error(`Could not find the file ${FRONTEND_HELPERS_TARGET_DIRECTORY}`);
} else if (!fs.existsSync(GSCAN_KNOWN_HELPERS_TARGET_FILE)) {
  console.error(`Could not find the file ${GSCAN_KNOWN_HELPERS_TARGET_FILE}`);
}

// -----------------
// -----------------

function addLinesToFile_afterMatchedLine(
  fileLocation,
  lineFinderFunction,
  linesToAdd
) {
  const fileContents = fs.readFileSync(fileLocation);
  const fileLines = fileContents.toString().split("\n");
  const lineIndex = lineFinderFunction(fileLines);

  if (typeof lineIndex != "number") {
    throw new Error("lineIndex is not a number");
  }

  [].splice.apply(fileLines, [
    lineIndex + 1, // starting point
    0, // delete ZERO entries
    ...linesToAdd,
  ]);

  fs.writeFileSync(fileLocation, fileLines.join("\n"));
}

const helperFiles = fs
  .readdirSync("./custom-helpers")
  .filter((fileName) => /^[\w]+\.js/.test(fileName));
const helperFileExportNames = [];

helperFiles.forEach((fileName) => {
  helperFileExportNames.push(fileName.slice(0, -3)); // -3 removes .js
  fs.copyFileSync(
    `./custom-helpers/${fileName}`,
    `${FRONTEND_HELPERS_TARGET_DIRECTORY}/${fileName}`
  );
});

if (helperFileExportNames.length === 0) {
  process.exit(0);
}

addLinesToFile_afterMatchedLine(
  FRONTEND_HELPERS_REGISTRATION_FILE,
  function (lineByLineArray) {
    return lineByLineArray.reduce((prev, lineStr, lineIndex) => {
      if (lineStr.trim().startsWith("registerThemeHelper(")) {
        return lineIndex; // since we want the last one we always just overwrite
      }
      return prev;
    }, -1);
  },
  helperFileExportNames.map((exportName) => {
    return `registerThemeHelper('${exportName}', coreHelpers.${exportName});`;
  })
);

addLinesToFile_afterMatchedLine(
  GSCAN_KNOWN_HELPERS_TARGET_FILE,
  function (lineByLineArray) {
    return lineByLineArray.reduce((prev, lineStr, lineIndex) => {
      if (prev < 0 && lineStr.trim().startsWith("let knownHelpers")) {
        return lineIndex; // since we want the last one we always just overwrite
      }
      return prev;
    }, -1);
  },
  [
    `knownHelpers.push(${helperFileExportNames.reduce(
      (arrayString, exportName) => {
        let _separator = arrayString ? ',' : '';
        return `${arrayString}${_separator}'${exportName}'`;
      }, '')})`,
  ]
);

