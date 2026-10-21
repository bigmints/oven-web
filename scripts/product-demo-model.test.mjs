import assert from 'node:assert/strict';
import test from 'node:test';
import {DEMO_STEPS, DEMO_DURATION, CHAPTER_STARTS, demoFrameAt} from '../site/product-demo-model.mjs';
import {productPreview} from './product-preview.mjs';

test('catalog demo installs once and does not switch to a paste-link or second-start flow', () => {
  const clicks = DEMO_STEPS.filter(step => step.click);
  assert.equal(clicks.length, 1);
  assert.equal(clicks[0].target, 'install');
  const markup = productPreview(file => '/' + file);
  assert(!markup.includes('data-demo-url'));
  assert(!markup.includes('Install and launch'));
  assert(markup.includes('data-demo-new-app hidden'));
  assert(markup.includes('data-demo-model="/product-demo-model.mjs"'));
});

test('installation, startup, readiness and opening happen in order before the library result', () => {
  const ids = DEMO_STEPS.map(step => step.id);
  const phases = ['press-install','downloading','inspecting','installing','saving','starting','waiting','opening','ready'];
  phases.forEach((phase, index) => { if (index) assert(ids.indexOf(phase) > ids.indexOf(phases[index - 1])); });
  let time = 0;
  for (const step of DEMO_STEPS) {
    const state = demoFrameAt(time + step.duration / 2);
    assert.equal(state.installedCount, state.installed ? 3 : 2);
    assert.equal(state.runningCount, state.running ? 1 : 0);
    if (state.running) assert(state.installed);
    if (ids.indexOf(step.id) < ids.indexOf('starting')) assert.equal(state.installed, false);
    if (ids.indexOf(step.id) < ids.indexOf('opening')) assert.equal(state.running, false);
    if (state.target) assert.equal(state.chapter, 0, 'Pointer only clicks actual discover controls');
    time += step.duration;
  }
});

test('chapter jumps have coherent snapshots and the next loop resets the example', () => {
  assert.deepEqual(CHAPTER_STARTS.map(time => demoFrameAt(time).chapter), [0,1,2]);
  const initial = demoFrameAt(0), ready = demoFrameAt(CHAPTER_STARTS[2]);
  assert.equal(initial.installedCount, 2);
  assert.equal(initial.query, '');
  assert.equal(ready.installedCount, 3);
  assert.equal(ready.runningCount, 1);
  assert.equal(ready.id, 'ready');
  assert.equal(demoFrameAt(DEMO_DURATION - 1).resetting, true);
  assert.deepEqual(demoFrameAt(DEMO_DURATION), initial);
});
