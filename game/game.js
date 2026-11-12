
"use strict";

/* =========================================
   MERGE WORLDS — GAME.JS
========================================= */

const SAVE_KEY = "merge_worlds_save_v3";

const BOARD_SIZE = 9;
const SUMMON_COST = 10;
const ANTI_SUMMON_COST = 1;

const PASSIVE_SKINT_PER_MINUTE = 10;

/* =========================================
   ПРЕДМЕТЫ
========================================= */

const items = {
  ice_scale: {
    name: "Осколок ледяной чешуи",
    icon: "❄️"
  },
  dim_crystal: {
    name: "Тусклый кристалл",
    icon: "💎"
  },
  rune_cloth: {
    name: "Кусок ткани с рунами",
    icon: "🧵"
  },
  key_core: {
    name: "Основа ключа",
    icon: "🔑"
  },
  key: {
    name: "Ключ Расшифровки",
    icon: "🗝️"
  },

  stone_fragment: {
    name: "Каменный осколок",
    icon: "🪨"
  },
  glowing_dust: {
    name: "Светящаяся пыль",
    icon: "✨"
  },
  metal_plate: {
    name: "Металлическая пластина",
    icon: "🔩"
  },
  tablet_core: {
    name: "Основа скрижали",
    icon: "📜"
  },
  tablet: {
    name: "Фрагмент Скрижали",
    icon: "📜"
  },

  dense_cloth: {
    name: "Плотная ткань",
    icon: "🧶"
  },
  beast_leather: {
    name: "Прочная кожа зверя",
    icon: "🐾"
  },
  stable_stone: {
    name: "Кристалл устойчивости",
    icon: "🔮"
  },
  cloak_core: {
    name: "Основа плаща",
    icon: "🧥"
  },
  cloak: {
    name: "Укреплённый путевой плащ",
    icon: "🛡️"
  },

  strange_glass: {
    name: "Странное стекло",
    icon: "🪞"
  },
  copper_wire: {
    name: "Медная проволока",
    icon: "🪢"
  },
  weak_energy: {
    name: "Слабый энергетический кристалл",
    icon: "🔹"
  },
  anomaly_core: {
    name: "Основа стабилизатора",
    icon: "⚙️"
  },
  anomaly_stabilizer: {
    name: "Стабилизатор аномалии",
    icon: "🌀"
  },

  amulet_fragment: {
    name: "Фрагмент амулета",
    icon: "📿"
  },
  silver_thread: {
    name: "Серебряная нить",
    icon: "🧵"
  },
  magic_essence: {
    name: "Магическая эссенция",
    icon: "🌟"
  },
  amulet_core: {
    name: "Основа амулета",
    icon: "💠"
  },
  eola_amulet: {
    name: "Починенный фрагмент Амулета Эолы",
    icon: "📿"
  },

  tree_bark: {
    name: "Кора дерева",
    icon: "🌳"
  },
  dark_feather: {
    name: "Тёмное перо",
    icon: "🪶"
  },
  stone_symbol: {
    name: "Каменный символ",
    icon: "🔰"
  },
  order_core: {
    name: "Основа знака",
    icon: "🔱"
  },
  order_sign: {
    name: "Защитный знак Ордена",
    icon: "🛡️"
  }
};

/* =========================================
   РЕЦЕПТЫ ОБЪЕДИНЕНИЯ
========================================= */

function makePair(first, second) {
  return [first, second].sort().join("+");
}

const recipes = {
  [makePair("ice_scale", "ice_scale")]: "dim_crystal",
  [makePair("ice_scale", "dim_crystal")]: "key_core",
  [makePair("key_core", "rune_cloth")]: "key",

  [makePair("stone_fragment", "glowing_dust")]: "tablet_core",
  [makePair("metal_plate", "tablet_core")]: "tablet",

  [makePair("beast_leather", "dense_cloth")]: "cloak_core",
  [makePair("cloak_core", "stable_stone")]: "cloak",

  [makePair("strange_glass", "copper_wire")]: "anomaly_core",
  [makePair("anomaly_core", "weak_energy")]: "anomaly_stabilizer",

  [makePair("amulet_fragment", "silver_thread")]: "amulet_core",
  [makePair("amulet_core", "magic_essence")]: "eola_amulet",

  [makePair("tree_bark", "dark_feather")]: "order_core",
  [makePair("order_core", "stone_symbol")]: "order_sign"
};

/* =========================================
   УЛУЧШЕННЫЕ ПРЕДМЕТЫ
========================================= */

function getUpgradeId(itemId) {
  const newId = "refined_" + itemId;

  if (!items[newId]) {
    const upgradedNames = {
      stable_stone: "Совершенный кристалл устойчивости"
    };
    items[newId] = {
      name: upgradedNames[itemId] || ("Улучшенный " + items[itemId].name.toLowerCase()),
      icon: "✨"
    };
  }

  return newId;
}

