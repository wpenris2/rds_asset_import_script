
import winston from 'winston';
import path from 'path';
import { Config } from '../types/config';
import { isoFilenameTimestamp } from './date';
import { fsx } from './fsx';


// Generic logger object using winston
export class Logger {
    private logBuffer: string[] = [];
    private logger: winston.Logger;
    private logDir: string;
    private logFileName: string;
    
    constructor(config: Config, filename?: string) {
        this.logDir = config.paths.logDir || 'logs';  // to config.logDir or 'logs'
        fsx.ensureDirSync(this.logDir);         //ensure dir exists

        // Filename with timestamp if not provided, finegrained to seconds (not ms)
        const baseName = filename || 'script-logger';
        this.logFileName = `${baseName}-${isoFilenameTimestamp()}.log`;
        const logFilePath = fsx.joinPath(this.logDir, this.logFileName);  //create the log file path

        // Create the logger, set to info level
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.simple(),
            transports: [ // Define where to transport the logs to, in this case our file.
                new winston.transports.File({ filename: logFilePath })
            ]
        });
    }

    /** Buffer a log message to be written later. */
    push(message: string) {
        this.logBuffer.push(message);
    }

    /** Write all buffered logs to the file and clear the buffer. */
    async write() {
        // Write all buffered logs to the file using fsx.writeFile
        await fsx.writeFile(
            fsx.joinPath(this.logDir, this.logFileName),
            this.logBuffer.join('\n')
        );
        this.logBuffer = [];
    }

    /** Write a single log message immediately. */
    log(message: string) {
        this.logger.info(message);
    }
}