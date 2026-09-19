import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { validateCatalog } from './catalog-contract.mjs';

const git = (...args) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { encoding: 'utf8' }).trim();
if (git('branch', '--show-current') !== 'main') throw new Error('Publish only from main');
const remote = git('remote', 'get-url', 'origin');
if (!['git@github.com:bigmints/oven-web.git','https://github.com/bigmints/oven-web.git'].includes(remote)) throw new Error('Unexpected publication destination');
const changed = git('status', '--porcelain=v1', '--untracked-files=all').split('\n').filter(Boolean);
if (!changed.length) { console.log('No curation changes to publish.'); process.exit(0); }
// Read NUL-separated paths instead of parsing quoted porcelain paths.
const tracked = execFileSync('git', ['diff','HEAD','--name-only','-z'], {encoding:'utf8'}).split('\0').filter(Boolean);
const untracked = execFileSync('git', ['ls-files','--others','--exclude-standard','-z'], {encoding:'utf8'}).split('\0').filter(Boolean);
const paths = [...new Set([...tracked, ...untracked])];
for (const file of paths) if (file !== 'catalog/apps.json' && !/^curation\/reports\/\d{4}-\d{2}-\d{2}(?:-[a-z0-9-]+)?\.md$/.test(file)) throw new Error(`Out-of-scope change: ${file}`);
const catalog = JSON.parse(readFileSync('catalog/apps.json','utf8'));
const errors = validateCatalog(catalog);
if (!catalog.apps.length) errors.push('Do not publish an empty catalog');
const previous = JSON.parse(git('show','HEAD:catalog/apps.json'));
for (const app of catalog.apps) {
  const prior = previous.apps.find(x => x.id === app.id);
  if (JSON.stringify(prior) !== JSON.stringify(app) && !['source-reviewed','verified','blocked'].includes(app.compatibility.status)) errors.push(`${app.id}: changed entries require source review`);
  if (app.compatibility.status === 'verified' && prior?.compatibility.status !== 'verified') errors.push(`${app.id}: Linux curator cannot promote macOS verification`);
}
if (errors.length) throw new Error(errors.join('\n'));
execFileSync(process.execPath,['--test','scripts/site.test.mjs'],{stdio:'inherit'});
git('fetch','origin','main');
if (git('rev-parse','HEAD') !== git('rev-parse','origin/main')) throw new Error('Remote changed. Reconcile manually; no overwrite attempted.');
git('add','--',...paths);
git('diff','--cached','--check');
git('commit','-m','Curate consumer apps for Oven');
git('push','origin','HEAD:main');
console.log(`Published curation commit ${git('rev-parse','HEAD')}. GitHub Pages deployment is triggered; deployment completion is not established by this push.`);
