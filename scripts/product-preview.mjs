// A fixed example of the current My Apps interface. It does not depend on catalog size.
const paths = {
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  settings: '<path d="M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-8 0v6"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6h.01M10 6h.01"/>',
  activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  play: '<path d="m8 4 13 8-13 8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  power: '<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
  memory: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 9v6m4-6v6m4-6v6M1 10h3m-3 4h3m16-4h3m-3 4h3"/>',
  storage: '<path d="m6 4-4 10v6h20v-6L18 4Z"/><path d="M2 14h20m-7 3h3"/>',
};
const glyph = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
export function productPreview(href) {
  const examples = [{name:'Flourish',author:'bigmints',color:'mint'}, {name:'Memos',author:'usememos',color:'violet'}, {name:'Moodist',author:'remvze',color:'amber'}];
  return `<figure class="product-preview" aria-label="PicoRunner My Apps screen with its tab bar, icon sidebar, usage summary, search, and three example apps">
    <div class="product-preview-screen" aria-hidden="true">
      <div class="product-tabs"><span class="product-traffic"><i></i><i></i><i></i></span><span class="product-tab">${glyph('home')} My Apps</span><span class="product-new-tab">+</span><span class="product-preview-label">Example library</span></div>
      <div class="product-body"><div class="product-rail"><img src="${href('brand/mark-teal.svg')}" width="28" height="28" alt=""><span class="selected">${glyph('home')}</span><span>${glyph('compass')}</span><span>${glyph('download')}</span><span>${glyph('settings')}</span><div class="product-rail-bottom"><span>${glyph('sun')}</span><span>${glyph('power')}</span></div></div>
      <div class="product-main"><div class="product-heading"><div><strong>My Apps</strong><p>Open a running app, or start one from your library.</p></div><span class="product-add">+ <span>Add app</span></span></div>
      <div class="product-stats">${[['window','Installed','3','apps'],['activity','Running','0','active apps'],['memory','Memory','0 MB','used by running apps'],['storage','Storage','—','across installed apps']].map(([icon,label,value,note])=>`<div>${glyph(icon)}<span><small>${label}</small><b>${value}</b><em>${note}</em></span></div>`).join('')}</div>
      <div class="product-filters"><span class="selected">All apps <b>3</b></span><span>${glyph('activity')} Running <b>0</b></span><span class="product-search">${glyph('search')} Search apps</span></div>
      <div class="product-cards">${examples.map(app=>`<div class="product-card"><div class="product-card-top"><span class="product-app-icon ${app.color}">${glyph('window')}</span><span class="product-status">● Stopped</span></div><strong>${app.name}</strong><small>${app.author}</small><span class="product-start">${glyph('play')} Start</span></div>`).join('')}</div>
      </div></div>
    </div>
    <figcaption class="sr-only">An illustration of PicoRunner’s current My Apps layout using example apps.</figcaption>
  </figure>`;
}
