/* =====================================================================
   MesoForge — hypertrophy training PWA  (redesigned UI, same engine)
   Autoregulated volume, RIR progression, deloads, progress analytics.
   All data stays on-device (IndexedDB). Export/import JSON backup.
   ===================================================================== */
'use strict';

/* ============================ constants ============================ */
const MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Calves','Abs'];

const SEED_EXERCISES = [
  // Chest
  { name:'Barbell Bench Press', muscle:'Chest', eq:'Barbell' },
  { name:'Incline Barbell Press', muscle:'Chest', eq:'Barbell' },
  { name:'Dumbbell Bench Press', muscle:'Chest', eq:'Dumbbell' },
  { name:'Incline Dumbbell Press', muscle:'Chest', eq:'Dumbbell' },
  { name:'Machine Chest Press', muscle:'Chest', eq:'Machine' },
  { name:'Cable Fly', muscle:'Chest', eq:'Cable' },
  { name:'Pec Deck', muscle:'Chest', eq:'Machine' },
  { name:'Weighted Dip', muscle:'Chest', eq:'Bodyweight' },
  { name:'Push-Up', muscle:'Chest', eq:'Bodyweight' },
  // Back
  { name:'Deadlift', muscle:'Back', eq:'Barbell' },
  { name:'Barbell Row', muscle:'Back', eq:'Barbell' },
  { name:'Pull-Up', muscle:'Back', eq:'Bodyweight' },
  { name:'Chin-Up', muscle:'Back', eq:'Bodyweight' },
  { name:'Lat Pulldown', muscle:'Back', eq:'Cable' },
  { name:'Seated Cable Row', muscle:'Back', eq:'Cable' },
  { name:'Chest-Supported Row', muscle:'Back', eq:'Machine' },
  { name:'Single-Arm Dumbbell Row', muscle:'Back', eq:'Dumbbell' },
  { name:'Rack Pull', muscle:'Back', eq:'Barbell' },
  // Shoulders
  { name:'Overhead Press', muscle:'Shoulders', eq:'Barbell' },
  { name:'Seated Dumbbell Press', muscle:'Shoulders', eq:'Dumbbell' },
  { name:'Machine Shoulder Press', muscle:'Shoulders', eq:'Machine' },
  { name:'Dumbbell Lateral Raise', muscle:'Shoulders', eq:'Dumbbell' },
  { name:'Cable Lateral Raise', muscle:'Shoulders', eq:'Cable' },
  { name:'Reverse Pec Deck', muscle:'Shoulders', eq:'Machine' },
  { name:'Face Pull', muscle:'Shoulders', eq:'Cable' },
  { name:'Upright Row', muscle:'Shoulders', eq:'Barbell' },
  // Biceps
  { name:'Barbell Curl', muscle:'Biceps', eq:'Barbell' },
  { name:'Dumbbell Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Incline Dumbbell Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Hammer Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Preacher Curl', muscle:'Biceps', eq:'Machine' },
  { name:'Cable Curl', muscle:'Biceps', eq:'Cable' },
  // Triceps
  { name:'Close-Grip Bench Press', muscle:'Triceps', eq:'Barbell' },
  { name:'Skull Crusher', muscle:'Triceps', eq:'Barbell' },
  { name:'Cable Pushdown', muscle:'Triceps', eq:'Cable' },
  { name:'Overhead Cable Extension', muscle:'Triceps', eq:'Cable' },
  { name:'Dumbbell Overhead Extension', muscle:'Triceps', eq:'Dumbbell' },
  { name:'Assisted Dip (Triceps)', muscle:'Triceps', eq:'Machine' },
  // Quads
  { name:'Back Squat', muscle:'Quads', eq:'Barbell' },
  { name:'Front Squat', muscle:'Quads', eq:'Barbell' },
  { name:'Hack Squat', muscle:'Quads', eq:'Machine' },
  { name:'Leg Press', muscle:'Quads', eq:'Machine' },
  { name:'Bulgarian Split Squat', muscle:'Quads', eq:'Dumbbell' },
  { name:'Leg Extension', muscle:'Quads', eq:'Machine' },
  { name:'Walking Lunge', muscle:'Quads', eq:'Dumbbell' },
  // Hamstrings
  { name:'Romanian Deadlift', muscle:'Hamstrings', eq:'Barbell' },
  { name:'Stiff-Leg Deadlift', muscle:'Hamstrings', eq:'Barbell' },
  { name:'Lying Leg Curl', muscle:'Hamstrings', eq:'Machine' },
  { name:'Seated Leg Curl', muscle:'Hamstrings', eq:'Machine' },
  { name:'Nordic Curl', muscle:'Hamstrings', eq:'Bodyweight' },
  { name:'Good Morning', muscle:'Hamstrings', eq:'Barbell' },
  // Glutes
  { name:'Barbell Hip Thrust', muscle:'Glutes', eq:'Barbell' },
  { name:'Glute Bridge', muscle:'Glutes', eq:'Barbell' },
  { name:'Cable Kickback', muscle:'Glutes', eq:'Cable' },
  { name:'Sumo Deadlift', muscle:'Glutes', eq:'Barbell' },
  { name:'Machine Hip Abduction', muscle:'Glutes', eq:'Machine' },
  // Calves
  { name:'Standing Calf Raise', muscle:'Calves', eq:'Machine' },
  { name:'Seated Calf Raise', muscle:'Calves', eq:'Machine' },
  { name:'Leg Press Calf Raise', muscle:'Calves', eq:'Machine' },
  // Abs
  { name:'Cable Crunch', muscle:'Abs', eq:'Cable' },
  { name:'Hanging Leg Raise', muscle:'Abs', eq:'Bodyweight' },
  { name:'Ab Wheel Rollout', muscle:'Abs', eq:'Bodyweight' },
  { name:'Machine Crunch', muscle:'Abs', eq:'Machine' },
  { name:'Plank', muscle:'Abs', eq:'Bodyweight' },
];

/* Templates: each day = named list of muscle slots (muscle appears once per set-group) */
const TEMPLATES = [
  {
    id:'fb3', name:'Full Body', days:3, blurb:'3 days/week — every muscle hit often, minimal time.',
    plan:[
      { name:'Full Body A', slots:['Quads','Chest','Back','Shoulders','Biceps','Calves'] },
      { name:'Full Body B', slots:['Hamstrings','Back','Chest','Triceps','Abs','Calves'] },
      { name:'Full Body C', slots:['Quads','Glutes','Chest','Back','Shoulders','Abs'] },
    ],
  },
  {
    id:'ul4', name:'Upper / Lower', days:4, blurb:'4 days/week — the classic balanced split.',
    plan:[
      { name:'Upper A', slots:['Chest','Back','Shoulders','Triceps','Biceps'] },
      { name:'Lower A', slots:['Quads','Hamstrings','Glutes','Calves','Abs'] },
      { name:'Upper B', slots:['Back','Chest','Shoulders','Biceps','Triceps'] },
      { name:'Lower B', slots:['Hamstrings','Quads','Glutes','Calves','Abs'] },
    ],
  },
  {
    id:'ulppl5', name:'Upper / Lower / Push / Pull / Legs', days:5, blurb:'5 days/week — more volume, still repeatable.',
    plan:[
      { name:'Upper', slots:['Chest','Back','Shoulders','Biceps','Triceps'] },
      { name:'Lower', slots:['Quads','Hamstrings','Glutes','Calves'] },
      { name:'Push', slots:['Chest','Shoulders','Triceps','Abs'] },
      { name:'Pull', slots:['Back','Biceps','Shoulders','Abs'] },
      { name:'Legs', slots:['Quads','Hamstrings','Glutes','Calves'] },
    ],
  },
  {
    id:'ppl6', name:'Push / Pull / Legs ×2', days:6, blurb:'6 days/week — high volume for experienced lifters.',
    plan:[
      { name:'Push A', slots:['Chest','Shoulders','Triceps'] },
      { name:'Pull A', slots:['Back','Biceps','Shoulders'] },
      { name:'Legs A', slots:['Quads','Hamstrings','Glutes','Calves'] },
      { name:'Push B', slots:['Chest','Shoulders','Triceps','Abs'] },
      { name:'Pull B', slots:['Back','Biceps','Shoulders','Abs'] },
      { name:'Legs B', slots:['Hamstrings','Quads','Glutes','Calves'] },
    ],
  },
];

const MAX_SETS_PER_EX = 6;     // per-exercise cap
const DELOAD_RIR = 4;

/* Per-muscle weekly volume landmarks (sets/week) — approximations of the
   MEV/MRV ranges commonly discussed in public hypertrophy-volume literature.
   Week 1 starts near MEV; autoregulation never pushes a muscle past MRV. */
