//import { ThemeVariables, Themes, ThemeDiff } from '../types/themes';

import path from 'path';
import fs, { writeFile } from 'fs';
import { nowISO } from '../utils/date'; // Ensure ../utils/misc.ts exists, or update this path to the correct file location
import { fsx } from '../utils/fsx';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { loadAndMergeJsons, buildScssThemeMap, diffThemes, parseThemesJson, buildScss, formatThemeDiffs, formatFirstRunCounts, totalsFromDiff } from '../lib/themes';
import { json } from 'stream/consumers';
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
        const isFirstRun = !previousSnapshot || !fs.existsSync(config.paths.OUTFILE_SCSS);
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

        const diffText = formatThemeDiffs(diffs);
        logger.push('\nDetailed diff:');
        logger.push(diffText);

        // Timestamps + preserved fallback
        let generatedDate = nowISO();
        let lastUpdatedDate = generatedDate;
        let preservedFallback = config.enableFallbackDefault;

        // Use fsx.existsSync and fsx.readFile for consistency
        if (fs.existsSync(config.paths.OUTFILE_SCSS)) {
            const existing = await fsx.readFile(config.paths.OUTFILE_SCSS);
            if (existing) {
                const matchGenerated = existing.match(/Generated:\s*(.*)/);
                if (matchGenerated) generatedDate = matchGenerated[1].trim();

                const matchUpdated = existing.match(/Last Updated:\s*(.*)/);
                if (matchUpdated && !hasChanges) {
                    lastUpdatedDate = matchUpdated[1].trim();
                } else {
                    lastUpdatedDate = nowISO();
                }

                const matchFallback = existing.match(/\$enableFallback:\s*(true|false)\s*!default;/);
                if (matchFallback) preservedFallback = matchFallback[1] === 'true';
            }
        }

        // Backup the previous snapshot if it exists
         if (fsx.existsSync(config.paths.OUTFILE_SCSS_JSON)) {
            const backupPath = config.paths.OUTFILE_SCSS_JSON + ".old";
            try {
                await fsx.rename(config.paths.OUTFILE_SCSS_JSON, backupPath);
                logger.push(`🗂️ Previous snapshot backed up as: ${path.relative(config.paths.themeSourceRoot, backupPath)}`);
            } catch (err) {
                logger.push(`❌ Failed to backup previous snapshot: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        await fsx.writeFile(config.paths.OUTFILE_SCSS_JSON, JSON.stringify(jsonThemes, null, 2));


        const scssMap = buildScssThemeMap(jsonThemes);

        const scss = buildScss(jsonThemes, {
            enableFallback: preservedFallback,
            generatedDate,
            lastUpdatedDate,
            changeLogText,
            diffText,
            scssMap
        });

        await fsx.ensureDir(path.dirname(config.paths.OUTFILE_SCSS));
        await fsx.writeFile(config.paths.OUTFILE_SCSS, scss);
        logger.push(`✅ Generated: ${fsx.joinPath(config.paths.themeSourceRoot, config.paths.OUTFILE_SCSS)}`);
        await logger.write();
    }, logger, true
);