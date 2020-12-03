const { GHOST_VERSION } = process.env;

const GHOST_PATH = `/var/lib/ghost/versions/${GHOST_VERSION}`;
const GHOST_CORE_PATH = `${GHOST_PATH}/core`;

const GHOST_FRONTEND_PATH = `${GHOST_CORE_PATH}/frontend`;
export const FRONTEND_HELPERS_TARGET_DIRECTORY = `${GHOST_FRONTEND_PATH}/helpers`;
export const FRONTEND_HELPERS_REGISTRATION_FILE = `${GHOST_FRONTEND_PATH}/services/themes/handlebars/helpers.js`;
export const GSCAN_KNOWN_HELPERS_TARGET_FILE = `${GHOST_PATH}/node_modules/gscan/lib/specs/canary.js`;