/* =========================================
   МИРЫ
========================================= */

const worlds = [
  {
    number: 1,
    name: "Новое Поколение",
    description: "Мир, где всё только начинается. Древние драконы, забытые артефакты и первый шаг в неизвестность. Здесь ещё никто не знает, кем ты можешь стать."
  },
  {
    number: 2,
    name: "Игра Бога",
    description: "Мир аномалий и полубогов. Здесь силы выше смертных начинают вмешиваться в судьбы, а обычные правила больше не работают."
  },
  {
    number: 3,
    name: "Идеальный МИР",
    description: "Мир, который кажется слишком правильным. Под идеальной поверхностью скрывается система, которая решает, кому жить, а кому исчезнуть."
  },
  {
    number: 4,
    name: "Голос Времени",
    description: "Междумирье и пустота между мирами. Здесь время течёт иначе, а каждый выбор может переписать то, что уже произошло."
  },
  {
    number: 5,
    name: "Тринадцать Огней",
    description: "Жаркий пустынный мир богов и древних культов. Здесь сила измеряется верой, а боги никогда не бывают добрыми просто так."
  },
  {
    number: 6,
    name: "Последняя Реальность",
    description: "Мир, где реальность даёт трещины. Альтернативные версии событий и людей начинают пересекаться, и становится всё сложнее понять, что настоящее."
  },
  {
    number: 7,
    name: "Сердце Вселенной",
    description: "Глубокий и странный мир, связанный с самой основой существования. Здесь вопросы уже не про выживание, а про то, что вообще держит всё вместе."
  },
  {
    number: 8,
    name: "Точка Невозврата",
    description: "Мир, из которого уже почти нельзя выйти прежним. Каждый шаг окончательный, а цена ошибок становится слишком высокой."
  },
  {
    number: 9,
    name: "Мастерская 47",
    description: "Искусственный, созданный мир-симуляция. Здесь всё подчиняется правилам, которые можно понять… или сломать."
  }
];

/* =========================================
   КВЕСТЫ
========================================= */

const questData = [
  {
    id: "keyQuest",
    title: "Ключ Расшифровки",
    character: "Лефтарион",
    description: "Брат оставил записку. Мне нужен способ её прочесть.",
    target: "key",
    rewardSkint: 25,
    rewardAnti: 1
  },
  {
    id: "tabletQuest",
    title: "Фрагмент Скрижали",
    character: "Лефтарион",
    description: "Собери целый фрагмент древней Скрижали.",
    target: "tablet",
    rewardSkint: 40,
    rewardAnti: 1
  },
  {
    id: "cloakQuest",
    title: "Укреплённый путевой плащ",
    character: "Горбатик",
    description: "Без хорошей защиты далеко не уйдёшь.",
    target: "cloak",
    rewardSkint: 35,
    rewardAnti: 2
  }
];

/* =========================================
   НАЧАЛЬНОЕ СОХРАНЕНИЕ
========================================= */

function createInitialState() {
  return {
    skint: 100,
    antiSkint: 0,

    board: [
      "ice_scale",
      "ice_scale",
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],

    boardValues: [10, 10, 0, 0, 0, 0, 0, 0, 0],

    completedQuests: [],
    acceptedQuests: [],

    tutorialDone: false,
    avatarDataUrl: "",

    mergedCount: 0,
    soldCount: 0,
    summonedCount: 0,

    unlockedWorld: 1,

    playTimeMs: 0,
    lastSessionStart: Date.now(),
    lastSkintUpdate: Date.now()
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) return createInitialState();

    const parsed = JSON.parse(saved);
    const initial = createInitialState();

    const board = Array.isArray(parsed.board)
      ? parsed.board.slice(0, BOARD_SIZE)
      : initial.board.slice();

    while (board.length < BOARD_SIZE) {
      board.push(null);
    }

    const boardValues = Array.isArray(parsed.boardValues)
      ? parsed.boardValues.slice(0, BOARD_SIZE)
      : board.map(item => item ? SUMMON_COST : 0);

    // Старые пустые сохранения получают стартовую пару для первого объединения.
    const neverPlayed = Number(parsed.summonedCount || 0) === 0 &&
      Number(parsed.mergedCount || 0) === 0 &&
      Number(parsed.soldCount || 0) === 0;
    if (neverPlayed && board.every(item => !item)) {
      board[0] = "ice_scale";
      board[1] = "ice_scale";
      boardValues[0] = SUMMON_COST;
      boardValues[1] = SUMMON_COST;
    }

    while (boardValues.length < BOARD_SIZE) {
      boardValues.push(0);
    }

    // Убираем только неизвестные старые ID, чтобы они не занимали место невидимыми.
    // Валюты и все распознанные предметы остаются в сохранении.
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (board[i] && !items[board[i]]) {
        board[i] = null;
        boardValues[i] = 0;
      }
    }

    return {
      ...initial,
      ...parsed,
      board,
      boardValues,

      completedQuests: Array.isArray(parsed.completedQuests)
        ? parsed.completedQuests
        : [],

      acceptedQuests: Array.isArray(parsed.acceptedQuests)
        ? parsed.acceptedQuests
        : [],

      unlockedWorld: Math.min(
        9,
        Math.max(1, Number(parsed.unlockedWorld) || 1)
      )
    };
  } catch (error) {
    console.error("Ошибка загрузки сохранения:", error);
    return createInitialState();
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Ошибка сохранения:", error);
  }
}

