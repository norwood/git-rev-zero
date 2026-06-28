import { execSync } from 'node:child_process';
import { GitRevZero } from '../src';

function git(command: string): string {
  return execSync(`git ${command}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function gitTag(): string | null {
  try {
    return git('describe --tags --exact-match');
  } catch {
    return null;
  }
}

describe('GitRevZero', () => {
  it('should return a valid short hash', () => {
    expect(GitRevZero.shortHash()).toBe(git('rev-parse --short=7 HEAD'));
  });

  it('should return a valid full hash', () => {
    expect(GitRevZero.fullHash()).toBe(git('rev-parse HEAD'));
  });

  it('should return the current branch', () => {
    expect(GitRevZero.branch()).toBe(git('rev-parse --abbrev-ref HEAD'));
  });

  it('should return the latest commit message', () => {
    expect(GitRevZero.message()).toBe(git('log -1 --pretty=%B'));
  });

  it('should return the latest commit author', () => {
    expect(GitRevZero.author()).toBe(git('log -1 --pretty=format:%an'));
  });

  it('should return the latest commit date as ISO 8601', () => {
    expect(GitRevZero.date()).toBe(git('log -1 --pretty=format:%ad --date=iso-strict'));
    expect(GitRevZero.date()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('should return null if not on a tag', () => {
    expect(GitRevZero.tag()).toBe(gitTag());
  });
});
