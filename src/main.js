import './style.css';
import { jsPDF } from 'jspdf';

// =========================================
// Configuration: Text positions as PERCENTAGES
// =========================================
const PDF_WIDTH = 297;
const PDF_HEIGHT = 210;

// Default positions — will be overridden by saved calibration
const DEFAULT_POSITIONS = {
  name: { xPct: 3.5, yPct: 3.5, fontPct: 2.2 },
  level: { xPct: 10, yPct: 12, fontPct: 1.5 },
  class: { xPct: 18, yPct: 12, fontPct: 1.5 },
  species: { xPct: 30, yPct: 12, fontPct: 1.5 },
  
  init: { xPct: 63, yPct: 6, fontPct: 2 },
  cd: { xPct: 76, yPct: 6, fontPct: 2 },
  speed: { xPct: 90, yPct: 6, fontPct: 2 },
  
  hp: { xPct: 75, yPct: 20, fontPct: 2 },
  ac: { xPct: 68, yPct: 52, fontPct: 3 },
  defenses: { xPct: 80, yPct: 50, fontPct: 1.2 },

  portrait: { xPct: 38, yPct: 13.5, widthPct: 24, heightPct: 60.5 },

  stats: {
    str: { value: { xPct: 10, yPct: 20, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 16, fontPct: 3.0 }, save: { xPct: 31, yPct: 16, fontPct: 2.4 } },
    dex: { value: { xPct: 10, yPct: 33, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 29, fontPct: 3.0 }, save: { xPct: 31, yPct: 29, fontPct: 2.4 } },
    con: { value: { xPct: 10, yPct: 46, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 42, fontPct: 3.0 }, save: { xPct: 31, yPct: 42, fontPct: 2.4 } },
    int: { value: { xPct: 10, yPct: 59, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 55, fontPct: 3.0 }, save: { xPct: 31, yPct: 55, fontPct: 2.4 } },
    wis: { value: { xPct: 10, yPct: 72, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 68, fontPct: 3.0 }, save: { xPct: 31, yPct: 68, fontPct: 2.4 } },
    cha: { value: { xPct: 10, yPct: 85, fontPct: 1.5 }, mod: { xPct: 21.5, yPct: 81, fontPct: 3.0 }, save: { xPct: 31, yPct: 81, fontPct: 2.4 } },
  },

  weapons: [
    { name: { xPct: 6, yPct: 84, fontPct: 1.2 }, atk: { xPct: 17, yPct: 84, fontPct: 1.2 }, dmg: { xPct: 25, yPct: 84, fontPct: 1.2 }, type: { xPct: 33, yPct: 84, fontPct: 1.2 }, notes: { xPct: 40, yPct: 84, fontPct: 1.2 } },
    { name: { xPct: 6, yPct: 87, fontPct: 1.2 }, atk: { xPct: 17, yPct: 87, fontPct: 1.2 }, dmg: { xPct: 25, yPct: 87, fontPct: 1.2 }, type: { xPct: 33, yPct: 87, fontPct: 1.2 }, notes: { xPct: 40, yPct: 87, fontPct: 1.2 } },
    { name: { xPct: 6, yPct: 90, fontPct: 1.2 }, atk: { xPct: 17, yPct: 90, fontPct: 1.2 }, dmg: { xPct: 25, yPct: 90, fontPct: 1.2 }, type: { xPct: 33, yPct: 90, fontPct: 1.2 }, notes: { xPct: 40, yPct: 90, fontPct: 1.2 } },
    { name: { xPct: 6, yPct: 93, fontPct: 1.2 }, atk: { xPct: 17, yPct: 93, fontPct: 1.2 }, dmg: { xPct: 25, yPct: 93, fontPct: 1.2 }, type: { xPct: 33, yPct: 93, fontPct: 1.2 }, notes: { xPct: 40, yPct: 93, fontPct: 1.2 } },
    { name: { xPct: 6, yPct: 96, fontPct: 1.2 }, atk: { xPct: 17, yPct: 96, fontPct: 1.2 }, dmg: { xPct: 25, yPct: 96, fontPct: 1.2 }, type: { xPct: 33, yPct: 96, fontPct: 1.2 }, notes: { xPct: 40, yPct: 96, fontPct: 1.2 } },
  ]
};

// D&D 5e Skills definition
const SKILLS_DEF = [
  { id: 'acrobatics', name: 'Acrobacias', stat: 'dex' },
  { id: 'animalHandling', name: 'Trato con Animales', stat: 'wis' },
  { id: 'arcana', name: 'Arcanos', stat: 'int' },
  { id: 'athletics', name: 'Atletismo', stat: 'str' },
  { id: 'deception', name: 'Engaño', stat: 'cha' },
  { id: 'history', name: 'Historia', stat: 'int' },
  { id: 'insight', name: 'Perspicacia', stat: 'wis' },
  { id: 'intimidation', name: 'Intimidación', stat: 'cha' },
  { id: 'investigation', name: 'Investigación', stat: 'int' },
  { id: 'medicine', name: 'Medicina', stat: 'wis' },
  { id: 'nature', name: 'Naturaleza', stat: 'int' },
  { id: 'perception', name: 'Percepción', stat: 'wis' },
  { id: 'performance', name: 'Interpretación', stat: 'cha' },
  { id: 'persuasion', name: 'Persuasión', stat: 'cha' },
  { id: 'religion', name: 'Religión', stat: 'int' },
  { id: 'sleightOfHand', name: 'Juego de Manos', stat: 'dex' },
  { id: 'stealth', name: 'Sigilo', stat: 'dex' },
  { id: 'survival', name: 'Supervivencia', stat: 'wis' }
];

// Load saved positions from localStorage, or use defaults
function loadPositions() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_POSITIONS));
  try {
    const saved = localStorage.getItem('dnd_sheet_positions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], merge(target[key], source[key]));
          }
        }
        Object.assign(target || {}, source);
        return target;
      };
      return merge(defaults, parsed);
    }
  } catch (e) { /* ignore */ }
  return defaults;
}

function savePositions() {
  localStorage.setItem('dnd_sheet_positions', JSON.stringify(POSITIONS));
}

let POSITIONS = loadPositions();

// =========================================
// State
// =========================================
const formData = {
  name: '', level: '', class: '', species: '',
  init: '', cd: '', speed: '',
  hp: '', ac: '', defenses: '',
  str: { value: '', mod: '', save: '' },
  dex: { value: '', mod: '', save: '' },
  con: { value: '', mod: '', save: '' },
  int: { value: '', mod: '', save: '' },
  wis: { value: '', mod: '', save: '' },
  cha: { value: '', mod: '', save: '' },
  weapons: [
    { name: '', atk: '', dmg: '', type: '', notes: '' },
    { name: '', atk: '', dmg: '', type: '', notes: '' },
    { name: '', atk: '', dmg: '', type: '', notes: '' },
    { name: '', atk: '', dmg: '', type: '', notes: '' },
    { name: '', atk: '', dmg: '', type: '', notes: '' },
  ],
  // Roleo Data
  profBonus: '+2',
  portraitUrl: '',
  skills: {},
  otherTraits: '',
  otherProficiencies: '',
  inspiration: false,
  passives: { perception: '10', investigation: '10', insight: '10' },

  // Section Activation Toggles
  toggles: {
    combateIdentity: true,
    combateMetrics: true,
    combateWeapons: true,
    roleoName: true,
    roleoStats: true,
    roleoProfBonus: true,
    roleoPortrait: true,
    roleoSkills: true,
    roleoTraits: true,
    roleoProfs: true,
    roleoInspiration: false,
    roleoPassives: true
  }
};