/* =========================================
   ПАССИВНЫЙ ДОХОД
========================================= */

function updatePassiveIncome() {
  const now = Date.now();

  if (!state.lastSkintUpdate) {
    state.lastSkintUpdate = now;
    return;
  }

  const elapsed = now - state.lastSkintUpdate;
  const minutes = Math.floor(elapsed / 60000);

  if (minutes <= 0) return;

  state.skint += minutes * PASSIVE_SKINT_PER_MINUTE;
  state.lastSkintUpdate += minutes * 60000;

  saveState();
}

/* =========================================
   HTML-ЭЛЕМЕНТЫ
========================================= */

const boardElement = document.getElementById("mergeBoard");

const summonButton = document.getElementById("summonButton");
const antiSummonButton = document.getElementById("antiSummonButton");

const skintElement = document.getElementById("skint");
const antiSkintElement = document.getElementById("antiSkint");

const questListElement = document.getElementById("questList");

const sellOverlay = document.getElementById("sellOverlay");
const sellItemIcon = document.getElementById("sellItemIcon");
const sellItemName = document.getElementById("sellItemName");
const sellItemDescription = document.getElementById("sellItemDescription");
const sellItemPrice = document.getElementById("sellItemPrice");
const sellConfirmButton = document.getElementById("sellConfirmButton");
const sellCancelButton = document.getElementById("sellCancelButton");

const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");
const tutorialProgress = document.getElementById("tutorialProgress");
const tutorialStepLabel = document.getElementById("tutorialStepLabel");
const tutorialButton = document.getElementById("tutorialButton");
const tutorialSkipButton = document.getElementById("tutorialSkipButton");

const tutorialCompleteOverlay =
  document.getElementById("tutorialCompleteOverlay");

const tutorialCompleteButton =
  document.getElementById("tutorialCompleteButton");

const restartTutorialButton =
  document.getElementById("restartTutorialButton");

/* =========================================
   ПОЛЕ И ОБУЧЕНИЕ
========================================= */

let tutorialMode = false;
let tutorialBoard = Array(BOARD_SIZE).fill(null);
let tutorialStep = 0;
let tutorialMerged = false;

let dragSource = null;
let pointerStart = null;
let pointerMoved = false;

let itemToSellIndex = null;

function getCurrentBoard() {
  return tutorialMode ? tutorialBoard : state.board;
}

/* =========================================
   ПРЕДМЕТЫ ДЛЯ ПРИЗЫВА
========================================= */

const randomItems = [
  "ice_scale",
  "ice_scale",
  "rune_cloth",
  "stone_fragment",
  "glowing_dust",
  "metal_plate",
  "dense_cloth",
  "beast_leather",
  "stable_stone"
];

function getRandomSummonItem() {
  const existing = randomItems.filter(id => state.board.includes(id));

  if (existing.length && Math.random() < 0.75) {
    return existing[Math.floor(Math.random() * existing.length)];
  }

  return randomItems[Math.floor(Math.random() * randomItems.length)];
}

/* =========================================
   ВАЛЮТА
========================================= */

function renderCurrencies() {
  if (skintElement) {
    skintElement.textContent = Math.floor(state.skint);
  }

  if (antiSkintElement) {
    antiSkintElement.textContent = Math.floor(state.antiSkint);
  }
}

/* =========================================
   КНОПКИ ПРИЗЫВА
========================================= */

function updateSummonButtons() {
  const occupied = state.board.filter(Boolean).length;
  const full = occupied >= BOARD_SIZE;

  if (summonButton) {
    summonButton.disabled = full || state.skint < SUMMON_COST;
  }

  if (antiSummonButton) {
    antiSummonButton.disabled =
      full || state.antiSkint < ANTI_SUMMON_COST;
  }
}

/* =========================================
   ОТОБРАЖЕНИЕ ПОЛЯ
========================================= */

