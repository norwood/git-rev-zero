import { GitRevZero } from '../src';
const child_process = require('node:child_process');
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function createTempRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grz-'));
  child_process.execSync('git init', { cwd: dir, stdio: 'ignore' });
  child_process.execSync('git config user.name "Test"', { cwd: dir, stdio: 'ignore' });
  child_process.execSync('git config user.email "test@example.com"', { cwd: dir, stdio: 'ignore' });
  fs.writeFileSync(path.join(dir, 'file.txt'), 'temp');
  child_process.execSync('git add file.txt', { cwd: dir, stdio: 'ignore' });
  child_process.execSync('git commit -m "init"', { cwd: dir, stdio: 'ignore' });
  return dir;
}

describe('GitRevZero additional tests', () => {
  const originalCwd = process.cwd();

  afterEach(() => {
    process.chdir(originalCwd);
    jest.restoreAllMocks();
  });

  test('shortHash with custom length', () => {
    const hash = GitRevZero.shortHash(10);
    expect(hash).toMatch(/^[0-9a-f]{10}$/);
  });

  test('shortHash with invalid length uses minimal 4 chars', () => {
    const hash = GitRevZero.shortHash(0);
    expect(hash).toMatch(/^[0-9a-f]{4}$/);
  });

  test('branch returns HEAD when detached', () => {
    const repo = createTempRepo();
    child_process.execSync('git checkout --detach', { cwd: repo, stdio: 'ignore' });
    process.chdir(repo);
    expect(GitRevZero.branch()).toBe('HEAD');
  });

  test('tag returns null when commit has no tag', () => {
    const repo = createTempRepo();
    process.chdir(repo);
    expect(GitRevZero.tag()).toBeNull();
  });

  test('fullHash shares prefix with shortHash', () => {
    const full = GitRevZero.fullHash();
    const short = GitRevZero.shortHash();
    expect(full.startsWith(short)).toBe(true);
  });

  test('author and date match git show', () => {
    const full = GitRevZero.fullHash();
    const author = child_process.execSync(`git show -s --format=%an ${full}`, { encoding: 'utf8' }).trim();
    const date = child_process.execSync(`git show -s --format=%ad ${full}`, { encoding: 'utf8' }).trim();
    expect(GitRevZero.author()).toBe(author);
    expect(GitRevZero.date()).toBe(date);
  });

  test('tag falls back to null on command failure', () => {
    jest.spyOn(child_process, 'execSync').mockImplementation(() => { throw new Error('fail'); });
    expect(GitRevZero.tag()).toBeNull();
  });

  test('fullHash throws on command failure', () => {
    jest.spyOn(child_process, 'execSync').mockImplementation(() => { throw new Error('fail'); });
    expect(() => GitRevZero.fullHash()).toThrow('fail');
  });

  test('methods throw outside of git repository', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nogit-'));
    process.chdir(dir);
    expect(() => GitRevZero.fullHash()).toThrow();
  });
});
