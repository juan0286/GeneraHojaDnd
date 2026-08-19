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

// Load saved positions from localStorage, or use defaults
function loadPositions() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_POSITIONS));
  try {
    const saved = localStorage.getItem('dnd_sheet_positions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Deep merge to ensure new fields are added even if old config exists
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
  ]
};

// Calibration state
let calibrationMode = false;
let selectedOverlayId = null;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let overlayStartXPct = 0, overlayStartYPct = 0;

// =========================================
// DOM References
// =========================================
const inputs = {
  name: document.getElementById('charName'),
  level: document.getElementById('charLevel'),
  class: document.getElementById('charClass'),
  species: document.getElementById('charSpecies'),
  init: document.getElementById('combatInit'),
  cd: document.getElementById('combatCD'),
  speed: document.getElementById('combatSpeed'),
  hp: document.getElementById('combatHP'),
  ac: document.getElementById('combatAC'),
  defenses: document.getElementById('combatDefenses'),
  
  strValue: document.getElementById('strValue'), strMod: document.getElementById('strMod'), strSave: document.getElementById('strSave'),
  dexValue: document.getElementById('dexValue'), dexMod: document.getElementById('dexMod'), dexSave: document.getElementById('dexSave'),
  conValue: document.getElementById('conValue'), conMod: document.getElementById('conMod'), conSave: document.getElementById('conSave'),
  intValue: document.getElementById('intValue'), intMod: document.getElementById('intMod'), intSave: document.getElementById('intSave'),
  wisValue: document.getElementById('wisValue'), wisMod: document.getElementById('wisMod'), wisSave: document.getElementById('wisSave'),
  chaValue: document.getElementById('chaValue'), chaMod: document.getElementById('chaMod'), chaSave: document.getElementById('chaSave'),
  
  w1Name: document.getElementById('w1Name'), w1Atk: document.getElementById('w1Atk'), w1Dmg: document.getElementById('w1Dmg'), w1Type: document.getElementById('w1Type'), w1Notes: document.getElementById('w1Notes'),
  w2Name: document.getElementById('w2Name'), w2Atk: document.getElementById('w2Atk'), w2Dmg: document.getElementById('w2Dmg'), w2Type: document.getElementById('w2Type'), w2Notes: document.getElementById('w2Notes'),
  w3Name: document.getElementById('w3Name'), w3Atk: document.getElementById('w3Atk'), w3Dmg: document.getElementById('w3Dmg'), w3Type: document.getElementById('w3Type'), w3Notes: document.getElementById('w3Notes'),
  w4Name: document.getElementById('w4Name'), w4Atk: document.getElementById('w4Atk'), w4Dmg: document.getElementById('w4Dmg'), w4Type: document.getElementById('w4Type'), w4Notes: document.getElementById('w4Notes'),
  w5Name: document.getElementById('w5Name'), w5Atk: document.getElementById('w5Atk'), w5Dmg: document.getElementById('w5Dmg'), w5Type: document.getElementById('w5Type'), w5Notes: document.getElementById('w5Notes'),
};

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
  document.getElementById('overlay-name').textContent = formData.name || (calibrationMode ? 'NOMBRE DEL PJ' : '');
  document.getElementById('overlay-level').textContent = formData.level || (calibrationMode ? 'Lvl' : '');
  document.getElementById('overlay-class').textContent = formData.class || (calibrationMode ? 'Clase' : '');
  document.getElementById('overlay-species').textContent = formData.species || (calibrationMode ? 'Especie' : '');
  
  document.getElementById('overlay-init').textContent = formData.init || (calibrationMode ? '+0' : '');
  document.getElementById('overlay-cd').textContent = formData.cd || (calibrationMode ? '10' : '');
  document.getElementById('overlay-speed').textContent = formData.speed || (calibrationMode ? '30' : '');
  document.getElementById('overlay-hp').textContent = formData.hp || (calibrationMode ? '10/10' : '');
  document.getElementById('overlay-ac').textContent = formData.ac || (calibrationMode ? '10' : '');
  document.getElementById('overlay-defenses').textContent = formData.defenses || (calibrationMode ? 'Defensas...' : '');

  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of statKeys) {
    document.getElementById(`overlay-${stat}-val`).textContent = formData[stat].value || (calibrationMode ? '10' : '');
    document.getElementById(`overlay-${stat}-mod`).textContent = formData[stat].mod   || (calibrationMode ? '+0' : '');
    document.getElementById(`overlay-${stat}-save`).textContent = formData[stat].save || (calibrationMode ? '+0' : '');
  }

  for (let i = 0; i < 5; i++) {
    const idx = i + 1;
    document.getElementById(`overlay-w${idx}-name`).textContent = formData.weapons[i].name || (calibrationMode ? 'Arma' : '');
    document.getElementById(`overlay-w${idx}-atk`).textContent = formData.weapons[i].atk || (calibrationMode ? '+0' : '');
    document.getElementById(`overlay-w${idx}-dmg`).textContent = formData.weapons[i].dmg || (calibrationMode ? '1d8' : '');
    document.getElementById(`overlay-w${idx}-type`).textContent = formData.weapons[i].type || (calibrationMode ? 'Crt' : '');
    document.getElementById(`overlay-w${idx}-notes`).textContent = formData.weapons[i].notes || (calibrationMode ? 'Notas' : '');
  }
}