function renderBoard() {
  if (!boardElement) return;
  const board = getCurrentBoard();
  boardElement.innerHTML = "";

  for (let index = 0; index < BOARD_SIZE; index++) {
    const itemId = board[index] || null;
    const cell = document.createElement("div");
    cell.className = itemId && items[itemId]
      ? "board-cell has-item"
      : "board-cell empty";
    cell.dataset.index = index;

    if (itemId && items[itemId]) {
      const icon = document.createElement("span");
      icon.className = "item-icon";
      icon.textContent = items[itemId].icon;
      cell.appendChild(icon);
      cell.title = items[itemId].name;
    } else {
      cell.setAttribute("aria-label", "Пустая клетка");
    }
    boardElement.appendChild(cell);
  }

  updateSummonButtons();
}

/* =========================================
   ДОБАВЛЕНИЕ ПРЕДМЕТА
========================================= */

function addItemToBoard(itemId, value = SUMMON_COST) {
  const emptyIndex = state.board.indexOf(null);

  if (emptyIndex === -1) return false;

  state.board[emptyIndex] = itemId;
  state.boardValues[emptyIndex] = value;

  return true;
}

/* =========================================
   ОБЫЧНЫЙ ПРИЗЫВ
========================================= */

function summonMainItem() {
  updatePassiveIncome();

  if (state.board.filter(Boolean).length >= BOARD_SIZE) {
    showMessage("Поле заполнено!");
    return;
  }

  if (state.skint < SUMMON_COST) {
    showMessage("Недостаточно Скинтов!");
    return;
  }

  const itemId = getRandomSummonItem();

  state.skint -= SUMMON_COST;

  addItemToBoard(itemId, SUMMON_COST);
  state.summonedCount++;

  saveState();
  renderAll();

  showMessage("Получен предмет: " + items[itemId].name);
}

/* =========================================
   АНТИ-СКИНТ
   ЗАПОЛНЕНИЕ ДО 9/9
========================================= */

function summonAntiItems() {
  updatePassiveIncome();

  const occupied = state.board.filter(Boolean).length;
  const freeCells = BOARD_SIZE - occupied;

  if (freeCells <= 0) {
    showMessage("Поле уже заполнено!");
    return;
  }

  if (state.antiSkint < ANTI_SUMMON_COST) {
    showMessage("Недостаточно Анти-скинтов!");
    return;
  }

  state.antiSkint -= ANTI_SUMMON_COST;

  for (let i = 0; i < freeCells; i++) {
    const itemId = getRandomSummonItem();

    if (!addItemToBoard(itemId, SUMMON_COST)) break;

    state.summonedCount++;
  }

  saveState();
  renderAll();

  showMessage(`Поле заполнено! Добавлено предметов: ${freeCells}`);
}

if (summonButton) {
  summonButton.addEventListener("click", () => {
    if (tutorialMode) return;
    summonMainItem();
  });
}

if (antiSummonButton) {
  antiSummonButton.addEventListener("click", () => {
    if (tutorialMode) return;
    summonAntiItems();
  });
}

/* =========================================
   ПРОДАЖА ПРЕДМЕТОВ
========================================= */

function openSellWindow(index) {
  const itemId = state.board[index];

  if (!itemId || !items[itemId] || !sellOverlay) return;

  itemToSellIndex = index;

  const value = state.boardValues[index] || SUMMON_COST;
  const price = Math.floor(value * 0.5);

  if (sellItemIcon) {
    sellItemIcon.textContent = items[itemId].icon;
  }

  if (sellItemName) {
    sellItemName.textContent = items[itemId].name;
  }

  if (sellItemDescription) {
    sellItemDescription.textContent =
      "Ты получишь половину стоимости предмета.";
  }

  if (sellItemPrice) {
    sellItemPrice.textContent = price + " Скинтов";
  }

  sellOverlay.classList.add("active");
}

function closeSellWindow() {
  itemToSellIndex = null;

  if (sellOverlay) {
    sellOverlay.classList.remove("active");
  }
}

function confirmSellItem() {
  if (itemToSellIndex === null) return;

  const index = itemToSellIndex;
  const itemId = state.board[index];

  if (!itemId) {
    closeSellWindow();
    return;
  }

  const value = state.boardValues[index] || SUMMON_COST;
  const price = Math.floor(value * 0.5);

  state.skint += price;
  state.board[index] = null;
  state.boardValues[index] = 0;
  state.soldCount++;

  closeSellWindow();

  saveState();
  renderAll();

  showMessage("Продано за " + price + " Скинтов");
}

if (sellConfirmButton) {
  sellConfirmButton.addEventListener("click", confirmSellItem);
}

