/**
 * form.js — the add / edit sheet.
 *
 * Field order is fixed by design: word, part of speech, definition, note.
 *
 * The part of speech is not one answer but a short path — see js/latin.js.
 * Choosing "Verb" opens four more rows, choosing "Conjunction" opens none,
 * and the rows change when the first answer does. They are built rather than
 * written out because which ones exist is a property of the grammar, not of
 * the markup.
 */

import { WORD_COLORS, DEFAULT_COLOR, UNSORTED_LABEL } from './config.js';
import { PARTS_OF_SPEECH, stepsFor, composeForm, parseForm } from './latin.js';
import { createWord, updateWord, getFolders } from './store.js';
import { folderForNewWord } from './view.js';
import { openDialog, closeDialog, wireDismiss } from './dialog.js';
import { openPicker } from './picker.js';

const PLACEHOLDER = 'Choose…';
const OPTIONAL = 'Any';

const dialog = document.getElementById('form-dialog');
const form = document.getElementById('word-form');
const titleElement = document.getElementById('form-title');
const wordField = document.getElementById('field-word');
const posTrigger = document.getElementById('field-pos');
const posValue = document.getElementById('field-pos-value');
const stepsElement = document.getElementById('form-steps');
const definitionField = document.getElementById('field-definition');
const noteField = document.getElementById('field-note');
const colorField = document.getElementById('field-color');
const folderTrigger = document.getElementById('field-folder');
const folderValue = document.getElementById('field-folder-value');
const errorElement = document.getElementById('form-error');
const submitButton = document.getElementById('form-submit');
const cancelButton = document.getElementById('form-cancel');

let editingId = null;
let part = '';
let answers = {};
let color = DEFAULT_COLOR;
let folder = '';
let busy = false;
let afterSave = () => {};

/**
 * Swatches rather than a picker sheet: seven options fit on one line, and a
 * colour is easier to recognise than to read.
 */
function buildSwatches() {
  const fragment = document.createDocumentFragment();

  WORD_COLORS.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.dataset.color = option.value;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute('aria-label', option.label);

    const dot = document.createElement('span');
    dot.className = 'swatch__dot';
    button.appendChild(dot);

    fragment.appendChild(button);
  });

  colorField.replaceChildren(fragment);
}

function setColor(value) {
  const known = WORD_COLORS.some((option) => option.value === value);
  color = known ? value : DEFAULT_COLOR;

  colorField.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.setAttribute('aria-checked', swatch.dataset.color === color ? 'true' : 'false');
  });
}

/**
 * Each step the current part of speech asks for, as its own row.
 *
 * Every one is optional. "Verb · 1st conj." is a complete dictionary entry;
 * the person and tense are there for when a particular form is the thing
 * being learnt, not as blanks demanding to be filled.
 */
function renderSteps() {
  const fragment = document.createDocumentFragment();

  stepsFor(part).forEach((step) => {
    const field = document.createElement('div');
    field.className = 'field field--step';

    const label = document.createElement('span');
    label.className = 'field__label';
    label.id = 'step-' + step.key + '-label';
    label.textContent = step.title;
    field.appendChild(label);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'field__input field__trigger';
    trigger.dataset.step = step.key;
    trigger.setAttribute('aria-labelledby', label.id);
    trigger.setAttribute('aria-haspopup', 'listbox');

    const value = document.createElement('span');
    value.className = 'field__value';
    value.textContent = answers[step.key] || OPTIONAL;
    trigger.appendChild(value);
    trigger.classList.toggle('is-empty', !answers[step.key]);

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('class', 'field__chevron');
    chevron.setAttribute('aria-hidden', 'true');
    chevron.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 9l6 6 6-6');
    chevron.appendChild(path);
    trigger.appendChild(chevron);

    field.appendChild(trigger);
    fragment.appendChild(field);
  });

  stepsElement.replaceChildren(fragment);
}

/** Sets the part of speech, dropping answers that no longer have a question. */
function setPart(value, keep) {
  const known = PARTS_OF_SPEECH.includes(value);
  const changed = !known || value !== part;
  part = known ? value : '';
  if (changed && !keep) answers = {};

  posValue.textContent = part || PLACEHOLDER;
  posTrigger.classList.toggle('is-empty', !part);
  posTrigger.removeAttribute('aria-invalid');
  renderSteps();
}