// =========================================
// Input Event Listeners
// =========================================
function setupListeners() {
  const simpleFields = ['name', 'level', 'class', 'species', 'init', 'cd', 'speed', 'hp', 'ac', 'defenses'];
  simpleFields.forEach(field => {
    if (inputs[field]) {
      inputs[field].addEventListener('input', (e) => {
        formData[field] = e.target.value;
        updatePreview();
      });
    }
  });

  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of statKeys) {
    inputs[`${stat}Value`].addEventListener('input', (e) => { formData[stat].value = e.target.value; updatePreview(); });
    inputs[`${stat}Mod`].addEventListener('input', (e) => { formData[stat].mod = e.target.value; updatePreview(); });
    inputs[`${stat}Save`].addEventListener('input', (e) => { formData[stat].save = e.target.value; updatePreview(); });
  }

  for (let i = 0; i < 5; i++) {
    const idx = i + 1;
    ['Name', 'Atk', 'Dmg', 'Type', 'Notes'].forEach(sub => {
      const el = inputs[`w${idx}${sub}`];
      if (el) {
        el.addEventListener('input', (e) => {
          formData.weapons[i][sub.toLowerCase()] = e.target.value;
          updatePreview();
        });
      }
    });
  }

  document.getElementById('exportBtn').addEventListener('click', exportPDF);
  document.getElementById('randomBtn').addEventListener('click', generateRandom);
  document.getElementById('calibrateBtn').addEventListener('click', toggleCalibration);
  
  // JSON Import
  document.getElementById('importJsonBtn').addEventListener('click', () => {
    document.getElementById('jsonFileInput').click();
  });
  document.getElementById('jsonFileInput').addEventListener('change', importJsonFile);
}

