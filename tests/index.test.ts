import { GitRevZero } from '../src';

describe('GitRevZero', () => {
  it('should return a valid short hash', () => {
    expect(GitRevZero.shortHash()).toMatch(/^[0-9a-f]{7}$/);
    console.log('Short hash:', GitRevZero.shortHash());
  });

  it('should return a valid full hash', () => {
    expect(GitRevZero.fullHash()).toMatch(/^[0-9a-f]{40}$/);
    console.log('Full hash:', GitRevZero.fullHash());
  });

  it('should return the current branch', () => {
    expect(GitRevZero.branch()).toBeDefined();
    console.log('Current branch:', GitRevZero.branch());
  });

  it('should return the latest commit message', () => {
    expect(GitRevZero.message()).toBeDefined();
    console.log('Latest commit message:', GitRevZero.message());
  });

  it('should return the latest commit author', () => {
    expect(GitRevZero.author()).toBeDefined();
    console.log('Latest commit author:', GitRevZero.author());
  });

  it('should return the latest commit date', () => {
    expect(GitRevZero.date()).toBeDefined();
    console.log('Latest commit date:', GitRevZero.date());
  });

  it('should return null if not on a tag', () => {
    const tag = GitRevZero.tag();
    if (tag) {
      expect(tag).toBeDefined();
    } else {
      expect(tag).toBeNull();
    }
    console.log('Tag (if any):', tag);
  });
});
