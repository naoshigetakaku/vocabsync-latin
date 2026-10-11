/**
 * links.js — where a word can be looked up.
 *
 * DuckDuckGo only. The English app pairs it with YouGlish, which plays clips
 * of people saying the word in real videos; there is no such thing for a
 * language nobody has spoken natively for fifteen centuries, and a link that
 * returns nothing is worse than no link.
 *
 * Built here rather than in each screen because the detail dialog, the card
 * deck and the quiz all show the same link.
 */

import { DUCKDUCKGO_BASE } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function duckduckgoUrl(word) {
  return DUCKDUCKGO_BASE + encodeURIComponent(word.word);
}

export function duckduckgoLabel(word) {
  return 'Search \u201c' + word.word + '\u201d on DuckDuckGo';
}

function chevron() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'youglish__chevron');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M9 6l6 6-6 6');
  svg.appendChild(path);
  return svg;
}

/** The link for one word, ready to drop into a card. */
export function wordLinks(word) {
  const group = document.createElement('div');
  group.className = 'wordlinks';

  const element = document.createElement('a');
  element.className = 'youglish';
  element.href = duckduckgoUrl(word);
  element.target = '_blank';
  element.rel = 'noopener noreferrer';
  element.setAttribute('aria-label', duckduckgoLabel(word));

  const name = document.createElement('span');
  name.className = 'youglish__label';
  name.textContent = 'duckduckgo';
  element.appendChild(name);
  element.appendChild(chevron());

  group.appendChild(element);
  return group;
}

/** Points a link already in the markup at a different word. */
export function pointLinks(duckduckgo, word) {
  duckduckgo.href = duckduckgoUrl(word);
  duckduckgo.setAttribute('aria-label', duckduckgoLabel(word));
}
