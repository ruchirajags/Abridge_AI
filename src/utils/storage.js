const HISTORY_KEY = 'abridgeai.history.v1';
const DRAFT_KEY = 'abridgeai.draft.v1';
const THEME_KEY = 'abridgeai.theme.v1';

// History
export function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

export function writeHistory(items) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

export function saveToHistory(record) {
  const items = readHistory();
  items.unshift(record);
  writeHistory(items.slice(0, 12));
}

export function deleteFromHistory(id) {
  writeHistory(readHistory().filter(it => it.id !== id));
}

export function clearHistory() {
  writeHistory([]);
}

// Draft autosave
export function writeDraft(data) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }
  catch { /* ignore */ }
}

export function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); }
  catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); }
  catch { /* ignore */ }
}

// Theme
export function readTheme() {
  try { return localStorage.getItem(THEME_KEY); }
  catch { return null; }
}

export function writeTheme(mode) {
  try { localStorage.setItem(THEME_KEY, mode); }
  catch { /* ignore */ }
}

export function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
}