const VOLUME_LANDMARKS = {
  Chest:      { mev: 8,  mrv: 20 },
  Back:       { mev: 10, mrv: 22 },
  Shoulders:  { mev: 8,  mrv: 22 },
  Biceps:     { mev: 8,  mrv: 20 },
  Triceps:    { mev: 6,  mrv: 18 },
  Quads:      { mev: 8,  mrv: 18 },
  Hamstrings: { mev: 6,  mrv: 16 },
  Glutes:     { mev: 4,  mrv: 16 },
  Calves:     { mev: 8,  mrv: 18 },
  Abs:        { mev: 6,  mrv: 20 },
};

/* RIR ramp presets selectable per meso */
const RIR_RAMPS = [
  { id: '3-0', label: '3 → 0 RIR (standard)', start: 3, end: 0 },
  { id: '2-0', label: '2 → 0 RIR (aggressive)', start: 2, end: 0 },
  { id: '3-1', label: '3 → 1 RIR (conservative)', start: 3, end: 1 },
];

/* ============================ inline icons ============================ */
const I = {
  play:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg>',
  swap:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
  plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/></svg>',
  lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1 .4-2 1-2.8C8 10 9 12 10 12c1.5 0 1-2.5.5-4C10 6 12 3.5 12 2z"/></svg>',
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M9 8.5L7 2h10l-2 6.5M12 12v4M10 14h4" opacity=".9"/></svg>',
  cal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/></svg>',
};
const icon = (name, cls='') => `<span class="${cls}" aria-hidden="true">${I[name] || ''}</span>`;
const EQ_ABBR = { Barbell:'BB', Dumbbell:'DB', Machine:'MA', Cable:'CB', Bodyweight:'BW', Other:'—' };
const MUSCLE_ICON = (m) => `icons/m/${String(m).toLowerCase()}.png`;
const mIcon = (m, cls='m-ic') => `<img class="${cls}" src="${MUSCLE_ICON(m)}" alt="" loading="lazy">`;
const MSHORT = { Chest:'Chest', Back:'Back', Shoulders:'Delts', Biceps:'Biceps', Triceps:'Triceps', Quads:'Quads', Hamstrings:'Hams', Glutes:'Glutes', Calves:'Calves', Abs:'Abs' };

