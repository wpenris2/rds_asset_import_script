export interface Paths {
    inputDirSvgs: string;
    inputDirJson: string;
    outputDir: string;
    logDir: string;
    themeSourceRoot: string;
    mrdsRoot: string;
    webRoot: string;
    outputDirScss: string;
    OUTFILE_SCSS: string;
    OUTFILE_SCSS_JSON:string
    OUTFILE_JSON_SNAPSHOT_RDSICONS: string;
    OUTFILE_JSON_SNAPSHOT_OTHER_ICONS: string;
    OUTFILE_BINDINGS_RDS_ICONS: string;
    OUTFILE_BINDINGS_OTHER_ICONS: string;
}

export interface Config {
    paths: Paths;
    startCodepoint: number;
    enableFallbackDefault: boolean;
}
