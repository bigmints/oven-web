const esc = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

export function readmeSection(app) {
  const readme = app.readme;
  if (!readme) return `<section class="readme-excerpt"><h2>About ${esc(app.name)}</h2><p>${esc(app.editorial.reason)}</p><a class="text-link" href="${esc(app.repository)}">Read the project README ↗</a></section>`;
  return `<section class="readme-excerpt" aria-labelledby="readme-heading"><div class="section-label">FROM THE PROJECT README</div><h2 id="readme-heading">What ${esc(app.name)} does</h2>${readme.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${readme.features.length ? `<h3>Features from the README</h3><ul>${readme.features.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}<a class="text-link" href="${esc(readme.source)}" target="_blank" rel="noopener noreferrer">Read the full README ↗</a><p class="source-attribution">Excerpt from the upstream project at the reviewed source revision.</p></section>`;
}

export function legalSection(app) {
  const editorial = app.editorial;
  const license = editorial.license || 'License not confirmed';
  return `<section class="app-legal" aria-labelledby="legal-heading"><h2 id="legal-heading">License and legal</h2><div class="license-line"><span class="license-badge">${esc(license)}</span>${editorial.licenseSource ? `<a class="text-link" href="${esc(editorial.licenseSource)}" target="_blank" rel="noopener noreferrer">Read the license ↗</a>` : ''}</div>${editorial.copyright ? `<p class="copyright-notice">${esc(editorial.copyright)}</p>` : ''}${(editorial.legalNotes || []).map(note => `<p>${esc(note)}</p>`).join('')}${editorial.assetLicenses?.length ? `<h3>Third-party asset licenses</h3><ul>${editorial.assetLicenses.map(license => `<li><a href="${esc(license.source)}" target="_blank" rel="noopener noreferrer">${esc(license.name)} ↗</a><span>${esc(license.summary)}</span></li>`).join('')}</ul>` : ''}<p class="legal-context">This app is maintained by its upstream project. PicoRunner provides the launcher and this catalog listing. The project’s license applies to its code; assets and connected services may have separate terms. Read the full license for permissions, conditions, and warranty terms.</p></section>`;
}

export function projectActions(app) {
  const github = new URL(app.repository).hostname === 'github.com';
  return `<a class="detail-license" href="#legal-heading">${esc(app.editorial.license ? app.editorial.license + ' license' : 'License not confirmed')}</a><div class="project-actions" aria-label="Project links"><a class="button secondary" href="${esc(app.repository)}" target="_blank" rel="noopener noreferrer">${github ? 'View on GitHub' : 'Visit project'} ↗</a>${github ? `<a class="button secondary github-star-action" href="${esc(app.repository)}" target="_blank" rel="noopener noreferrer" aria-label="Star ${esc(app.name)} on GitHub">☆ Star on GitHub ↗</a>` : ''}</div>${github ? '<p class="project-action-note">Opens GitHub, where you can sign in and star the repository.</p>' : ''}`;
}