if (sellCancelButton) {
  sellCancelButton.addEventListener("click", closeSellWindow);
}

const sellCancelButtonSecondary = document.getElementById("sellCancelButtonSecondary");
if (sellCancelButtonSecondary) {
  sellCancelButtonSecondary.addEventListener("click", closeSellWindow);
}

if (sellOverlay) {
  sellOverlay.addEventListener("click", event => {
    if (event.target === sellOverlay) closeSellWindow();
  });
}


function mergeItems(sourceIndex, targetIndex) {
  if (
    !Number.isInteger(sourceIndex) ||
    !Number.isInteger(targetIndex) ||
    sourceIndex === targetIndex
  ) return false;

  const board = getCurrentBoard();
  if (
    sourceIndex < 0 || targetIndex < 0 ||
    sourceIndex >= board.length || targetIndex >= board.length
  ) return false;

  const first = board[sourceIndex];
  const second = board[targetIndex];
  if (!first || !second) return false;

  // Объединять можно только два совершенно одинаковых предмета.
  if (first !== second) {
    showMessage("Объединять можно только одинаковые предметы.");
    return false;
  }

  const result = getUpgradeId(first);
  board[sourceIndex] = null;
  board[targetIndex] = result;

  if (tutorialMode) {
    tutorialMerged = true;
    tutorialStep = 3;
    showTutorialStep();
  } else {
    const firstValue = state.boardValues[sourceIndex] || SUMMON_COST;
    const secondValue = state.boardValues[targetIndex] || SUMMON_COST;
    state.boardValues[sourceIndex] = 0;
    state.boardValues[targetIndex] = firstValue + secondValue;
    state.mergedCount++;
    saveState();
    renderQuests();
    renderProfile();
  }

  renderBoard();
  showMessage("Объединено: " + items[result].name);
  return true;
}

/* =========================================
   ПЕРЕТАСКИВАНИЕ И НАЖАТИЯ
========================================= */

let lastTappedIndex = null;
let lastTapAt = 0;
let dragGhost = null;
let dragTargetCell = null;
let dragOffset = { x: 0, y: 0 };

let savedPageScrollY = 0;
let pageScrollLocked = false;

function lockPageScroll() {
  if (pageScrollLocked) return;
  savedPageScrollY = window.scrollY || window.pageYOffset || 0;
  pageScrollLocked = true;
  document.documentElement.classList.add("item-drag-active");
  document.body.style.position = "fixed";
  document.body.style.top = "-" + savedPageScrollY + "px";
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
  if (!pageScrollLocked) return;
  pageScrollLocked = false;
  document.documentElement.classList.remove("item-drag-active");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  window.scrollTo(0, savedPageScrollY);
}

document.addEventListener("touchmove", event => {
  if (pageScrollLocked) event.preventDefault();
}, { passive: false, capture: true });

function clearDragVisuals() {
  if (dragGhost) dragGhost.remove();
  dragGhost = null;
  if (dragTargetCell) dragTargetCell.classList.remove("drop-target");
  dragTargetCell = null;
  if (boardElement) {
    boardElement.querySelectorAll(".drag-source").forEach(el => el.classList.remove("drag-source"));
  }
}

let scrollGesture = false;
let lastPointerY = 0;