// Initialize skills in state
SKILLS_DEF.forEach(s => {
  formData.skills[s.id] = { prof: false, val: '+0' };
});

// Calibration state
let calibrationMode = false;
let selectedOverlayId = null;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let overlayStartXPct = 0, overlayStartYPct = 0;

// Map overlay IDs → position path in POSITIONS object
const OVERLAY_MAP = {
  'overlay-name': { path: 'name', label: 'Nombre' },
  'overlay-level': { path: 'level', label: 'Nivel' },
  'overlay-class': { path: 'class', label: 'Clase' },
  'overlay-species': { path: 'species', label: 'Especie' },
  
  'overlay-init': { path: 'init', label: 'Iniciativa' },
  'overlay-cd': { path: 'cd', label: 'CD' },
  'overlay-speed': { path: 'speed', label: 'Velocidad' },
  'overlay-hp': { path: 'hp', label: 'Puntos de Golpe' },
  'overlay-ac': { path: 'ac', label: 'CA' },
  'overlay-defenses': { path: 'defenses', label: 'Defensas' },

  'overlay-str-val': { path: 'stats.str.value', label: 'FUE - Valor' }, 'overlay-str-mod': { path: 'stats.str.mod', label: 'FUE - Mod' }, 'overlay-str-save': { path: 'stats.str.save', label: 'FUE - Salv' },
  'overlay-dex-val': { path: 'stats.dex.value', label: 'DES - Valor' }, 'overlay-dex-mod': { path: 'stats.dex.mod', label: 'DES - Mod' }, 'overlay-dex-save': { path: 'stats.dex.save', label: 'DES - Salv' },
  'overlay-con-val': { path: 'stats.con.value', label: 'CON - Valor' }, 'overlay-con-mod': { path: 'stats.con.mod', label: 'CON - Mod' }, 'overlay-con-save': { path: 'stats.con.save', label: 'CON - Salv' },
  'overlay-int-val': { path: 'stats.int.value', label: 'INT - Valor' }, 'overlay-int-mod': { path: 'stats.int.mod', label: 'INT - Mod' }, 'overlay-int-save': { path: 'stats.int.save', label: 'INT - Salv' },
  'overlay-wis-val': { path: 'stats.wis.value', label: 'SAB - Valor' }, 'overlay-wis-mod': { path: 'stats.wis.mod', label: 'SAB - Mod' }, 'overlay-wis-save': { path: 'stats.wis.save', label: 'SAB - Salv' },
  'overlay-cha-val': { path: 'stats.cha.value', label: 'CAR - Valor' }, 'overlay-cha-mod': { path: 'stats.cha.mod', label: 'CAR - Mod' }, 'overlay-cha-save': { path: 'stats.cha.save', label: 'CAR - Salv' },

  'overlay-w1-name': { path: 'weapons.0.name', label: 'Arma 1 - Nombre' }, 'overlay-w1-atk': { path: 'weapons.0.atk', label: 'Arma 1 - Atk' }, 'overlay-w1-dmg': { path: 'weapons.0.dmg', label: 'Arma 1 - Daño' }, 'overlay-w1-type': { path: 'weapons.0.type', label: 'Arma 1 - Tipo' }, 'overlay-w1-notes': { path: 'weapons.0.notes', label: 'Arma 1 - Notas' },
  'overlay-w2-name': { path: 'weapons.1.name', label: 'Arma 2 - Nombre' }, 'overlay-w2-atk': { path: 'weapons.1.atk', label: 'Arma 2 - Atk' }, 'overlay-w2-dmg': { path: 'weapons.1.dmg', label: 'Arma 2 - Daño' }, 'overlay-w2-type': { path: 'weapons.1.type', label: 'Arma 2 - Tipo' }, 'overlay-w2-notes': { path: 'weapons.1.notes', label: 'Arma 2 - Notas' },
  'overlay-w3-name': { path: 'weapons.2.name', label: 'Arma 3 - Nombre' }, 'overlay-w3-atk': { path: 'weapons.2.atk', label: 'Arma 3 - Atk' }, 'overlay-w3-dmg': { path: 'weapons.2.dmg', label: 'Arma 3 - Daño' }, 'overlay-w3-type': { path: 'weapons.2.type', label: 'Arma 3 - Tipo' }, 'overlay-w3-notes': { path: 'weapons.2.notes', label: 'Arma 3 - Notas' },
  'overlay-w4-name': { path: 'weapons.3.name', label: 'Arma 4 - Nombre' }, 'overlay-w4-atk': { path: 'weapons.3.atk', label: 'Arma 4 - Atk' }, 'overlay-w4-dmg': { path: 'weapons.3.dmg', label: 'Arma 4 - Daño' }, 'overlay-w4-type': { path: 'weapons.3.type', label: 'Arma 4 - Tipo' }, 'overlay-w4-notes': { path: 'weapons.3.notes', label: 'Arma 4 - Notas' },
  'overlay-w5-name': { path: 'weapons.4.name', label: 'Arma 5 - Nombre' }, 'overlay-w5-atk': { path: 'weapons.4.atk', label: 'Arma 5 - Atk' }, 'overlay-w5-dmg': { path: 'weapons.4.dmg', label: 'Arma 5 - Daño' }, 'overlay-w5-type': { path: 'weapons.4.type', label: 'Arma 5 - Tipo' }, 'overlay-w5-notes': { path: 'weapons.4.notes', label: 'Arma 5 - Notas' },
};

// Helper: get/set nested property by dot-path
function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((o, k) => o && o[k] !== undefined ? o[k] : undefined, obj);
}

// =========================================
// Preview: Apply positions & resize fonts
// =========================================
function applyOverlayPositions() {
  const img = document.getElementById('previewBg');
  if (!img) return;
  const imgWidth = img.offsetWidth || 900;

  for (const [id, info] of Object.entries(OVERLAY_MAP)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const pos = getByPath(POSITIONS, info.path);
    if (!pos) continue;

    el.style.left = pos.xPct + '%';
    el.style.top = pos.yPct + '%';
    el.style.fontSize = (pos.fontPct / 100 * imgWidth) + 'px';
  }
}

const previewImg = document.getElementById('previewBg');
if (previewImg) {
  previewImg.addEventListener('load', applyOverlayPositions);
  if (previewImg.complete) setTimeout(applyOverlayPositions, 50);
}
window.addEventListener('resize', applyOverlayPositions);

