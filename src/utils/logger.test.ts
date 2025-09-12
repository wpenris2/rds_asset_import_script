import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from './logger';
import { fsx } from './fsx';

// Minimal mock config for Logger
const mockConfig = {
    paths: {
        logDir: 'test-logs',
        // ...other required paths can be dummy values
        inputDirSvgs: '', inputDirJson: '', outputDir: '', themeSourceRoot: '', mrdsRoot: '', webRoot: '', outputDirScss: '', OUTFILE_SCSS: '', OUTFILE_SCSS_JSON: '', OUTFILE_JSON_SNAPSHOT_RDSICONS: '', OUTFILE_JSON_SNAPSHOT_OTHER_ICONS: '', OUTFILE_BINDINGS_RDS_ICONS: '', OUTFILE_BINDINGS_OTHER_ICONS: ''
    },
    startCodepoint: 0,
    enableFallbackDefault: false
};

describe('Logger', () => {
    let logger: Logger;

    beforeEach(() => {
        logger = new Logger(mockConfig, 'test-log');
    });

    // Helper to access logBuffer for testing
    function getLogBuffer(l: Logger) {
        // @ts-ignore: access private for test
        return l.logBuffer;
    }

    it('push() buffers a single message', () => {
        logger.push('hello');
        expect(getLogBuffer(logger)).toEqual(['hello']);
    });

    it('push() buffers multiple messages in order', () => {
        logger.push('hello');
        logger.push('world');
        expect(getLogBuffer(logger)).toEqual(['hello', 'world']);
    });

    it('push() appends to buffer', () => {
        logger.push('hello');
        logger.push('world');
        logger.push('!');
        expect(getLogBuffer(logger)).toEqual(['hello', 'world', '!']);
    });

    it('clears buffer after write()', async () => {
        logger.push('foo');
        await logger.write(); // Write buffered logs, clear buffer
        // @ts-ignore: access private for test
        expect(logger.logBuffer).toEqual([]);
    });

    it('calls winston logger.info on log()', () => {
        const spy = vi.spyOn(logger['logger'], 'info'); //spy on private logger
        logger.log('test message');
        expect(spy).toHaveBeenCalledWith('test message'); // Check the message was logged
        spy.mockRestore(); // Restore original method
    });


    // Test runWithErrorLogging - 
    it('runWithErrorLogging logs and writes on error', async () => {
        const errorLogger = new Logger(mockConfig, 'error-log');
        const writeSpy = vi.spyOn(errorLogger, 'write').mockResolvedValue(); // Mock write to avoid actual file I/O
        const pushSpy = vi.spyOn(errorLogger, 'push'); // Spy on push to check error logging
        const errorFn = vi.fn().mockRejectedValue(new Error('fail!')); // Function that always rejects
        // Suppress process.exit
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); }); // mock exit to throw instead of exiting
        try {
            await Logger.runWithErrorLogging(errorFn, errorLogger, false);
        } catch { }
        // The try/catch is needed because runWithErrorLogging may call process.exit (mocked to throw),
        // or the errorFn may throw. We catch to prevent the test from failing due to the thrown error/exit.
        // This allows us to assert on the logger behavior after the error handling logic runs.
        expect(pushSpy).toHaveBeenCalledWith(expect.stringContaining('fail!'));
        expect(writeSpy).toHaveBeenCalled();
        exitSpy.mockRestore();
    });
});
