import * as childProcess from 'node:child_process';

export class GitRevZero {
  private static execGit(args: string[], stderr: 'pipe' | 'ignore' = 'pipe'): string {
    return childProcess.execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', stderr],
    }).trim();
  }

  private static normalizeShortHashLength(length: number): number {
    if (typeof length !== 'number' || !Number.isSafeInteger(length)) {
      throw new TypeError('shortHash length must be a safe integer');
    }

    return Math.max(4, length);
  }

  private static isNoExactTagError(error: unknown): boolean {
    const stderr = (error as { stderr?: unknown }).stderr;
    const message = Buffer.isBuffer(stderr) ? stderr.toString('utf8') : String(stderr ?? '');

    return message.includes('no tag exactly matches') || message.includes('No names found');
  }

  static shortHash(length = 7): string {
    return this.execGit(['rev-parse', `--short=${this.normalizeShortHashLength(length)}`, 'HEAD']);
  }

  static fullHash(): string {
    return this.execGit(['rev-parse', 'HEAD']);
  }

  static branch(): string {
    return this.execGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  }

  static tag(): string | null {
    try {
      return this.execGit(['describe', '--tags', '--exact-match']);
    } catch (error) {
      if (this.isNoExactTagError(error)) {
        return null;
      }

      throw error;
    }
  }

  static message(): string {
    return this.execGit(['log', '-1', '--pretty=%B']);
  }

  static author(): string {
    return this.execGit(['log', '-1', '--pretty=format:%an']);
  }

  static date(): string {
    return this.execGit(['log', '-1', '--pretty=format:%ad', '--date=iso-strict']);
  }
}