/** An empty name is the unsorted bucket, which is a real destination here. */
function setFolder(name) {
  folder = typeof name === 'string' ? name : '';
  folderValue.textContent = folder || UNSORTED_LABEL;
  folderTrigger.classList.toggle('is-empty', !folder);
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.hidden = false;
  form.classList.remove('is-invalid');
  // Restart the shake animation on a repeated failure.
  void form.offsetWidth;
  form.classList.add('is-invalid');
}

function clearError() {
  errorElement.hidden = true;
  errorElement.textContent = '';
  form.classList.remove('is-invalid');
  wordField.removeAttribute('aria-invalid');
  posTrigger.removeAttribute('aria-invalid');
}

function setBusy(value) {
  busy = value;
  submitButton.disabled = value;
  cancelButton.disabled = value;
  submitButton.textContent = value ? 'Saving…' : 'Save';
}

export function openCreateForm() {
  editingId = null;
  titleElement.textContent = 'New word';
  form.reset();
  answers = {};
  setPart('');
  setColor(DEFAULT_COLOR);
  // A word made inside a folder belongs to it without being asked.
  setFolder(folderForNewWord());
  clearError();
  setBusy(false);
  openDialog(dialog);
  // Opening the keyboard while the sheet animates fights the transition on iOS.
  setTimeout(() => wordField.focus(), 320);
}

export function openEditForm(word) {
  editingId = word.id;
  titleElement.textContent = 'Edit word';
  wordField.value = word.word || '';
  const parsed = parseForm(word.pos);
  answers = parsed.answers;
  setPart(parsed.part, true);
  definitionField.value = word.definition || '';
  noteField.value = word.note || '';
  setColor(word.color || DEFAULT_COLOR);
  setFolder(word.folder || '');
  clearError();
  setBusy(false);
  openDialog(dialog);
}

function readFields() {
  return {
    word: wordField.value.trim(),
    pos: composeForm(part, answers),
    definition: definitionField.value.trim(),
    note: noteField.value.trim(),
    color: color,
    folder: folder,
  };
}

function validate(fields) {
  if (!fields.word) {
    wordField.setAttribute('aria-invalid', 'true');
    wordField.focus();
    return 'Enter a word.';
  }
  if (!part) {
    posTrigger.setAttribute('aria-invalid', 'true');
    return 'Choose a part of speech.';
  }
  return null;
}

export function initForm(handlers) {
  afterSave = handlers.afterSave || (() => {});
  setPart('');
  buildSwatches();
  setColor(DEFAULT_COLOR);

  colorField.addEventListener('click', (event) => {
    const swatch = event.target.closest('.swatch');
    if (swatch) setColor(swatch.dataset.color);
  });

  folderTrigger.addEventListener('click', () => {
    const options = getFolders().map((entry) => ({ value: entry.name, label: entry.name }));
    options.push({ value: '', label: UNSORTED_LABEL });

    openPicker({
      title: 'Folder',
      options,
      value: folder,
      onSelect: setFolder,
    });
  });

  wireDismiss(dialog, () => {
    editingId = null;
  });

  posTrigger.addEventListener('click', () => {
    openPicker({
      title: 'Part of speech',
      options: PARTS_OF_SPEECH.map((value) => ({ value, label: value })),
      value: part,
      onSelect: (value) => {
        setPart(value);
        clearError();
      },
    });
  });

  // One handler for every step row: they are rebuilt whenever the part of
  // speech changes, and a listener attached to each would go with them.
  stepsElement.addEventListener('click', (event) => {
    const trigger = event.target.closest('.field__trigger');
    if (!trigger) return;

    const step = stepsFor(part).find((entry) => entry.key === trigger.dataset.step);
    if (!step) return;

    openPicker({
      title: step.title,
      // Blank is a real answer: a word can be a verb of the first
      // conjugation without the note naming a tense.
      options: [{ value: '', label: OPTIONAL }].concat(step.options),
      value: answers[step.key] || '',
      onSelect: (value) => {
        if (value) answers[step.key] = value;
        else delete answers[step.key];
        renderSteps();
      },
    });
  });

  cancelButton.addEventListener('click', () => {
    if (busy) return;
    closeDialog(dialog);
    editingId = null;
  });

  wordField.addEventListener('input', clearError);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;

    const fields = readFields();
    const problem = validate(fields);
    if (problem) {
      showError(problem);
      return;
    }

    setBusy(true);
    try {
      const saved = editingId
        ? await updateWord(Object.assign({ id: editingId }, fields))
        : await createWord(fields);

      closeDialog(dialog);
      editingId = null;
      afterSave(saved);
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false);
    }
  });
}