if (boardElement) {
  boardElement.addEventListener("pointerdown", event => {
    const cell = event.target.closest(".board-cell");
    if (!cell) return;
    dragSource = Number(cell.dataset.index);
    pointerStart = { x: event.clientX, y: event.clientY };
    lastPointerY = event.clientY;
    pointerMoved = false;
    scrollGesture = false;
    if (boardElement.setPointerCapture && event.pointerId !== undefined) {
      try { boardElement.setPointerCapture(event.pointerId); } catch (_) {}
    }
  });

  boardElement.addEventListener("pointermove", event => {
    if (dragSource === null || !pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const distance = Math.hypot(dx, dy);

    if (!pointerMoved && distance > 7) {
      pointerMoved = true;
      // Вертикальный жест прокручивает страницу, а не таскает предмет.
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        scrollGesture = true;
      } else {
        lockPageScroll();
        const sourceCell = boardElement.querySelector('[data-index="' + dragSource + '"]');
        const sourceItem = getCurrentBoard()[dragSource];
        if (sourceCell && sourceItem && items[sourceItem]) {
          const rect = sourceCell.getBoundingClientRect();
          dragOffset = { x: pointerStart.x - rect.left, y: pointerStart.y - rect.top };
          dragGhost = document.createElement("div");
          dragGhost.className = "item-drag-ghost";
          dragGhost.textContent = items[sourceItem].icon;
          dragGhost.style.width = rect.width + "px";
          dragGhost.style.height = rect.height + "px";
          dragGhost.style.left = rect.left + "px";
          dragGhost.style.top = rect.top + "px";
          document.body.appendChild(dragGhost);
          sourceCell.classList.add("drag-source");
        }
      }
    }

    if (scrollGesture) {
      window.scrollBy(0, lastPointerY - event.clientY);
      lastPointerY = event.clientY;
      return;
    }
    if (!pointerMoved) return;

    if (dragGhost) {
      dragGhost.style.left = (event.clientX - dragOffset.x) + "px";
      dragGhost.style.top = (event.clientY - dragOffset.y) + "px";
      dragGhost.classList.add("dragging");
    }

    const underPointer = document.elementFromPoint(event.clientX, event.clientY);
    const nextTarget = underPointer?.closest(".board-cell") || null;
    if (dragTargetCell !== nextTarget) {
      if (dragTargetCell) dragTargetCell.classList.remove("drop-target");
      dragTargetCell = nextTarget;
      if (dragTargetCell) dragTargetCell.classList.add("drop-target");
    }
  });

  boardElement.addEventListener("pointerup", event => {
    if (dragSource === null) return;
    const sourceIndex = dragSource;
    const targetCell = document.elementFromPoint(event.clientX, event.clientY)?.closest(".board-cell");

    if (pointerMoved && !scrollGesture && targetCell) {
      const targetIndex = Number(targetCell.dataset.index);
      if (sourceIndex !== targetIndex) {
        const currentBoard = getCurrentBoard();
        if (currentBoard[sourceIndex] && !currentBoard[targetIndex] && !tutorialMode) {
          currentBoard[targetIndex] = currentBoard[sourceIndex];
          currentBoard[sourceIndex] = null;
          state.boardValues[targetIndex] = state.boardValues[sourceIndex] || SUMMON_COST;
          state.boardValues[sourceIndex] = 0;
          saveState();
          renderBoard();
        } else if (currentBoard[sourceIndex] && currentBoard[targetIndex]) {
          if (currentBoard[sourceIndex] === currentBoard[targetIndex]) {
            mergeItems(sourceIndex, targetIndex);
          } else if (!tutorialMode) {
            mergeItems(sourceIndex, targetIndex); // Different items swap places.
          }
        }
      }
      lastTappedIndex = null;
      lastTapAt = 0;
    } else if (!pointerMoved) {
      if (tutorialMode) {
        handleTutorialTap(sourceIndex);
      } else if (state.board[sourceIndex]) {
        const now = Date.now();
        if (lastTappedIndex === sourceIndex && now - lastTapAt < 420) {
          openSellWindow(sourceIndex);
          lastTappedIndex = null;
          lastTapAt = 0;
        } else {
          lastTappedIndex = sourceIndex;
          lastTapAt = now;
        }
      } else {
        lastTappedIndex = null;
        lastTapAt = 0;
      }
    }

    clearDragVisuals();
    dragSource = null;
    pointerStart = null;
    pointerMoved = false;
    scrollGesture = false;
    unlockPageScroll();
  });

  const cancelDrag = () => {
    clearDragVisuals();
    dragSource = null;
    pointerStart = null;
    pointerMoved = false;
    scrollGesture = false;
    unlockPageScroll();
  };
  boardElement.addEventListener("pointercancel", cancelDrag);
  boardElement.addEventListener("lostpointercapture", cancelDrag);
}

function handleTutorialTap(index) {
  if (!tutorialBoard[index]) return;

  if (selectedTutorialCell === null) {
    selectedTutorialCell = index;
    return;
  }

  if (selectedTutorialCell === index) {
    selectedTutorialCell = null;
    return;
  }

  const previous = selectedTutorialCell;
  selectedTutorialCell = null;

  mergeItems(previous, index);
}

let selectedTutorialCell = null;

/* =========================================
   ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
========================================= */

const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

function openPage(pageId) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  navButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  renderAll();
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (tutorialMode) return;

    const pageId = button.dataset.page;

    if (pageId) openPage(pageId);
  });
});

/* =========================================
   КВЕСТЫ
========================================= */

