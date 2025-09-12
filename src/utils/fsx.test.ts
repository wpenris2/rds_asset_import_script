import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fsx } from './fsx';
import fs from 'fs';
import path from 'path';

const testDir = 'test-fsx-dir';
const testFile = path.join(testDir, 'test.txt');
const testFile2 = path.join(testDir, 'test2.txt');


beforeEach(() => {
    // Clean up before each test; called before each it() call
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testFile2)) fs.unlinkSync(testFile2);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir, { recursive: true });
});


afterEach(() => {
    // Clean up after each test; called after each it() call
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testFile2)) fs.unlinkSync(testFile2);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir, { recursive: true });
});

describe('fsx utility', () => {
    it('ensureDirSync creates a directory', () => {
        // Ensure the directory does not exist
        expect(fs.existsSync(testDir)).toBe(false);
        // Create the directory with fsx
        fsx.ensureDirSync(testDir);
        // Ensure the directory was created
        expect(fs.existsSync(testDir)).toBe(true);
    });

    it('writeFile writes a file (dir already exists)', async () => {
        // Ensure the directory exists
        fs.mkdirSync(testDir, { recursive: true });
        // Write the file with content 'hello world'
        await fsx.writeFile(testFile, 'hello world');
        // Ensure the file was written
        expect(fs.existsSync(testFile)).toBe(true);
        // test that it contains 'hello world'
        const content = fs.readFileSync(testFile, 'utf8');
        expect(content).toBe('hello world');
    });

    it('readFile reads a file (dir and file already exist)', async () => {
        // Ensure the directory and file exist
        fs.mkdirSync(testDir, { recursive: true });
        // write the file content
        fs.writeFileSync(testFile, 'hello world2');
        // Read the file with fsx
        const content = await fsx.readFile(testFile);
        // Ensure the content is correct
        expect(content).toBe('hello world2');
    });

    it('readFile returns null if file does not exist and allowEmpty is true', async () => {
        // Ensure the file does not exist
        expect(fs.existsSync('nonexistent.txt')).toBe(false);
        // Read the non-existent file with allowEmpty=true  
        const content = await fsx.readFile('nonexistent.txt', true);
        // Ensure the content is null
        expect(content).toBeNull();
    });

    it('readFile throws error if file does not exist and allowEmpty is false', async () => {
        // Ensure the file does not exist
        expect(fs.existsSync('nonexistent.txt')).toBe(false);
        // This should throw an error
        await expect(fsx.readFile('nonexistent.txt', false)).rejects.toThrow();
    });

    const dir = 'foo';
    const file = 'bar.txt';
    it(`joinPath joins paths correctly: ${dir} and ${file} into ${dir}/${file}`, () => {
        // Test joining dir and file
        const joined = fsx.joinPath(dir, file);
        // Ensure the joined path is correct
        expect(joined).toBe(path.join(dir, file));
    });


    it('existsSync returns true for existing file', async () => {
        // Use fs for setup
        fs.mkdirSync(testDir, { recursive: true });
        // Create the file
        fs.writeFileSync(testFile, 'exists');
        // Ensure the file exists
        expect(fsx.existsSync(testFile)).toBe(true);
    });

    it('existsSync returns false for non-existing file', () => {
        // Ensure the file does not exist
        expect(fs.existsSync('nope.txt')).toBe(false);
    });

    it('rename moves a file to a new path and new file exists', async () => {
        // Use fs for setup
        fs.mkdirSync(testDir, { recursive: true });
        // Create the file to be renamed
        fs.writeFileSync(testFile, 'rename me');
        // Rename the file
        await fsx.rename(testFile, testFile2);
        // Ensure the new file exists
        expect(fs.existsSync(testFile2)).toBe(true);
        // Ensure the old file does not exist
        expect(fs.existsSync(testFile)).toBe(false);
    });

    it('rename moves a file to a new path and new old doesn\'t exist', async () => {
        // Use fs for setup
        fs.mkdirSync(testDir, { recursive: true });
        // Create the file to be renamed
        fs.writeFileSync(testFile, 'rename me');
        // Rename the file
        await fsx.rename(testFile, testFile2);
        // Ensure the old file does not exist
        expect(fs.existsSync(testFile)).toBe(false);
    });

    it('rename preserves file content', async () => {
        // Use fs for setup
        fs.mkdirSync(testDir, { recursive: true });
        // Create the file to be renamed
        fs.writeFileSync(testFile, 'rename me');
        // Rename the file
        await fsx.rename(testFile, testFile2);
        // Ensure the new file has the correct content
        const content = fs.readFileSync(testFile2, 'utf8');
        // Ensure the content is correct
        expect(content).toBe('rename me');
    });
});
