/* =====================================================================
   MesoForge — original hypertrophy training PWA
   Autoregulated volume, RIR progression, deloads, analytics.
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

/* ============================ tiny utils ============================ */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayISO = () => new Date().toISOString().slice(0, 10);
const round1 = (n) => Math.round(n * 10) / 10;

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
        <div class="big">🏗️</div>
        <p><strong>No active mesocycle.</strong></p>
        <p class="muted">Build one to start training — pick a split, choose your exercises, and MesoForge will run your week-to-week progression.</p>
        <button class="btn primary" id="btn-new-meso-empty">Create a mesocycle</button>
      </div>`;
    $('#btn-new-meso-empty').onclick = () => { switchTab('plan'); openWizard(); };
    return;
  }

  const cw = currentWeek(meso);
  const viewWeek = S.planWeek || cw;
  const rir = targetRIR(meso, viewWeek);
  const deload = isDeload(meso, viewWeek);

  const weekPills = Array.from({ length: meso.weeks }, (_, i) => {
    const wk = i + 1;
    const cls = ['week-pill', wk === viewWeek ? 'active' : '', wk === cw && wk !== viewWeek ? 'current' : ''].join(' ');
    return `<button class="${cls}" data-week="${wk}">${isDeload(meso, wk) ? 'Deload' : 'Week ' + wk}</button>`;
  }).join('');

  const days = meso.days.map((day, di) => {
    const w = getWorkout(meso, viewWeek, di);
    const done = w && w.status === 'done';
    const ready = !!w;
    const totalSets = w ? w.entries.reduce((a, e) => a + (done ? e.sets.filter(s => s.done).length : e.targetSets), 0) : 0;
    return `
      <div class="card day-card ${done ? 'done' : ''} ${ready && !done && viewWeek === cw ? 'today' : ''}">
        <div class="status-dot"></div>
        <div style="flex:1">
          <div class="title">${esc(day.name)}</div>
          <div class="muted">${ready ? totalSets + ' sets · ' + (done ? 'completed' + (w.date ? ' ' + w.date : '') : 'ready') : 'unlocks after last week’s session'}</div>
        </div>
        ${ready && !done ? `<button class="btn primary small" data-start="${w.id}">${w.entries.some(e => e.sets.length) ? 'Resume' : 'Start'}</button>` : ''}
        ${done ? `<button class="btn subtle small" data-view-workout="${w.id}">View</button>` : ''}
      </div>`;
  }).join('');

  const doneCount = mesoWorkouts(meso.id).filter(w => w.status === 'done').length;
  const totalCount = meso.weeks * meso.days.length;

  el.innerHTML = `
    <div class="card">
      <div class="row between">
        <div>
          <div class="hero-label">${esc(meso.name)}</div>
          <div class="hero-number">${deload ? 'Deload' : 'Week ' + viewWeek}</div>
          <div class="muted">${deload ? 'Half volume · light loads · leave ' + rir + '+ in the tank' : 'Target effort: ' + (rir === 0 ? '0 RIR — to the limit' : rir + ' RIR')}</div>
        </div>
        <div style="text-align:right">
          <div class="stat-tile" style="min-width:100px">
            <div class="v">${doneCount}<span class="muted" style="font-size:14px">/${totalCount}</span></div>
            <div class="l">sessions done</div>
          </div>
        </div>
      </div>
      <div style="margin-top:12px" class="progress-track"><div class="progress-fill" style="width:${Math.round(100 * doneCount / totalCount)}%"></div></div>
    </div>
    <div class="week-strip" style="margin-bottom:12px">${weekPills}</div>
    ${days}`;

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

  const blocks = w.entries.map((en, ei) => {
    const ex = exById(en.exerciseId);
    const setRows = Array.from({ length: Math.max(en.targetSets, en.sets.length) }, (_, si) => {
      const s = en.sets[si] || {};
      const sug = en.suggest && !s.weight ? ` placeholder="${en.suggest.weight}"` : '';
      const sugR = en.suggest && !s.reps ? ` placeholder="${en.suggest.reps}"` : '';
      return `
        <div class="set-grid">
          <div class="set-num">${si + 1}</div>
          <input type="number" inputmode="decimal" step="any" min="0" data-w="${ei}:${si}" value="${s.weight ?? ''}"${sug} ${readonly ? 'disabled' : ''} aria-label="weight">
          <input type="number" inputmode="numeric" min="0" data-r="${ei}:${si}" value="${s.reps ?? ''}"${sugR} ${readonly ? 'disabled' : ''} aria-label="reps">
          <div class="rir-cell">${en.targetRIR}${deload ? '+' : ''} RIR</div>
          <button class="set-done-btn ${s.done ? 'done' : ''}" data-d="${ei}:${si}" ${readonly ? 'disabled' : ''} aria-label="mark set done">✓</button>
        </div>`;
    }).join('');

    return `
      <div class="card exercise-block">
        <div class="ex-head">
          <span class="ex-name">${esc(ex ? ex.name : 'Unknown')}</span>
          <span class="muscle-tag">${esc(en.muscle)}</span>
          <span class="spacer"></span>
          ${readonly ? '' : `<button class="icon-btn" data-swap="${ei}" title="Swap exercise">⇄</button>`}
        </div>
        <div class="target-line">${en.targetSets} set${en.targetSets > 1 ? 's' : ''} · ${en.targetRIR}${deload ? '+' : ''} RIR target${en.suggest ? ` · last: ${en.suggest.weight}${u} × ${en.suggest.reps}` : ''}</div>
        <div class="set-grid header"><div></div><div>${u === 'kg' ? 'KG' : 'LB'}</div><div>Reps</div><div>Effort</div><div></div></div>
        ${setRows}
        ${readonly ? '' : `<button class="btn subtle small" data-addset="${ei}">+ Add set</button>`}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="row between" style="margin-bottom:12px">
      <button class="btn subtle small" id="btn-back-train">‹ Back</button>
      <div style="text-align:center">
        <strong>${esc(day.name)}</strong>
        <div class="muted small">${isDeload(meso, w.week) ? 'Deload' : 'Week ' + w.week} · ${w.status === 'done' ? 'completed' : 'in progress'}</div>
      </div>
      <span style="width:64px"></span>
    </div>
    ${blocks}
    ${readonly ? '' : `<button class="btn primary block" id="btn-finish" style="margin-top:6px">Finish workout</button>`}`;

  $('#btn-back-train').onclick = () => switchTab('train');

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

  $$('[data-d]', el).forEach(btn => btn.onclick = () => {
    const [ei, si] = btn.dataset.d.split(':').map(Number);
    const en = w.entries[ei];
    while (en.sets.length <= si) en.sets.push({ weight: null, reps: null, done: false });
    const s = en.sets[si];
    // adopt suggestion if fields left empty
    if (!s.done && s.weight == null && en.suggest) s.weight = en.suggest.weight;
    if (!s.done && s.reps == null && en.suggest) s.reps = en.suggest.reps;
    s.done = !s.done;
    saveWorkout(w);
    renderWorkout();
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
    .map(e => `<div class="lib-item" style="cursor:pointer" data-pick="${e.id}"><div style="flex:1"><div class="name">${esc(e.name)}</div><div class="eq">${esc(e.eq)}</div></div>${e.id === en.exerciseId ? '<span class="muted">current</span>' : ''}</div>`)
    .join('');
  openModal(`<h2>Swap exercise — ${esc(en.muscle)}</h2><p class="muted small">Swaps apply to this session and all future weeks.</p>${options}`);
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
  const fbSection = deload ? '<p class="muted">Deload week — no feedback needed. Enjoy the recovery.</p>' :
    muscles.map(m => `
      <h3>${esc(m)}</h3>
      <label class="field">Soreness before today
        <div class="seg" data-fb="${m}:soreness">
          <button data-v="0">Healed early</button><button data-v="1">Just in time</button><button data-v="2">Still sore</button>
        </div>
      </label>
      <label class="field">Pump
        <div class="seg" data-fb="${m}:pump">
          <button data-v="0">Low</button><button data-v="1">Decent</button><button data-v="2">Great</button>
        </div>
      </label>
      <label class="field">Workload
        <div class="seg" data-fb="${m}:workload">
          <button data-v="0">Easy</button><button data-v="1">Manageable</button><button data-v="2">Pushed limits</button><button data-v="3">Too much</button>
        </div>
      </label>
      <label class="field">Joints & connective tissue
        <div class="seg" data-fb="${m}:joints">
          <button data-v="0">Fresh</button><button data-v="1">A bit achy</button><button data-v="2">Painful</button>
        </div>
      </label>`).join('');

  openModal(`
    <h2>Finish workout</h2>
    <p class="muted small">${deload ? '' : 'Rate each muscle you trained — this drives next week’s set targets.'}</p>
    ${fbSection}
    <button class="btn primary block" id="btn-confirm-finish" style="margin-top:10px">Save & finish</button>`);

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
    <button class="btn primary block" id="btn-new-meso">+ New mesocycle</button>
    <div style="height:12px"></div>
    ${list.length ? '' : '<p class="muted" style="text-align:center">No mesocycles yet.</p>'}
    ${list.map(m => {
      const done = mesoWorkouts(m.id).filter(w => w.status === 'done').length;
      const total = m.weeks * m.days.length;
      return `
      <div class="card">
        <div class="row between">
          <div>
            <strong>${esc(m.name)}</strong>
            <div class="muted small">${m.days.length} days/wk · ${m.weeks - 1} weeks + deload · ${done}/${total} sessions${m.status === 'done' ? ' · finished' : m.status === 'active' ? '' : ' · archived'}</div>
          </div>
          <div class="row">
            ${m.status === 'active'
              ? '<span class="muscle-tag">active</span>'
              : `<button class="btn small" data-activate="${m.id}">Activate</button>`}
            <button class="btn small danger" data-del-meso="${m.id}">✕</button>
          </div>
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
    openModal(`<h2>Delete “${esc(m.name)}”?</h2><p class="muted">This removes the plan and all its logged workouts. This cannot be undone.</p>
      <div class="row"><button class="btn block" id="btn-cancel-del">Cancel</button><button class="btn danger block" id="btn-do-del">Delete</button></div>`);
    $('#btn-cancel-del').onclick = closeModal;
    $('#btn-do-del').onclick = async () => {
      S.mesos = S.mesos.filter(x => x.id !== m.id);
      await idb.del('mesos', m.id);
      for (const w of mesoWorkouts(m.id)) await idb.del('workouts', w.id);
      S.workouts = S.workouts.filter(w => w.mesoId !== m.id);
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
    openModal(`${dots}<h2>Pick a split</h2>
      ${TEMPLATES.map(t => `
        <div class="card" style="cursor:pointer;margin-bottom:10px" data-tpl="${t.id}">
          <div class="row between"><strong>${esc(t.name)}</strong><span class="muscle-tag">${t.days} days</span></div>
          <div class="muted small">${esc(t.blurb)}</div>
        </div>`).join('')}`);
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
    openModal(`${dots}<h2>Length & name</h2>
      <label class="field">Mesocycle name
        <input type="text" id="wiz-name" placeholder="e.g. Summer block 1" value="${esc(WIZ.name)}">
      </label>
      <label class="field">Length (accumulation weeks + deload)
        <div class="seg" id="wiz-weeks">
          ${[4,5,6].map(n => `<button data-v="${n}" class="${WIZ.weeks === n ? 'active' : ''}">${n - 1} + deload</button>`).join('')}
        </div>
      </label>
      <label class="field">Effort ramp
        <select id="wiz-ramp">
          ${RIR_RAMPS.map(r => `<option value="${r.id}" ${WIZ.ramp === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </label>
      <p class="muted small">Effort ramps across the block, then a light deload week. Starting volume sits near each muscle's minimum effective dose and autoregulates upward from your feedback, capped at its weekly maximum.</p>
      <div class="row"><button class="btn block" id="wiz-back">Back</button><button class="btn primary block" id="wiz-next">Next</button></div>`);
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
        <span class="muscle-tag" style="min-width:74px;text-align:center">${esc(slot.muscle)}</span>
        <select data-slot="${di}:${si}">
          ${S.exercises.filter(e => e.muscle === slot.muscle).map(e => `<option value="${e.id}" ${e.id === slot.exerciseId ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}
        </select>
      </div>`).join('')}`).join('');

  openModal(`${dots}<h2>Choose exercises</h2>
    <p class="muted small">Defaults are picked for you — change any slot. You can also swap mid-meso later.</p>
    ${daysHtml}
    <div class="row" style="margin-top:12px"><button class="btn block" id="wiz-back">Back</button><button class="btn primary block" id="wiz-create">Create mesocycle</button></div>`);
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
    <div class="chips" style="margin-bottom:12px">${chips}</div>
    <button class="btn block" id="btn-add-ex">+ Add custom exercise</button>
    <div class="card" style="margin-top:12px">
      ${list.map(e => `
        <div class="lib-item">
          <div style="flex:1"><div class="name">${esc(e.name)}</div><div class="eq">${esc(e.muscle)} · ${esc(e.eq)}${e.custom ? ' · custom' : ''}</div></div>
          ${e.custom ? `<button class="btn small danger" data-del-ex="${e.id}">✕</button>` : ''}
        </div>`).join('') || '<p class="muted">Nothing here.</p>'}
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
    el.innerHTML = '<div class="empty-state card"><div class="big">📈</div><p class="muted">Charts appear once you have a mesocycle going.</p></div>';
    return;
  }
  const loggedExIds = [...new Set(S.workouts.filter(w => w.status === 'done').flatMap(w => w.entries.map(e => e.exerciseId)))];
  if (!S.progressExercise || !loggedExIds.includes(S.progressExercise)) S.progressExercise = loggedExIds[0] || null;

  const muscleChips = MUSCLES.map(m => `<button class="chip ${m === S.progressMuscle ? 'active' : ''}" data-pm="${m}">${m}</button>`).join('');
  const setsData = weeklySetsForMuscle(meso, S.progressMuscle);
  const tonData = weeklyTonnage(meso);
  const trendData = S.progressExercise ? e1rmTrend(S.progressExercise) : [];
  const exOptions = loggedExIds.map(id => { const e = exById(id); return e ? `<option value="${id}" ${id === S.progressExercise ? 'selected' : ''}>${esc(e.name)}</option>` : ''; }).join('');

  el.innerHTML = `
    <div class="card">
      <h2>Weekly sets — ${esc(S.progressMuscle)}</h2>
      <div class="chips" style="margin-bottom:10px">${muscleChips}</div>
      <div id="chart-sets"></div>
      <p class="muted small" style="margin:8px 0 0">Completed weeks show logged working sets; upcoming weeks show current targets.</p>
    </div>
    <div class="card">
      <h2>Weekly tonnage (${S.settings.units})</h2>
      <div id="chart-tonnage"></div>
    </div>
    <div class="card">
      <h2>Estimated 1RM</h2>
      ${loggedExIds.length ? `<label class="field"><select id="sel-ex">${exOptions}</select></label><div id="chart-e1rm"></div>` : '<p class="muted small">Log some workouts to see strength trends.</p>'}
    </div>`;

  $$('[data-pm]', el).forEach(c => c.onclick = () => { S.progressMuscle = c.dataset.pm; renderProgress(); });
  const sel = $('#sel-ex');
  if (sel) sel.onchange = () => { S.progressExercise = sel.value; renderProgress(); };

  const lm = VOLUME_LANDMARKS[S.progressMuscle];
  barChart($('#chart-sets'), setsData, {
    unit: 'sets',
    refLines: lm ? [{ value: lm.mev, label: 'min effective' }, { value: lm.mrv, label: 'max recoverable' }] : null,
  });
  barChart($('#chart-tonnage'), tonData, { unit: S.settings.units });
  if (trendData.length) lineChart($('#chart-e1rm'), trendData, { unit: S.settings.units });
  else if (loggedExIds.length) $('#chart-e1rm').innerHTML = '<p class="muted small">No completed sets for this exercise yet.</p>';
}

