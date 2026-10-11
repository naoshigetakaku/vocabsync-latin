/**
 * latin.js — what a Latin word can be.
 *
 * English needed one field: a word is a noun or it is a verb. Latin does not
 * work that way. "amō" is not merely a verb, it is the first person singular
 * present active indicative of a first-conjugation verb, and a note that says
 * only "Verb" has thrown away everything that makes it worth writing down.
 *
 * So a part of speech here is a short path rather than a single word, chosen
 * one step at a time: the first step says what kind of word it is, and what
 * it is decides which steps follow. A noun is asked for its declension, its
 * case and its number; a verb for its conjugation, mood, tense and person.
 *
 * Every step after the first is optional. A dictionary entry is often just
 * "Verb · 1st conj." and that is a complete, useful thing to record — the
 * finer steps are there when a particular form is what you are learning, not
 * as a form to be filled in.
 *
 * The categories follow the tables at naoshigetakaku.github.io/arslatina so
 * that what is written here and what is studied there are the same words.
 *
 * Stored as one string, the steps joined by SEPARATOR. One column, readable
 * in the sheet by eye, and the backend stays as it was.
 */

export const SEPARATOR = ' · ';

/** value is what gets stored; label is what the picker shows. */
function plain(values) {
  return values.map((value) => ({ value, label: value }));
}

const CASES = plain(['Nominative', 'Genitive', 'Dative', 'Accusative', 'Ablative', 'Vocative']);
const NUMBERS = plain(['sg.', 'pl.']);
const GENDERS = plain(['masc.', 'fem.', 'neut.']);
const PERSONS = plain(['1st sg.', '2nd sg.', '3rd sg.', '1st pl.', '2nd pl.', '3rd pl.']);

const TENSES = [
  { value: 'Present Active', label: 'Present Active' },
  { value: 'Imperfect Active', label: 'Imperfect Active' },
  { value: 'Future Active', label: 'Future Active' },
  { value: 'Perfect Active', label: 'Perfect Active' },
  { value: 'Pluperfect Active', label: 'Pluperfect Active' },
  { value: 'Future Perfect Active', label: 'Future Perfect Active' },
  { value: 'Present Passive', label: 'Present Passive' },
  { value: 'Imperfect Passive', label: 'Imperfect Passive' },
  { value: 'Future Passive', label: 'Future Passive' },
  { value: 'Perfect Passive', label: 'Perfect Passive' },
  { value: 'Pluperfect Passive', label: 'Pluperfect Passive' },
  { value: 'Future Perfect Passive', label: 'Future Perfect Passive' },
];

/**
 * The steps each kind of word is asked for, in order.
 *
 * The label carries the example paradigm — "1st conj. — amō, amāre" — because
 * the number alone is hard to hold on to, and the paradigm is how anyone
 * actually remembers which is which. Only the short part is stored.
 */
export const PARTS_OF_SPEECH = [
  'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun',
  'Preposition', 'Conjunction', 'Interjection', 'Numeral', 'Phrase',
];