// =========================================
// Preview Update Logic
// =========================================
function updatePreview() {
  // Name
  const showName = formData.toggles.roleoName;
  document.getElementById('overlay-name').textContent = (showName && formData.name) ? formData.name.toUpperCase() : (calibrationMode ? 'NOMBRE DEL PJ' : '');
  
  // Identity
  const showIdentity = formData.toggles.combateIdentity;
  document.getElementById('overlay-level').textContent = (showIdentity && formData.level) ? formData.level : (calibrationMode ? 'Lvl' : '');
  document.getElementById('overlay-class').textContent = (showIdentity && formData.class) ? formData.class : (calibrationMode ? 'Clase' : '');
  document.getElementById('overlay-species').textContent = (showIdentity && formData.species) ? formData.species : (calibrationMode ? 'Especie' : '');
  
  // Combat Metrics
  const showCombat = formData.toggles.combateMetrics;
  document.getElementById('overlay-init').textContent = (showCombat && formData.init) ? formData.init : (calibrationMode ? '+0' : '');
  document.getElementById('overlay-cd').textContent = (showCombat && formData.cd) ? formData.cd : (calibrationMode ? '10' : '');
  document.getElementById('overlay-speed').textContent = (showCombat && formData.speed) ? formData.speed : (calibrationMode ? '30' : '');
  document.getElementById('overlay-hp').textContent = (showCombat && formData.hp) ? formData.hp : (calibrationMode ? '10/10' : '');
  document.getElementById('overlay-ac').textContent = (showCombat && formData.ac) ? formData.ac : (calibrationMode ? '10' : '');
  document.getElementById('overlay-defenses').textContent = (showCombat && formData.defenses) ? formData.defenses : (calibrationMode ? 'Defensas...' : '');

  // Stats
  const showStats = formData.toggles.roleoStats;
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of statKeys) {
    document.getElementById(`overlay-${stat}-val`).textContent = (showStats && formData[stat].value) ? formData[stat].value : (calibrationMode ? '10' : '');
    document.getElementById(`overlay-${stat}-mod`).textContent = (showStats && formData[stat].mod)   ? formData[stat].mod   : (calibrationMode ? '+0' : '');
    document.getElementById(`overlay-${stat}-save`).textContent = (showStats && formData[stat].save) ? formData[stat].save : (calibrationMode ? '+0' : '');
  }

  // Weapons
  const showWeapons = formData.toggles.combateWeapons;
  for (let i = 0; i < 5; i++) {
    const idx = i + 1;
    document.getElementById(`overlay-w${idx}-name`).textContent = (showWeapons && formData.weapons[i].name) ? formData.weapons[i].name : (calibrationMode ? 'Arma' : '');
    document.getElementById(`overlay-w${idx}-atk`).textContent = (showWeapons && formData.weapons[i].atk) ? formData.weapons[i].atk : (calibrationMode ? '+0' : '');
    document.getElementById(`overlay-w${idx}-dmg`).textContent = (showWeapons && formData.weapons[i].dmg) ? formData.weapons[i].dmg : (calibrationMode ? '1d8' : '');
    document.getElementById(`overlay-w${idx}-type`).textContent = (showWeapons && formData.weapons[i].type) ? formData.weapons[i].type : (calibrationMode ? 'Crt' : '');
    document.getElementById(`overlay-w${idx}-notes`).textContent = (showWeapons && formData.weapons[i].notes) ? formData.weapons[i].notes : (calibrationMode ? 'Notas' : '');
  }

  // Portrait (Visual Frame)
  const portraitEl = document.getElementById('overlay-portrait');
  const showPortrait = formData.toggles.roleoPortrait;
  if (showPortrait && formData.portraitUrl) {
    portraitEl.src = formData.portraitUrl;
    portraitEl.style.display = 'block';
  } else {
    portraitEl.style.display = 'none';
  }
}

// =========================================
// Input Event Listeners
// =========================================
function setupListeners() {
  // Group Selector dropdown
  const groupSelect = document.getElementById('groupSelector');
  if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      document.querySelectorAll('.data-group-container').forEach(el => el.style.display = 'none');
      const targetGroup = document.getElementById(`group-${selected}`);
      if (targetGroup) targetGroup.style.display = 'block';
    });
  }

  // Section Checkbox Toggles
  const toggleMap = [
    { id: 'chk-combate-identity', key: 'combateIdentity' },
    { id: 'chk-combate-metrics', key: 'combateMetrics' },
    { id: 'chk-combate-weapons', key: 'combateWeapons' },
    { id: 'chk-roleo-name', key: 'roleoName' },
    { id: 'chk-roleo-stats', key: 'roleoStats' },
    { id: 'chk-roleo-profbonus', key: 'roleoProfBonus' },
    { id: 'chk-roleo-portrait', key: 'roleoPortrait' },
    { id: 'chk-roleo-skills', key: 'roleoSkills' },
    { id: 'chk-roleo-traits', key: 'roleoTraits' },
    { id: 'chk-roleo-profs', key: 'roleoProfs' },
    { id: 'chk-roleo-inspiration', key: 'roleoInspiration' },
    { id: 'chk-roleo-passives', key: 'roleoPassives' },
  ];

  toggleMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        formData.toggles[key] = e.target.checked;
        if (key === 'roleoInspiration') {
          formData.inspiration = e.target.checked;
        }
        updatePreview();
      });
    }
  });

  // Simple Text Fields (sync all elements with same id or name)
  const syncFields = [
    { id: 'charName', prop: 'name' },
    { id: 'charLevel', prop: 'level' },
    { id: 'charClass', prop: 'class' },
    { id: 'charSpecies', prop: 'species' },
    { id: 'combatInit', prop: 'init' },
    { id: 'combatCD', prop: 'cd' },
    { id: 'combatSpeed', prop: 'speed' },
    { id: 'combatHP', prop: 'hp' },
    { id: 'combatAC', prop: 'ac' },
    { id: 'combatDefenses', prop: 'defenses' },
    { id: 'profBonus', prop: 'profBonus' },
    { id: 'otherTraits', prop: 'otherTraits' },
    { id: 'otherProficiencies', prop: 'otherProficiencies' },
  ];

  syncFields.forEach(({ id, prop }) => {
    const els = document.querySelectorAll(`#${id}`);
    els.forEach(el => {
      el.addEventListener('input', (e) => {
        formData[prop] = e.target.value;
        // Sync any duplicates
        document.querySelectorAll(`#${id}`).forEach(duplicate => {
          if (duplicate !== el) duplicate.value = e.target.value;
        });
        updatePreview();
      });
    });
  });

  // Passives
  ['Perception', 'Investigation', 'Insight'].forEach(p => {
    const el = document.getElementById(`passive${p}`);
    if (el) {
      el.addEventListener('input', (e) => {
        formData.passives[p.toLowerCase()] = e.target.value;
      });
    }
  });

  // Stats
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of statKeys) {
    const valInput = document.getElementById(`${stat}Value`);
    const modInput = document.getElementById(`${stat}Mod`);
    const saveInput = document.getElementById(`${stat}Save`);

    if (valInput) valInput.addEventListener('input', (e) => { formData[stat].value = e.target.value; updatePreview(); });
    if (modInput) modInput.addEventListener('input', (e) => { formData[stat].mod = e.target.value; updatePreview(); });
    if (saveInput) saveInput.addEventListener('input', (e) => { formData[stat].save = e.target.value; updatePreview(); });
  }

  // Skills
  SKILLS_DEF.forEach(s => {
    const chk = document.getElementById(`sk-${s.id}`);
    const val = document.getElementById(`skval-${s.id}`);
    if (chk) {
      chk.addEventListener('change', (e) => {
        if (!formData.skills[s.id]) formData.skills[s.id] = {};
        formData.skills[s.id].prof = e.target.checked;
      });
    }
    if (val) {
      val.addEventListener('input', (e) => {
        if (!formData.skills[s.id]) formData.skills[s.id] = {};
        formData.skills[s.id].val = e.target.value;
      });
    }
  });

  // Weapons
  for (let i = 0; i < 5; i++) {
    const idx = i + 1;
    ['Name', 'Atk', 'Dmg', 'Type', 'Notes'].forEach(sub => {
      const el = document.getElementById(`w${idx}${sub}`);
      if (el) {
        el.addEventListener('input', (e) => {
          formData.weapons[i][sub.toLowerCase()] = e.target.value;
          updatePreview();
        });
      }
    });
  }

  // Portrait (Visual Frame) Handling
  const portraitUrlInput = document.getElementById('portraitUrlInput');
  const uploadPortraitBtn = document.getElementById('uploadPortraitBtn');
  const portraitFileInput = document.getElementById('portraitFileInput');
  const removePortraitBtn = document.getElementById('removePortraitBtn');

  if (portraitUrlInput) {
    portraitUrlInput.addEventListener('input', (e) => {
      formData.portraitUrl = e.target.value;
      updatePreview();
    });
  }

  if (uploadPortraitBtn && portraitFileInput) {
    uploadPortraitBtn.addEventListener('click', () => portraitFileInput.click());
    portraitFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          formData.portraitUrl = ev.target.result;
          if (portraitUrlInput) portraitUrlInput.value = '';
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePortraitBtn) {
    removePortraitBtn.addEventListener('click', () => {
      formData.portraitUrl = '';
      if (portraitUrlInput) portraitUrlInput.value = '';
      if (portraitFileInput) portraitFileInput.value = '';
      updatePreview();
    });
  }

  // Action Buttons
  document.getElementById('exportBtn').addEventListener('click', exportPDF);
  document.getElementById('randomBtn').addEventListener('click', generateRandom);
  document.getElementById('calibrateBtn').addEventListener('click', toggleCalibration);
  
  // D&D Beyond URL/ID Importer
  const importUrlBtn = document.getElementById('importUrlBtn');
  const dndbUrlInput = document.getElementById('dndbUrlInput');
  if (importUrlBtn) {
    importUrlBtn.addEventListener('click', importFromDndbUrl);
  }
  if (dndbUrlInput) {
    dndbUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') importFromDndbUrl();
    });
  }

  // JSON Import
  document.getElementById('importJsonBtn').addEventListener('click', () => {
    document.getElementById('jsonFileInput').click();
  });
  document.getElementById('jsonFileInput').addEventListener('change', importJsonFile);
}