/* --- minimal original SVG charts: thin marks, rounded data ends, hover tooltip --- */
const CHART_H = 180, PAD = { t: 14, r: 10, b: 26, l: 36 };

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
    <text class="axis-label" x="${PAD.l - 6}" y="${gy(t) + 3.5}" text-anchor="end">${t >= 1000 ? Math.round(t / 1000) + 'k' : t}</text>`).join('');
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

function barChart(root, data, { unit, refLines } = {}) {
  if (!root) return;
  root.classList.add('viz-root');
  const width = Math.max(root.clientWidth || 320, 280);
  const refMax = refLines ? Math.max(...refLines.map(r => r.value)) : 0;
  const maxV = niceMax(Math.max(...data.map(d => d.value), refMax, 1));
  const { innerW, gy, grid } = chartFrame(width, maxV);
  const n = data.length;
  const slot = innerW / n;
  const bw = Math.min(26, slot * 0.55);

  let bars = '', hits = [];
  data.forEach((d, i) => {
    const x = PAD.l + slot * i + (slot - bw) / 2;
    const y = gy(d.value), y0 = gy(0);
    const h = Math.max(y0 - y, 0);
    const r = Math.min(4, bw / 2, h);
    bars += h > 0
      ? `<path d="M${x},${y0} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + bw - r},${y} Q${x + bw},${y} ${x + bw},${y + r} L${x + bw},${y0} Z" fill="var(--accent)"/>`
      : '';
    bars += `<text class="axis-label" x="${x + bw / 2}" y="${CHART_H - 8}" text-anchor="middle">${esc(d.label)}</text>`;
    bars += `<rect data-hit="${i}" x="${PAD.l + slot * i}" y="${PAD.t}" width="${slot}" height="${CHART_H - PAD.t - PAD.b}" fill="transparent"/>`;
    hits.push({ i, x: x + bw / 2, y });
  });

  const refs = (refLines || []).map(r => `
    <line x1="${PAD.l}" x2="${width - PAD.r}" y1="${gy(r.value)}" y2="${gy(r.value)}" stroke="var(--ink-muted)" stroke-width="1" stroke-dasharray="4 4"/>
    <text class="axis-label" x="${width - PAD.r}" y="${gy(r.value) - 4}" text-anchor="end">${esc(r.label)}</text>`).join('');

  root.innerHTML = `<svg viewBox="0 0 ${width} ${CHART_H}" role="img" aria-label="bar chart">${grid}${bars}${refs}</svg>`;
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
  const dots = data.map((d, i) => `<circle cx="${gx(i)}" cy="${gy(d.value)}" r="4" fill="var(--accent)" stroke="var(--surface-1)" stroke-width="2"/>`).join('');
  const labels = data.map((d, i) => (n <= 6 || i === 0 || i === n - 1 || i % Math.ceil(n / 5) === 0)
    ? `<text class="axis-label" x="${gx(i)}" y="${CHART_H - 8}" text-anchor="middle">${esc(d.label)}</text>` : '').join('');
  const hitRects = data.map((d, i) => {
    const x0 = i === 0 ? PAD.l : (gx(i - 1) + gx(i)) / 2;
    const x1 = i === n - 1 ? PAD.l + innerW : (gx(i) + gx(i + 1)) / 2;
    return `<rect data-hit="${i}" x="${x0}" y="${PAD.t}" width="${x1 - x0}" height="${CHART_H - PAD.t - PAD.b}" fill="transparent"/>`;
  }).join('');

  root.innerHTML = `<svg viewBox="0 0 ${width} ${CHART_H}" role="img" aria-label="line chart">${grid}
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}${hitRects}</svg>`;
  const svg = $('svg', root);
  attachTooltip(root, svg, data.map((d, i) => ({
    el: $(`[data-hit="${i}"]`, svg),
    item: { label: d.label, text: `${d.value.toLocaleString()} ${unit || ''}` },
    x: gx(i) * (root.clientWidth ? root.clientWidth / width : 1), y: gy(d.value),
  })));
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
main();