export const STEPS = {
  Noun: [
    {
      key: 'declension',
      title: 'Declension',
      options: [
        { value: '1st decl.', label: '1st decl. — puella, puellae' },
        { value: '2nd decl. masc.', label: '2nd decl. masc. — servus, servī' },
        { value: '2nd decl. neut.', label: '2nd decl. neut. — bellum, bellī' },
        { value: '3rd decl. cons.', label: '3rd decl. consonant — rēx, rēgis' },
        { value: '3rd decl. i-stem', label: '3rd decl. i-stem m/f — cīvis, cīvis' },
        { value: '3rd decl. i-stem neut.', label: '3rd decl. i-stem neut. — mare, maris' },
        { value: '3rd decl. neut. cons.', label: '3rd decl. neut. cons. — opus, operis' },
        { value: '4th decl. masc.', label: '4th decl. masc. — manus, manūs' },
        { value: '4th decl. neut.', label: '4th decl. neut. — cornū, cornūs' },
        { value: '5th decl.', label: '5th decl. — rēs, reī' },
      ],
    },
    { key: 'gender', title: 'Gender', options: GENDERS },
    { key: 'case', title: 'Case', options: CASES },
    { key: 'number', title: 'Number', options: NUMBERS },
  ],

  Verb: [
    {
      key: 'conjugation',
      title: 'Conjugation',
      options: [
        { value: '1st conj.', label: '1st conj. — amō, amāre' },
        { value: '2nd conj.', label: '2nd conj. — moneō, monēre' },
        { value: '3rd conj.', label: '3rd conj. — dūcō, dūcere' },
        { value: '3rd-iō conj.', label: '3rd-iō conj. — capiō, capere' },
        { value: '4th conj.', label: '4th conj. — audiō, audīre' },
        { value: 'irreg. esse', label: 'Irregular — esse (sum)' },
        { value: 'irreg. īre', label: 'Irregular — īre (eō)' },
        { value: 'irreg. ferre', label: 'Irregular — ferre (ferō)' },
        { value: 'irreg. posse', label: 'Irregular — posse (possum)' },
        { value: 'deponent', label: 'Deponent — sequor, sequī' },
      ],
    },
    {
      key: 'mood',
      title: 'Mood',
      options: plain([
        'Indicative', 'Subjunctive', 'Imperative',
        'Infinitive', 'Participle', 'Gerund', 'Gerundive', 'Supine',
      ]),
    },
    { key: 'tense', title: 'Tense and voice', options: TENSES },
    { key: 'person', title: 'Person', options: PERSONS },
  ],

  Adjective: [
    {
      key: 'type',
      title: 'Type',
      options: [
        { value: '1st/2nd decl.', label: '1st/2nd decl. — bonus, bona, bonum' },
        { value: '3rd decl. 3 endings', label: '3rd decl. 3 endings — ācer, ācris, ācre' },
        { value: '3rd decl. 2 endings', label: '3rd decl. 2 endings — gravis, grave' },
        { value: '3rd decl. 1 ending', label: '3rd decl. 1 ending — ingēns, ingentis' },
        { value: 'comparative', label: 'Comparative — altior, altius' },
        { value: 'superlative', label: 'Superlative — altissimus, -a, -um' },
      ],
    },
    { key: 'gender', title: 'Gender', options: GENDERS },
    { key: 'case', title: 'Case', options: CASES },
    { key: 'number', title: 'Number', options: NUMBERS },
  ],

  Adverb: [
    { key: 'degree', title: 'Degree', options: plain(['positive', 'comparative', 'superlative']) },
  ],

  Pronoun: [
    {
      key: 'kind',
      title: 'Kind',
      options: [
        { value: 'personal', label: 'Personal — ego, tū, nōs, vōs' },
        { value: 'demonstrative', label: 'Demonstrative — hic, ille, is' },
        { value: 'relative', label: 'Relative — quī, quae, quod' },
        { value: 'interrogative', label: 'Interrogative — quis, quid' },
        { value: 'reflexive', label: 'Reflexive — suī, sibi, sē' },
        { value: 'indefinite', label: 'Indefinite — aliquis, quīdam' },
        { value: 'intensive', label: 'Intensive — ipse, īdem' },
      ],
    },
    { key: 'gender', title: 'Gender', options: GENDERS },
    { key: 'case', title: 'Case', options: CASES },
    { key: 'number', title: 'Number', options: NUMBERS },
  ],

  Preposition: [
    {
      key: 'takes',
      title: 'Takes',
      options: plain(['+ accusative', '+ ablative', '+ acc. or abl.']),
    },
  ],

  Numeral: [
    {
      key: 'kind',
      title: 'Kind',
      options: [
        { value: 'cardinal', label: 'Cardinal — ūnus, duo, trēs' },
        { value: 'ordinal', label: 'Ordinal — prīmus, secundus' },
        { value: 'distributive', label: 'Distributive — singulī, bīnī' },
        { value: 'adverbial', label: 'Adverbial — semel, bis, ter' },
      ],
    },
  ],

  Conjunction: [],
  Interjection: [],
  Phrase: [],
};

/** The steps that follow a given part of speech, or none. */
export function stepsFor(part) {
  return STEPS[part] || [];
}

/** One string from the part and whatever steps have been answered. */
export function composeForm(part, answers) {
  if (!part) return '';
  const parts = [part];
  stepsFor(part).forEach((step) => {
    const answer = answers[step.key];
    if (answer) parts.push(answer);
  });
  return parts.join(SEPARATOR);
}

/**
 * Back from the stored string to the part and its answers.
 *
 * Anything it does not recognise is dropped rather than guessed at: a word
 * saved by an older version, or edited by hand in the sheet, should open in
 * the form showing what is actually understood and nothing invented.
 */
export function parseForm(text) {
  const segments = String(text || '').split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
  const part = segments.shift() || '';
  if (!PARTS_OF_SPEECH.includes(part)) return { part: '', answers: {} };

  const answers = {};
  stepsFor(part).forEach((step) => {
    const found = segments.find((segment) =>
      step.options.some((option) => option.value === segment));
    if (found) answers[step.key] = found;
  });

  return { part, answers };
}