/* ============================ tiny utils ============================ */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayISO = () => new Date().toISOString().slice(0, 10);
const round1 = (n) => Math.round(n * 10) / 10;
const fmtK = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(Math.round(n));

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ============================ storage ============================ */
const DB_NAME = 'mesoforge', DB_VER = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('exercises')) d.createObjectStore('exercises', { keyPath:'id' });
      if (!d.objectStoreNames.contains('mesos'))     d.createObjectStore('mesos', { keyPath:'id' });
      if (!d.objectStoreNames.contains('workouts'))  d.createObjectStore('workouts', { keyPath:'id' });
      if (!d.objectStoreNames.contains('kv'))        d.createObjectStore('kv', { keyPath:'k' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode='readonly') { return db.transaction(store, mode).objectStore(store); }
const idb = {
  all: (store) => new Promise((res, rej) => { const r = tx(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
  get: (store, key) => new Promise((res, rej) => { const r = tx(store).get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
  put: (store, val) => new Promise((res, rej) => { const r = tx(store, 'readwrite').put(val); r.onsuccess = () => res(val); r.onerror = () => rej(r.error); }),
  del: (store, key) => new Promise((res, rej) => { const r = tx(store, 'readwrite').delete(key); r.onsuccess = () => res(); r.onerror = () => rej(r.error); }),
};

/* in-memory state, hydrated from IndexedDB */
const S = {
  exercises: [],       // {id,name,muscle,eq,custom}
  mesos: [],           // mesocycles
  workouts: [],        // sessions
  settings: { units:'lb', theme:'auto' },
  tab: 'train',
  activeWorkoutId: null,
  planWeek: null,      // week being viewed on Train tab (null = current)
  progressMuscle: 'Chest',
  progressExercise: null,
};

async function hydrate() {
  db = await openDB();
  let exs = await idb.all('exercises');
  if (!exs.length) {
    exs = SEED_EXERCISES.map(e => ({ id: uid(), ...e, custom:false }));
    for (const e of exs) await idb.put('exercises', e);
  }
  S.exercises = exs;
  S.mesos = await idb.all('mesos');
  S.workouts = await idb.all('workouts');
  const st = await idb.get('kv', 'settings');
  if (st) S.settings = { ...S.settings, ...st.v };
  applyTheme();
}
const saveMeso = (m) => idb.put('mesos', m);
const saveWorkout = (w) => idb.put('workouts', w);
const saveSettings = () => idb.put('kv', { k:'settings', v:S.settings });

/* ============================ derived helpers ============================ */
const exById = (id) => S.exercises.find(e => e.id === id);
const activeMeso = () => S.mesos.find(m => m.status === 'active') || null;
const mesoWorkouts = (mesoId) => S.workouts.filter(w => w.mesoId === mesoId);

function accumWeeks(meso) { return meso.weeks - 1; } // last week is deload

function targetRIR(meso, week) {
  const acc = accumWeeks(meso);
  const start = meso.rirStart ?? 3, end = meso.rirEnd ?? 0;
  if (week >= meso.weeks) return DELOAD_RIR;      // deload
  if (acc <= 1) return end;
  // linear ramp start → end across accumulation weeks
  const r = Math.round(start - ((start - end) * (week - 1)) / (acc - 1));
  return Math.max(end, Math.min(start, r));
}

function isDeload(meso, week) { return week === meso.weeks; }

/* current week = first week that has an incomplete workout */
function currentWeek(meso) {
  for (let w = 1; w <= meso.weeks; w++) {
    const done = mesoWorkouts(meso.id).filter(x => x.week === w && x.status === 'done').length;
    if (done < meso.days.length) return w;
  }
  return meso.weeks;
}

function getWorkout(meso, week, dayIndex) {
  return mesoWorkouts(meso.id).find(w => w.week === week && w.dayIndex === dayIndex) || null;
}

/* ============================ progression engine ============================
   Original autoregulation, inspired by common hypertrophy programming ideas:
   - Sets start low (MEV-ish) and climb week to week based on recovery feedback.
   - Per-muscle post-session feedback: soreness (recovery), pump, workload.
   - Still sore or overwhelming workload -> pull a set. Low pump + easy
     workload -> add sets. Otherwise nudge upward slowly.
   - Final week is a deload: half sets, ~60% load, RIR 4+.
*/
function setDeltaFromFeedback(fb) {
  if (!fb) return 1; // no feedback given: default gentle +1 progression
  const { soreness, pump, workload, joints = 0 } = fb; // soreness 0-2, pump 0-2, workload 0-3, joints 0-2
  if (joints === 2) return -1;                           // painful joints: back off regardless
  if (soreness === 2 || workload === 3) return -1;      // under-recovered / overreached
  const ease = workload <= 1 ? 1 : 0;                    // easy or manageable
  const stimulus = (2 - pump) + ease;                    // low pump => more room
  if (joints === 1) return 0;                            // achy joints: hold, never add
  if (stimulus >= 3) return 2;
  if (stimulus >= 2) return 1;
  if (soreness === 1 && workload === 2) return 0;        // just recovered + hard: hold
  return 1;
}

/* Sets-per-slot for week 1: spread each muscle's MEV-ish weekly start
   across however many times it appears in the week. */
function weekOneSetsForMuscle(meso, muscle) {
  const slotCount = meso.days.reduce((a, d) => a + d.slots.filter(s => s.muscle === muscle).length, 0) || 1;
  const lm = VOLUME_LANDMARKS[muscle] || { mev: 6 };
  return Math.max(2, Math.min(4, Math.round(lm.mev / slotCount)));
}

/* Build week-1 workouts for a fresh meso */
function buildWeekOne(meso) {
  meso.days.forEach((day, di) => {
    const w = {
      id: uid(), mesoId: meso.id, week: 1, dayIndex: di, date: null, status: 'pending',
      entries: day.slots.map(s => ({
        exerciseId: s.exerciseId, muscle: s.muscle,
        targetSets: weekOneSetsForMuscle(meso, s.muscle), targetRIR: targetRIR(meso, 1),
        sets: [], // {weight, reps, done}
      })),
      feedback: {}, // muscle -> {soreness, pump, workload, joints}
    };
    S.workouts.push(w);
    saveWorkout(w);
  });
}

/* Projected weekly sets for a muscle in a given week (logged sets for done
   sessions, current targets otherwise) — used to enforce the MRV ceiling. */
function weeklyMuscleTotal(meso, week, muscle) {
  let n = 0;
  for (const w of mesoWorkouts(meso.id).filter(x => x.week === week)) {
    for (const en of w.entries) {
      if (en.muscle !== muscle) continue;
      n += w.status === 'done' ? en.sets.filter(s => s.done && s.reps > 0).length : en.targetSets;
    }
  }
  return n;
}

/* When a workout completes, materialize the same day for next week with
   feedback-adjusted set targets and prefilled targets from this week. */
function scheduleNextWeek(meso, finished) {
  const nextWeek = finished.week + 1;
  if (nextWeek > meso.weeks) return;
  if (getWorkout(meso, nextWeek, finished.dayIndex)) return; // already built
  const deload = isDeload(meso, nextWeek);
  const rir = targetRIR(meso, nextWeek);

  const entries = finished.entries.map(en => {
    let delta = deload ? 0 : setDeltaFromFeedback(finished.feedback[en.muscle]);
    const doneSets = en.sets.filter(s => s.done && s.reps > 0);
    const base = Math.max(doneSets.length || en.targetSets, 1);
    // MRV ceiling: don't add sets if this muscle's projected weekly volume
    // is already at/over its landmark
    if (delta > 0) {
      const lm = VOLUME_LANDMARKS[en.muscle];
      if (lm) {
        const thisWeekTotal = weeklyMuscleTotal(meso, finished.week, en.muscle);
        delta = Math.min(delta, Math.max(0, lm.mrv - thisWeekTotal));
      }
    }
    let sets = deload ? Math.max(1, Math.ceil(base / 2))
                      : Math.min(MAX_SETS_PER_EX, Math.max(1, base + delta));
    // last week's best load, used to prefill suggestions
    const topSet = doneSets.slice().sort((a,b) => (b.weight*(1+b.reps/30)) - (a.weight*(1+a.reps/30)))[0] || null;
    const suggest = topSet
      ? { weight: deload ? round1(topSet.weight * 0.6) : topSet.weight, reps: topSet.reps }
      : null;
    return {
      exerciseId: en.exerciseId, muscle: en.muscle,
      targetSets: sets, targetRIR: rir, suggest,
      sets: [],
    };
  });

  const w = {
    id: uid(), mesoId: meso.id, week: nextWeek, dayIndex: finished.dayIndex,
    date: null, status: 'pending', entries, feedback: {},
  };
  S.workouts.push(w);
  saveWorkout(w);
}

/* estimated 1RM (Epley), treating logged reps at face value */
const e1rm = (weight, reps) => reps > 0 ? weight * (1 + reps / 30) : 0;

/* ============================ analytics data ============================ */
function weeklySetsForMuscle(meso, muscle) {
  const out = [];
  for (let wk = 1; wk <= meso.weeks; wk++) {
    let n = 0;
    for (const w of mesoWorkouts(meso.id).filter(x => x.week === wk)) {
      for (const en of w.entries) {
        if (en.muscle !== muscle) continue;
        n += w.status === 'done' ? en.sets.filter(s => s.done && s.reps > 0).length : en.targetSets;
      }
    }
    out.push({ label: isDeload(meso, wk) ? 'DL' : 'W' + wk, value: n, projected: false });
  }
  return out;
}

function weeklyTonnage(meso) {
  const out = [];
  for (let wk = 1; wk <= meso.weeks; wk++) {
    let t = 0;
    for (const w of mesoWorkouts(meso.id).filter(x => x.week === wk && x.status === 'done')) {
      for (const en of w.entries)
        for (const s of en.sets) if (s.done) t += (s.weight || 0) * (s.reps || 0);
    }
    out.push({ label: isDeload(meso, wk) ? 'DL' : 'W' + wk, value: Math.round(t) });
  }
  return out;
}

function e1rmTrend(exerciseId) {
  const pts = [];
  const done = S.workouts.filter(w => w.status === 'done' && w.date)
    .sort((a,b) => a.date.localeCompare(b.date));
  for (const w of done) {
    for (const en of w.entries) {
      if (en.exerciseId !== exerciseId) continue;
      let best = 0;
      for (const s of en.sets) if (s.done) best = Math.max(best, e1rm(s.weight || 0, s.reps || 0));
      if (best > 0) pts.push({ label: w.date.slice(5), value: round1(best) });
    }
  }
  return pts;
}

/* ============================ router / shell ============================ */
function switchTab(tab) {
  S.tab = tab;
  $$('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-' + tab).classList.add('active');
  window.scrollTo(0, 0);
  render();
}

function render() {
  const meso = activeMeso();
  $('#header-sub').textContent = meso
    ? `${meso.name} · Week ${currentWeek(meso)}${isDeload(meso, currentWeek(meso)) ? ' (deload)' : ''} of ${meso.weeks}`
    : 'No active mesocycle';
  if (S.tab === 'train') renderTrain();
  if (S.tab === 'workout') renderWorkout();
  if (S.tab === 'plan') renderPlan();
  if (S.tab === 'library') renderLibrary();
  if (S.tab === 'progress') renderProgress();
}

function applyTheme() {
  const t = S.settings.theme || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

/* ============================ modal helper ============================ */
function openModal(html) {
  $('#modal-body').innerHTML = '<div class="drag"></div>' + html;
  $('#modal-scrim').classList.add('open');
}
function closeModal() { $('#modal-scrim').classList.remove('open'); }

/* ============================ TRAIN view ============================ */
function renderTrain() {
  const el = $('#view-train');
  const meso = activeMeso();
  if (!meso) {
    el.innerHTML = `
      <div class="empty-state card">
        <div class="empty-art"><img src="icons/empty-hero.png" alt=""></div>
        <h2>Let's build your first block.</h2>
        <p>Pick a split, choose your exercises, and MesoForge runs your week-to-week volume and effort progression automatically.</p>
        <button class="btn primary block" id="btn-new-meso-empty">Create a mesocycle</button>
      </div>`;
    $('#btn-new-meso-empty').onclick = () => { switchTab('plan'); openWizard(); };
    return;
  }

  const cw = currentWeek(meso);
  const viewWeek = S.planWeek || cw;
  const rir = targetRIR(meso, viewWeek);
  const deload = isDeload(meso, viewWeek);

  const doneCount = mesoWorkouts(meso.id).filter(w => w.status === 'done').length;
  const totalCount = meso.weeks * meso.days.length;
  const pct = Math.round(100 * doneCount / totalCount);

  // next session to do, in the *current* week
  let nextDay = null;
  for (let di = 0; di < meso.days.length; di++) {
    const w = getWorkout(meso, cw, di);
    if (w && w.status !== 'done') { nextDay = { w, di, name: meso.days[di].name }; break; }
  }

  const weekPills = Array.from({ length: meso.weeks }, (_, i) => {
    const wk = i + 1;
    const dl = isDeload(meso, wk);
    const cls = ['week-pill', dl ? 'deload' : '', wk === viewWeek ? 'active' : '', wk === cw && wk !== viewWeek ? 'current' : ''].join(' ');
    return `<button class="${cls}" data-week="${wk}">${dl ? 'Deload' : 'Week ' + wk}</button>`;
  }).join('');

  const nextPendingIdx = meso.days.findIndex((_, di) => { const w = getWorkout(meso, viewWeek, di); return w && w.status !== 'done'; });
  const days = meso.days.map((day, di) => {
    const w = getWorkout(meso, viewWeek, di);
    const done = w && w.status === 'done';
    const ready = !!w;
    const isNext = ready && !done && viewWeek === cw && di === nextPendingIdx;
    const totalSets = w ? w.entries.reduce((a, e) => a + (done ? e.sets.filter(s => s.done).length : e.targetSets), 0) : 0;
    const ic = done ? 'check' : ready ? 'dumbbell' : 'lock';
    return `
      <div class="day-card ${done ? 'done' : ''} ${isNext ? 'today' : ''} ${!ready ? 'day-locked' : ''}">
        <div class="day-icon">${icon(ic)}</div>
        <div class="day-main">
          <div class="day-title">${esc(day.name)}</div>
          <div class="day-meta">${ready ? totalSets + ' sets · ' + (done ? 'completed' + (w.date ? ' · ' + w.date : '') : isNext ? 'up next' : 'ready') : 'unlocks after last week’s session'}</div>
        </div>
        ${ready && !done ? `<button class="btn ${isNext ? 'primary' : 'ghost'} small" data-start="${w.id}">${w.entries.some(e => e.sets.length) ? 'Resume' : 'Start'}</button>` : ''}
        ${done ? `<button class="btn subtle small" data-view-workout="${w.id}">View</button>` : ''}
      </div>`;
  }).join('');

  // this-week volume balance (muscle icons + status)
  const planMuscles = MUSCLES.filter(m => meso.days.some(d => d.slots.some(s => s.muscle === m)));
  let nUnder = 0, nOpt = 0, nOver = 0;
  const balCells = planMuscles.map(m => {
    const lm = VOLUME_LANDMARKS[m] || { mev: 6, mrv: 18 };
    const sets = weeklyMuscleTotal(meso, cw, m);
    const st = sets < lm.mev ? 'under' : sets > lm.mrv ? 'over' : 'optimal';
    st === 'under' ? nUnder++ : st === 'over' ? nOver++ : nOpt++;
    return `<button class="bal-cell" data-goprog aria-label="${esc(m)} ${sets} sets"><img class="m-ic" src="${MUSCLE_ICON(m)}" alt=""><span class="bal-n">${sets}</span><span class="bal-name">${esc(MSHORT[m] || m)}</span><span class="bal-dot ${st}"></span></button>`;
  }).join('');

  el.innerHTML = `
    <div class="today-hero">
      <div class="hero-eyebrow">${esc(meso.name)}</div>
      <div class="hero-title">${deload ? 'Deload' : 'Week ' + viewWeek}</div>
      ${deload ? '<span class="hero-badge">Recovery week</span>' : ''}
      <div class="hero-meta">${deload
        ? `Half volume · light loads · leave ${rir}+ reps in the tank`
        : `Target effort — ${rir === 0 ? '0 RIR, take sets to failure' : rir + ' reps in reserve'}`}</div>
      <div class="progress-track" style="margin-top:14px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="hero-meta" style="margin-top:7px">${doneCount} of ${totalCount} sessions complete · ${pct}%</div>
      ${nextDay ? `<button class="btn primary block" id="btn-hero-start" style="margin-top:14px">${icon('play','ic')} ${nextDay.w.entries.some(e => e.sets.length) ? 'Resume' : 'Start'} ${esc(nextDay.name)}</button>` : ''}
    </div>

    <div class="section-title">Schedule</div>
    <div class="week-strip">${weekPills}</div>
    <div class="day-list" style="margin-top:12px">${days}</div>

    <div class="section-title" style="margin-top:22px">This week’s volume</div>
    <div class="card">
      <div class="balance-grid">${balCells}</div>
      <div class="balance-summary">
        <span><b>${nOpt}</b> in range</span>
        ${nUnder ? `<span style="color:var(--warn)"><b>${nUnder}</b> below target</span>` : ''}
        ${nOver ? `<span style="color:var(--over)"><b>${nOver}</b> over</span>` : ''}
        <span class="spacer"></span>
        <span class="muted" style="font-size:12px">Tap → Progress</span>
      </div>
    </div>`;

  if (nextDay) $('#btn-hero-start').onclick = () => { S.activeWorkoutId = nextDay.w.id; switchTab('workout'); };
  $$('[data-goprog]', el).forEach(b => b.onclick = () => switchTab('progress'));
  $$('.week-pill', el).forEach(b => b.onclick = () => { S.planWeek = +b.dataset.week; renderTrain(); });
  $$('[data-start]', el).forEach(b => b.onclick = () => { S.activeWorkoutId = b.dataset.start; switchTab('workout'); });
  $$('[data-view-workout]', el).forEach(b => b.onclick = () => { S.activeWorkoutId = b.dataset.viewWorkout; switchTab('workout'); });
}

/* ============================ WORKOUT view ============================ */
function renderWorkout() {
  const el = $('#view-workout');
  const w = S.workouts.find(x => x.id === S.activeWorkoutId);
  if (!w) { switchTab('train'); return; }
  const meso = S.mesos.find(m => m.id === w.mesoId);
  const day = meso.days[w.dayIndex];
  const readonly = w.status === 'done';
  const deload = isDeload(meso, w.week);
  const u = S.settings.units;

  // workout completion (done sets / total target sets)
  let doneSets = 0, targetTotal = 0;
  w.entries.forEach(en => {
    targetTotal += Math.max(en.targetSets, en.sets.length);
    doneSets += en.sets.filter(s => s.done).length;
  });
  const wkPct = targetTotal ? Math.round(100 * doneSets / targetTotal) : 0;

  const blocks = w.entries.map((en, ei) => {
    const ex = exById(en.exerciseId);
    const enDone = en.sets.length && en.sets.every(s => s.done) && en.sets.length >= en.targetSets;
    const setRows = Array.from({ length: Math.max(en.targetSets, en.sets.length) }, (_, si) => {
      const s = en.sets[si] || {};
      const sug = en.suggest && (s.weight == null) ? ` placeholder="${en.suggest.weight}"` : '';
      const sugR = en.suggest && (s.reps == null) ? ` placeholder="${en.suggest.reps}"` : '';
      return `
        <div class="set-grid">
          <div class="set-num">${si + 1}</div>
          <input type="number" inputmode="decimal" step="any" min="0" class="${s.weight != null ? 'filled' : ''}" data-w="${ei}:${si}" value="${s.weight ?? ''}"${sug} ${readonly ? 'disabled' : ''} aria-label="weight">
          <input type="number" inputmode="numeric" min="0" class="${s.reps != null ? 'filled' : ''}" data-r="${ei}:${si}" value="${s.reps ?? ''}"${sugR} ${readonly ? 'disabled' : ''} aria-label="reps">
          <div class="rir-cell">${en.targetRIR}${deload ? '+' : ''}</div>
          <button class="set-done-btn ${s.done ? 'done' : ''}" data-d="${ei}:${si}" ${readonly ? 'disabled' : ''} aria-label="mark set done">${icon('check')}</button>
        </div>`;
    }).join('');

    return `
      <div class="card exercise-block ${enDone ? 'complete' : ''}">
        <div class="ex-head">
          <span class="m-badge">${mIcon(en.muscle)}</span>
          <span class="ex-name">${esc(ex ? ex.name : 'Unknown')}</span>
          <span class="muscle-tag">${esc(en.muscle)}</span>
          ${readonly ? '' : `<button class="icon-btn" data-swap="${ei}" title="Swap exercise" aria-label="Swap exercise">${icon('swap')}</button>`}
        </div>
        <div class="target-line"><b>${en.targetSets} set${en.targetSets > 1 ? 's' : ''}</b> · ${en.targetRIR}${deload ? '+' : ''} RIR${en.suggest ? ` · last time <b>${en.suggest.weight}${u} × ${en.suggest.reps}</b>` : ''}</div>
        <div class="set-grid header"><div>Set</div><div>${u === 'kg' ? 'Kg' : 'Lb'}</div><div>Reps</div><div>RIR</div><div></div></div>
        ${setRows}
        ${readonly ? '' : `<button class="btn subtle small addset" data-addset="${ei}">${icon('plus','ic')} Add set</button>`}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="wk-topbar">
      <button class="btn subtle small" id="btn-back-train">${icon('chevL','ic')} Back</button>
      <div class="t">
        <strong>${esc(day.name)}</strong>
        <div class="muted tiny">${isDeload(meso, w.week) ? 'Deload' : 'Week ' + w.week} · ${w.status === 'done' ? 'completed' : 'in progress'}</div>
      </div>
      <span style="width:72px"></span>
    </div>
    ${readonly ? '' : `<div class="wk-progress"><div class="progress-track"><div class="progress-fill" style="width:${wkPct}%"></div></div><span class="lbl num">${doneSets}/${targetTotal} sets</span></div>`}
    ${blocks}
    ${readonly ? '' : `<button class="btn primary block" id="btn-finish" style="margin-top:6px">${icon('check','ic')} Finish workout</button>`}`;

  $('#btn-back-train').onclick = () => switchTab('train');

  if (readonly) return;

  const saveField = (attr, key) => (inp) => {
    const [ei, si] = inp.dataset[attr].split(':').map(Number);
    inp.addEventListener('input', () => {
      const en = w.entries[ei];
      while (en.sets.length <= si) en.sets.push({ weight: null, reps: null, done: false });
      en.sets[si][key] = inp.value === '' ? null : +inp.value;
      inp.classList.toggle('filled', inp.value !== '');
      saveWorkout(w);
    });
  };
  $$('[data-w]', el).forEach(saveField('w', 'weight'));
  $$('[data-r]', el).forEach(saveField('r', 'reps'));

  const updateWkProgress = () => {
    let d = 0, t = 0;
    w.entries.forEach(en => { t += Math.max(en.targetSets, en.sets.length); d += en.sets.filter(x => x.done).length; });
    const pct = t ? Math.round(100 * d / t) : 0;
    const fill = $('.wk-progress .progress-fill', el); if (fill) fill.style.width = pct + '%';
    const lbl = $('.wk-progress .lbl', el); if (lbl) lbl.textContent = `${d}/${t} sets`;
  };
  const flash = (node, cls) => { if (!node) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

  $$('[data-d]', el).forEach(btn => btn.onclick = () => {
    const [ei, si] = btn.dataset.d.split(':').map(Number);
    const en = w.entries[ei];
    while (en.sets.length <= si) en.sets.push({ weight: null, reps: null, done: false });
    const s = en.sets[si];
    const nowDone = !s.done;
    // adopt suggestion if fields left empty
    if (nowDone && s.weight == null && en.suggest) s.weight = en.suggest.weight;
    if (nowDone && s.reps == null && en.suggest) s.reps = en.suggest.reps;
    s.done = nowDone;
    saveWorkout(w);

    // in-place UI update (snappy, no full re-render) + tactile feedback
    const wInp = $(`[data-w="${ei}:${si}"]`, el), rInp = $(`[data-r="${ei}:${si}"]`, el);
    if (wInp && s.weight != null) { wInp.value = s.weight; wInp.classList.add('filled'); }
    if (rInp && s.reps != null) { rInp.value = s.reps; rInp.classList.add('filled'); }
    btn.classList.toggle('done', nowDone);
    const block = btn.closest('.exercise-block');
    const wasComplete = block && block.classList.contains('complete');
    const enDone = en.sets.length && en.sets.every(x => x.done) && en.sets.length >= en.targetSets;
    if (block) block.classList.toggle('complete', enDone);
    if (nowDone) {
      flash(btn, 'pop');
      flash(btn.closest('.set-grid'), 'flash');
      if (enDone && !wasComplete) flash(block, 'jc');
    }
    updateWkProgress();
  });

  $$('[data-addset]', el).forEach(btn => btn.onclick = () => {
    const en = w.entries[+btn.dataset.addset];
    en.targetSets = Math.max(en.targetSets + 1, en.sets.length + 1);
    saveWorkout(w);
    renderWorkout();
  });

  $$('[data-swap]', el).forEach(btn => btn.onclick = () => openSwapModal(w, +btn.dataset.swap));

  $('#btn-finish').onclick = () => openFeedbackModal(meso, w);
}

function openSwapModal(w, ei) {
  const en = w.entries[ei];
  const options = S.exercises.filter(e => e.muscle === en.muscle)
    .map(e => `<div class="lib-item" style="cursor:pointer" data-pick="${e.id}"><div class="eq-icon">${EQ_ABBR[e.eq] || '—'}</div><div style="flex:1"><div class="name">${esc(e.name)}</div><div class="eq">${esc(e.eq)}</div></div>${e.id === en.exerciseId ? '<span class="badge active">current</span>' : ''}</div>`)
    .join('');
  openModal(`<h2>Swap exercise</h2><p class="muted small">${esc(en.muscle)} · applies to this session and all future weeks.</p><div class="card flush" style="margin-top:12px">${options}</div>`);
  $$('[data-pick]').forEach(d => d.onclick = () => {
    const newId = d.dataset.pick;
    en.exerciseId = newId; en.suggest = null;
    saveWorkout(w);
    // also swap in the meso plan + future pending weeks
    const meso = S.mesos.find(m => m.id === w.mesoId);
    const slot = meso.days[w.dayIndex].slots[ei];
    if (slot) { slot.exerciseId = newId; saveMeso(meso); }
    S.workouts.filter(x => x.mesoId === w.mesoId && x.dayIndex === w.dayIndex && x.week > w.week && x.status === 'pending')
      .forEach(x => { if (x.entries[ei]) { x.entries[ei].exerciseId = newId; x.entries[ei].suggest = null; saveWorkout(x); } });
    closeModal(); renderWorkout();
  });
}

/* ============================ feedback + finish ============================ */
function openFeedbackModal(meso, w) {
  const muscles = [...new Set(w.entries.map(e => e.muscle))];
  const deload = isDeload(meso, w.week);
  const fbSection = deload ? '<p class="muted">Deload week — no feedback needed. Enjoy the recovery. 🧘</p>' :
    muscles.map(m => `
      <div class="fb-group">
        <h3><span class="muscle-dot"></span>${esc(m)}</h3>
        <div class="fb-label">Soreness coming in</div>
        <div class="seg grow" data-fb="${m}:soreness">
          <button data-v="0">Healed early</button><button data-v="1">Just in time</button><button data-v="2">Still sore</button>
        </div>
        <div class="fb-label">Pump</div>
        <div class="seg grow" data-fb="${m}:pump">
          <button data-v="0">Low</button><button data-v="1">Decent</button><button data-v="2">Great</button>
        </div>
        <div class="fb-label">Workload</div>
        <div class="seg grow" data-fb="${m}:workload">
          <button data-v="0">Easy</button><button data-v="1">Manageable</button><button data-v="2">Pushed</button><button data-v="3">Too much</button>
        </div>
        <div class="fb-label">Joints &amp; connective tissue</div>
        <div class="seg grow" data-fb="${m}:joints">
          <button data-v="0">Fresh</button><button data-v="1">A bit achy</button><button data-v="2">Painful</button>
        </div>
      </div>`).join('');

  openModal(`
    <h2>Finish workout</h2>
    <p class="muted small">${deload ? '' : 'Rate each muscle you trained — this drives next week’s set targets.'}</p>
    ${fbSection}
    <button class="btn primary block" id="btn-confirm-finish" style="margin-top:14px">Save &amp; finish</button>`);

  const fb = {};
  muscles.forEach(m => { if (!deload) fb[m] = { soreness: 1, pump: 1, workload: 1, joints: 0 }; });
  $$('.seg[data-fb]').forEach(seg => {
    const [m, k] = seg.dataset.fb.split(':');
    // preselect defaults
    $$('button', seg).forEach(b => b.classList.toggle('active', +b.dataset.v === fb[m][k]));
    $$('button', seg).forEach(b => b.onclick = () => {
      fb[m][k] = +b.dataset.v;
      $$('button', seg).forEach(x => x.classList.toggle('active', x === b));
    });
  });

  $('#btn-confirm-finish').onclick = () => {
    w.feedback = fb;
    w.status = 'done';
    w.date = todayISO();
    // drop empty trailing sets
    w.entries.forEach(en => { en.sets = en.sets.filter(s => s.done && (s.reps || 0) > 0); });
    saveWorkout(w);
    scheduleNextWeek(meso, w);
    // meso complete?
    const doneAll = mesoWorkouts(meso.id).filter(x => x.status === 'done').length >= meso.weeks * meso.days.length;
    if (doneAll) { meso.status = 'done'; saveMeso(meso); }
    closeModal();
    S.planWeek = null;
    toast(doneAll ? 'Mesocycle complete! 🎉' : 'Workout saved');
    switchTab('train');
  };
}

/* ============================ PLAN view + wizard ============================ */
function renderPlan() {
  const el = $('#view-plan');
  const list = S.mesos.slice().sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  el.innerHTML = `
    <button class="btn primary block" id="btn-new-meso">${icon('plus','ic')} New mesocycle</button>
    <div style="height:14px"></div>
    ${list.length ? '<div class="section-title">Your blocks</div>' : '<div class="empty-state"><div class="empty-art"><img src="icons/empty-hero.png" alt=""></div><p>No mesocycles yet. Create one to get started.</p></div>'}
    ${list.map(m => {
      const done = mesoWorkouts(m.id).filter(w => w.status === 'done').length;
      const total = m.weeks * m.days.length;
      const badge = m.status === 'active' ? '<span class="badge active">Active</span>'
                  : m.status === 'done' ? '<span class="badge done">Finished</span>' : '';
      return `
      <div class="card meso-card">
        <div class="row between">
          <div style="min-width:0">
            <div class="meso-title">${esc(m.name)}</div>
            <div class="meso-meta">${m.days.length} days/wk · ${m.weeks - 1} wks + deload · ${done}/${total} sessions</div>
          </div>
          <div class="row">
            ${badge || `<button class="btn small" data-activate="${m.id}">Activate</button>`}
            <button class="icon-btn" data-del-meso="${m.id}" aria-label="Delete" style="color:var(--over)">✕</button>
          </div>
        </div>
        <div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:${Math.round(100*done/total)}%"></div></div>
      </div>`;
    }).join('')}`;

  $('#btn-new-meso').onclick = openWizard;
  $$('[data-activate]', el).forEach(b => b.onclick = () => {
    S.mesos.forEach(m => { if (m.status === 'active') { m.status = 'paused'; saveMeso(m); } });
    const m = S.mesos.find(x => x.id === b.dataset.activate);
    m.status = 'active'; saveMeso(m); S.planWeek = null; render();
  });
  $$('[data-del-meso]', el).forEach(b => b.onclick = () => {
    const m = S.mesos.find(x => x.id === b.dataset.delMeso);
    openModal(`<h2>Delete “${esc(m.name)}”?</h2><p class="muted">This removes the plan and all its logged workouts. This cannot be undone.</p>
      <div class="row" style="margin-top:14px"><button class="btn block" id="btn-cancel-del">Cancel</button><button class="btn danger block" id="btn-do-del" style="background:var(--over-weak)">Delete</button></div>`);
    $('#btn-cancel-del').onclick = closeModal;
    $('#btn-do-del').onclick = async () => {
      const removed = mesoWorkouts(m.id);
      S.mesos = S.mesos.filter(x => x.id !== m.id);
      await idb.del('mesos', m.id);
      for (const wk of removed) await idb.del('workouts', wk.id);
      S.workouts = S.workouts.filter(wk => wk.mesoId !== m.id);
      closeModal(); render(); toast('Deleted');
    };
  });
}

/* --- meso creation wizard (3 steps) --- */
const WIZ = { step: 0, template: null, weeks: 5, name: '', slots: [], ramp: '3-0' };

function openWizard() {
  WIZ.step = 0; WIZ.template = null; WIZ.weeks = 5; WIZ.name = ''; WIZ.slots = []; WIZ.ramp = '3-0';
  renderWizard();
}

function defaultExerciseFor(muscle, taken) {
  const opts = S.exercises.filter(e => e.muscle === muscle && !taken.has(e.id));
  return (opts[0] || S.exercises.find(e => e.muscle === muscle)).id;
}

function renderWizard() {
  const dots = `<div class="wizard-step-dots">${[0,1,2].map(i => `<span class="${i <= WIZ.step ? 'on' : ''}"></span>`).join('')}</div>`;

  if (WIZ.step === 0) {
    openModal(`${dots}<h2>Pick a split</h2><p class="muted small">How many days a week can you train?</p>
      <div style="margin-top:12px">
      ${TEMPLATES.map(t => `
        <div class="card pick-card" data-tpl="${t.id}">
          <div class="row between"><strong>${esc(t.name)}</strong><span class="muscle-tag">${t.days} days</span></div>
          <div class="muted small" style="margin-top:4px">${esc(t.blurb)}</div>
        </div>`).join('')}</div>`);
    $$('[data-tpl]').forEach(c => c.onclick = () => {
      WIZ.template = TEMPLATES.find(t => t.id === c.dataset.tpl);
      // build default slots
      WIZ.slots = WIZ.template.plan.map(day => {
        const taken = new Set();
        return day.slots.map(m => {
          const id = defaultExerciseFor(m, taken);
          taken.add(id);
          return { muscle: m, exerciseId: id };
        });
      });
      WIZ.step = 1; renderWizard();
    });
    return;
  }

  if (WIZ.step === 1) {
    openModal(`${dots}<h2>Length &amp; effort</h2>
      <label class="field">Mesocycle name
        <input type="text" id="wiz-name" placeholder="e.g. Summer block 1" value="${esc(WIZ.name)}">
      </label>
      <label class="field">Length
        <div class="seg" id="wiz-weeks">
          ${[4,5,6].map(n => `<button data-v="${n}" class="${WIZ.weeks === n ? 'active' : ''}">${n - 1} + deload</button>`).join('')}
        </div>
      </label>
      <label class="field">Effort ramp
        <select id="wiz-ramp">
          ${RIR_RAMPS.map(r => `<option value="${r.id}" ${WIZ.ramp === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </label>
      <p class="muted small">Effort ramps across the block, then a light deload week. Starting volume sits near each muscle’s minimum effective dose and autoregulates upward from your feedback, capped at its weekly maximum.</p>
      <div class="row" style="margin-top:8px"><button class="btn block" id="wiz-back">Back</button><button class="btn primary block" id="wiz-next">Next</button></div>`);
    $$('#wiz-weeks button').forEach(b => b.onclick = () => {
      WIZ.weeks = +b.dataset.v;
      $$('#wiz-weeks button').forEach(x => x.classList.toggle('active', x === b));
    });
    $('#wiz-back').onclick = () => { WIZ.step = 0; renderWizard(); };
    $('#wiz-next').onclick = () => {
      WIZ.name = $('#wiz-name').value.trim() || WIZ.template.name + ' block';
      WIZ.ramp = $('#wiz-ramp').value;
      WIZ.step = 2; renderWizard();
    };
    return;
  }

  // step 2 — exercises per slot
  const daysHtml = WIZ.template.plan.map((day, di) => `
    <h3>${esc(day.name)}</h3>
    ${WIZ.slots[di].map((slot, si) => `
      <div class="slot-row">
        <span class="muscle-tag" style="min-width:76px;text-align:center">${esc(slot.muscle)}</span>
        <select data-slot="${di}:${si}">
          ${S.exercises.filter(e => e.muscle === slot.muscle).map(e => `<option value="${e.id}" ${e.id === slot.exerciseId ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}
        </select>
      </div>`).join('')}`).join('');

  openModal(`${dots}<h2>Choose exercises</h2>
    <p class="muted small">Defaults are picked for you — change any slot. You can also swap mid-meso later.</p>
    ${daysHtml}
    <div class="row" style="margin-top:16px"><button class="btn block" id="wiz-back">Back</button><button class="btn primary block" id="wiz-create">Create mesocycle</button></div>`);
  $$('[data-slot]').forEach(sel => sel.onchange = () => {
    const [di, si] = sel.dataset.slot.split(':').map(Number);
    WIZ.slots[di][si].exerciseId = sel.value;
  });
  $('#wiz-back').onclick = () => { WIZ.step = 1; renderWizard(); };
  $('#wiz-create').onclick = () => {
    S.mesos.forEach(m => { if (m.status === 'active') { m.status = 'paused'; saveMeso(m); } });
    const ramp = RIR_RAMPS.find(r => r.id === WIZ.ramp) || RIR_RAMPS[0];
    const meso = {
      id: uid(), name: WIZ.name, created: todayISO(), status: 'active',
      weeks: WIZ.weeks, rirStart: ramp.start, rirEnd: ramp.end,
      days: WIZ.template.plan.map((day, di) => ({ name: day.name, slots: WIZ.slots[di] })),
    };
    S.mesos.push(meso);
    saveMeso(meso);
    buildWeekOne(meso);
    S.planWeek = null;
    closeModal();
    toast('Mesocycle created');
    switchTab('train');
  };
}

/* ============================ LIBRARY view ============================ */
function renderLibrary() {
  const el = $('#view-library');
  const filter = S.libFilter || 'All';
  const chips = ['All', ...MUSCLES].map(m => `<button class="chip ${m === filter ? 'active' : ''}" data-m="${m}">${m}</button>`).join('');
  const list = S.exercises
    .filter(e => filter === 'All' || e.muscle === filter)
    .sort((a, b) => a.muscle === b.muscle ? a.name.localeCompare(b.name) : MUSCLES.indexOf(a.muscle) - MUSCLES.indexOf(b.muscle));

  el.innerHTML = `
    <div class="chips scroll" style="margin-bottom:12px">${chips}</div>
    <button class="btn block" id="btn-add-ex">${icon('plus','ic')} Add custom exercise</button>
    <div class="card flush" style="margin-top:12px">
      ${list.map(e => `
        <div class="lib-item">
          <div class="eq-icon">${mIcon(e.muscle)}</div>
          <div style="flex:1"><div class="name">${esc(e.name)}</div><div class="eq">${esc(e.muscle)} · ${esc(e.eq)}${e.custom ? ' · custom' : ''}</div></div>
          ${e.custom ? `<button class="btn small danger" data-del-ex="${e.id}">Remove</button>` : ''}
        </div>`).join('') || '<div style="padding:20px"><p class="muted" style="text-align:center;margin:0">Nothing here.</p></div>'}
    </div>`;

  $$('.chip', el).forEach(c => c.onclick = () => { S.libFilter = c.dataset.m; renderLibrary(); });
  $('#btn-add-ex').onclick = () => {
    openModal(`<h2>Add exercise</h2>
      <label class="field">Name<input type="text" id="ex-name" placeholder="e.g. Smith Machine Press"></label>
      <label class="field">Muscle group<select id="ex-muscle">${MUSCLES.map(m => `<option>${m}</option>`).join('')}</select></label>
      <label class="field">Equipment<select id="ex-eq">${['Barbell','Dumbbell','Machine','Cable','Bodyweight','Other'].map(q => `<option>${q}</option>`).join('')}</select></label>
      <button class="btn primary block" id="ex-save">Save</button>`);
    $('#ex-save').onclick = async () => {
      const name = $('#ex-name').value.trim();
      if (!name) { toast('Give it a name'); return; }
      const e = { id: uid(), name, muscle: $('#ex-muscle').value, eq: $('#ex-eq').value, custom: true };
      S.exercises.push(e);
      await idb.put('exercises', e);
      closeModal(); renderLibrary(); toast('Added');
    };
  };
  $$('[data-del-ex]', el).forEach(b => b.onclick = async () => {
    const id = b.dataset.delEx;
    S.exercises = S.exercises.filter(e => e.id !== id);
    await idb.del('exercises', id);
    renderLibrary();
  });
}

/* ============================ PROGRESS view (charts) ============================ */
function renderProgress() {
  const el = $('#view-progress');
  const meso = activeMeso() || S.mesos.slice().sort((a,b) => (b.created||'').localeCompare(a.created||''))[0];
  if (!meso) {
    el.innerHTML = `<div class="empty-state card"><div class="empty-art"><img src="icons/empty-hero.png" alt=""></div><h2>No progress yet</h2><p>Charts and stats appear once you have a mesocycle underway.</p></div>`;
    return;
  }
  const loggedExIds = [...new Set(S.workouts.filter(w => w.status === 'done').flatMap(w => w.entries.map(e => e.exerciseId)))];
  if (!S.progressExercise || !loggedExIds.includes(S.progressExercise)) S.progressExercise = loggedExIds[0] || null;

  // summary stats ----------------------------------------------------------
  const doneCount = mesoWorkouts(meso.id).filter(w => w.status === 'done').length;
  const totalCount = meso.weeks * meso.days.length;
  const adherence = Math.round(100 * doneCount / totalCount);
  const tonSeries = weeklyTonnage(meso);
  const totalTon = tonSeries.reduce((a, d) => a + d.value, 0);
  const cw = currentWeek(meso);
  const weekSets = MUSCLES.reduce((a, m) => a + weeklyMuscleTotal(meso, cw, m), 0);
  // best e1RM across everything logged
  let bestE = 0, bestExId = null;
  for (const w of S.workouts.filter(w => w.status === 'done')) {
    for (const en of w.entries) for (const s of en.sets) if (s.done) {
      const v = e1rm(s.weight || 0, s.reps || 0);
      if (v > bestE) { bestE = v; bestExId = en.exerciseId; }
    }
  }
  const bestExName = bestExId ? (exById(bestExId)?.name || '') : '';
  const u = S.settings.units;

  const statRow = `
    <div class="stat-row" style="margin-bottom:14px">
      <div class="stat-tile"><div class="v num"><span class="cv" data-count="${adherence}" data-fmt="int">0</span><small>%</small></div><div class="l">Adherence · ${doneCount}/${totalCount}</div></div>
      <div class="stat-tile"><div class="v num"><span class="cv" data-count="${totalTon}" data-fmt="k">0</span><small> ${u}</small></div><div class="l">Total volume lifted</div>${tonSeries.some(d=>d.value)?`<div class="spark" id="spark-ton"></div>`:''}</div>
      <div class="stat-tile"><div class="v num">${bestE ? `<span class="cv" data-count="${round1(bestE)}" data-fmt="dec">0</span><small> ${u}</small>` : '—'}</div><div class="l">${bestE ? 'Best e1RM · ' + esc(bestExName) : 'Best e1RM'}</div></div>
      <div class="stat-tile"><div class="v num"><span class="cv" data-count="${weekSets}" data-fmt="int">0</span></div><div class="l">Working sets · wk ${cw}</div></div>
    </div>`;

  // muscle volume overview (current week vs MEV–MRV) ------------------------
  const planMuscles = MUSCLES.filter(m => meso.days.some(d => d.slots.some(s => s.muscle === m)));
  const volRows = planMuscles.map(m => {
    const lm = VOLUME_LANDMARKS[m] || { mev: 6, mrv: 18 };
    const sets = weeklyMuscleTotal(meso, cw, m);
    const scaleMax = Math.max(lm.mrv * 1.15, sets, 1);
    const status = sets < lm.mev ? 'under' : sets > lm.mrv ? 'over' : 'optimal';
    const statusTxt = status === 'under' ? 'below MEV' : status === 'over' ? 'over MRV' : 'optimal';
    const pctFill = Math.min(100, 100 * sets / scaleMax);
    const zL = 100 * lm.mev / scaleMax, zR = 100 * lm.mrv / scaleMax;
    return `
      <div class="volume-row">
        <div class="vol-muscle"><span class="m-plate">${mIcon(m)}</span>${esc(m)}</div>
        <div class="vol-track">
          <div class="vol-zone" style="left:${zL}%;width:${zR - zL}%"></div>
          <div class="vol-zone-line" style="left:${zL}%"></div>
          <div class="vol-zone-line" style="left:${zR}%"></div>
          <div class="vol-fill ${status}" style="width:${pctFill}%"></div>
        </div>
        <div class="vol-val num">${sets}<span class="st ${status}">${statusTxt}</span></div>
      </div>`;
  }).join('');

  const muscleChips = MUSCLES.map(m => `<button class="chip ${m === S.progressMuscle ? 'active' : ''}" data-pm="${m}">${m}</button>`).join('');
  const setsData = weeklySetsForMuscle(meso, S.progressMuscle);
  const trendData = S.progressExercise ? e1rmTrend(S.progressExercise) : [];
  const exOptions = loggedExIds.map(id => { const e = exById(id); return e ? `<option value="${id}" ${id === S.progressExercise ? 'selected' : ''}>${esc(e.name)}</option>` : ''; }).join('');

  el.innerHTML = `
    ${statRow}

    <div class="card">
      <h2>Weekly volume by muscle</h2>
      <p class="muted small" style="margin:-4px 0 14px">Working sets this week (Week ${cw}) against each muscle’s recoverable range.</p>
      <div class="volume-list">${volRows}</div>
      <div class="legend">
        <span><i style="background:var(--warn)"></i>Below MEV — add volume</span>
        <span><i style="background:var(--accent)"></i>In range — optimal</span>
        <span><i style="background:var(--over)"></i>Over MRV — ease off</span>
        <span><i style="background:var(--good-weak);border:1px solid var(--good)"></i>MEV–MRV zone</span>
      </div>
    </div>

    <div class="card">
      <h2 style="display:flex;align-items:center;gap:8px">${mIcon(S.progressMuscle)} Set progression — ${esc(S.progressMuscle)}</h2>
      <div class="chips scroll" style="margin-bottom:12px">${muscleChips}</div>
      <div id="chart-sets"></div>
      <p class="muted small" style="margin:10px 0 0">Completed weeks show logged working sets; upcoming weeks show current targets. Shaded band = recoverable range.</p>
    </div>

    <div class="progress-cols">
      <div class="card">
        <h2>Weekly tonnage <span class="muted" style="font-weight:600">(${u})</span></h2>
        <div id="chart-tonnage"></div>
      </div>

      <div class="card">
        <h2>Estimated 1RM</h2>
        ${loggedExIds.length ? `<label class="field"><select id="sel-ex">${exOptions}</select></label><div id="chart-e1rm"></div>` : '<p class="muted small">Log some workouts to see strength trends.</p>'}
      </div>
    </div>`;

  $$('[data-pm]', el).forEach(c => c.onclick = () => { S.progressMuscle = c.dataset.pm; renderProgress(); });
  const sel = $('#sel-ex');
  if (sel) sel.onchange = () => { S.progressExercise = sel.value; renderProgress(); };

  const lm = VOLUME_LANDMARKS[S.progressMuscle];
  barChart($('#chart-sets'), setsData, {
    unit: 'sets',
    zone: lm ? { min: lm.mev, max: lm.mrv } : null,
  });
  barChart($('#chart-tonnage'), weeklyTonnage(meso), { unit: u });
  if (trendData.length) lineChart($('#chart-e1rm'), trendData, { unit: u });
  else if (loggedExIds.length) $('#chart-e1rm').innerHTML = '<p class="muted small">No completed sets for this exercise yet.</p>';

  // sparkline on tonnage tile
  const sp = $('#spark-ton');
  if (sp) sparkline(sp, tonSeries.map(d => d.value));

  runCountUps(el);
}

/* --- minimal original SVG charts: thin marks, rounded data ends, hover tooltip --- */
const CHART_H = 190, PAD = { t: 16, r: 12, b: 28, l: 38 };

function niceMax(v) {
  if (v <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

function chartFrame(width, maxV) {
  const innerW = width - PAD.l - PAD.r, innerH = CHART_H - PAD.t - PAD.b;
  const ticks = [0, .5, 1].map(f => f * maxV);
  const gy = (v) => PAD.t + innerH * (1 - v / maxV);
  const grid = ticks.map(t => `
    <line class="${t === 0 ? 'baseline-line' : 'gridline'}" x1="${PAD.l}" x2="${width - PAD.r}" y1="${gy(t)}" y2="${gy(t)}"/>
    <text class="axis-label" x="${PAD.l - 7}" y="${gy(t) + 3.5}" text-anchor="end">${t >= 1000 ? Math.round(t / 1000) + 'k' : t}</text>`).join('');
  return { innerW, innerH, gy, grid };
}

function attachTooltip(root, svg, items) {
  const tip = document.createElement('div');
  tip.className = 'viz-tooltip';
  root.appendChild(tip);
  const show = (it, x, y) => {
    tip.innerHTML = `<div class="t">${esc(it.label)}</div><div class="v">${esc(it.text)}</div>`;
    tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.display = 'block';
  };
  const hide = () => { tip.style.display = 'none'; };
  items.forEach(({ el, item, x, y }) => {
    el.addEventListener('pointerenter', () => show(item, x, y));
    el.addEventListener('pointerleave', hide);
  });
  svg.addEventListener('pointerleave', hide);
}

function barChart(root, data, { unit, zone } = {}) {
  if (!root) return;
  root.classList.add('viz-root');
  const width = Math.max(root.clientWidth || 320, 280);
  const zoneMax = zone ? zone.max : 0;
  const maxV = niceMax(Math.max(...data.map(d => d.value), zoneMax, 1));
  const { innerW, gy, grid } = chartFrame(width, maxV);
  const n = data.length;
  const slot = innerW / n;
  const bw = Math.min(28, slot * 0.56);

  // shaded MEV–MRV zone band behind bars
  let zoneEls = '';
  if (zone) {
    const yTop = gy(zone.max), yBot = gy(zone.min);
    zoneEls = `
      <rect class="zone-band" x="${PAD.l}" y="${yTop}" width="${width - PAD.l - PAD.r}" height="${Math.max(0, yBot - yTop)}"/>
      <line class="zone-edge" x1="${PAD.l}" x2="${width - PAD.r}" y1="${yTop}" y2="${yTop}"/>
      <line class="zone-edge" x1="${PAD.l}" x2="${width - PAD.r}" y1="${yBot}" y2="${yBot}"/>
      <text class="axis-label" x="${width - PAD.r}" y="${yTop - 4}" text-anchor="end">MRV</text>
      <text class="axis-label" x="${width - PAD.r}" y="${yBot + 12}" text-anchor="end">MEV</text>`;
  }

  let bars = '', hits = [];
  data.forEach((d, i) => {
    const x = PAD.l + slot * i + (slot - bw) / 2;
    const y = gy(d.value), y0 = gy(0);
    const h = Math.max(y0 - y, 0);
    const r = Math.min(4, bw / 2, h);
    bars += h > 0
      ? `<path class="bar" style="animation-delay:${i * 45}ms" d="M${x},${y0} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + bw - r},${y} Q${x + bw},${y} ${x + bw},${y + r} L${x + bw},${y0} Z" fill="var(--accent)"/>`
      : '';
    bars += `<text class="axis-label" x="${x + bw / 2}" y="${CHART_H - 9}" text-anchor="middle">${esc(d.label)}</text>`;
    bars += `<rect data-hit="${i}" x="${PAD.l + slot * i}" y="${PAD.t}" width="${slot}" height="${CHART_H - PAD.t - PAD.b}" fill="transparent"/>`;
    hits.push({ i, x: x + bw / 2, y });
  });

  root.innerHTML = `<svg viewBox="0 0 ${width} ${CHART_H}" role="img" aria-label="bar chart">${grid}${zoneEls}${bars}</svg>`;
  const svg = $('svg', root);
  attachTooltip(root, svg, hits.map(h => ({
    el: $(`[data-hit="${h.i}"]`, svg),
    item: { label: data[h.i].label, text: `${data[h.i].value.toLocaleString()} ${unit || ''}` },
    x: h.x * (root.clientWidth ? root.clientWidth / width : 1), y: h.y,
  })));
}

function lineChart(root, data, { unit } = {}) {
  if (!root) return;
  root.classList.add('viz-root');
  const width = Math.max(root.clientWidth || 320, 280);
  const maxV = niceMax(Math.max(...data.map(d => d.value), 1));
  const { innerW, gy, grid } = chartFrame(width, maxV);
  const n = data.length;
  const gx = (i) => n === 1 ? PAD.l + innerW / 2 : PAD.l + (innerW * i) / (n - 1);

  const path = data.map((d, i) => `${i ? 'L' : 'M'}${gx(i)},${gy(d.value)}`).join(' ');
  const area = `${path} L${gx(n-1)},${gy(0)} L${gx(0)},${gy(0)} Z`;
  const dots = data.map((d, i) => `<circle class="dot" style="animation-delay:${300 + i * 70}ms" cx="${gx(i)}" cy="${gy(d.value)}" r="4" fill="var(--accent)" stroke="var(--surface-1)" stroke-width="2"/>`).join('');
  const labels = data.map((d, i) => (n <= 6 || i === 0 || i === n - 1 || i % Math.ceil(n / 5) === 0)
    ? `<text class="axis-label" x="${gx(i)}" y="${CHART_H - 9}" text-anchor="middle">${esc(d.label)}</text>` : '').join('');
  const hitRects = data.map((d, i) => {
    const x0 = i === 0 ? PAD.l : (gx(i - 1) + gx(i)) / 2;
    const x1 = i === n - 1 ? PAD.l + innerW : (gx(i) + gx(i + 1)) / 2;
    return `<rect data-hit="${i}" x="${x0}" y="${PAD.t}" width="${x1 - x0}" height="${CHART_H - PAD.t - PAD.b}" fill="transparent"/>`;
  }).join('');

  root.innerHTML = `<svg viewBox="0 0 ${width} ${CHART_H}" role="img" aria-label="line chart">${grid}
    <path class="area" d="${area}" fill="var(--accent-weak)" stroke="none"/>
    <path class="line" pathLength="1" d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}${hitRects}</svg>`;
  const svg = $('svg', root);
  attachTooltip(root, svg, data.map((d, i) => ({
    el: $(`[data-hit="${i}"]`, svg),
    item: { label: d.label, text: `${d.value.toLocaleString()} ${unit || ''}` },
    x: gx(i) * (root.clientWidth ? root.clientWidth / width : 1), y: gy(d.value),
  })));
}

/* tiny sparkline for stat tiles */
function sparkline(root, values) {
  if (!root || !values.length) return;
  const W = 100, H = 26, max = Math.max(...values, 1), min = Math.min(...values, 0);
  const span = max - min || 1;
  const n = values.length;
  const gx = (i) => n === 1 ? W / 2 : (W * i) / (n - 1);
  const gy = (v) => H - 3 - (H - 6) * (v - min) / span;
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${gx(i).toFixed(1)},${gy(v).toFixed(1)}`).join(' ');
  root.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:26px;display:block">
    <path class="area" d="${path} L${W},${H} L0,${H} Z" fill="var(--accent-weak)"/>
    <path class="spark-line" pathLength="1" d="${path}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

/* count-up animation for stat numbers */
const REDUCE_MOTION = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(node, to, fmt = (v) => Math.round(v)) {
  if (REDUCE_MOTION() || !node) { if (node) node.textContent = fmt(to); return; }
  const dur = 700, start = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
    node.textContent = fmt(to * e);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function runCountUps(root) {
  $$('.cv[data-count]', root).forEach(n => {
    const to = +n.dataset.count;
    const f = n.dataset.fmt;
    const fmt = f === 'k' ? fmtK : f === 'dec' ? (v => round1(v)) : (v => Math.round(v));
    countUp(n, to, fmt);
  });
}

/* ============================ settings / export ============================ */
function openSettings() {
  openModal(`
    <h2>Settings</h2>
    <label class="field">Units
      <div class="seg" id="set-units">
        <button data-v="lb" class="${S.settings.units === 'lb' ? 'active' : ''}">lb</button>
        <button data-v="kg" class="${S.settings.units === 'kg' ? 'active' : ''}">kg</button>
      </div>
    </label>
    <label class="field">Theme
      <div class="seg" id="set-theme">
        <button data-v="auto" class="${(S.settings.theme||'auto') === 'auto' ? 'active' : ''}">Auto</button>
        <button data-v="light" class="${S.settings.theme === 'light' ? 'active' : ''}">Light</button>
        <button data-v="dark" class="${S.settings.theme === 'dark' ? 'active' : ''}">Dark</button>
      </div>
    </label>
    <h3>Backup</h3>
    <p class="muted small">Your data lives only on this device. Export a backup once in a while.</p>
    <div class="row">
      <button class="btn block" id="btn-export">Export JSON</button>
      <button class="btn block" id="btn-import">Import JSON</button>
    </div>
    <input type="file" id="file-import" accept="application/json" style="display:none">
    <h3>About</h3>
    <p class="muted small">MesoForge — a personal hypertrophy planner. Volume autoregulates from your set feedback; effort ramps to 0 RIR before each deload.</p>`);

  $$('#set-units button').forEach(b => b.onclick = () => {
    S.settings.units = b.dataset.v; saveSettings();
    $$('#set-units button').forEach(x => x.classList.toggle('active', x === b));
    render();
  });
  $$('#set-theme button').forEach(b => b.onclick = () => {
    S.settings.theme = b.dataset.v; saveSettings(); applyTheme();
    $$('#set-theme button').forEach(x => x.classList.toggle('active', x === b));
  });

  $('#btn-export').onclick = () => {
    const blob = new Blob([JSON.stringify({ v: 1, exported: new Date().toISOString(), exercises: S.exercises, mesos: S.mesos, workouts: S.workouts, settings: S.settings }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mesoforge-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  $('#btn-import').onclick = () => $('#file-import').click();
  $('#file-import').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.mesos || !data.workouts || !data.exercises) throw new Error('bad file');
      S.exercises = data.exercises; S.mesos = data.mesos; S.workouts = data.workouts;
      S.settings = { ...S.settings, ...(data.settings || {}) };
      for (const x of S.exercises) await idb.put('exercises', x);
      for (const x of S.mesos) await idb.put('mesos', x);
      for (const x of S.workouts) await idb.put('workouts', x);
      await saveSettings();
      applyTheme();
      closeModal(); render(); toast('Backup restored');
    } catch { toast('Could not read that file'); }
  };
}

/* ============================ boot ============================ */
async function main() {
  await hydrate();

  $('#tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) switchTab(b.dataset.tab);
  });
  $('#btn-settings').onclick = openSettings;
  $('#btn-theme').onclick = () => {
    const cur = S.settings.theme || 'auto';
    S.settings.theme = cur === 'auto' ? 'dark' : cur === 'dark' ? 'light' : 'auto';
    saveSettings(); applyTheme();
    toast('Theme: ' + S.settings.theme);
  };
  $('#modal-scrim').addEventListener('click', (e) => { if (e.target.id === 'modal-scrim') closeModal(); });

  switchTab('train');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
if (!(typeof window !== 'undefined' && window.__MF_NOBOOT)) main();