// =========================================
// URL / ID Import Logic (D&D Beyond API)
// =========================================
function extractCharacterId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const matchChar = trimmed.match(/characters\/(\d+)/i);
  if (matchChar) return matchChar[1];
  const matchService = trimmed.match(/character\/(\d+)/i);
  if (matchService) return matchService[1];
  return null;
}

async function importFromDndbUrl() {
  const urlInput = document.getElementById('dndbUrlInput');
  const rawVal = urlInput ? urlInput.value : '';
  const charId = extractCharacterId(rawVal);

  if (!charId) {
    alert("Por favor, ingresa una URL de personaje de D&D Beyond válida (ej: https://www.dndbeyond.com/characters/155088686) o el ID numérico.");
    return;
  }

  const btn = document.getElementById('importUrlBtn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Cargando...';
  btn.disabled = true;

  const targetApiUrl = `https://character-service.dndbeyond.com/character/v5/character/${charId}?includeCustomItems=true`;

  try {
    let json = null;
    
    // 1. Intentar fetch directo
    try {
      const response = await fetch(targetApiUrl);
      if (response.ok) {
        json = await response.json();
      }
    } catch (e) {
      console.warn("Fetch directo no disponible, usando proxy...", e);
    }

    // 2. Si falla por CORS, usar proxies públicos confiables
    if (!json || !json.data) {
      const proxyCandidates = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetApiUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetApiUrl)}`
      ];

      for (const proxyUrl of proxyCandidates) {
        try {
          const resp = await fetch(proxyUrl);
          if (resp.ok) {
            const data = await resp.json();
            if (data && (data.data || data.success)) {
              json = data;
              break;
            }
          }
        } catch (proxyErr) {
          console.warn("Proxy falló:", proxyUrl, proxyErr);
        }
      }
    }

    if (!json || !json.data) {
      throw new Error("No se pudo obtener la información del personaje. Asegúrate de que el personaje sea público en D&D Beyond.");
    }

    parseDdbJson(json);
    
  } catch (error) {
    console.error("Error al importar desde D&D Beyond:", error);
    alert(`Error al importar personaje: ${error.message}\n\nAsegúrate de que la hoja de personaje esté configurada como 'Pública' en D&D Beyond.`);
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

// =========================================
// JSON File Import Logic
// =========================================
function importJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      parseDdbJson(json);
    } catch (err) {
      console.error(err);
      alert('Error al parsear el archivo JSON. Asegúrate de que sea un archivo válido de D&D Beyond.');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset
}

function parseDdbJson(json) {
  const data = json.data;
  if (!data) {
    alert("Formato de D&D Beyond no reconocido.");
    return;
  }

  // Helper setter
  const setVal = (id, val) => {
    document.querySelectorAll(`#${id}`).forEach(el => el.value = val);
  };

  // Helper translations
  const damageTypeTranslations = {
    'Bludgeoning': 'Contundente',
    'Piercing': 'Perforante',
    'Slashing': 'Cortante',
    'Fire': 'Fuego',
    'Cold': 'Frío',
    'Lightning': 'Relámpago',
    'Thunder': 'Trueno',
    'Poison': 'Veneno',
    'Acid': 'Ácido',
    'Psychic': 'Psíquico',
    'Necrotic': 'Necrótico',
    'Radiant': 'Radiante',
    'Force': 'Fuerza'
  };

  // 1. COMBINE ALL MODIFIERS from all sources (race, class, background, item, feat, condition)
  const allMods = [];
  if (data.modifiers) {
    Object.values(data.modifiers).forEach(arr => {
      if (Array.isArray(arr)) allMods.push(...arr);
    });
  }

  // Also include modifiers granted by equipped items directly
  if (data.inventory) {
    data.inventory.forEach(item => {
      if (item.equipped && item.definition && item.definition.grantedModifiers) {
        allMods.push(...item.definition.grantedModifiers);
      }
    });
  }

  // 2. NAME & IDENTITY
  formData.name = data.name || '';
  setVal('charName', formData.name);

  // Total Level & Class
  let totalLevel = 1;
  if (data.classes && data.classes.length > 0) {
    totalLevel = data.classes.reduce((sum, cls) => sum + cls.level, 0);
    formData.level = String(totalLevel);
    setVal('charLevel', formData.level);

    formData.class = data.classes.map(cls => `${cls.definition.name} ${cls.level}`).join(' / ');
    setVal('charClass', formData.class);
  }

  // Species
  formData.species = data.race ? data.race.fullName || data.race.baseName : '';
  setVal('charSpecies', formData.species);

  // Proficiency Bonus
  const profBonus = Math.ceil(totalLevel / 4) + 1;
  formData.profBonus = `+${profBonus}`;
  setVal('profBonus', formData.profBonus);

  // 3. STATS & MODIFIERS (Incorporates base, bonus modifiers from all sources, bonusStats, set modifiers, and overrides)
  const statMap = { 1: 'str', 2: 'dex', 3: 'con', 4: 'int', 5: 'wis', 6: 'cha' };
  const statNames = { 1: 'strength', 2: 'dexterity', 3: 'constitution', 4: 'intelligence', 5: 'wisdom', 6: 'charisma' };

  const finalStats = {};
  const statMods = {};

  for (let id = 1; id <= 6; id++) {
    const statKey = statMap[id];
    const statName = statNames[id];

    // Base score
    let score = 10;
    if (data.stats) {
      const baseObj = data.stats.find(s => s.id === id);
      if (baseObj && baseObj.value != null) score = baseObj.value;
    }

    // Add all score bonuses from all modifier categories (race, class, background, item, feat)
    allMods.forEach(m => {
      if (m.type === 'bonus' && m.subType === `${statName}-score`) {
        score += (m.value || 0);
      }
    });

    // Add bonusStats
    if (data.bonusStats) {
      const bObj = data.bonusStats.find(s => s.id === id);
      if (bObj && bObj.value != null) score += bObj.value;
    }

    // Set modifiers (e.g. Gauntlets of Ogre Power = 19, Headband of Intellect = 19)
    allMods.forEach(m => {
      if (m.type === 'set' && m.subType === `${statName}-score`) {
        if (m.value && m.value > score) score = m.value;
      }
    });

    // Override score (manual user override in D&D Beyond)
    if (data.overrideStats) {
      const oObj = data.overrideStats.find(s => s.id === id);
      if (oObj && oObj.value != null) score = oObj.value;
    }

    finalStats[statKey] = score;
    const mod = Math.floor((score - 10) / 2);
    statMods[statKey] = mod;

    formData[statKey].value = String(score);
    formData[statKey].mod = mod >= 0 ? `+${mod}` : String(mod);

    setVal(`${statKey}Value`, formData[statKey].value);
    setVal(`${statKey}Mod`, formData[statKey].mod);
  }

  // 4. SAVING THROWS (Ability mod + prof bonus + global save bonuses from items like Cloak/Ring/Robe of Protection + specific save bonuses)
  let globalSaveBonus = 0;
  allMods.forEach(m => {
    if (m.type === 'bonus' && m.subType === 'saving-throws') {
      globalSaveBonus += (m.value || 0);
    }
  });

  for (let id = 1; id <= 6; id++) {
    const statKey = statMap[id];
    const statName = statNames[id];

    const isProf = allMods.some(m => m.type === 'proficiency' && m.subType === `${statName}-saving-throws`);
    let specSaveBonus = 0;
    allMods.forEach(m => {
      if (m.type === 'bonus' && m.subType === `${statName}-saving-throws`) {
        specSaveBonus += (m.value || 0);
      }
    });

    const totalSave = statMods[statKey] + (isProf ? profBonus : 0) + globalSaveBonus + specSaveBonus;
    formData[statKey].save = totalSave >= 0 ? `+${totalSave}` : String(totalSave);
    setVal(`${statKey}Save`, formData[statKey].save);
  }

  // 5. HIT POINTS (Base HP + CON mod * level + hp per level bonus * level + bonusHitPoints or override)
  let conMod = statMods.con;
  let maxHp = data.baseHitPoints || 0;
  let hpPerLevel = 0;
  allMods.forEach(m => {
    if (m.type === 'bonus' && m.subType === 'hit-points-per-level') {
      hpPerLevel += (m.value || 0);
    }
  });
  maxHp += (conMod * totalLevel) + (hpPerLevel * totalLevel);
  if (data.bonusHitPoints) maxHp += data.bonusHitPoints;
  if (data.overrideHitPoints) maxHp = data.overrideHitPoints;

  const curHp = maxHp - (data.removedHitPoints || 0);
  formData.hp = `${curHp}/${maxHp}`;
  if (data.temporaryHitPoints && data.temporaryHitPoints > 0) {
    formData.hp += ` (+${data.temporaryHitPoints} temp)`;
  }
  setVal('combatHP', formData.hp);

  // 6. INITIATIVE (DEX mod + all initiative bonuses e.g. Alert feat, Swashbuckler, Bard)
  let initBonus = statMods.dex;
  allMods.forEach(m => {
    if (m.type === 'bonus' && m.subType === 'initiative') {
      initBonus += (m.value || 0);
    }
  });
  formData.init = initBonus >= 0 ? `+${initBonus}` : String(initBonus);
  setVal('combatInit', formData.init);

  // 7. SPEED (Base + all unarmored-movement, speed bonuses, etc.)
  let speed = data.race && data.race.weightSpeeds ? data.race.weightSpeeds.normal.walk : 30;
  allMods.forEach(m => {
    if (m.type === 'bonus' && (m.subType === 'speed' || m.subType === 'unarmored-movement' || m.subType === 'walking-speed')) {
      speed += (m.value || 0);
    }
    if (m.type === 'set' && m.subType === 'innate-speed-walking') {
      if (m.value && m.value > speed) speed = m.value;
    }
  });
  formData.speed = `${speed} ft`;
  setVal('combatSpeed', formData.speed);

  // 8. ARMOR CLASS (CA) (Equipped armor, shields, unarmored defense, and global item/feat bonuses)
  let shieldBonus = 0;
  let armorItem = null;
  let hasUnarmoredDefense = false;
  let unarmoredWis = false;
  let unarmoredCon = false;

  allMods.forEach(m => {
    if (m.type === 'set' && m.subType === 'unarmored-armor-class') {
      hasUnarmoredDefense = true;
      if (m.statId === 5) unarmoredWis = true; // Monk (10 + DEX + WIS)
      if (m.statId === 3) unarmoredCon = true; // Barbarian (10 + DEX + CON)
    }
  });

  if (data.inventory) {
    data.inventory.forEach(inv => {
      if (inv.equipped && inv.definition && inv.definition.filterType === 'Armor') {
        if (inv.definition.armorTypeId === 4) {
          shieldBonus += (inv.definition.armorClass || 2);
        } else {
          armorItem = inv;
        }
      }
    });
  }

  let finalAC = 10;
  if (armorItem) {
    const def = armorItem.definition;
    const baseArmor = def.armorClass || 10;
    const armorType = def.armorTypeId; // 1: Light, 2: Medium, 3: Heavy
    let dexBonus = statMods.dex;
    if (armorType === 2) dexBonus = Math.min(2, dexBonus);
    if (armorType === 3) dexBonus = 0;
    finalAC = baseArmor + dexBonus + shieldBonus;
  } else if (hasUnarmoredDefense) {
    if (unarmoredWis) finalAC = 10 + statMods.dex + statMods.wis;
    else if (unarmoredCon) finalAC = 10 + statMods.dex + statMods.con + shieldBonus;
    else finalAC = 10 + statMods.dex + shieldBonus;
  } else {
    finalAC = 10 + statMods.dex + shieldBonus;
  }

  // Global AC bonuses from items / features (Ring of Protection, Defense fighting style, Túnica de Freya, etc.)
  allMods.forEach(m => {
    if (m.type === 'bonus' && m.subType === 'armor-class') {
      finalAC += (m.value || 0);
    }
  });

  formData.ac = String(finalAC);
  setVal('combatAC', formData.ac);

  // 9. SPELL SAVE DC / CD (8 + prof + main casting ability mod + DC bonuses from items like Dragonhide Belt, Rod of the Pact Keeper)
  let mainCastingMod = Math.max(statMods.int, statMods.wis, statMods.cha, statMods.dex);
  let dcBonus = 0;
  allMods.forEach(m => {
    if (m.type === 'bonus' && (m.subType === 'spell-save-dc' || m.subType.includes('-spell-save-dc') || m.subType === 'ki-save-dc')) {
      dcBonus += (m.value || 0);
    }
  });
  formData.cd = String(8 + profBonus + mainCastingMod + dcBonus);
  setVal('combatCD', formData.cd);

  // 10. DEFENSES / RESISTANCES / IMMUNITIES
  const defenseList = [];
  allMods.forEach(m => {
    if (m.type === 'resistance') defenseList.push(`Resistencia: ${m.friendlySubtypeName || m.subType}`);
    if (m.type === 'immunity') defenseList.push(`Inmunidad: ${m.friendlySubtypeName || m.subType}`);
    if (m.type === 'vulnerability') defenseList.push(`Vulnerabilidad: ${m.friendlySubtypeName || m.subType}`);
  });
  formData.defenses = defenseList.length > 0 ? defenseList.join('\n') : '';
  setVal('combatDefenses', formData.defenses);

  // 11. WEAPONS & ATTACKS
  if (data.inventory) {
    const getCustomName = (itemId) => {
      if (!data.characterValues) return null;
      const custom = data.characterValues.find(cv => String(cv.valueId) === String(itemId) && cv.typeId === 8);
      return custom ? custom.value : null;
    };

    const isMonk = data.classes && data.classes.some(c => c.definition.name.toLowerCase() === 'monk');
    const monkLevel = isMonk ? data.classes.find(c => c.definition.name.toLowerCase() === 'monk').level : 0;
    // Monk martial arts die: 1-4: 1d4, 5-10: 1d6 (or 1d8 in 2024), 11-16: 1d8, 17-20: 1d10
    const monkDie = monkLevel >= 17 ? '1d10' : (monkLevel >= 11 ? '1d8' : (monkLevel >= 5 ? '1d6' : '1d4'));

    const equippedWeapons = data.inventory.filter(i => i.definition.filterType === 'Weapon' && i.equipped);
    equippedWeapons.slice(0, 5).forEach((w, index) => {
      formData.weapons[index].name = getCustomName(w.id) || w.definition.name;
      setVal(`w${index+1}Name`, formData.weapons[index].name);

      const props = w.definition.properties ? w.definition.properties.map(p => p.name) : [];
      const isFinesse = props.includes('Finesse');
      const isRanged = props.includes('Ammunition') || props.includes('Range') || w.definition.attackType === 2;
      const isSimple = w.definition.type === 'Simple' || (w.definition.categories && w.definition.categories.includes('Simple'));
      const isMonkWeapon = isMonk && (isSimple || w.definition.name.toLowerCase().includes('shortsword'));

      // Determine ability modifier
      let abilityMod = statMods.str;
      if (isRanged) abilityMod = statMods.dex;
      else if (isFinesse || isMonkWeapon) abilityMod = Math.max(statMods.str, statMods.dex);

      // Check weapon magic bonus
      let magicBonus = 0;
      if (w.definition.grantedModifiers) {
        w.definition.grantedModifiers.forEach(m => {
          if (m.type === 'bonus' && m.subType === 'magic') magicBonus += (m.value || 0);
        });
      }

      // Global attack bonuses
      let globalAtkBonus = 0;
      allMods.forEach(m => {
        if (m.type === 'bonus' && (m.subType === 'weapon-attacks' || (isRanged ? m.subType === 'ranged-weapon-attacks' : m.subType === 'melee-weapon-attacks'))) {
          globalAtkBonus += (m.value || 0);
        }
      });

      const totalAtk = abilityMod + profBonus + magicBonus + globalAtkBonus;
      formData.weapons[index].atk = totalAtk >= 0 ? `+${totalAtk}` : String(totalAtk);
      setVal(`w${index+1}Atk`, formData.weapons[index].atk);

      // Damage calculation
      let dmgDice = w.definition.damage ? w.definition.damage.diceString : monkDie;
      let globalDmgBonus = 0;
      allMods.forEach(m => {
        if (m.type === 'bonus' && (m.subType === 'weapon-damage' || (isRanged ? m.subType === 'ranged-weapon-damage' : m.subType === 'melee-weapon-damage'))) {
          globalDmgBonus += (m.value || 0);
        }
      });

      const totalDmgBonus = abilityMod + magicBonus + globalDmgBonus;
      formData.weapons[index].dmg = `${dmgDice}${totalDmgBonus >= 0 ? '+' + totalDmgBonus : totalDmgBonus}`;
      setVal(`w${index+1}Dmg`, formData.weapons[index].dmg);

      const rawType = w.definition.damageType || '';
      formData.weapons[index].type = damageTypeTranslations[rawType] || rawType;
      setVal(`w${index+1}Type`, formData.weapons[index].type);

      formData.weapons[index].notes = props.join(', ');
      setVal(`w${index+1}Notes`, formData.weapons[index].notes);
    });
  }

  // 12. ROLEO: AVATAR / PORTRAIT
  if (data.decorations) {
    formData.portraitUrl = data.decorations.avatarUrl || 
      (data.decorations.defaultBackdrop && data.decorations.defaultBackdrop.backdropAvatarUrl) || '';
    const urlInp = document.getElementById('portraitUrlInput');
    if (urlInp) urlInp.value = formData.portraitUrl;
  }

  // 13. ROLEO: SKILLS & EXPERTISE (Considers proficiencies, expertises, and item bonuses)
  const ddbSkillSubtypes = {
    acrobatics: 'acrobatics',
    animalHandling: 'animal-handling',
    arcana: 'arcana',
    athletics: 'athletics',
    deception: 'deception',
    history: 'history',
    insight: 'insight',
    intimidation: 'intimidation',
    investigation: 'investigation',
    medicine: 'medicine',
    nature: 'nature',
    perception: 'perception',
    performance: 'performance',
    persuasion: 'persuasion',
    religion: 'religion',
    sleightOfHand: 'sleight-of-hand',
    stealth: 'stealth',
    survival: 'survival'
  };

  SKILLS_DEF.forEach(s => {
    const subtype = ddbSkillSubtypes[s.id];
    const isProf = allMods.some(m => m.type === 'proficiency' && m.subType === subtype);
    const isExpertise = allMods.some(m => m.type === 'expertise' && m.subType === subtype);

    let specSkillBonus = 0;
    allMods.forEach(m => {
      if (m.type === 'bonus' && m.subType === subtype) {
        specSkillBonus += (m.value || 0);
      }
    });

    const abilityMod = statMods[s.stat] || 0;
    const profMult = isExpertise ? 2 : (isProf ? 1 : 0);
    const finalSkillBonus = abilityMod + (profMult * profBonus) + specSkillBonus;
    const bonusStr = finalSkillBonus >= 0 ? `+${finalSkillBonus}` : `${finalSkillBonus}`;

    formData.skills[s.id] = { prof: isProf || isExpertise, val: bonusStr };
    
    const chk = document.getElementById(`sk-${s.id}`);
    if (chk) chk.checked = isProf || isExpertise;
    const valInp = document.getElementById(`skval-${s.id}`);
    if (valInp) valInp.value = bonusStr;
  });

  // 14. ROLEO: PASSIVE PERCEPTION, INVESTIGATION & INSIGHT
  let passivePercBonus = 0;
  let passiveInvBonus = 0;
  let passiveInsBonus = 0;

  allMods.forEach(m => {
    if (m.type === 'bonus' && m.subType === 'passive-perception') passivePercBonus += (m.value || 0);
    if (m.type === 'bonus' && m.subType === 'passive-investigation') passiveInvBonus += (m.value || 0);
    if (m.type === 'bonus' && m.subType === 'passive-insight') passiveInsBonus += (m.value || 0);
  });

  const percVal = parseInt(formData.skills.perception?.val || '0', 10);
  const invVal = parseInt(formData.skills.investigation?.val || '0', 10);
  const insVal = parseInt(formData.skills.insight?.val || '0', 10);

  formData.passives.perception = String(10 + (isNaN(percVal) ? 0 : percVal) + passivePercBonus);
  formData.passives.investigation = String(10 + (isNaN(invVal) ? 0 : invVal) + passiveInvBonus);
  formData.passives.insight = String(10 + (isNaN(insVal) ? 0 : insVal) + passiveInsBonus);

  setVal('passivePerception', formData.passives.perception);
  setVal('passiveInvestigation', formData.passives.investigation);
  setVal('passiveInsight', formData.passives.insight);

  // 15. ROLEO: INSPIRATION
  formData.inspiration = !!data.inspiration;
  const inspChk = document.getElementById('chk-roleo-inspiration');
  if (inspChk) inspChk.checked = formData.inspiration;

  // 16. ROLEO: LANGUAGES & OTHER PROFICIENCIES
  const languages = [];
  const otherProfs = [];
  allMods.forEach(m => {
    if (m.type === 'language') {
      const name = m.friendlySubtypeName || m.subType;
      if (name && !languages.includes(name)) languages.push(name);
    }
    if (m.type === 'proficiency' && !m.subType.includes('-saving-throws') && !Object.values(ddbSkillSubtypes).includes(m.subType)) {
      const name = m.friendlySubtypeName || m.subType;
      if (name && !otherProfs.includes(name) && !name.toLowerCase().includes('choose')) {
        otherProfs.push(name);
      }
    }
  });

  formData.otherProficiencies = [
    languages.length > 0 ? `Idiomas: ${languages.join(', ')}` : '',
    otherProfs.length > 0 ? `Competencias: ${otherProfs.join(', ')}` : ''
  ].filter(Boolean).join('\n');
  setVal('otherProficiencies', formData.otherProficiencies);

  // 17. ROLEO: TRAITS & FEATURES
  const traits = [];
  if (data.traits && data.traits.personalityTraits) traits.push(`Rasgos: ${data.traits.personalityTraits}`);
  if (data.ideals) traits.push(`Ideales: ${data.ideals}`);
  if (data.bonds) traits.push(`Vínculos: ${data.bonds}`);
  if (data.flaws) traits.push(`Defectos: ${data.flaws}`);
  formData.otherTraits = traits.filter(Boolean).join('\n');
  setVal('otherTraits', formData.otherTraits);

  updatePreview();
  alert("¡Personaje importado con éxito con todos los bonos y valores finales calculados!");
}

