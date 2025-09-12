//import { ThemeVariables, Themes, ThemeDiff } from '../types/themes';

import path from 'path';
import { nowISO } from '../utils/date';
import { fsx } from '../utils/fsx';
import { config } from '../config';
import { Logger } from '../utils/logger';
import {
    loadAndMergeJsons,
    buildScssThemeMap,
    diffThemes,
    parseThemesJson,
    buildScss,
    formatThemeDiffs,
    formatFirstRunCounts,
    totalsFromDiff,
    extractOrCreateGeneratedDate,
    extractOrCreatePreservedFallback,
} from '../lib/themes';
import minimist from 'minimist';
const logger = new Logger(config, 'RDS-GenScss-Log');


// generates SCSS from JSON themes
Logger.runWithErrorLogging(
    async () => {
        //track changes
        let changeLogText = '';
        let hasChanges = false;

        // Ensure output directories exist
        fsx.ensureDirSync(config.paths.outputDirScss);
        fsx.ensureDirSync(config.paths.logDir);

        //initial log push
        logger.push(`🛠️  RDS Theme Variable Generator`);
        logger.push(`   Input JSON dir  : ${fsx.joinPath(config.paths.themeSourceRoot, config.paths.inputDirJson)}`);
        logger.push(`   Output SCSS file: ${fsx.joinPath(config.paths.themeSourceRoot, config.paths.OUTFILE_SCSS || '')}`);
        logger.push(`   Log dir         : ${fsx.joinPath(config.paths.themeSourceRoot, config.paths.logDir)}`);

        //get the new json themes
        let jsonThemes = await loadAndMergeJsons(config.paths.inputDirJson);

        // --- CLI override support into config ---
        const argv = minimist(process.argv.slice(2));
        const overrides = Array.isArray(argv.override) ? argv.override : argv.override ? [argv.override] : [];
        overrides.forEach((entry: string) => {
            // Format: key=value (for config overrides)
            const match = entry.match(/^([^.]+(?:\.[^.]+)*?)=(.+)$/);
            if (!match) return; // Invalid format, skip
            const [, key, value] = match; // key=value
            // Support nested config keys, e.g. paths.OUTFILE_SCSS
            const keys = key.split('.');
            let target: any = config;
            // Traverse to the correct nested object
            for (let i = 0; i < keys.length - 1; i++) {
                if (typeof target[keys[i]] !== 'object' || target[keys[i]] === null) {
                    target[keys[i]] = {};
                }
                target = target[keys[i]];
            }
            // Try to parse value as JSON, fallback to string
            let parsedValue: any = value;
            try {
                parsedValue = JSON.parse(value);
            } catch {}
            target[keys[keys.length - 1]] = parsedValue;
        });

        
        //get the previous json theme file
        const previousSnapShotFile = await fsx.readFile(config.paths.OUTFILE_SCSS_JSON, true);

        //see if we can get the old snapshot json.
        let previousSnapshot;
        if (previousSnapShotFile) previousSnapshot = parseThemesJson(previousSnapShotFile);
        if (previousSnapshot) {
            logger.push(`   Previous snapshot: ${path.relative(config.paths.themeSourceRoot, config.paths.OUTFILE_SCSS_JSON || '')}`);
        } else {
            logger.push(`   No previous snapshot found.`);
        }

        // Determine if this is the first run (no previous snapshot or no existing SCSS file)
    const isFirstRun = !previousSnapshot || !fsx.existsSync(config.paths.OUTFILE_SCSS);
        if (isFirstRun) logger.push(`   First run       : ${isFirstRun}`);

        //now get some diffs.
        const diffs = previousSnapshot ? diffThemes(previousSnapshot, jsonThemes) : [];

        if (isFirstRun) {
            changeLogText = formatFirstRunCounts(jsonThemes);
            hasChanges = true;
        } else {
            const totals = totalsFromDiff(diffs);
            hasChanges = (totals.added + totals.removed + totals.changed) > 0;
        }
        // get the diff text
        const diffText = formatThemeDiffs(diffs);
        logger.push('\nDetailed diff:');
        logger.push(diffText);

        //parse preservedFallBack, generatedData (if they exist, otherwise default), and set lastUpdateDate (now)
        const scssContent: string | null = await fsx.readFile(config.paths.OUTFILE_SCSS, true);
        const generatedDate = extractOrCreateGeneratedDate(scssContent);
        const lastUpdatedDate = nowISO();
        const preservedFallback = extractOrCreatePreservedFallback(scssContent, config.enableFallbackDefault);

        // Backup the previous snapshot if it exists
        if (fsx.existsSync(config.paths.OUTFILE_SCSS_JSON)) {
            const backupPath = config.paths.OUTFILE_SCSS_JSON + ".old";
            await fsx.rename(config.paths.OUTFILE_SCSS_JSON, backupPath);
            logger.push(`🗂️ Previous snapshot backed up as: ${path.relative(config.paths.themeSourceRoot, backupPath)}`);
        }
        // Write the new snapshot
        await fsx.writeFile(config.paths.OUTFILE_SCSS_JSON, JSON.stringify(jsonThemes, null, 2));

        // Build the SCSS map and full SCSS content
        const scssMap = buildScssThemeMap(jsonThemes);

        // Build the full SCSS content
        const scss = buildScss(jsonThemes, {
            enableFallback: preservedFallback,
            generatedDate,
            lastUpdatedDate,
            changeLogText,
            diffText,
            scssMap
        });

        // Write the SCSS file
        await fsx.ensureDir(path.dirname(config.paths.OUTFILE_SCSS));
        await fsx.writeFile(config.paths.OUTFILE_SCSS, scss);
        logger.push(`✅ Generated: ${fsx.joinPath(config.paths.themeSourceRoot, config.paths.OUTFILE_SCSS)}`);
        // push the logger to write the log file
        await logger.write();
    }, logger, true
);