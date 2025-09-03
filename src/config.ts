// one place to config everything
import { Config, Paths } from './types/config';
import path from 'path';
import { fsx } from './utils/fsx';

// --- Base names ---
const OUTFILE_BASE = 'rds-theme-variables';
const OUTFILE_SCSS_FILENAME_FULL = `_${OUTFILE_BASE}.scss`;  //  SCSS output file with RDS vars
const OUTFILE_SCSS_SNAPSHOT_JSON_FULL = `_${OUTFILE_BASE}.json`; // JSON snapshot file with vars.
const OUTFILE_RDS_ICONS_BASE = 'rds-icons';
const OUTFILE_OTHER_ICONS_BASE = 'other-icons';
const OUTFILE_BINDINGS_BASE_INFIX = 'bindings';

// --- Base directories and filenames ---
const inputDirSvgs = 'icons/';                    // Where SVGs are read from
const inputDirJson = 'json/';                     // Where JSONs are read from
const outputDir = 'dist/';                        // Start output dir
const logDir = 'logs/';                           // Logs folder

// --- Derived directories ---
const themeSourceRoot = path.join(outputDir, './MRDS_ThemeSource'); //nested in outputDir
const mrdsRoot = path.join(themeSourceRoot, 'mrds');        //nested in themeSourceRoot
const webRoot = path.join(mrdsRoot, 'web');                 //nested in mrdsRoot
const outputDirScss = path.join(webRoot, 'rds-scss');       //nested in webRoot
const outputDirPublic = path.join(mrdsRoot, 'public');      //nested in mrdsRoot
const outputDirFont = path.join(outputDirPublic, 'fonts/rds-icon-fonts');   //nested in outputDirPublic
const outputDirSvgs = path.join(outputDirPublic, 'rds-svgs'); //nested in outputDirPublic

// --- Output files ---
const OUTFILE_SCSS = path.join(outputDirScss, OUTFILE_SCSS_FILENAME_FULL); // Generated SCSS target
const OUTFILE_SCSS_JSON = path.join(outputDirScss, OUTFILE_SCSS_SNAPSHOT_JSON_FULL); // JSON snapshot file with vars

//font stuff - do we just need 1? 
const OUTFILE_BINDINGS_RDS_ICONS = path.join(outputDirSvgs, OUTFILE_RDS_ICONS_BASE +  '.csv');
const OUTFILE_BINDINGS_OTHER_ICONS = path.join(outputDirSvgs, OUTFILE_OTHER_ICONS_BASE + '.csv');
const OUTFILE_JSON_SNAPSHOT_RDSICONS = path.join(outputDirSvgs, OUTFILE_RDS_ICONS_BASE + '-' + OUTFILE_BINDINGS_BASE_INFIX + '.csv'); //  JSON with theme variables
const OUTFILE_JSON_SNAPSHOT_OTHER_ICONS = path.join(outputDirSvgs, OUTFILE_OTHER_ICONS_BASE + '-' + OUTFILE_BINDINGS_BASE_INFIX + '.csv'); //  JSON with theme variables

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
        OUTFILE_SCSS,
        OUTFILE_SCSS_JSON,
        OUTFILE_JSON_SNAPSHOT_RDSICONS,
        OUTFILE_JSON_SNAPSHOT_OTHER_ICONS,
        OUTFILE_BINDINGS_RDS_ICONS,
        OUTFILE_BINDINGS_OTHER_ICONS,
    },
    startCodepoint: 0xea01,
    enableFallbackDefault: false,
};