// =========================================
// CALIBRATION MODE
// =========================================
function toggleCalibration() {
  calibrationMode = !calibrationMode;
  document.body.classList.toggle('calibration-mode', calibrationMode);

  const btn = document.getElementById('calibrateBtn');
  const panel = document.getElementById('calibrationPanel');

  if (calibrationMode) {
    btn.innerHTML = '<span class="btn-icon">✅</span> Salir Calibración';
    panel.style.display = 'block';
    enableDragging();
    updatePreview();
  } else {
    btn.innerHTML = '<span class="btn-icon">🎯</span> Calibrar Posiciones';
    panel.style.display = 'none';
    disableDragging();
    selectedOverlayId = null;
    updateCalibrationInfo();
    updatePreview();
  }
}

function enableDragging() {
  const allOverlays = document.querySelectorAll('.overlay-text');
  allOverlays.forEach(el => {
    el.addEventListener('mousedown', onOverlayMouseDown);
    el.addEventListener('touchstart', onOverlayTouchStart, { passive: false });
  });
  document.addEventListener('mousemove', onDocMouseMove);
  document.addEventListener('mouseup', onDocMouseUp);
  document.addEventListener('touchmove', onDocTouchMove, { passive: false });
  document.addEventListener('touchend', onDocTouchEnd);
}