// =========================================
// JSON Import Logic
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
      alert('Error al parsear el archivo JSON. Asegurate de que sea un archivo válido de D&D Beyond.');
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

  // Name
  formData.name = data.name || '';
  inputs.name.value = formData.name;

  // Level & Class
  if (data.classes && data.classes.length > 0) {
    const totalLevel = data.classes.reduce((sum, cls) => sum + cls.level, 0);
    formData.level = String(totalLevel);
    inputs.level.value = formData.level;

    formData.class = data.classes.map(cls => `${cls.definition.name} ${cls.level}`).join(' / ');
    inputs.class.value = formData.class;
  }

  // Species
  formData.species = data.race ? data.race.fullName || data.race.baseName : '';
  inputs.species.value = formData.species;

  // HP
  formData.hp = String(data.baseHitPoints || '');
  inputs.hp.value = formData.hp;

  // Stats calculation
  const getModifier = (val) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const statMap = { 1: 'str', 2: 'dex', 3: 'con', 4: 'int', 5: 'wis', 6: 'cha' };
  
  const statValues = { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10 };
  if (data.stats) {
    data.stats.forEach(s => statValues[s.id] = s.value);
  }

  if (data.modifiers && data.modifiers.race) {
    data.modifiers.race.forEach(mod => {
      if (mod.type === 'bonus' && mod.subType.includes('-score')) {
        const mapToId = { 'strength-score': 1, 'dexterity-score': 2, 'constitution-score': 3, 'intelligence-score': 4, 'wisdom-score': 5, 'charisma-score': 6 };
        const id = mapToId[mod.subType];
        if (id) statValues[id] += mod.value;
      }
    });
  }

  const profBonus = Math.ceil(Number(formData.level) / 4) + 1;
  
  const saveProfs = [];
  if (data.modifiers && data.modifiers.class) {
    data.modifiers.class.forEach(mod => {
      if (mod.type === 'proficiency' && mod.subType.includes('-saving-throws')) {
        const mapToStat = { 'strength-saving-throws': 'str', 'dexterity-saving-throws': 'dex', 'constitution-saving-throws': 'con', 'intelligence-saving-throws': 'int', 'wisdom-saving-throws': 'wis', 'charisma-saving-throws': 'cha' };
        if (mapToStat[mod.subType]) saveProfs.push(mapToStat[mod.subType]);
      }
    });
  }

  Object.entries(statMap).forEach(([id, statName]) => {
    const totalVal = statValues[id];
    const mod = Math.floor((totalVal - 10) / 2);
    
    formData[statName].value = String(totalVal);
    inputs[`${statName}Value`].value = String(totalVal);
    
    formData[statName].mod = getModifier(totalVal);
    inputs[`${statName}Mod`].value = formData[statName].mod;

    const saveVal = saveProfs.includes(statName) ? mod + profBonus : mod;
    formData[statName].save = saveVal >= 0 ? `+${saveVal}` : String(saveVal);
    inputs[`${statName}Save`].value = formData[statName].save;
  });

  // Combat stats
  const dexMod = Math.floor((statValues[2] - 10) / 2);
  formData.init = dexMod >= 0 ? `+${dexMod}` : String(dexMod);
  inputs.init.value = formData.init;

  // Unarmored Defense for Monk (10 + dex + wis) - very basic parsing
  const wisMod = Math.floor((statValues[5] - 10) / 2);
  let ac = 10 + dexMod + wisMod;
  
  if (data.inventory) {
    data.inventory.forEach(inv => {
      if (inv.equipped && inv.definition && inv.definition.grantedModifiers) {
        inv.definition.grantedModifiers.forEach(m => {
          if (m.subType === 'armor-class') ac += m.value;
        });
      }
    });
  }
  formData.ac = String(ac);
  inputs.ac.value = formData.ac;

  // Speed
  let speed = data.race && data.race.weightSpeeds ? data.race.weightSpeeds.normal.walk : 30;
  if (data.modifiers && data.modifiers.class) {
    data.modifiers.class.forEach(m => {
      if (m.type === 'bonus' && m.subType === 'unarmored-movement') speed += m.value;
    });
  }
  if (data.modifiers && data.modifiers.feat) {
     data.modifiers.feat.forEach(m => {
      if (m.type === 'bonus' && m.subType === 'speed') speed += m.value;
    });
  }
  formData.speed = speed + ' ft';
  inputs.speed.value = formData.speed;

  // Weapons
  if (data.inventory) {
    // Helper to find custom names set by the user in D&D Beyond
    const getCustomName = (itemId) => {
      if (!data.characterValues) return null;
      // typeId: 8 usually represents a custom name override
      const custom = data.characterValues.find(cv => String(cv.valueId) === String(itemId) && cv.typeId === 8);
      return custom ? custom.value : null;
    };

    const weapons = data.inventory.filter(i => i.definition.filterType === 'Weapon' && i.equipped);
    weapons.slice(0, 5).forEach((w, index) => {
      formData.weapons[index].name = getCustomName(w.id) || w.definition.name;
      inputs[`w${index+1}Name`].value = formData.weapons[index].name;

      let atkBonus = dexMod + profBonus;
      let magicBonus = 0;
      if (w.definition.grantedModifiers) {
        w.definition.grantedModifiers.forEach(m => {
          if (m.subType === 'magic') magicBonus += m.value;
        });
      }
      atkBonus += magicBonus;
      formData.weapons[index].atk = atkBonus >= 0 ? `+${atkBonus}` : String(atkBonus);
      inputs[`w${index+1}Atk`].value = formData.weapons[index].atk;

      if (w.definition.damage) {
         formData.weapons[index].dmg = w.definition.damage.diceString + (magicBonus ? `+${magicBonus}` : '');
         inputs[`w${index+1}Dmg`].value = formData.weapons[index].dmg;
      }
      formData.weapons[index].type = w.definition.damageType || '';
      inputs[`w${index+1}Type`].value = formData.weapons[index].type;
      
      const props = w.definition.properties ? w.definition.properties.map(p => p.name).join(', ') : '';
      formData.weapons[index].notes = props;
      inputs[`w${index+1}Notes`].value = formData.weapons[index].notes;
    });
  }

  updatePreview();
  alert("¡Personaje importado con éxito!");
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
    updatePreview(); // show placeholders
  } else {
    btn.innerHTML = '<span class="btn-icon">🎯</span> Calibrar Posiciones';
    panel.style.display = 'none';
    disableDragging();
    selectedOverlayId = null;
    updateCalibrationInfo();
    updatePreview(); // remove placeholders
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
const RANDOM_NAMES = ['Arthas el Valiente', 'Lyra Sombraluna', 'Thorin Martillopiedra', 'Seraphina Llama Eterna'];
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
  formData.name = name; inputs.name.value = name;

  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const profBonus = Math.floor(Math.random() * 5) + 2;
  const proficientSaves = [...statKeys].sort(() => Math.random() - 0.5).slice(0, 2);

  for (const stat of statKeys) {
    const value = roll4d6DropLowest();
    const mod = Math.floor((value - 10) / 2);
    const modStr = calcModifier(value);
    const saveVal = proficientSaves.includes(stat) ? mod + profBonus : mod;
    const saveStr = saveVal >= 0 ? `+${saveVal}` : `${saveVal}`;

    formData[stat].value = String(value); formData[stat].mod = modStr; formData[stat].save = saveStr;
    inputs[`${stat}Value`].value = String(value); inputs[`${stat}Mod`].value = modStr; inputs[`${stat}Save`].value = saveStr;
  }
  
  // Also random fill some simple fields
  const sampleWeapons = [
    { name: 'Espada Larga', atk: '+5', dmg: '1d8+3', type: 'Cortante', notes: 'Versátil' },
    { name: 'Arco Largo', atk: '+4', dmg: '1d8+2', type: 'Perforante', notes: '150/600 ft' },
  ];
  for (let i = 0; i < 2; i++) {
    Object.assign(formData.weapons[i], sampleWeapons[i]);
    inputs[`w${i+1}Name`].value = sampleWeapons[i].name;
    inputs[`w${i+1}Atk`].value = sampleWeapons[i].atk;
    inputs[`w${i+1}Dmg`].value = sampleWeapons[i].dmg;
    inputs[`w${i+1}Type`].value = sampleWeapons[i].type;
    inputs[`w${i+1}Notes`].value = sampleWeapons[i].notes;
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

    pdf.addImage(templateImg, 'JPEG', 0, 0, PDF_WIDTH, PDF_HEIGHT);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 21, 16);

    const toX = (pct) => (pct / 100) * PDF_WIDTH;
    const toY = (pct) => (pct / 100) * PDF_HEIGHT;
    const toFontSize = (pct) => (pct / 100) * (PDF_WIDTH * 72 / 25.4);

    const drawText = (text, pos) => {
      if (text && pos) {
        pdf.setFontSize(toFontSize(pos.fontPct));
        // Multi-line support for defenses
        if (text.includes('\n')) {
          pdf.text(text.split('\n'), toX(pos.xPct), toY(pos.yPct), { align: 'left', baseline: 'top' });
        } else {
          pdf.text(text.toString(), toX(pos.xPct), toY(pos.yPct), { align: 'left', baseline: 'top' });
        }
      }
    };

    drawText(formData.name ? formData.name.toUpperCase() : '', POSITIONS.name);
    drawText(formData.level, POSITIONS.level);
    drawText(formData.class, POSITIONS.class);
    drawText(formData.species, POSITIONS.species);
    
    drawText(formData.init, POSITIONS.init);
    drawText(formData.cd, POSITIONS.cd);
    drawText(formData.speed, POSITIONS.speed);
    drawText(formData.hp, POSITIONS.hp);
    drawText(formData.ac, POSITIONS.ac);
    drawText(formData.defenses, POSITIONS.defenses);

    const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    for (const stat of statKeys) {
      const pos = POSITIONS.stats[stat];
      drawText(formData[stat].value, pos.value);
      drawText(formData[stat].mod, pos.mod);
      drawText(formData[stat].save, pos.save);
    }

    for (let i = 0; i < 5; i++) {
      const wPos = POSITIONS.weapons[i];
      const wData = formData.weapons[i];
      drawText(wData.name, wPos.name);
      drawText(wData.atk, wPos.atk);
      drawText(wData.dmg, wPos.dmg);
      drawText(wData.type, wPos.type);
      drawText(wData.notes, wPos.notes);
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

setupListeners();
updatePreview();