function renderQuests() {
  if (!questListElement) return;

  questListElement.innerHTML = "";

  questData.forEach(quest => {
    const completed = state.completedQuests.includes(quest.id);
    const accepted = state.acceptedQuests.includes(quest.id);
    const hasTarget = state.board.includes(quest.target);

    const card = document.createElement("article");
    card.className = "quest-card";

    const title = document.createElement("h3");
    title.textContent = quest.title;

    const character = document.createElement("p");
    character.textContent = "Персонаж: " + quest.character;

    const description = document.createElement("p");
    description.textContent = quest.description;

    const reward = document.createElement("div");
    reward.className = "quest-reward";
    reward.textContent =
      `Награда: ${quest.rewardSkint} Скинтов · ${quest.rewardAnti} Анти-скинтов`;

    const button = document.createElement("button");
    button.className = "primary-button";

    if (completed) {
      button.textContent = "Задание выполнено";
      button.disabled = true;
    } else if (!accepted) {
      button.textContent = "Принять задание";

      button.addEventListener("click", () => {
        state.acceptedQuests.push(quest.id);
        saveState();
        renderQuests();
      });
    } else if (hasTarget) {
      button.textContent = "Сдать предмет";

      button.addEventListener("click", () => completeQuest(quest));
    } else {
      button.textContent = "Предмет ещё не найден";
      button.disabled = true;
    }

    card.append(title, character, description, reward, button);
    questListElement.appendChild(card);
  });
}

function completeQuest(quest) {
  const index = state.board.indexOf(quest.target);

  if (index === -1) {
    showMessage("Нужный предмет не найден!");
    return;
  }

  state.board[index] = null;
  state.boardValues[index] = 0;

  state.completedQuests.push(quest.id);
  state.skint += quest.rewardSkint;
  state.antiSkint += quest.rewardAnti;

  saveState();
  renderAll();

  showMessage("Задание выполнено! Награда получена.");
}

/* =========================================
   МИРЫ
========================================= */

function renderWorlds() {
  const cards = document.querySelectorAll(".world-card");

  cards.forEach(card => {
    const number = Number(card.dataset.world);
    const locked = number > state.unlockedWorld;

    card.classList.toggle("locked", locked);
  });
}

document.querySelectorAll(".world-card").forEach(card => {
  card.addEventListener("click", () => {
    const number = Number(card.dataset.world);

    if (!number) return;

    if (number > state.unlockedWorld) {
      showMessage("Сначала открой предыдущий мир!");
      return;
    }

    showMessage("Выбран мир: " + worlds[number - 1].name);
  });
});

/* =========================================
   ПРОФИЛЬ
========================================= */