function disableDragging() {
  const allOverlays = document.querySelectorAll('.overlay-text');
  allOverlays.forEach(el => {
    el.removeEventListener('mousedown', onOverlayMouseDown);
    el.removeEventListener('touchstart', onOverlayTouchStart);
    el.classList.remove('cal-selected');
  });
  document.removeEventListener('mousemove', onDocMouseMove);
  document.removeEventListener('mouseup', onDocMouseUp);
  document.removeEventListener('touchmove', onDocTouchMove);
  document.removeEventListener('touchend', onDocTouchEnd);
}

function onOverlayMouseDown(e) {
  e.preventDefault();
  startDrag(e.target.closest('.overlay-text'), e.clientX, e.clientY);
}

function onOverlayTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  startDrag(e.target.closest('.overlay-text'), touch.clientX, touch.clientY);
}

function startDrag(el, clientX, clientY) {
  if (!calibrationMode || !el) return;
  isDragging = true;

  document.querySelectorAll('.overlay-text').forEach(o => o.classList.remove('cal-selected'));
  el.classList.add('cal-selected');
  selectedOverlayId = el.id;

  dragStartX = clientX;
  dragStartY = clientY;
  overlayStartXPct = parseFloat(el.style.left) || 0;
  overlayStartYPct = parseFloat(el.style.top) || 0;

  updateCalibrationInfo();
}

