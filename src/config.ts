// one place to config everything
import { Config, Paths } from './types/config';
import path from 'path';
import { fsx } from './utils/fsx';

// --- Base names ---
const OUTFILE_BASE = 'rds-theme-variables';
const OUTFILE_SCSS_FILENAME_FULL = `_${OUTFILE_BASE}.scss`;  //  SCSS output file with RDS vars
const OUTFILE_RDS_ICONS_BASE = 'rds-icons';
const OUTFILE_OTHER_ICONS_BASE = 'other-icons';
const OUTFILE_BINDINGS_BASE_INFIX = 'bindings';

// --- Base directories and filenames ---
const inputDirSvgs = 'icons/';                    // Where SVGs are read from
const inputDirJson = 'json/';                     // Where JSONs are read from
const outputDir = 'dist/';                        // Start output dir
const logDir = 'logs/';                           // Logs folder

// --- Derived directories ---
const themeSourceRoot = path.join(outputDir, './MRDS_ThemeSource'); //goes in outputDir
const mrdsRoot = path.join(themeSourceRoot, 'mrds');        //nested in themeSourceRoot
const webRoot = path.join(mrdsRoot, 'web');                 //nested in mrdsRoot
const outputDirScss = path.join(webRoot, 'rds-scss');       //nested in webRoot

// --- Output files ---
const SCSS_OUTFILE = path.join(outputDirScss, OUTFILE_SCSS_FILENAME_FULL); // Generated SCSS target
//const OUTFILE_BINDINGS = path.join(outputDirScss, OUTFILE_BINDINGS);
//const OUTFILE_JSON_SNAPSHOT = path.join(outputDirScss, OUTFILE_JSON_SNAPSHOT); //  JSON with theme variables

// --- Exported config object ---
export const config: Config = {
    paths: {
        inputDirSvgs,
        inputDirJson,
        outputDir,
        logDir,
        themeSourceRoot,
        mrdsRoot,
        webRoot,
        outputDirScss,
        SCSS_OUTFILE,
        OUTFILE_BASE,
    },
    startCodepoint: 0xea01,
    enableFallbackDefault: false,
};