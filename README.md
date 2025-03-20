# Modern Git Rev

A minimalistic, dependency-free TypeScript library providing synchronous Git revision information.

## Installation

```bash
npm install git-rev-zero
```

## Usage

```typescript
import { GitRevZero } from 'git-rev-zero';

console.log(GitRevZero.shortHash()); // e.g., "a1b2c3d"
console.log(GitRevZero.fullHash());  // e.g., full commit hash
console.log(GitRevZero.branch());    // e.g., "main"
console.log(GitRevZero.tag());       // e.g., "v1.0.0" or null
console.log(GitRevZero.message());   // e.g., commit message
console.log(GitRevZero.author());    // e.g., "John Doe"
console.log(GitRevZero.date());      // e.g., commit date
```

## Methods

| Method              | Description                                  |
|---------------------|----------------------------------------------|
| `shortHash(length)` | Get short commit hash (default length is 7). |
| `fullHash()`        | Get full commit hash.                        |
| `branch()`          | Get current branch name.                     |
| `tag()`             | Get current tag or null if not tagged.       |
| `message()`         | Get latest commit message.                   |
| `author()`          | Get latest commit author name.               |
| `date()`            | Get latest commit date.                      |


## License

[MIT](LICENSE)
