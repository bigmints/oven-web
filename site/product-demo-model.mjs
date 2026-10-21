// One catalog-install path. Phase order follows PicoRunner's catalog installer.
export const DEMO_STEPS = Object.freeze([
  {id:'browse', duration:1400, chapter:0},
  {id:'focus-search', duration:650, chapter:0, target:'search'},
  {id:'type-search', duration:1150, chapter:0, target:'search'},
  {id:'filtered', duration:900, chapter:0},
  {id:'aim-install', duration:700, chapter:0, target:'install'},
  {id:'press-install', duration:350, chapter:0, target:'install', click:true},
  {id:'downloading', duration:1800, chapter:1, title:'Getting Moodist', hint:'Getting the app onto this Mac.'},
  {id:'inspecting', duration:1000, chapter:1, title:'Checking Moodist', hint:'Finding how to start it.'},
  {id:'installing', duration:1700, chapter:1, title:'Setting up Moodist', hint:'Preparing what the app needs.'},
  {id:'saving', duration:800, chapter:1, title:'Adding Moodist to My Apps', hint:'Saving the app so you can come back to it.'},
  {id:'starting', duration:1100, chapter:1, title:'Starting Moodist', hint:'Starting the app on this Mac.'},
  {id:'waiting', duration:1000, chapter:1, title:'Waiting for Moodist', hint:'Checking that the app is ready.'},
  {id:'opening', duration:800, chapter:1, title:'Opening Moodist', hint:'The app is ready. Opening it for you.'},
  {id:'ready', duration:4000, chapter:2},
]);
export const DEMO_DURATION = DEMO_STEPS.reduce((sum, step) => sum + step.duration, 0);
export const CHAPTER_STARTS = [0,1,2].map(chapter => {
  let start = 0;
  for (const step of DEMO_STEPS) { if (step.chapter === chapter) return start; start += step.duration; }
});
export function demoFrameAt(time) {
  let remaining = Number.isFinite(time) ? Math.min(Math.max(0, time), DEMO_DURATION - 1) : 0;
  let index = 0;
  while (remaining >= DEMO_STEPS[index].duration) remaining -= DEMO_STEPS[index++].duration;
  const step = DEMO_STEPS[index];
  const at = id => DEMO_STEPS.findIndex(item => item.id === id);
  const progress = remaining / step.duration;
  const typed = index < at('type-search') ? 0 : index === at('type-search') ? Math.floor(progress * 7) : 7;
  const query = 'Moodist'.slice(0, typed);
  const installed = index >= at('starting');
  const running = index >= at('opening');
  return {...step, progress, query, filtered: query === 'Moodist', installed, running,
    installedCount: installed ? 3 : 2, runningCount: running ? 1 : 0,
    completed: [index >= at('inspecting'), index >= at('starting'), index >= at('opening'), index >= at('ready')],
    resetting: false,
  };
}
