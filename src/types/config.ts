export interface Paths {
    inputDirSvgs: string;
    inputDirJson: string;
    outputDir: string;
    logDir: string;
    themeSourceJson?: string;
    scssOutFile?: string;
    outFileJsonSnapshot?: string;
    outFileBindingsFile?: string;
    themeSourceRoot?: string;
    mrdsRoot?: string;
    webRoot?: string;
    outputDirScss?: string;
    SCSS_OUTFILE?: string;
    OUTFILE_BASE?: string;
}

export interface Config {
    paths: Paths;
    startCodepoint?: number;
    enableFallbackDefault: boolean;
}