function onDocMouseMove(e) {
  if (!isDragging) return;
  moveDrag(e.clientX, e.clientY);
}

function onDocTouchMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  moveDrag(e.touches[0].clientX, e.touches[0].clientY);
}

function moveDrag(clientX, clientY) {
  const wrapper = document.getElementById('previewWrapper');
  const rect = wrapper.getBoundingClientRect();
  const el = document.getElementById(selectedOverlayId);
  if (!el) return;

  const dx = clientX - dragStartX;
  const dy = clientY - dragStartY;

  const newXPct = overlayStartXPct + (dx / rect.width) * 100;
  const newYPct = overlayStartYPct + (dy / rect.height) * 100;

  const clampedX = Math.max(0, Math.min(95, newXPct));
  const clampedY = Math.max(0, Math.min(95, newYPct));

  el.style.left = clampedX + '%';
  el.style.top = clampedY + '%';

  const info = OVERLAY_MAP[selectedOverlayId];
  if (info) {
    const pos = getByPath(POSITIONS, info.path);
    if (pos) {
      pos.xPct = Math.round(clampedX * 10) / 10;
      pos.yPct = Math.round(clampedY * 10) / 10;
    }
  }

  updateCalibrationInfo();
}

function onDocMouseUp() { isDragging = false; }
function onDocTouchEnd() { isDragging = false; }

function adjustFontSize(delta) {
  if (!selectedOverlayId) return;
  const info = OVERLAY_MAP[selectedOverlayId];
  if (!info) return;

  const pos = getByPath(POSITIONS, info.path);
  if (pos) {
    pos.fontPct = Math.max(0.3, Math.round((pos.fontPct + delta) * 10) / 10);
    applyOverlayPositions();
    updateCalibrationInfo();
  }
}

function updateCalibrationInfo() {
  const infoEl = document.getElementById('calInfo');
  const controlsEl = document.getElementById('calControls');

  if (!selectedOverlayId || !calibrationMode) {
    infoEl.textContent = 'Hacé click en un texto para seleccionarlo';
    controlsEl.style.display = 'none';
    return;
  }

  const info = OVERLAY_MAP[selectedOverlayId];
  const pos = getByPath(POSITIONS, info.path);
  if (pos) {
    infoEl.innerHTML = `<strong>${info.label}</strong><br>X: ${pos.xPct.toFixed(1)}% — Y: ${pos.yPct.toFixed(1)}%<br>Tamaño: ${pos.fontPct.toFixed(1)}%`;
    controlsEl.style.display = 'flex';
  }
}

