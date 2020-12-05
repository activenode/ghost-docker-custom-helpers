// first we need to read both directories and see if there are equal named ones. this will NOT work so please fail!
import fs from "fs";
import { registerSyncHelpers, registerAsyncHelpers } from "./helper-registration.js";

function quit_playing_games_with_my_heart() {
  process.exit(0);
}

function doArraysIntersect(...arrays) {
  const flattenedInside = arrays.flat();
  return new Set(flattenedInside).size !== flattenedInside.length;
}

function exitOnInvalidHelperFiles(helperFiles) {
  const invalidFiles = helperFiles.filter((fileName) => {
    // check if it fits WITH dash but not WITHOUT - dashes are not allowed!
    return /^[_\w-]+\.js$/.test(fileName) && !/^[_\w]+\.js$/.test(fileName);
  });

  if (invalidFiles.length > 0) {
    throw new Error(
      `You cannot use dashes (-) for helper file names as dashes cannot be used in JS variables. Invalid Files=${invalidFiles}`
    );
  }
}

const HELPER_FILES_SRC_DIR = "./custom-helpers";
const HELPER_FILES_SYNC_SCR_DIR = `${HELPER_FILES_SRC_DIR}/default`;
const HELPER_FILES_ASYNC_SCR_DIR = `${HELPER_FILES_SRC_DIR}/async`;

const helperFilesSrcDirExists = fs.existsSync(HELPER_FILES_SRC_DIR);
const helperFilesSyncSrcDirExists = fs.existsSync(HELPER_FILES_SYNC_SCR_DIR);
const helperFilesAsyncSrcDirExists = fs.existsSync(HELPER_FILES_ASYNC_SCR_DIR);

// presetting
let syncFileHelpers = [];
let asyncFileHelpers = [];

if (!helperFilesSrcDirExists) {
  console.warn(`No ${HELPER_FILES_SRC_DIR} was found. Skipping this part and not adding any.`);
  quit_playing_games_with_my_heart();
}

// sync-files
if (helperFilesSyncSrcDirExists) {
  const syncHelperFilesAll = fs.readdirSync(HELPER_FILES_SYNC_SCR_DIR);
  exitOnInvalidHelperFiles(syncHelperFilesAll);
  syncFileHelpers = syncHelperFilesAll.filter((fileName) => /^[\w_]+\.js$/.test(fileName));
}

// async-files
if (helperFilesAsyncSrcDirExists) {
  const asyncHelperFilesAll = fs.readdirSync(HELPER_FILES_ASYNC_SCR_DIR);
  exitOnInvalidHelperFiles(asyncFileHelpers);
  asyncFileHelpers = asyncHelperFilesAll.filter((fileName) => /^[\w_]+\.js$/.test(fileName));
}

if (helperFilesSyncSrcDirExists && helperFilesAsyncSrcDirExists) {
  console.log(
    `Both ${HELPER_FILES_SYNC_SCR_DIR} and ${HELPER_FILES_ASYNC_SCR_DIR} exist so checking now if there are invalid intersections`
  );

  if (doArraysIntersect(asyncFileHelpers, syncFileHelpers)) {
    console.error(
      `The given files found for sync and async have intersecting filenames. You cannot have the same helper file name for sync and async helpers. sync=${syncFileHelpers}, async=${asyncFileHelpers}`
    );
    process.exit(1);
  }
}

registerSyncHelpers({ srcDir: HELPER_FILES_SYNC_SCR_DIR, helperFiles: syncFileHelpers });
registerAsyncHelpers({ srcDir: HELPER_FILES_ASYNC_SCR_DIR, helperFiles: asyncFileHelpers });