function formatPlayTime(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} ч. ${minutes} мин.`;
}

function getPlayTime() {
  const currentSession = Math.max(
    0,
    Date.now() - (state.lastSessionStart || Date.now())
  );

  return state.playTimeMs + currentSession;
}

function renderProfile() {
  const avatarImage = document.getElementById("profileAvatarImage");
  const avatarFallback = document.getElementById("profileAvatarFallback");
  if (avatarImage && avatarFallback) {
    if (state.avatarDataUrl) {
      avatarImage.src = state.avatarDataUrl;
      avatarImage.hidden = false;
      avatarFallback.hidden = true;
    } else {
      avatarImage.removeAttribute("src");
      avatarImage.hidden = true;
      avatarFallback.hidden = false;
    }
  }

  const values = {
    profileName: "Мироходец",
    profileStatus: "Начинающий",
    profileRank: "—",
    profileWorld: worlds[state.unlockedWorld - 1]?.name || worlds[0].name,
    playTime: formatPlayTime(getPlayTime()),
    mergedCount: state.mergedCount,
    soldCount: state.soldCount,
    summonedCount: state.summonedCount,
    profileSkint: Math.floor(state.skint),
    profileAntiSkint: Math.floor(state.antiSkint)
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) element.textContent = value;
  });
}

/* =========================================
   ПЕРСОНАЛЬНАЯ АВАТАРКА
========================================= */

const avatarInput = document.getElementById("profileAvatarInput");
const changeAvatarButton = document.getElementById("changeAvatarButton");

if (changeAvatarButton && avatarInput) {
  changeAvatarButton.addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Выбери изображение.");
      avatarInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const side = 512;
        const scale = Math.min(1, side / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          state.avatarDataUrl = canvas.toDataURL("image/jpeg", 0.84);
          saveState();
          renderProfile();
          showMessage("Аватар обновлён!");
        } catch (error) {
          showMessage("Не удалось сохранить это изображение.");
        }
        avatarInput.value = "";
      };
      image.onerror = () => showMessage("Не удалось открыть изображение.");
      image.src = reader.result;
    };
    reader.onerror = () => showMessage("Не удалось загрузить изображение.");
    reader.readAsDataURL(file);
  });
}

/* =========================================
   ОБУЧЕНИЕ
========================================= */

const tutorialSteps = [
  {
    title: "Добро пожаловать!",
    text: "Это Merge Worlds. Здесь ты будешь получать предметы, объединять их и открывать новые миры.",
    button: "Начать"
  },
  {
    title: "Призыв предметов",
    text: "Обычный призыв стоит 10 Скинтов. Нажми кнопку, чтобы получить предметы.",
    button: "Далее"
  },
  {
    title: "Объединение",
    text: "Перетащи один предмет на другой. Два подходящих предмета объединятся в один новый.",
    button: "Далее"
  },
  {
    title: "Продажа",
    text: "Нажми на предмет, чтобы открыть окно продажи. Ты получишь половину его стоимости.",
    button: "Далее"
  },
  {
    title: "Анти-скинт",
    text: "Анти-скинт заполняет все свободные клетки поля. Он стоит 1 Анти-скинт.",
    button: "Далее"
  },
  {
    title: "Квесты и миры",
    text: "Выполняй задания персонажей и открывай новые миры.",
    button: "Завершить"
  }
];

function showTutorialStep() {
  const step = tutorialSteps[tutorialStep];

  if (!step) return;

  if (tutorialTitle) tutorialTitle.textContent = step.title;
  if (tutorialText) tutorialText.textContent = step.text;
  if (tutorialButton) tutorialButton.textContent = step.button;

  if (tutorialStepLabel) {
    tutorialStepLabel.textContent =
      `ОБУЧЕНИЕ · ${tutorialStep + 1}/${tutorialSteps.length}`;
  }

  if (tutorialProgress) {
    tutorialProgress.style.width =
      `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`;
  }
}

function startTutorial() {
  tutorialMode = true;
  tutorialStep = 0;

  tutorialBoard = [
    "ice_scale",
    "ice_scale",
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ];

  tutorialMerged = false;
  selectedTutorialCell = null;

  if (tutorialOverlay) {
    tutorialOverlay.classList.add("active");
  }

  if (tutorialCompleteOverlay) {
    tutorialCompleteOverlay.classList.remove("active");
  }

  showTutorialStep();
  renderBoard();
}

function finishTutorial() {
  tutorialMode = false;
  state.tutorialDone = true;

  if (tutorialOverlay) {
    tutorialOverlay.classList.remove("active");
  }

  if (tutorialCompleteOverlay) {
    tutorialCompleteOverlay.classList.add("active");
  }

  saveState();
  renderAll();
}

function nextTutorialStep() {
  if (tutorialStep < tutorialSteps.length - 1) {
    tutorialStep++;
    showTutorialStep();
  } else {
    finishTutorial();
  }
}

if (tutorialButton) {
  tutorialButton.addEventListener("click", () => {
    if (!tutorialMode) return;

    if (tutorialStep === 2 && !tutorialMerged) {
      showMessage("Сначала объедини два предмета!");
      return;
    }

    nextTutorialStep();
  });
}

if (tutorialSkipButton) {
  tutorialSkipButton.addEventListener("click", finishTutorial);
}

if (tutorialCompleteButton) {
  tutorialCompleteButton.addEventListener("click", () => {
    if (tutorialCompleteOverlay) {
      tutorialCompleteOverlay.classList.add("hidden");
    }

    tutorialMode = false;
    renderAll();
  });
}

if (restartTutorialButton) {
  restartTutorialButton.addEventListener("click", startTutorial);
}

/* =========================================
   СООБЩЕНИЯ
========================================= */

let messageTimeout = null;

function showMessage(message) {
  let element = document.getElementById("gameMessage");

  if (!element) {
    element = document.createElement("div");
    element.id = "gameMessage";
    element.className = "game-message";
    document.body.appendChild(element);
  }

  element.textContent = message;
  element.classList.add("visible");

  clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    element.classList.remove("visible");
  }, 2200);
}

/* =========================================
   ОБНОВЛЕНИЕ ИГРЫ
========================================= */

function renderAll() {
  renderBoard();
  renderCurrencies();
  renderQuests();
  renderProfile();
  renderWorlds();
  updateSummonButtons();
}

/* =========================================
   УЧЁТ ВРЕМЕНИ
========================================= */

function savePlayTime() {
  if (!state.lastSessionStart) {
    state.lastSessionStart = Date.now();
    return;
  }

  const now = Date.now();

  state.playTimeMs += Math.max(
    0,
    now - state.lastSessionStart
  );

  state.lastSessionStart = now;

  saveState();
  renderProfile();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    savePlayTime();
  } else {
    state.lastSessionStart = Date.now();
    saveState();
  }
});

window.addEventListener("pagehide", savePlayTime);

setInterval(() => {
  updatePassiveIncome();
  renderCurrencies();
  renderProfile();
}, 10000);

/* =========================================
   ЗАПУСК
========================================= */

document.title = "Приключение Lo";

// Не блокируем игру обучением при запуске
tutorialMode = false;

if (tutorialOverlay) {
  tutorialOverlay.classList.remove("active");
}

if (tutorialCompleteOverlay) {
  tutorialCompleteOverlay.classList.remove("active");
}

state.lastSessionStart = Date.now();

renderAll();
saveState();