function saveCalibration() {
  savePositions();
  const btn = document.getElementById('calSaveBtn');
  const original = btn.textContent;
  btn.textContent = '✅ ¡Guardado!';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
}

function resetCalibration() {
  POSITIONS = JSON.parse(JSON.stringify(DEFAULT_POSITIONS));
  localStorage.removeItem('dnd_sheet_positions');
  applyOverlayPositions();
  updateCalibrationInfo();
}

window.adjustFontSize = adjustFontSize;
window.saveCalibration = saveCalibration;
window.resetCalibration = resetCalibration;

// =========================================
// Random Data Generation
// =========================================
const RANDOM_NAMES = ['Arthas el Valiente', 'Lyra Sombraluna', 'Thorin Martillopiedra', 'Seraphina Llama Eterna', 'Kaelen Sombraforja'];
function roll4d6DropLowest() {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}
function calcModifier(value) {
  const mod = Math.floor((value - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function generateRandom() {
  const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  formData.name = name; 
  document.querySelectorAll('#charName').forEach(el => el.value = name);

  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const profBonus = Math.floor(Math.random() * 4) + 2;
  formData.profBonus = `+${profBonus}`;
  const profEl = document.getElementById('profBonus');
  if (profEl) profEl.value = formData.profBonus;

  const proficientSaves = [...statKeys].sort(() => Math.random() - 0.5).slice(0, 2);

  for (const stat of statKeys) {
    const value = roll4d6DropLowest();
    const mod = Math.floor((value - 10) / 2);
    const modStr = calcModifier(value);
    const saveVal = proficientSaves.includes(stat) ? mod + profBonus : mod;
    const saveStr = saveVal >= 0 ? `+${saveVal}` : `${saveVal}`;

    formData[stat].value = String(value); formData[stat].mod = modStr; formData[stat].save = saveStr;
    const vEl = document.getElementById(`${stat}Value`); if (vEl) vEl.value = String(value);
    const mEl = document.getElementById(`${stat}Mod`); if (mEl) mEl.value = modStr;
    const sEl = document.getElementById(`${stat}Save`); if (sEl) sEl.value = saveStr;
  }
  
  // Random Weapons
  const sampleWeapons = [
    { name: 'Espada Larga', atk: '+5', dmg: '1d8+3', type: 'Cortante', notes: 'Versátil' },
    { name: 'Arco Largo', atk: '+4', dmg: '1d8+2', type: 'Perforante', notes: '150/600 ft' },
  ];
  for (let i = 0; i < 2; i++) {
    Object.assign(formData.weapons[i], sampleWeapons[i]);
    const wName = document.getElementById(`w${i+1}Name`); if (wName) wName.value = sampleWeapons[i].name;
    const wAtk = document.getElementById(`w${i+1}Atk`); if (wAtk) wAtk.value = sampleWeapons[i].atk;
    const wDmg = document.getElementById(`w${i+1}Dmg`); if (wDmg) wDmg.value = sampleWeapons[i].dmg;
    const wType = document.getElementById(`w${i+1}Type`); if (wType) wType.value = sampleWeapons[i].type;
    const wNotes = document.getElementById(`w${i+1}Notes`); if (wNotes) wNotes.value = sampleWeapons[i].notes;
  }

  updatePreview();
  const btn = document.getElementById('randomBtn');
  btn.classList.add('rolling');
  setTimeout(() => btn.classList.remove('rolling'), 600);
}

// =========================================
// PDF Export
// =========================================
async function exportPDF() {
  const btn = document.getElementById('exportBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Generando...';
  btn.disabled = true;

  try {
    const templateImg = await loadImage('/Hoja_modelo.jpg');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Draw background sheet
    pdf.addImage(templateImg, 'JPEG', 0, 0, PDF_WIDTH, PDF_HEIGHT);
    
    // Draw portrait in gothic arch frame if enabled
    if (formData.toggles.roleoPortrait && formData.portraitUrl) {
      try {
        const portraitImg = await loadImage(formData.portraitUrl);
        const pPos = POSITIONS.portrait || DEFAULT_POSITIONS.portrait;
        const pX = (pPos.xPct / 100) * PDF_WIDTH;
        const pY = (pPos.yPct / 100) * PDF_HEIGHT;
        const pW = (pPos.widthPct / 100) * PDF_WIDTH;
        const pH = (pPos.heightPct / 100) * PDF_HEIGHT;
        pdf.addImage(portraitImg, 'JPEG', pX, pY, pW, pH);
      } catch (err) {
        console.warn('No se pudo renderizar la imagen del retrato en el PDF:', err);
      }
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 21, 16);

    const toX = (pct) => (pct / 100) * PDF_WIDTH;
    const toY = (pct) => (pct / 100) * PDF_HEIGHT;
    const toFontSize = (pct) => (pct / 100) * (PDF_WIDTH * 72 / 25.4);

    const drawText = (text, pos) => {
      if (text && pos) {
        pdf.setFontSize(toFontSize(pos.fontPct));
        if (text.includes('\n')) {
          pdf.text(text.split('\n'), toX(pos.xPct), toY(pos.yPct), { align: 'left', baseline: 'top' });
        } else {
          pdf.text(text.toString(), toX(pos.xPct), toY(pos.yPct), { align: 'left', baseline: 'top' });
        }
      }
    };

    // Roleo: Name
    if (formData.toggles.roleoName && formData.name) {
      drawText(formData.name.toUpperCase(), POSITIONS.name);
    }

    // Combate: Identity
    if (formData.toggles.combateIdentity) {
      drawText(formData.level, POSITIONS.level);
      drawText(formData.class, POSITIONS.class);
      drawText(formData.species, POSITIONS.species);
    }
    
    // Combate: Metrics
    if (formData.toggles.combateMetrics) {
      drawText(formData.init, POSITIONS.init);
      drawText(formData.cd, POSITIONS.cd);
      drawText(formData.speed, POSITIONS.speed);
      drawText(formData.hp, POSITIONS.hp);
      drawText(formData.ac, POSITIONS.ac);
      drawText(formData.defenses, POSITIONS.defenses);
    }

    // Roleo: Stats
    if (formData.toggles.roleoStats) {
      const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      for (const stat of statKeys) {
        const pos = POSITIONS.stats[stat];
        drawText(formData[stat].value, pos.value);
        drawText(formData[stat].mod, pos.mod);
        drawText(formData[stat].save, pos.save);
      }
    }

    // Combate: Weapons
    if (formData.toggles.combateWeapons) {
      for (let i = 0; i < 5; i++) {
        const wPos = POSITIONS.weapons[i];
        const wData = formData.weapons[i];
        drawText(wData.name, wPos.name);
        drawText(wData.atk, wPos.atk);
        drawText(wData.dmg, wPos.dmg);
        drawText(wData.type, wPos.type);
        drawText(wData.notes, wPos.notes);
      }
    }

    const fileName = formData.name ? `${formData.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_')}_DnD.pdf` : 'Hoja_Personaje_DnD.pdf';
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error al generar el PDF. Asegúrate de que la imagen de la hoja modelo esté disponible.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Initial setup
setupListeners();
applyOverlayPositions();
updatePreview();
