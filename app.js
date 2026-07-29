/* =====================================================================
   MesoForge — iOS-native rebuild (same engine, new everything else)
   Autoregulated volume, RIR progression, deloads, progress analytics.
   All data stays on-device (IndexedDB). Export/import JSON backup.
   ===================================================================== */
'use strict';

/* ============================ constants ============================ */
const MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Calves','Abs'];

const SEED_EXERCISES = [
  { name:'Barbell Bench Press', muscle:'Chest', eq:'Barbell' },
  { name:'Incline Barbell Press', muscle:'Chest', eq:'Barbell' },
  { name:'Dumbbell Bench Press', muscle:'Chest', eq:'Dumbbell' },
  { name:'Incline Dumbbell Press', muscle:'Chest', eq:'Dumbbell' },
  { name:'Machine Chest Press', muscle:'Chest', eq:'Machine' },
  { name:'Cable Fly', muscle:'Chest', eq:'Cable' },
  { name:'Pec Deck', muscle:'Chest', eq:'Machine' },
  { name:'Weighted Dip', muscle:'Chest', eq:'Bodyweight' },
  { name:'Push-Up', muscle:'Chest', eq:'Bodyweight' },
  { name:'Deadlift', muscle:'Back', eq:'Barbell' },
  { name:'Barbell Row', muscle:'Back', eq:'Barbell' },
  { name:'Pull-Up', muscle:'Back', eq:'Bodyweight' },
  { name:'Chin-Up', muscle:'Back', eq:'Bodyweight' },
  { name:'Lat Pulldown', muscle:'Back', eq:'Cable' },
  { name:'Seated Cable Row', muscle:'Back', eq:'Cable' },
  { name:'Chest-Supported Row', muscle:'Back', eq:'Machine' },
  { name:'Single-Arm Dumbbell Row', muscle:'Back', eq:'Dumbbell' },
  { name:'Rack Pull', muscle:'Back', eq:'Barbell' },
  { name:'Overhead Press', muscle:'Shoulders', eq:'Barbell' },
  { name:'Seated Dumbbell Press', muscle:'Shoulders', eq:'Dumbbell' },
  { name:'Machine Shoulder Press', muscle:'Shoulders', eq:'Machine' },
  { name:'Dumbbell Lateral Raise', muscle:'Shoulders', eq:'Dumbbell' },
  { name:'Cable Lateral Raise', muscle:'Shoulders', eq:'Cable' },
  { name:'Reverse Pec Deck', muscle:'Shoulders', eq:'Machine' },
  { name:'Face Pull', muscle:'Shoulders', eq:'Cable' },
  { name:'Upright Row', muscle:'Shoulders', eq:'Barbell' },
  { name:'Barbell Curl', muscle:'Biceps', eq:'Barbell' },
  { name:'Dumbbell Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Incline Dumbbell Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Hammer Curl', muscle:'Biceps', eq:'Dumbbell' },
  { name:'Preacher Curl', muscle:'Biceps', eq:'Machine' },
  { name:'Cable Curl', muscle:'Biceps', eq:'Cable' },
  { name:'Close-Grip Bench Press', muscle:'Triceps', eq:'Barbell' },
  { name:'Skull Crusher', muscle:'Triceps', eq:'Barbell' },
  { name:'Cable Pushdown', muscle:'Triceps', eq:'Cable' },
  { name:'Overhead Cable Extension', muscle:'Triceps', eq:'Cable' },
  { name:'Dumbbell Overhead Extension', muscle:'Triceps', eq:'Dumbbell' },
  { name:'Assisted Dip (Triceps)', muscle:'Triceps', eq:'Machine' },
  { name:'Back Squat', muscle:'Quads', eq:'Barbell' },
  { name:'Front Squat', muscle:'Quads', eq:'Barbell' },
  { name:'Hack Squat', muscle:'Quads', eq:'Machine' },
  { name:'Leg Press', muscle:'Quads', eq:'Machine' },
  { name:'Bulgarian Split Squat', muscle:'Quads', eq:'Dumbbell' },
  { name:'Leg Extension', muscle:'Quads', eq:'Machine' },
  { name:'Walking Lunge', muscle:'Quads', eq:'Dumbbell' },
  { name:'Romanian Deadlift', muscle:'Hamstrings', eq:'Barbell' },
  { name:'Stiff-Leg Deadlift', muscle:'Hamstrings', eq:'Barbell' },
  { name:'Lying Leg Curl', muscle:'Hamstrings', eq:'Machine' },
  { name:'Seated Leg Curl', muscle:'Hamstrings', eq:'Machine' },
  { name:'Nordic Curl', muscle:'Hamstrings', eq:'Bodyweight' },
  { name:'Good Morning', muscle:'Hamstrings', eq:'Barbell' },
  { name:'Barbell Hip Thrust', muscle:'Glutes', eq:'Barbell' },
  { name:'Glute Bridge', muscle:'Glutes', eq:'Barbell' },
  { name:'Cable Kickback', muscle:'Glutes', eq:'Cable' },
  { name:'Sumo Deadlift', muscle:'Glutes', eq:'Barbell' },
  { name:'Machine Hip Abduction', muscle:'Glutes', eq:'Machine' },
  { name:'Standing Calf Raise', muscle:'Calves', eq:'Machine' },
  { name:'Seated Calf Raise', muscle:'Calves', eq:'Machine' },
  { name:'Leg Press Calf Raise', muscle:'Calves', eq:'Machine' },
  { name:'Cable Crunch', muscle:'Abs', eq:'Cable' },
  { name:'Hanging Leg Raise', muscle:'Abs', eq:'Bodyweight' },
  { name:'Ab Wheel Rollout', muscle:'Abs', eq:'Bodyweight' },
  { name:'Machine Crunch', muscle:'Abs', eq:'Machine' },
  { name:'Plank', muscle:'Abs', eq:'Bodyweight' },
];

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

const MAX_SETS_PER_EX = 6;
const DELOAD_RIR = 4;

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

const RIR_RAMPS = [
  { id: '3-0', label: '3 → 0 RIR (standard)', start: 3, end: 0 },
  { id: '2-0', label: '2 → 0 RIR (aggressive)', start: 2, end: 0 },
  { id: '3-1', label: '3 → 1 RIR (conservative)', start: 3, end: 1 },
];

/* training-group identity (maps onto iOS system tints in CSS) */
const MGROUP = {
  Chest:'push', Shoulders:'push', Triceps:'push',
  Back:'pull', Biceps:'pull',
  Quads:'legs', Hamstrings:'legs', Glutes:'legs', Calves:'legs',
  Abs:'core',
};
const GROUP_LABEL = { push:'Push', pull:'Pull', legs:'Legs', core:'Core' };
const gOf = (m) => MGROUP[m] || 'push';
const gCls = (m) => 'g-' + gOf(m);
const dayGroups = (day) => [...new Set(day.slots.map(s => gOf(s.muscle)))];

/* weekday scheduling (Mon = 0 … Sun = 6) */
const WD_ABBR = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const WD_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DEFAULT_WD = { 3:[0,2,4], 4:[0,1,3,4], 5:[0,1,2,3,4], 6:[0,1,2,3,4,5] };
const todayWd = () => (new Date().getDay() + 6) % 7;
/* migrate mesos created before weekday scheduling existed */
function ensureWeekdays(meso) {
  if (meso.days.every(d => Number.isInteger(d.weekday))) return;
  const defs = DEFAULT_WD[meso.days.length] || meso.days.map((_, i) => i % 7);
  meso.days.forEach((d, i) => { d.weekday = defs[i] ?? i % 7; });
  saveMeso(meso);
}

