import { describe, it, expect } from 'vitest';
import { nowISO, nowISOSeconds, isoFilenameTimestamp } from './date';

// Tests for date utilities
describe('date utils', () => {
    it(`nowISO() returns '${nowISO()}' and should look like '2025-09-10T12:34:56.789Z'`, () => {
        const iso = nowISO();
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it(`nowISOSeconds() returns '${nowISOSeconds()}' and should look like '2025-09-10T12:34:56Z'`, () => {
        const iso = nowISOSeconds();
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/);
    });

    it(`isoFilenameTimestamp() returns ${isoFilenameTimestamp()} and should not contain a dot '.'`, () => {
        const ts = isoFilenameTimestamp();
        expect(ts).not.toMatch(/[.]/);
    });

    it('isoFilenameTimestamp() should not contain colons', () => {
        const ts = isoFilenameTimestamp();
        expect(ts).not.toMatch(/[:]/);
    });

    it('isoFilenameTimestamp() should not end in Z', () => {
        const ts = isoFilenameTimestamp();
        expect(ts).not.toMatch(/Z$/);
    });


});
