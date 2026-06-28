import { GitRevZero } from '../src';
const child_process = require('node:child_process');
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function git(command: string, cwd = process.cwd()): string {
  return child_process.execSync(`git ${command}`, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function createTempRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grz-'));
  git('init', dir);
  git('config user.name "Test"', dir);
  git('config user.email "test@example.com"', dir);
  git('config commit.gpgsign false', dir);
  git('config tag.gpgsign false', dir);
  commitFile(dir, 'file.txt', 'temp', 'init');
  return dir;
}

function commitFile(repo: string, fileName: string, content: string, message: string): void {
  fs.writeFileSync(path.join(repo, fileName), content);
  git(`add ${fileName}`, repo);
  git(`commit -m "${message}"`, repo);
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

  test('shortHash rejects unsafe runtime length values', () => {
    expect(() => GitRevZero.shortHash('7; echo injected' as unknown as number)).toThrow(TypeError);
    expect(() => GitRevZero.shortHash(1.5)).toThrow(TypeError);
    expect(() => GitRevZero.shortHash(Number.NaN)).toThrow(TypeError);
  });

  test('branch returns HEAD when detached', () => {
    const repo = createTempRepo();
    git('checkout --detach', repo);
    process.chdir(repo);
    expect(GitRevZero.branch()).toBe('HEAD');
  });

  test('tag returns exact tag when HEAD is tagged', () => {
    const repo = createTempRepo();
    git('tag v-test', repo);
    process.chdir(repo);
    expect(GitRevZero.tag()).toBe('v-test');
  });

  test('tag returns null when commit has no tag', () => {
    const repo = createTempRepo();
    process.chdir(repo);
    expect(GitRevZero.tag()).toBeNull();
  });

  test('tag returns null when tags exist but HEAD is untagged', () => {
    const repo = createTempRepo();
    git('tag v-initial', repo);
    commitFile(repo, 'second.txt', 'second', 'second');
    process.chdir(repo);
    expect(GitRevZero.tag()).toBeNull();
  });

  test('tag does not write stderr for an untagged commit', () => {
    const repo = createTempRepo();
    process.chdir(repo);
    const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    expect(GitRevZero.tag()).toBeNull();
    expect(stderr).not.toHaveBeenCalled();
  });

  test('fullHash shares prefix with shortHash', () => {
    const full = GitRevZero.fullHash();
    const short = GitRevZero.shortHash();
    expect(full.startsWith(short)).toBe(true);
  });

  test('author and date match git show', () => {
    const full = GitRevZero.fullHash();
    const author = git(`show -s --format=%an ${full}`);
    const date = git(`show -s --format=%ad --date=iso-strict ${full}`);
    expect(GitRevZero.author()).toBe(author);
    expect(GitRevZero.date()).toBe(date);
  });

  test('methods throw outside of git repository', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nogit-'));
    process.chdir(dir);
    expect(() => GitRevZero.fullHash()).toThrow();
    expect(() => GitRevZero.tag()).toThrow();
  });
});
