import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = 'c:/Users/Super/Desktop/VIN-Decoder';

const DEFAULT_AUTHOR = {
  name: 'Haseeb Khokhar',
  email: 'haseebkhokhar0999@gmail.com',
};

const SKIP_DIRS = new Set(['.git', 'node_modules', '.vercel']);

function walkProjectFiles(currentDir, relativeBase = '') {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relPath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...walkProjectFiles(path.join(currentDir, entry.name), relPath));
    } else if (entry.isFile()) {
      files.push(relPath);
    }
  }

  return files;
}

export async function ensureRepoInitialized(defaultBranch = 'main') {
  if (!fs.existsSync(path.join(dir, '.git'))) {
    await git.init({ fs, dir, defaultBranch });
  }
}

export async function commitChanges(message, author = DEFAULT_AUTHOR) {
  await ensureRepoInitialized('main');

  const files = walkProjectFiles(dir);
  let stagedCount = 0;

  for (const filepath of files) {
    if (filepath === '.env' || filepath.startsWith('.env.')) continue;
    const ignored = await git.isIgnored({ fs, dir, filepath });
    if (ignored) continue;
    await git.add({ fs, dir, filepath });
    stagedCount += 1;
  }

  const matrix = await git.statusMatrix({ fs, dir });
  for (const [filepath, headStatus, workdirStatus, stageStatus] of matrix) {
    if (headStatus === 1 && workdirStatus === 0 && stageStatus !== 0) {
      await git.remove({ fs, dir, filepath });
      stagedCount += 1;
    }
  }

  const sha = await git.commit({
    fs,
    dir,
    author,
    message,
  });

  return { sha, message, stagedCount };
}

export async function pushToGitHub(repoUrl, token, username = 'git', branch = 'main') {
  try {
    console.log(`Setting remote origin: ${repoUrl}`);
    try {
      await git.deleteRemote({ fs, dir, remote: 'origin' });
    } catch {}

    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: repoUrl,
    });

    console.log(`Pushing to ${branch} on GitHub...`);
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({
        username: username || 'token',
        password: token,
      }),
    });

    console.log('Push complete!', pushResult);
    return { success: true, pushResult };
  } catch (err) {
    console.error('Push failed:', err.message);
    return { success: false, error: err.message };
  }
}

const isDirectExecution =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const args = process.argv.slice(2);
  let commitMessage = null;
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--commit' && args[i + 1]) {
      commitMessage = args[i + 1];
      i += 1;
    } else {
      positional.push(args[i]);
    }
  }

  const repoUrl = positional[0];
  const token = positional[1] || process.env.GITHUB_TOKEN;
  const username = positional[2] || 'git';

  if (!repoUrl || !token) {
    console.log(
      'Usage: node push_to_github.js [--commit "message"] <https://github.com/user/repo.git> <github_token>'
    );
    process.exit(1);
  }

  (async () => {
    if (commitMessage) {
      const committed = await commitChanges(commitMessage);
      console.log(`Committed ${committed.sha}: ${committed.message}`);
    }
    const res = await pushToGitHub(repoUrl, token, username);
    if (!res.success) process.exit(1);
  })();
}