/* ============================ SF-style glyphs ============================ */
const I = {
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/></svg>',
  check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l4.8 4.8L19.5 7"/></svg>',
  chev:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  chevL:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  swap:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
  plus:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  play:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.7v12.6a1 1 0 0 0 1.52.86l10.3-6.3a1 1 0 0 0 0-1.72L9.52 4.84A1 1 0 0 0 8 5.7z"/></svg>',
  chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h16"/><path d="M6.5 16.5V10M11 16.5V5M15.5 16.5v-5M20 16.5V8" transform="translate(-1.5 0)"/></svg>',
  flame:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1 .4-2 1-2.8C8 10 9 12 10 12c1.5 0 1-2.5.5-4C10 6 12 3.5 12 2z"/></svg>',
  book:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z"/></svg>',
  cal:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M8 2.5v3.5M16 2.5v3.5M3.5 9.5h17"/></svg>',
  lock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="11" width="13" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>',
  grip:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 9h14M5 15h14"/></svg>',
};
const icon = (name, cls='') => `<span class="${cls}" aria-hidden="true" style="display:inline-flex">${I[name] || ''}</span>`;
const tile = (m, extra='') => `<span class="tile ${gCls(m)} ${extra}">${I.dumbbell}</span>`;
const chev = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`;

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

const S = {
  exercises: [],
  mesos: [],
  workouts: [],
  settings: { units:'lb', theme:'auto' },
  tab: 'train',
  trainView: 'list',   // 'list' | 'week' (calendar)
  activeWorkoutId: null,
  planWeek: null,
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

function accumWeeks(meso) { return meso.weeks - 1; }

function targetRIR(meso, week) {
  const acc = accumWeeks(meso);
  const start = meso.rirStart ?? 3, end = meso.rirEnd ?? 0;
  if (week >= meso.weeks) return DELOAD_RIR;
  if (acc <= 1) return end;
  const r = Math.round(start - ((start - end) * (week - 1)) / (acc - 1));
  return Math.max(end, Math.min(start, r));
}

function isDeload(meso, week) { return week === meso.weeks; }

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

/* ============================ progression engine ============================ */
function setDeltaFromFeedback(fb) {
  if (!fb) return 1;
  const { soreness, pump, workload, joints = 0 } = fb;
  if (joints === 2) return -1;
  if (soreness === 2 || workload === 3) return -1;
  const ease = workload <= 1 ? 1 : 0;
  const stimulus = (2 - pump) + ease;
  if (joints === 1) return 0;
  if (stimulus >= 3) return 2;
  if (stimulus >= 2) return 1;
  if (soreness === 1 && workload === 2) return 0;
  return 1;
}

function weekOneSetsForMuscle(meso, muscle) {
  const slotCount = meso.days.reduce((a, d) => a + d.slots.filter(s => s.muscle === muscle).length, 0) || 1;
  const lm = VOLUME_LANDMARKS[muscle] || { mev: 6 };
  return Math.max(2, Math.min(4, Math.round(lm.mev / slotCount)));
}

function buildWeekOne(meso) {
  meso.days.forEach((day, di) => {
    const w = {
      id: uid(), mesoId: meso.id, week: 1, dayIndex: di, date: null, status: 'pending',
      entries: day.slots.map(s => ({
        exerciseId: s.exerciseId, muscle: s.muscle,
        targetSets: weekOneSetsForMuscle(meso, s.muscle), targetRIR: targetRIR(meso, 1),
        sets: [],
      })),
      feedback: {},
    };
    S.workouts.push(w);
    saveWorkout(w);
  });
}

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

function scheduleNextWeek(meso, finished) {
  const nextWeek = finished.week + 1;
  if (nextWeek > meso.weeks) return;
  if (getWorkout(meso, nextWeek, finished.dayIndex)) return;
  const deload = isDeload(meso, nextWeek);
  const rir = targetRIR(meso, nextWeek);

  const entries = finished.entries.map(en => {
    let delta = deload ? 0 : setDeltaFromFeedback(finished.feedback[en.muscle]);
    const doneSets = en.sets.filter(s => s.done && s.reps > 0);
    const base = Math.max(doneSets.length || en.targetSets, 1);
    if (delta > 0) {
      const lm = VOLUME_LANDMARKS[en.muscle];
      if (lm) {
        const thisWeekTotal = weeklyMuscleTotal(meso, finished.week, en.muscle);
        delta = Math.min(delta, Math.max(0, lm.mrv - thisWeekTotal));
      }
    }
    let sets = deload ? Math.max(1, Math.ceil(base / 2))
                      : Math.min(MAX_SETS_PER_EX, Math.max(1, base + delta));
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
    out.push({ label: isDeload(meso, wk) ? 'DL' : 'W' + wk, value: n });
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

/* ============================ nav / router ============================ */
const TAB_TITLE = { train: 'Training', plan: 'Plan', library: 'Library', progress: 'Progress' };

function setNav(title, { back = null } = {}) {
  $('#nav-title').textContent = title;
  const left = $('#nav-left');
  if (back) {
    left.innerHTML = `<button class="nav-btn" id="btn-nav-back">${icon('chevL')}${esc(back.label)}</button>`;
    $('#btn-nav-back').onclick = back.onTap;
  } else {
    left.innerHTML = '';
  }
}

function switchTab(tab) {
  S.tab = tab;
  if (tab !== 'workout') Rest.stop();
  $$('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === (tab === 'workout' ? 'train' : tab)));
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-' + tab).classList.add('active');
  window.scrollTo(0, 0);
  render();
}

function render() {
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

/* large title + optional subtitle */
const largeTitle = (t, sub) => `<h1 class="large-title">${esc(t)}</h1>${sub ? `<div class="subtitle-line">${sub}</div>` : ''}`;

/* ============================ sheet helper ============================ */
function openSheet(html) {
  $('#modal-body').innerHTML = '<div class="drag"></div>' + html;
  $('#modal-scrim').classList.add('open');
}
function closeSheet() { $('#modal-scrim').classList.remove('open'); }
const sheetHead = (title, doneLabel = 'Done') => `
  <div class="sheet-head">
    <span class="side"></span>
    <h2>${esc(title)}</h2>
    <span class="side right"><button class="btn-plain" data-sheet-done>${esc(doneLabel)}</button></span>
  </div>`;

/* ============================ TRAIN ============================ */
function renderTrain() {
  const el = $('#view-train');
  const meso = activeMeso();
  setNav('Training');

  if (!meso) {
    el.innerHTML = `
      ${largeTitle('Training')}
      <div class="empty-wrap">
        <div class="sym">${I.dumbbell}</div>
        <h2>No Active Mesocycle</h2>
        <p>Create a training block and MesoForge will run your week-to-week sets, effort and deloads automatically.</p>
      </div>
      <div class="group"><button class="btn-filled" id="btn-new-meso-empty">${icon('plus')} New Mesocycle</button></div>`;
    $('#btn-new-meso-empty').onclick = () => { switchTab('plan'); openWizard(); };
    return;
  }

  ensureWeekdays(meso);
  const cw = currentWeek(meso);
  const viewWeek = S.planWeek || cw;
  const rir = targetRIR(meso, viewWeek);
  const deload = isDeload(meso, viewWeek);
  const doneCount = mesoWorkouts(meso.id).filter(w => w.status === 'done').length;
  const totalCount = meso.weeks * meso.days.length;

  // next pending session in current week
  let nextDay = null;
  for (let di = 0; di < meso.days.length; di++) {
    const w = getWorkout(meso, cw, di);
    if (w && w.status !== 'done') { nextDay = { w, di, name: meso.days[di].name }; break; }
  }

  const weekSeg = Array.from({ length: meso.weeks }, (_, i) => {
    const wk = i + 1;
    return `<button class="${wk === viewWeek ? 'active' : ''}" data-week="${wk}">${isDeload(meso, wk) ? 'DL' : 'W' + wk}</button>`;
  }).join('');

  const nextPendingIdx = meso.days.findIndex((_, di) => { const w = getWorkout(meso, viewWeek, di); return w && w.status !== 'done'; });
  const dayRows = meso.days.map((day, di) => {
    const w = getWorkout(meso, viewWeek, di);
    const done = w && w.status === 'done';
    const ready = !!w;
    const isNext = ready && !done && viewWeek === cw && di === nextPendingIdx;
    const totalSets = w ? w.entries.reduce((a, e) => a + (done ? e.sets.filter(s => s.done).length : e.targetSets), 0) : 0;
    const g = dayGroups(day)[0] || 'push';
    const detail = !ready ? '' : done ? (w.date || 'Done') : isNext ? 'Up Next' : 'Ready';
    return `
      <button class="row has-tile" data-day="${di}" ${!ready ? 'disabled style="opacity:.45"' : ''}>
        <span class="tile g-${g}">${done ? I.check : ready ? I.dumbbell : I.lock}</span>
        <span class="r-main">
          <span class="r-title">${esc(day.name)}</span>
          <span class="r-sub" style="display:block">${ready ? totalSets + ' sets · ' + dayGroups(day).map(x => GROUP_LABEL[x]).join(' + ') : 'Unlocks after last week’s session'}</span>
        </span>
        <span class="r-detail ${isNext ? 'tint' : ''}">${detail}</span>
        ${ready ? chev : ''}
      </button>`;
  }).join('');

  const planMuscles = MUSCLES.filter(m => meso.days.some(d => d.slots.some(s => s.muscle === m)));
  const volLines = planMuscles.map(m => {
    const lm = VOLUME_LANDMARKS[m] || { mev: 6, mrv: 18 };
    const sets = weeklyMuscleTotal(meso, cw, m);
    const scaleMax = Math.max(lm.mrv * 1.15, sets, 1);
    const st = sets < lm.mev ? 'under' : sets > lm.mrv ? 'over' : 'optimal';
    const zL = 100 * lm.mev / scaleMax, zR = 100 * lm.mrv / scaleMax;
    return `
      <div class="vol-line ${gCls(m)}">
        ${tile(m)}
        <span class="vm">${esc(m)}</span>
        <span class="vtrack"><span class="vzone" style="left:${zL}%;width:${zR - zL}%"></span><span class="vfill ${st}" style="width:${Math.min(100, 100 * sets / scaleMax)}%"></span></span>
        <span class="vv num">${sets}</span>
      </div>`;
  }).join('');

  el.innerHTML = `
    ${largeTitle('Training', `${esc(meso.name)} · ${deload ? 'Deload' : 'Week ' + viewWeek} of ${meso.weeks} · ${rir === DELOAD_RIR ? rir + '+' : rir} RIR target`)}

    ${nextDay ? `
    <div class="group" style="margin-top:14px">
      <div class="list">
        <div class="row has-tile" style="padding-top:14px;padding-bottom:6px">
          <span class="tile lg g-${dayGroups(meso.days[nextDay.di])[0]}">${I.dumbbell}</span>
          <span class="r-main">
            <span class="r-title" style="font-weight:600">${esc(nextDay.name)}</span>
            <span class="r-sub" style="display:block">${nextDay.w.entries.reduce((a,e)=>a+e.targetSets,0)} sets · ${dayGroups(meso.days[nextDay.di]).map(x=>GROUP_LABEL[x]).join(' + ')}</span>
          </span>
        </div>
        <div style="padding: 6px 16px 8px">
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(100*doneCount/totalCount)}%"></div></div>
          <div style="font-size:13px;color:var(--label-2);margin-top:6px">${doneCount} of ${totalCount} sessions complete</div>
        </div>
        <button class="row action bold" id="btn-hero-start"><span class="r-title">${nextDay.w.entries.some(e => e.sets.length) ? 'Resume Session' : 'Start Session'}</span></button>
      </div>
    </div>` : ''}

    <div class="group">
      <div class="group-header">Week</div>
      <div class="seg" id="seg-week">${weekSeg}</div>
    </div>

    <div class="group">
      <div class="group-header" style="display:flex;justify-content:space-between;align-items:center">
        <span>Schedule</span>
        <span class="seg" id="seg-view" style="width:150px;text-transform:none;letter-spacing:0">
          <button data-view="list" class="${S.trainView === 'list' ? 'active' : ''}">List</button>
          <button data-view="week" class="${S.trainView === 'week' ? 'active' : ''}">Week</button>
        </span>
      </div>
      ${S.trainView === 'week' ? `<div class="list" id="cal-list">${calRows(meso, viewWeek, cw)}</div>` : `<div class="list">${dayRows}</div>`}
      ${S.trainView === 'week' ? '<div class="group-footer">Tap a workout to open it. Drag the handle to move it to another day — dropping on an occupied day swaps them.</div>' : ''}
      ${deload ? '<div class="group-footer">Deload week — half volume, light loads, leave 4+ reps in reserve.</div>' : ''}
    </div>

    <div class="group">
      <div class="group-header">This Week’s Volume</div>
      <div class="list">${volLines}</div>
      <div class="group-footer">Working sets vs. each muscle’s recoverable range. Shaded area = effective zone (MEV–MRV).</div>
    </div>`;

  if (nextDay) $('#btn-hero-start').onclick = () => { S.activeWorkoutId = nextDay.w.id; switchTab('workout'); };
  $$('#seg-week button', el).forEach(b => b.onclick = () => { S.planWeek = +b.dataset.week; renderTrain(); });
  $$('#seg-view button', el).forEach(b => b.onclick = () => { S.trainView = b.dataset.view; renderTrain(); });
  $$('[data-day]', el).forEach(b => b.onclick = () => {
    const w = getWorkout(meso, viewWeek, +b.dataset.day);
    if (!w) return;
    S.activeWorkoutId = w.id;
    switchTab('workout');
  });
  if (S.trainView === 'week') wireCalendar(el, meso, viewWeek);
}

/* --- calendar week view --- */
function calRows(meso, viewWeek, cw) {
  return Array.from({ length: 7 }, (_, wd) => {
    const di = meso.days.findIndex(d => d.weekday === wd);
    const day = di >= 0 ? meso.days[di] : null;
    let inner;
    if (!day) {
      inner = '<div class="cal-rest">Rest</div>';
    } else {
      const w = getWorkout(meso, viewWeek, di);
      const done = w && w.status === 'done';
      const ready = !!w;
      const names = day.slots.map(s => exById(s.exerciseId)?.name).filter(Boolean);
      const summary = names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
      const totalSets = w ? w.entries.reduce((a, e) => a + (done ? e.sets.filter(s => s.done).length : e.targetSets), 0) : 0;
      const g = dayGroups(day)[0] || 'push';
      const st = done ? '<span class="st done">✓ Done</span>' : !ready ? '' : '<span class="st">' + totalSets + ' sets</span>';
      inner = `
        <div class="cal-card" data-di="${di}" role="button" tabindex="0">
          <span class="tile g-${g}">${done ? I.check : I.dumbbell}</span>
          <span class="cc-main">
            <span class="cc-title">${esc(day.name)} ${st}</span>
            <span class="cc-sub" style="display:block">${esc(summary)}</span>
          </span>
          <span class="grip" data-grip aria-label="Drag to move day">${I.grip}</span>
        </div>`;
    }
    return `
      <div class="cal-row" data-wd="${wd}">
        <div class="cal-day ${wd === todayWd() ? 'today' : ''}"><div class="wd">${WD_ABBR[wd]}</div></div>
        ${inner}
      </div>`;
  }).join('');
}

function wireCalendar(el, meso, viewWeek) {
  // tap to open
  $$('.cal-card', el).forEach(card => card.addEventListener('click', (e) => {
    if (e.target.closest('[data-grip]')) return;
    const w = getWorkout(meso, viewWeek, +card.dataset.di);
    if (!w) return;
    S.activeWorkoutId = w.id;
    switchTab('workout');
  }));

  // pointer-based drag & drop (touch + mouse)
  let drag = null;
  const rowUnder = (x, y) => document.elementsFromPoint(x, y).find(n => n.classList && n.classList.contains('cal-row'));
  $$('[data-grip]', el).forEach(grip => {
    const card = grip.closest('.cal-card');
    const di = +card.dataset.di;

    grip.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true);
      ghost.classList.add('cal-ghost');
      ghost.style.width = rect.width + 'px';
      ghost.style.left = rect.left + 'px';
      ghost.style.top = rect.top + 'px';
      document.body.appendChild(ghost);
      card.classList.add('cal-src');
      drag = { ghost, offX: ev.clientX - rect.left, offY: ev.clientY - rect.top };
      grip.setPointerCapture(ev.pointerId);
      haptic(8);
    });

    grip.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      drag.ghost.style.left = (ev.clientX - drag.offX) + 'px';
      drag.ghost.style.top = (ev.clientY - drag.offY) + 'px';
      const r = rowUnder(ev.clientX, ev.clientY);
      $$('.cal-row', el).forEach(x => x.classList.toggle('drop', x === r && +x.dataset.wd !== meso.days[di].weekday));
    });

    const finish = (ev, commit) => {
      if (!drag) return;
      const r = commit ? rowUnder(ev.clientX, ev.clientY) : null;
      drag.ghost.remove();
      card.classList.remove('cal-src');
      $$('.cal-row', el).forEach(x => x.classList.remove('drop'));
      drag = null;
      if (r) {
        const wd = +r.dataset.wd;
        const from = meso.days[di].weekday;
        if (wd !== from) {
          const other = meso.days.findIndex(d => d.weekday === wd);
          meso.days[di].weekday = wd;
          if (other >= 0) meso.days[other].weekday = from;   // swap occupied days
          saveMeso(meso);
          haptic([8, 30, 8]);
          toast(other >= 0 ? 'Days swapped' : `Moved to ${WD_FULL[wd]}`);
        }
      }
      renderTrain();
    };
    grip.addEventListener('pointerup', (ev) => finish(ev, true));
    grip.addEventListener('pointercancel', (ev) => finish(ev, false));
  });
}

/* ============================ WORKOUT ============================ */
function renderWorkout() {
  const el = $('#view-workout');
  const w = S.workouts.find(x => x.id === S.activeWorkoutId);
  if (!w) { switchTab('train'); return; }
  const meso = S.mesos.find(m => m.id === w.mesoId);
  const day = meso.days[w.dayIndex];
  const readonly = w.status === 'done';
  const deload = isDeload(meso, w.week);
  const u = S.settings.units;

  setNav(day.name, { back: { label: 'Training', onTap: () => switchTab('train') } });

  let doneSets = 0, targetTotal = 0;
  w.entries.forEach(en => {
    targetTotal += Math.max(en.targetSets, en.sets.length);
    doneSets += en.sets.filter(s => s.done).length;
  });

  const blocks = w.entries.map((en, ei) => {
    const ex = exById(en.exerciseId);
    const rows = Array.from({ length: Math.max(en.targetSets, en.sets.length) }, (_, si) => {
      const s = en.sets[si] || {};
      const sug = en.suggest && (s.weight == null) ? ` placeholder="${en.suggest.weight}"` : '';
      const sugR = en.suggest && (s.reps == null) ? ` placeholder="${en.suggest.reps}"` : '';
      return `
        <div class="set-line">
          <span class="sn num">${si + 1}</span>
          <input type="number" inputmode="decimal" step="any" min="0" data-w="${ei}:${si}" value="${s.weight ?? ''}"${sug} ${readonly ? 'disabled' : ''} aria-label="weight">
          <input type="number" inputmode="numeric" min="0" data-r="${ei}:${si}" value="${s.reps ?? ''}"${sugR} ${readonly ? 'disabled' : ''} aria-label="reps">
          <span class="rir num">${en.targetRIR}${deload ? '+' : ''}</span>
          <button class="check ${s.done ? 'on' : ''}" data-d="${ei}:${si}" ${readonly ? 'disabled' : ''} aria-label="mark set done">${I.check}</button>
        </div>`;
    }).join('');

    return `
      <div class="group">
        <div class="list">
          <div class="ex-header ${gCls(en.muscle)}">
            ${tile(en.muscle)}
            <span class="r-title">${esc(ex ? ex.name : 'Unknown')}</span>
            <span class="g-label">${esc(en.muscle)}</span>
            ${readonly ? '' : `<button class="btn-gray" data-swap="${ei}" aria-label="Swap exercise">Swap</button>`}
          </div>
          <div class="sets-header"><div>Set</div><div>${u === 'kg' ? 'kg' : 'lb'}</div><div>Reps</div><div>RIR</div><div></div></div>
          ${rows}
          ${readonly ? '' : `<button class="row action" data-addset="${ei}"><span class="r-title">Add Set</span></button>`}
        </div>
        ${en.suggest ? `<div class="group-footer">Last time: ${en.suggest.weight} ${u} × ${en.suggest.reps}</div>` : ''}
      </div>`;
  }).join('');

  el.innerHTML = `
    ${largeTitle(day.name, `${deload ? 'Deload' : 'Week ' + w.week} · ${readonly ? 'Completed' + (w.date ? ' ' + w.date : '') : `<span class="num" id="wk-count">${doneSets}</span>/<span class="num">${targetTotal}</span> sets`}`)}
    ${readonly ? '' : `<div style="padding:2px 16px 14px"><div class="bar-track"><div class="bar-fill" id="wk-bar" style="width:${targetTotal ? Math.round(100*doneSets/targetTotal) : 0}%"></div></div></div>`}
    ${blocks}
    ${readonly ? '' : `<div class="group"><button class="btn-filled" id="btn-finish">${icon('check')} Finish Workout</button></div>`}`;

  if (readonly) return;

  const saveField = (attr, key) => (inp) => {
    const [ei, si] = inp.dataset[attr].split(':').map(Number);
    inp.addEventListener('input', () => {
      const en = w.entries[ei];
      while (en.sets.length <= si) en.sets.push({ weight: null, reps: null, done: false });
      en.sets[si][key] = inp.value === '' ? null : +inp.value;
      saveWorkout(w);
    });
  };
  $$('[data-w]', el).forEach(saveField('w', 'weight'));
  $$('[data-r]', el).forEach(saveField('r', 'reps'));

  const updateProgress = () => {
    let d = 0, t = 0;
    w.entries.forEach(en => { t += Math.max(en.targetSets, en.sets.length); d += en.sets.filter(x => x.done).length; });
    const bar = $('#wk-bar'); if (bar) bar.style.width = (t ? Math.round(100 * d / t) : 0) + '%';
    const c = $('#wk-count'); if (c) c.textContent = d;
  };

  $$('[data-d]', el).forEach(btn => btn.onclick = () => {
    const [ei, si] = btn.dataset.d.split(':').map(Number);
    const en = w.entries[ei];
    while (en.sets.length <= si) en.sets.push({ weight: null, reps: null, done: false });
    const s = en.sets[si];
    const nowDone = !s.done;
    if (nowDone && s.weight == null && en.suggest) s.weight = en.suggest.weight;
    if (nowDone && s.reps == null && en.suggest) s.reps = en.suggest.reps;
    s.done = nowDone;
    saveWorkout(w);

    const wInp = $(`[data-w="${ei}:${si}"]`, el), rInp = $(`[data-r="${ei}:${si}"]`, el);
    if (wInp && s.weight != null) wInp.value = s.weight;
    if (rInp && s.reps != null) rInp.value = s.reps;
    btn.classList.toggle('on', nowDone);
    if (nowDone) {
      btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      haptic(9);
      Rest.start();
    }
    updateProgress();
  });

  $$('[data-addset]', el).forEach(btn => btn.onclick = () => {
    const en = w.entries[+btn.dataset.addset];
    en.targetSets = Math.max(en.targetSets + 1, en.sets.length + 1);
    saveWorkout(w);
    renderWorkout();
  });

  $$('[data-swap]', el).forEach(btn => btn.onclick = () => openSwapSheet(w, +btn.dataset.swap));

  $('#btn-finish').onclick = () => openFeedbackSheet(meso, w);
}

function openSwapSheet(w, ei) {
  const en = w.entries[ei];
  const options = S.exercises.filter(e => e.muscle === en.muscle)
    .map(e => `
      <button class="row has-tile" data-pick="${e.id}">
        ${tile(e.muscle)}
        <span class="r-main"><span class="r-title">${esc(e.name)}</span><span class="r-sub" style="display:block">${esc(e.eq)}</span></span>
        ${e.id === en.exerciseId ? `<span style="color:var(--blue);display:inline-flex;width:22px">${I.check}</span>` : ''}
      </button>`).join('');
  openSheet(`
    ${sheetHead('Swap Exercise', 'Cancel')}
    <div class="group">
      <div class="list">${options}</div>
      <div class="group-footer">Applies to this session and all future weeks.</div>
    </div>`);
  $('[data-sheet-done]').onclick = closeSheet;
  $$('[data-pick]').forEach(d => d.onclick = () => {
    const newId = d.dataset.pick;
    en.exerciseId = newId; en.suggest = null;
    saveWorkout(w);
    const meso = S.mesos.find(m => m.id === w.mesoId);
    const slot = meso.days[w.dayIndex].slots[ei];
    if (slot) { slot.exerciseId = newId; saveMeso(meso); }
    S.workouts.filter(x => x.mesoId === w.mesoId && x.dayIndex === w.dayIndex && x.week > w.week && x.status === 'pending')
      .forEach(x => { if (x.entries[ei]) { x.entries[ei].exerciseId = newId; x.entries[ei].suggest = null; saveWorkout(x); } });
    closeSheet(); renderWorkout();
  });
}

/* ============================ feedback + finish ============================ */
function openFeedbackSheet(meso, w) {
  const muscles = [...new Set(w.entries.map(e => e.muscle))];
  const deload = isDeload(meso, w.week);
  const seg4 = (m, k, opts) => `
    <div style="padding:8px 16px 12px">
      <div style="font-size:13px;color:var(--label-2);margin-bottom:6px">${opts.label}</div>
      <div class="seg" data-fb="${m}:${k}">${opts.items.map((t, i) => `<button data-v="${i}">${t}</button>`).join('')}</div>
    </div>`;

  const fbSection = deload
    ? '<div class="group"><div class="group-footer" style="padding-top:0">Deload week — no feedback needed. Enjoy the recovery.</div></div>'
    : muscles.map(m => `
      <div class="group">
        <div class="group-header">${esc(m)}</div>
        <div class="list ${gCls(m)}">
          ${seg4(m, 'soreness', { label: 'Soreness coming in', items: ['Healed early','Just in time','Still sore'] })}
          ${seg4(m, 'pump',     { label: 'Pump',               items: ['Low','Decent','Great'] })}
          ${seg4(m, 'workload', { label: 'Workload',           items: ['Easy','Manageable','Pushed','Too much'] })}
          ${seg4(m, 'joints',   { label: 'Joints',             items: ['Fresh','Achy','Painful'] })}
        </div>
      </div>`).join('');

  openSheet(`
    ${sheetHead('Finish Workout', 'Cancel')}
    ${deload ? '' : '<div class="group"><div class="group-footer" style="padding-top:0">Rate each muscle — this sets next week’s targets.</div></div>'}
    ${fbSection}
    <div class="group"><button class="btn-filled" id="btn-confirm-finish">Save &amp; Finish</button></div>`);

  $('[data-sheet-done]').onclick = closeSheet;

  const fb = {};
  muscles.forEach(m => { if (!deload) fb[m] = { soreness: 1, pump: 1, workload: 1, joints: 0 }; });
  $$('.seg[data-fb]').forEach(seg => {
    const [m, k] = seg.dataset.fb.split(':');
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
    w.entries.forEach(en => { en.sets = en.sets.filter(s => s.done && (s.reps || 0) > 0); });
    saveWorkout(w);
    scheduleNextWeek(meso, w);
    const doneAll = mesoWorkouts(meso.id).filter(x => x.status === 'done').length >= meso.weeks * meso.days.length;
    if (doneAll) { meso.status = 'done'; saveMeso(meso); }
    Rest.stop();
    closeSheet();
    S.planWeek = null;
    switchTab('train');
    celebrate(
      doneAll ? 'Mesocycle Complete' : 'Workout Complete',
      doneAll ? 'Outstanding block. Enjoy the recovery.' : 'Logged and progressed.'
    );
  };
}

/* ============================ PLAN + wizard ============================ */
function renderPlan() {
  const el = $('#view-plan');
  setNav('Plan');
  const list = S.mesos.slice().sort((a, b) => (b.created || '').localeCompare(a.created || ''));

  el.innerHTML = `
    ${largeTitle('Plan')}
    <div class="group" style="margin-top:14px">
      <div class="list"><button class="row action bold" id="btn-new-meso"><span class="r-title">New Mesocycle…</span></button></div>
    </div>
    ${list.length ? '' : `
      <div class="empty-wrap">
        <div class="sym">${I.cal}</div>
        <h2>No Mesocycles</h2>
        <p>A mesocycle is a multi-week training block with a built-in deload. Create one to start.</p>
      </div>`}
    ${list.map(m => {
      const done = mesoWorkouts(m.id).filter(w => w.status === 'done').length;
      const total = m.weeks * m.days.length;
      const status = m.status === 'active' ? '<span class="r-detail tint">Active</span>'
                   : m.status === 'done' ? '<span class="r-detail">Finished</span>'
                   : `<button class="btn-gray" data-activate="${m.id}">Activate</button>`;
      return `
      <div class="group">
        <div class="group-header">${esc(m.name)}</div>
        <div class="list">
          <div class="row">
            <span class="r-main">
              <span class="r-title">${m.days.length} days/week · ${m.weeks - 1} weeks + deload</span>
              <span class="r-sub" style="display:block">${m.days.map(d => esc(d.name)).join(' · ')}</span>
            </span>
            ${status}
          </div>
          <div style="padding:10px 16px 12px;position:relative">
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(100*done/total)}%"></div></div>
            <div style="font-size:13px;color:var(--label-2);margin-top:6px" class="num">${done} of ${total} sessions</div>
          </div>
          <button class="row action destructive" data-del-meso="${m.id}"><span class="r-title">Delete Mesocycle…</span></button>
        </div>
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
    openSheet(`
      ${sheetHead('Delete Mesocycle', 'Cancel')}
      <div class="group">
        <div class="group-footer" style="padding-top:0">“${esc(m.name)}” and all of its logged workouts will be permanently deleted. This cannot be undone.</div>
      </div>
      <div class="group"><div class="list"><button class="row action destructive bold" id="btn-do-del"><span class="r-title" style="font-weight:600">Delete Mesocycle</span></button></div></div>`);
    $('[data-sheet-done]').onclick = closeSheet;
    $('#btn-do-del').onclick = async () => {
      const removed = mesoWorkouts(m.id);
      S.mesos = S.mesos.filter(x => x.id !== m.id);
      await idb.del('mesos', m.id);
      for (const wk of removed) await idb.del('workouts', wk.id);
      S.workouts = S.workouts.filter(wk => wk.mesoId !== m.id);
      closeSheet(); render(); toast('Deleted');
    };
  });
}

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
  const dots = `<div class="wiz-dots">${[0,1,2].map(i => `<span class="${i <= WIZ.step ? 'on' : ''}"></span>`).join('')}</div>`;

  if (WIZ.step === 0) {
    openSheet(`
      ${sheetHead('Choose a Split', 'Cancel')}${dots}
      <div class="group">
        <div class="list">
          ${TEMPLATES.map(t => `
            <button class="row" data-tpl="${t.id}">
              <span class="r-main">
                <span class="r-title">${esc(t.name)}</span>
                <span class="r-sub" style="display:block">${esc(t.blurb)}</span>
              </span>
              <span class="r-detail">${t.days}d</span>
              ${chev}
            </button>`).join('')}
        </div>
      </div>`);
    $('[data-sheet-done]').onclick = closeSheet;
    $$('[data-tpl]').forEach(c => c.onclick = () => {
      WIZ.template = TEMPLATES.find(t => t.id === c.dataset.tpl);
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
    openSheet(`
      ${sheetHead('Block Details', 'Cancel')}${dots}
      <div class="group">
        <div class="list" style="padding:14px 16px">
          <label class="field">Name
            <input type="text" id="wiz-name" placeholder="e.g. Summer Block 1" value="${esc(WIZ.name)}">
          </label>
          <label class="field">Length
            <div class="seg" id="wiz-weeks">
              ${[4,5,6].map(n => `<button data-v="${n}" class="${WIZ.weeks === n ? 'active' : ''}">${n - 1} wk + DL</button>`).join('')}
            </div>
          </label>
          <label class="field" style="margin-bottom:2px">Effort ramp
            <select id="wiz-ramp">
              ${RIR_RAMPS.map(r => `<option value="${r.id}" ${WIZ.ramp === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="group-footer">Effort ramps across the block, then a light deload week. Volume starts near each muscle’s minimum effective dose and autoregulates from your feedback.</div>
      </div>
      <div class="group" style="display:flex;gap:10px">
        <button class="btn-gray" id="wiz-back" style="flex:1;min-height:50px;border-radius:12px">Back</button>
        <button class="btn-filled" id="wiz-next" style="flex:2">Next</button>
      </div>`);
    $('[data-sheet-done]').onclick = closeSheet;
    $$('#wiz-weeks button').forEach(b => b.onclick = () => {
      WIZ.weeks = +b.dataset.v;
      $$('#wiz-weeks button').forEach(x => x.classList.toggle('active', x === b));
    });
    $('#wiz-back').onclick = () => { WIZ.step = 0; renderWizard(); };
    $('#wiz-next').onclick = () => {
      WIZ.name = $('#wiz-name').value.trim() || WIZ.template.name + ' Block';
      WIZ.ramp = $('#wiz-ramp').value;
      WIZ.step = 2; renderWizard();
    };
    return;
  }

  const daysHtml = WIZ.template.plan.map((day, di) => `
    <div class="group">
      <div class="group-header">${esc(day.name)}</div>
      <div class="list" style="padding:6px 16px 12px">
        ${WIZ.slots[di].map((slot, si) => `
          <label class="field" style="margin-bottom:10px">${esc(slot.muscle)}
            <select data-slot="${di}:${si}">
              ${S.exercises.filter(e => e.muscle === slot.muscle).map(e => `<option value="${e.id}" ${e.id === slot.exerciseId ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}
            </select>
          </label>`).join('')}
      </div>
    </div>`).join('');

  openSheet(`
    ${sheetHead('Choose Exercises', 'Cancel')}${dots}
    <div class="group"><div class="group-footer" style="padding-top:0">Defaults are picked for you. You can also swap mid-block later.</div></div>
    ${daysHtml}
    <div class="group" style="display:flex;gap:10px">
      <button class="btn-gray" id="wiz-back" style="flex:1;min-height:50px;border-radius:12px">Back</button>
      <button class="btn-filled" id="wiz-create" style="flex:2">Create</button>
    </div>`);
  $('[data-sheet-done]').onclick = closeSheet;
  $$('[data-slot]').forEach(sel => sel.onchange = () => {
    const [di, si] = sel.dataset.slot.split(':').map(Number);
    WIZ.slots[di][si].exerciseId = sel.value;
  });
  $('#wiz-back').onclick = () => { WIZ.step = 1; renderWizard(); };
  $('#wiz-create').onclick = () => {
    S.mesos.forEach(m => { if (m.status === 'active') { m.status = 'paused'; saveMeso(m); } });
    const ramp = RIR_RAMPS.find(r => r.id === WIZ.ramp) || RIR_RAMPS[0];
    const defWd = DEFAULT_WD[WIZ.template.plan.length] || WIZ.template.plan.map((_, i) => i % 7);
    const meso = {
      id: uid(), name: WIZ.name, created: todayISO(), status: 'active',
      weeks: WIZ.weeks, rirStart: ramp.start, rirEnd: ramp.end,
      days: WIZ.template.plan.map((day, di) => ({ name: day.name, slots: WIZ.slots[di], weekday: defWd[di] ?? di % 7 })),
    };
    S.mesos.push(meso);
    saveMeso(meso);
    buildWeekOne(meso);
    S.planWeek = null;
    closeSheet();
    toast('Mesocycle created');
    switchTab('train');
  };
}

/* ============================ LIBRARY ============================ */
function renderLibrary() {
  const el = $('#view-library');
  setNav('Library');
  const filter = S.libFilter || 'All';
  const chips = ['All', ...MUSCLES].map(m => `<button class="chip ${m === 'All' ? '' : gCls(m)} ${m === filter ? 'active' : ''}" data-m="${m}">${m}</button>`).join('');
  const list = S.exercises
    .filter(e => filter === 'All' || e.muscle === filter)
    .sort((a, b) => a.muscle === b.muscle ? a.name.localeCompare(b.name) : MUSCLES.indexOf(a.muscle) - MUSCLES.indexOf(b.muscle));

  el.innerHTML = `
    ${largeTitle('Library')}
    <div class="chips" style="margin-top:8px">${chips}</div>
    <div class="group">
      <div class="list"><button class="row action" id="btn-add-ex"><span class="r-title">Add Exercise…</span></button></div>
    </div>
    <div class="group">
      <div class="list">
        ${list.map(e => `
          <div class="row has-tile">
            ${tile(e.muscle)}
            <span class="r-main">
              <span class="r-title">${esc(e.name)}</span>
              <span class="r-sub" style="display:block">${esc(e.muscle)} · ${esc(e.eq)}${e.custom ? ' · Custom' : ''}</span>
            </span>
            ${e.custom ? `<button class="btn-gray" style="color:var(--red)" data-del-ex="${e.id}">Remove</button>` : ''}
          </div>`).join('') || '<div class="row"><span class="r-main"><span class="r-title" style="color:var(--label-2)">Nothing here.</span></span></div>'}
      </div>
    </div>`;

  $$('.chip', el).forEach(c => c.onclick = () => { S.libFilter = c.dataset.m; renderLibrary(); });
  $('#btn-add-ex').onclick = () => {
    openSheet(`
      ${sheetHead('New Exercise', 'Cancel')}
      <div class="group">
        <div class="list" style="padding:14px 16px">
          <label class="field">Name<input type="text" id="ex-name" placeholder="e.g. Smith Machine Press"></label>
          <label class="field">Muscle group<select id="ex-muscle">${MUSCLES.map(m => `<option>${m}</option>`).join('')}</select></label>
          <label class="field" style="margin-bottom:2px">Equipment<select id="ex-eq">${['Barbell','Dumbbell','Machine','Cable','Bodyweight','Other'].map(q => `<option>${q}</option>`).join('')}</select></label>
        </div>
      </div>
      <div class="group"><button class="btn-filled" id="ex-save">Add Exercise</button></div>`);
    $('[data-sheet-done]').onclick = closeSheet;
    $('#ex-save').onclick = async () => {
      const name = $('#ex-name').value.trim();
      if (!name) { toast('Give it a name'); return; }
      const e = { id: uid(), name, muscle: $('#ex-muscle').value, eq: $('#ex-eq').value, custom: true };
      S.exercises.push(e);
      await idb.put('exercises', e);
      closeSheet(); renderLibrary(); toast('Added');
    };
  };
  $$('[data-del-ex]', el).forEach(b => b.onclick = async () => {
    const id = b.dataset.delEx;
    S.exercises = S.exercises.filter(e => e.id !== id);
    await idb.del('exercises', id);
    renderLibrary();
  });
}

/* ============================ PROGRESS ============================ */
function renderProgress() {
  const el = $('#view-progress');
  setNav('Progress');
  const meso = activeMeso() || S.mesos.slice().sort((a,b) => (b.created||'').localeCompare(a.created||''))[0];
  if (!meso) {
    el.innerHTML = `${largeTitle('Progress')}
      <div class="empty-wrap">
        <div class="sym">${I.chart}</div>
        <h2>No Data Yet</h2>
        <p>Charts and statistics appear once you have a mesocycle underway.</p>
      </div>`;
    return;
  }
  const loggedExIds = [...new Set(S.workouts.filter(w => w.status === 'done').flatMap(w => w.entries.map(e => e.exerciseId)))];
  if (!S.progressExercise || !loggedExIds.includes(S.progressExercise)) S.progressExercise = loggedExIds[0] || null;

  const doneCount = mesoWorkouts(meso.id).filter(w => w.status === 'done').length;
  const totalCount = meso.weeks * meso.days.length;
  const adherence = Math.round(100 * doneCount / totalCount);
  const tonSeries = weeklyTonnage(meso);
  const totalTon = tonSeries.reduce((a, d) => a + d.value, 0);
  const cw = currentWeek(meso);
  const weekSets = MUSCLES.reduce((a, m) => a + weeklyMuscleTotal(meso, cw, m), 0);
  let bestE = 0, bestExId = null;
  for (const w of S.workouts.filter(w => w.status === 'done')) {
    for (const en of w.entries) for (const s of en.sets) if (s.done) {
      const v = e1rm(s.weight || 0, s.reps || 0);
      if (v > bestE) { bestE = v; bestExId = en.exerciseId; }
    }
  }
  const bestExName = bestExId ? (exById(bestExId)?.name || '') : '';
  const u = S.settings.units;

  const planMuscles = MUSCLES.filter(m => meso.days.some(d => d.slots.some(s => s.muscle === m)));
  const volLines = planMuscles.map(m => {
    const lm = VOLUME_LANDMARKS[m] || { mev: 6, mrv: 18 };
    const sets = weeklyMuscleTotal(meso, cw, m);
    const scaleMax = Math.max(lm.mrv * 1.15, sets, 1);
    const st = sets < lm.mev ? 'under' : sets > lm.mrv ? 'over' : 'optimal';
    const zL = 100 * lm.mev / scaleMax, zR = 100 * lm.mrv / scaleMax;
    return `
      <div class="vol-line ${gCls(m)}">
        ${tile(m)}
        <span class="vm">${esc(m)}</span>
        <span class="vtrack"><span class="vzone" style="left:${zL}%;width:${zR - zL}%"></span><span class="vfill ${st}" style="width:${Math.min(100, 100 * sets / scaleMax)}%"></span></span>
        <span class="vv num">${sets}</span>
      </div>`;
  }).join('');

  const muscleChips = MUSCLES.map(m => `<button class="chip ${gCls(m)} ${m === S.progressMuscle ? 'active' : ''}" data-pm="${m}">${m}</button>`).join('');
  const setsData = weeklySetsForMuscle(meso, S.progressMuscle);
  const trendData = S.progressExercise ? e1rmTrend(S.progressExercise) : [];
  const exOptions = loggedExIds.map(id => { const e = exById(id); return e ? `<option value="${id}" ${id === S.progressExercise ? 'selected' : ''}>${esc(e.name)}</option>` : ''; }).join('');

  el.innerHTML = `
    ${largeTitle('Progress', esc(meso.name))}

    <div class="stat-grid" style="margin-top:12px">
      <div class="stat-cell"><div class="l">Adherence</div><div class="v num">${adherence}<small>%</small></div></div>
      <div class="stat-cell"><div class="l">Volume Lifted</div><div class="v num">${fmtK(totalTon)}<small> ${u}</small></div></div>
      <div class="stat-cell"><div class="l">Best e1RM</div><div class="v num">${bestE ? round1(bestE) : '—'}<small>${bestE ? ' ' + u : ''}</small></div></div>
      <div class="stat-cell"><div class="l">Sets · Wk ${cw}</div><div class="v num">${weekSets}</div></div>
    </div>

    <div class="group">
      <div class="group-header">Weekly Volume by Muscle</div>
      <div class="list">${volLines}</div>
      <div class="group-footer">Week ${cw} working sets vs. recoverable range. Orange = below MEV, red = above MRV.</div>
    </div>

    <div class="group">
      <div class="group-header">Set Progression</div>
      <div class="list">
        <div class="chips" style="padding:12px 16px 6px">${muscleChips}</div>
        <div id="chart-sets"></div>
      </div>
      <div class="group-footer">Completed weeks show logged sets; upcoming weeks show targets. Shaded band = MEV–MRV.</div>
    </div>

    <div class="cols-2" style="margin:0">
      <div class="group">
        <div class="group-header">Weekly Tonnage (${u})</div>
        <div class="list"><div id="chart-tonnage"></div></div>
      </div>

      <div class="group">
        <div class="group-header">Estimated 1RM</div>
        <div class="list">
          ${loggedExIds.length
            ? `<div style="padding:12px 16px 4px"><select id="sel-ex">${exOptions}</select></div><div id="chart-e1rm"></div>`
            : '<div class="row"><span class="r-main"><span class="r-title" style="color:var(--label-2)">Log workouts to see strength trends.</span></span></div>'}
        </div>
      </div>
    </div>`;

  $$('[data-pm]', el).forEach(c => c.onclick = () => { S.progressMuscle = c.dataset.pm; renderProgress(); });
  const sel = $('#sel-ex');
  if (sel) sel.onchange = () => { S.progressExercise = sel.value; renderProgress(); };

  const lm = VOLUME_LANDMARKS[S.progressMuscle];
  const groupTint = getComputedStyle(document.documentElement).getPropertyValue(
    { push: '--blue', pull: '--purple', legs: '--teal', core: '--pink' }[gOf(S.progressMuscle)]).trim() || '#007aff';
  barChart($('#chart-sets'), setsData, {
    unit: 'sets',
    zone: lm ? { min: lm.mev, max: lm.mrv } : null,
    color: groupTint,
  });
  barChart($('#chart-tonnage'), weeklyTonnage(meso), { unit: u });
  if (trendData.length) lineChart($('#chart-e1rm'), trendData, { unit: u });
  else if (loggedExIds.length) $('#chart-e1rm').innerHTML = '<div class="group-footer" style="padding:0 16px 12px">No completed sets for this exercise yet.</div>';
}

/* ============================ charts ============================ */
const CHART_H = 180, PAD = { t: 16, r: 12, b: 26, l: 36 };

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

function barChart(root, data, { unit, zone, color = 'var(--blue)' } = {}) {
  if (!root) return;
  root.classList.add('viz-root');
  const width = Math.max(root.clientWidth || 320, 280);
  const zoneMax = zone ? zone.max : 0;
  const maxV = niceMax(Math.max(...data.map(d => d.value), zoneMax, 1));
  const { innerW, gy, grid } = chartFrame(width, maxV);
  const n = data.length;
  const slot = innerW / n;
  const bw = Math.min(26, slot * 0.5);

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
      ? `<path class="bar" style="animation-delay:${i * 40}ms" d="M${x},${y0} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + bw - r},${y} Q${x + bw},${y} ${x + bw},${y + r} L${x + bw},${y0} Z" fill="${color}"/>`
      : '';
    bars += `<text class="axis-label" x="${x + bw / 2}" y="${CHART_H - 8}" text-anchor="middle">${esc(d.label)}</text>`;
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
  const dots = data.map((d, i) => `<circle class="dot" style="animation-delay:${280 + i * 60}ms" cx="${gx(i)}" cy="${gy(d.value)}" r="3.6" fill="var(--blue)" stroke="var(--bg-card)" stroke-width="2"/>`).join('');
  const labels = data.map((d, i) => (n <= 6 || i === 0 || i === n - 1 || i % Math.ceil(n / 5) === 0)
    ? `<text class="axis-label" x="${gx(i)}" y="${CHART_H - 8}" text-anchor="middle">${esc(d.label)}</text>` : '').join('');
  const hitRects = data.map((d, i) => {
    const x0 = i === 0 ? PAD.l : (gx(i - 1) + gx(i)) / 2;
    const x1 = i === n - 1 ? PAD.l + innerW : (gx(i) + gx(i + 1)) / 2;
    return `<rect data-hit="${i}" x="${x0}" y="${PAD.t}" width="${x1 - x0}" height="${CHART_H - PAD.t - PAD.b}" fill="transparent"/>`;
  }).join('');

  root.innerHTML = `<svg viewBox="0 0 ${width} ${CHART_H}" role="img" aria-label="line chart">${grid}
    <path class="area" d="${area}" fill="color-mix(in srgb, var(--blue) 14%, transparent)" stroke="none"/>
    <path class="line" pathLength="1" d="${path}" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}${hitRects}</svg>`;
  const svg = $('svg', root);
  attachTooltip(root, svg, data.map((d, i) => ({
    el: $(`[data-hit="${i}"]`, svg),
    item: { label: d.label, text: `${d.value.toLocaleString()} ${unit || ''}` },
    x: gx(i) * (root.clientWidth ? root.clientWidth / width : 1), y: gy(d.value),
  })));
}

/* ============================ haptics / rest / celebrate ============================ */
function haptic(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {} }
const REDUCE_MOTION = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

const Rest = {
  el: null, iv: null, t0: 0, target: 120,
  ensure() {
    if (this.el) return;
    const d = document.createElement('div');
    d.className = 'rest-pill';
    d.innerHTML = `<span class="rt-lbl">Rest</span><span class="rt-time num">0:00</span><button class="rt-skip" aria-label="Dismiss rest timer">✕</button>`;
    document.body.appendChild(d);
    d.querySelector('.rt-skip').onclick = () => { haptic(6); this.stop(); };
    this.el = d;
  },
  start() {
    this.ensure();
    this.t0 = performance.now();
    this.el.classList.add('show'); this.el.classList.remove('done');
    clearInterval(this.iv); this.render(); this.iv = setInterval(() => this.render(), 250);
  },
  render() {
    const s = Math.floor((performance.now() - this.t0) / 1000);
    this.el.querySelector('.rt-time').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    if (s >= this.target && !this.el.classList.contains('done')) { this.el.classList.add('done'); haptic(18); }
  },
  stop() { clearInterval(this.iv); this.iv = null; if (this.el) this.el.classList.remove('show'); },
};

const CONFETTI_COLORS = ['#007aff', '#34c759', '#af52de', '#ff9500', '#30b0c7', '#ff2d55'];
function celebrate(title, sub) {
  const o = document.createElement('div');
  o.className = 'celebrate';
  let conf = '';
  if (!REDUCE_MOTION()) {
    for (let i = 0; i < 26; i++) {
      const left = Math.round(Math.random() * 100);
      const dur = (1.1 + Math.random() * 0.9).toFixed(2);
      const delay = (Math.random() * 0.3).toFixed(2);
      const col = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const rot = Math.round(Math.random() * 360);
      conf += `<i style="left:${left}%;background:${col};animation-duration:${dur}s;animation-delay:${delay}s;transform:rotate(${rot}deg)"></i>`;
    }
  }
  o.innerHTML = `<div class="confetti">${conf}</div><div class="cel-card">
      <div class="cel-check"><svg viewBox="0 0 24 24"><path pathLength="1" d="M4.5 12.5l4.8 4.8L19.5 7"/></svg></div>
      <div class="cel-title">${esc(title)}</div>
      ${sub ? `<div class="cel-sub">${esc(sub)}</div>` : ''}
    </div>`;
  document.body.appendChild(o);
  haptic([12, 40, 14]);
  requestAnimationFrame(() => o.classList.add('show'));
  setTimeout(() => { o.classList.remove('show'); setTimeout(() => o.remove(), 300); }, 1700);
}

/* ============================ settings ============================ */
function openSettings() {
  openSheet(`
    ${sheetHead('Settings')}
    <div class="group">
      <div class="group-header">Units</div>
      <div class="seg" id="set-units" style="margin:0 0 4px">
        <button data-v="lb" class="${S.settings.units === 'lb' ? 'active' : ''}">Pounds (lb)</button>
        <button data-v="kg" class="${S.settings.units === 'kg' ? 'active' : ''}">Kilograms (kg)</button>
      </div>
    </div>
    <div class="group">
      <div class="group-header">Appearance</div>
      <div class="seg" id="set-theme">
        <button data-v="auto" class="${(S.settings.theme||'auto') === 'auto' ? 'active' : ''}">Auto</button>
        <button data-v="light" class="${S.settings.theme === 'light' ? 'active' : ''}">Light</button>
        <button data-v="dark" class="${S.settings.theme === 'dark' ? 'active' : ''}">Dark</button>
      </div>
    </div>
    <div class="group">
      <div class="group-header">Backup</div>
      <div class="list">
        <button class="row action" id="btn-export"><span class="r-title">Export Backup…</span></button>
        <button class="row action" id="btn-import"><span class="r-title">Restore from Backup…</span></button>
      </div>
      <div class="group-footer">Your data lives only on this device. Export a JSON backup once in a while.</div>
      <input type="file" id="file-import" accept="application/json" style="display:none">
    </div>
    <div class="group">
      <div class="group-footer" style="padding-top:0">MesoForge — a personal hypertrophy planner. Volume autoregulates from your set feedback; effort ramps to 0 RIR before each deload.</div>
    </div>`);

  $('[data-sheet-done]').onclick = closeSheet;

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
      closeSheet(); render(); toast('Backup restored');
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
  $('#modal-scrim').addEventListener('click', (e) => { if (e.target.id === 'modal-scrim') closeSheet(); });

  // large-title collapse: raise compact nav on scroll
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('raised', scrollY > 30), { passive: true });

  switchTab('train');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
if (!(typeof window !== 'undefined' && window.__MF_NOBOOT)) main();
