import { execSync } from 'node:child_process';

export class GitRevZero {
  private static execGit(command: string): string {
    return execSync(command, { encoding: 'utf8' }).trim();
  }

  static shortHash(length = 7): string {
    return this.execGit(`git rev-parse --short=${length} HEAD`);
  }

  static fullHash(): string {
    return this.execGit('git rev-parse HEAD');
  }

  static branch(): string {
    return this.execGit('git rev-parse --abbrev-ref HEAD');
  }

  static tag(): string | null {
    try {
      return this.execGit('git describe --tags --exact-match');
    } catch {
      return null; // not on a tag
    }
  }

  static message(): string {
    return this.execGit('git log -1 --pretty=%B');
  }

  static author(): string {
    return this.execGit('git log -1 --pretty=format:%an');
  }

  static date(): string {
    return this.execGit('git log -1 --pretty=format:%ad');
  }
}