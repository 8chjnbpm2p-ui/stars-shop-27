
"use strict";

/* =========================================
   MERGE WORLDS — ОСНОВНАЯ ЛОГИКА
========================================= */

const SAVE_KEY = "merge_worlds_save_v3";
const SUMMON_COST = 10;

const PASSIVE_SKINT_PER_MINUTE = 10;
const PASSIVE_INTERVAL = 10000;

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
    name: "Стабильный магический камень",
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

function pair(a, b) {
  return [a, b].sort().join("+");
}

const recipes = {
  [pair("ice_scale", "ice_scale")]: "dim_crystal",
  [pair("ice_scale", "dim_crystal")]: "key_core",
  [pair("key_core", "rune_cloth")]: "key",

  [pair("stone_fragment", "glowing_dust")]: "tablet_core",
  [pair("metal_plate", "tablet_core")]: "tablet",

  [pair("beast_leather", "dense_cloth")]: "cloak_core",
  [pair("cloak_core", "stable_stone")]: "cloak",

  [pair("strange_glass", "copper_wire")]: "anomaly_core",
  [pair("anomaly_core", "weak_energy")]: "anomaly_stabilizer",

  [pair("amulet_fragment", "silver_thread")]: "amulet_core",
  [pair("amulet_core", "magic_essence")]: "eola_amulet",

  [pair("tree_bark", "dark_feather")]: "order_core",
  [pair("order_core", "stone_symbol")]: "order_sign"
};

/* =========================================
   УЛУЧШЕНИЕ ОДИНАКОВЫХ ПРЕДМЕТОВ
========================================= */

const upgradedItems = {};

function getUpgradeId(id) {
  if (upgradedItems[id]) {
    return upgradedItems[id];
  }

  const newId = "refined_" + id;

  if (!items[newId]) {
    items[newId] = {
      name: "Улучшенный: " + (items[id]?.name || id),
      icon: "✨"
    };
  }

  upgradedItems[id] = newId;
  return newId;
}

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
   СОХРАНЕНИЕ
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

    completedQuests: [],
    acceptedQuests: [],
    tutorialDone: false,

    lastSkintUpdate: Date.now()
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return createInitialState();
    }

    const parsed = JSON.parse(saved);
    const initial = createInitialState();

    const loadedBoard = Array.isArray(parsed.board)
      ? parsed.board.slice(0, 9)
      : initial.board;

    while (loadedBoard.length < 9) {
      loadedBoard.push(null);
    }

    const loadedState = {
      ...initial,
      ...parsed,

      board: loadedBoard,

      completedQuests: Array.isArray(parsed.completedQuests)
        ? parsed.completedQuests
        : [],

      acceptedQuests: Array.isArray(parsed.acceptedQuests)
        ? parsed.acceptedQuests
        : []
    };

    /*
      Старым сохранениям добавляем таймер.
      Это не начисляет деньги задним числом.
    */

    if (
      typeof loadedState.lastSkintUpdate !== "number" ||
      !Number.isFinite(loadedState.lastSkintUpdate)
    ) {
      loadedState.lastSkintUpdate = Date.now();
    }

    applyPassiveIncome(loadedState);

    return loadedState;

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
    console.error("Не удалось сохранить игру:", error);
  }
}

/* =========================================
   ПАССИВНЫЙ ДОХОД
   +10 Скинтов за каждую полную минуту
========================================= */

function applyPassiveIncome(targetState) {
  const now = Date.now();

  if (
    typeof targetState.lastSkintUpdate !== "number" ||
    !Number.isFinite(targetState.lastSkintUpdate)
  ) {
    targetState.lastSkintUpdate = now;
    return 0;
  }

  /*
    Если системные часы перевели назад,
    начинаем отсчёт заново.
  */

  if (now < targetState.lastSkintUpdate) {
    targetState.lastSkintUpdate = now;
    return 0;
  }

  const elapsed = now - targetState.lastSkintUpdate;
  const fullMinutes = Math.floor(elapsed / 60000);

  if (fullMinutes <= 0) {
    return 0;
  }

  const earned = fullMinutes * PASSIVE_SKINT_PER_MINUTE;

  targetState.skint += earned;

  /*
    Сохраняем остаток секунд,
    чтобы не терять время между начислениями.
  */

  targetState.lastSkintUpdate += fullMinutes * 60000;

  return earned;
}

function updatePassiveIncome() {
  const earned = applyPassiveIncome(state);

  if (earned > 0) {
    saveState();
    renderCurrencies();
  }
}

/* =========================================
   ЭЛЕМЕНТЫ СТРАНИЦЫ
========================================= */

const boardElement = document.getElementById("mergeBoard");
const summonButton = document.getElementById("summonButton");

const skintElement = document.getElementById("skint");
const antiSkintElement = document.getElementById("antiSkint");

const questListElement = document.getElementById("questList");

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
   ТЕКУЩИЙ РЕЖИМ ИГРЫ
========================================= */

let tutorialMode = false;
let tutorialBoard = Array(9).fill(null);
let tutorialStep = 0;
let tutorialMerged = false;

let selectedCell = null;
let dragSource = null;
let pointerStart = null;
let pointerMoved = false;

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

function getCurrentBoard() {
  return tutorialMode ? tutorialBoard : state.board;
}

/* =========================================
   ВЫБОР ПРЕДМЕТА ДЛЯ ПРИЗЫВА
========================================= */

function getRandomSummonItem() {
  /*
    С вероятностью 75% выбираем предмет,
    который уже есть на поле.

    Это повышает шанс получить пару
    для объединения.
  */

  const existingBaseItems = randomItems.filter(itemId =>
    state.board.includes(itemId)
  );

  if (
    existingBaseItems.length > 0 &&
    Math.random() < 0.75
  ) {
    const chosen = existingBaseItems[
      Math.floor(Math.random() * existingBaseItems.length)
    ];

    return chosen;
  }

  return randomItems[
    Math.floor(Math.random() * randomItems.length)
  ];
}

/* =========================================
   ОТОБРАЖЕНИЕ ВАЛЮТ
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
   ОТОБРАЖЕНИЕ ИГРОВОГО ПОЛЯ
========================================= */

function renderBoard() {
  if (!boardElement || !summonButton) return;

  const board = getCurrentBoard();

  boardElement.innerHTML = "";

  board.forEach((itemId, index) => {
    const cell = document.createElement("div");

    cell.className = "board-cell";
    cell.dataset.index = index;

    if (itemId && items[itemId]) {
      cell.classList.add("has-item");

      const icon = document.createElement("span");
      icon.className = "item-icon";
      icon.textContent = items[itemId].icon;

      cell.appendChild(icon);

      cell.title = items[itemId].name;
      cell.setAttribute("aria-label", items[itemId].name);
      cell.draggable = false;
    }

    if (selectedCell === index) {
      cell.classList.add("selected");
    }

    boardElement.appendChild(cell);
  });

  if (tutorialMode) {
    summonButton.textContent = "✨ Призвать пару";
  } else {
    summonButton.textContent =
      `✨ Призвать предмет · ${SUMMON_COST} Скинта`;
  }
}

/* =========================================
   ПРИЗЫВ ПРЕДМЕТОВ
========================================= */

function getEmptyCell(board) {
  return board.findIndex(item => item === null);
}

function summonMainItem() {
  updatePassiveIncome();

  if (state.skint < SUMMON_COST) {
    showMessage("Недостаточно Скинта!");
    return;
  }

  const empty = getEmptyCell(state.board);

  if (empty === -1) {
    showMessage("Игровое поле заполнено!");
    return;
  }

  const itemId = getRandomSummonItem();

  state.skint -= SUMMON_COST;
  state.board[empty] = itemId;

  saveState();
  renderAll();
}

function summonTutorialPair() {
  tutorialBoard = Array(9).fill(null);

  tutorialBoard[3] = "ice_scale";
  tutorialBoard[5] = "ice_scale";

  renderBoard();

  tutorialStep = 2;
  showTutorialStep();
}

if (summonButton) {
  summonButton.addEventListener("click", () => {
    if (tutorialMode) {
      if (tutorialStep === 1) {
        summonTutorialPair();
      }
      return;
    }

    summonMainItem();
  });
}

/* =========================================
   ОБЪЕДИНЕНИЕ
========================================= */

function mergeItems(sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex) return false;

  const board = getCurrentBoard();

  const first = board[sourceIndex];
  const second = board[targetIndex];

  if (!first || !second) return false;

  const recipe = recipes[pair(first, second)];

  let result = recipe;

  if (!result && first === second) {
    result = getUpgradeId(first);
  }

  if (!result) {
    showMessage("Эти предметы нельзя объединить");
    return false;
  }

  board[targetIndex] = result;
  board[sourceIndex] = null;

  selectedCell = null;

  if (!tutorialMode) {
    saveState();
  } else {
    tutorialMerged = true;
    tutorialStep = 3;
    showTutorialStep();
  }

  renderBoard();

  if (!tutorialMode) {
    renderQuests();
  }

  showMessage("Получено: " + items[result].name);

  return true;
}

/* =========================================
   ПЕРЕТАСКИВАНИЕ ПАЛЬЦЕМ И МЫШКОЙ
========================================= */

if (boardElement) {
  boardElement.addEventListener("pointerdown", event => {
    const cell = event.target.closest(".board-cell");

    if (!cell) return;

    dragSource = Number(cell.dataset.index);

    pointerStart = {
      x: event.clientX,
      y: event.clientY
    };

    pointerMoved = false;

    cell.classList.add("dragging");
  });

  boardElement.addEventListener("pointermove", event => {
    if (dragSource === null || !pointerStart) return;

    const distance = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y
    );

    if (distance > 8) {
      pointerMoved = true;
    }
  });

  boardElement.addEventListener("pointerup", event => {
    if (dragSource === null) return;

    const sourceIndex = dragSource;

    const sourceCell = boardElement.querySelector(
      `[data-index="${sourceIndex}"]`
    );

    if (sourceCell) {
      sourceCell.classList.remove("dragging");
    }

    const targetCell = document.elementFromPoint(
      event.clientX,
      event.clientY
    )?.closest(".board-cell");

    if (targetCell && pointerMoved) {
      const targetIndex = Number(targetCell.dataset.index);

      if (sourceIndex !== targetIndex) {
        mergeItems(sourceIndex, targetIndex);
      }
    } else if (!pointerMoved) {
      handleCellTap(sourceIndex);
    }

    dragSource = null;
    pointerStart = null;
    pointerMoved = false;

    boardElement.querySelectorAll(".drag-over").forEach(cell => {
      cell.classList.remove("drag-over");
    });
  });

  boardElement.addEventListener("pointercancel", () => {
    if (dragSource !== null) {
      const cell = boardElement.querySelector(
        `[data-index="${dragSource}"]`
      );

      if (cell) {
        cell.classList.remove("dragging");
      }
    }

    dragSource = null;
    pointerStart = null;
    pointerMoved = false;
  });

  boardElement.addEventListener("pointerover", event => {
    if (dragSource === null) return;

    const cell = event.target.closest(".board-cell");

    if (!cell) return;

    cell.classList.add("drag-over");
  });

  boardElement.addEventListener("pointerout", event => {
    const cell = event.target.closest(".board-cell");

    if (cell) {
      cell.classList.remove("drag-over");
    }
  });
}

/* =========================================
   ВЫБОР ПРЕДМЕТОВ КАСАНИЕМ
========================================= */

function handleCellTap(index) {
  const board = getCurrentBoard();
  const itemId = board[index];

  if (selectedCell === null) {
    if (!itemId) return;

    selectedCell = index;
    renderBoard();
    return;
  }

  if (selectedCell === index) {
    selectedCell = null;
    renderBoard();
    return;
  }

  if (!itemId) {
    selectedCell = null;
    renderBoard();
    return;
  }

  const previous = selectedCell;
  selectedCell = null;

  const merged = mergeItems(previous, index);

  if (!merged) {
    selectedCell = index;
    renderBoard();
  }
}

/* =========================================
   МЕНЮ И ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
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
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (tutorialMode) return;

    openPage(button.dataset.page);
  });
});

/* =========================================
   КВЕСТЫ
========================================= */

function hasItem(itemId) {
  return state.board.includes(itemId);
}

function renderQuests() {
  if (!questListElement) return;

  questListElement.innerHTML = "";

  questData.forEach(quest => {
    const completed = state.completedQuests.includes(quest.id);
    const accepted = state.acceptedQuests.includes(quest.id);
    const hasTarget = hasItem(quest.target);

    const card = document.createElement("article");
    card.className = "quest-card";

    if (completed) {
      card.classList.add("completed");
    }

    const title = document.createElement("h3");
    title.textContent = quest.title;

    const character = document.createElement("p");
    character.textContent = "Персонаж: " + quest.character;

    const description = document.createElement("p");
    description.textContent = quest.description;

    const reward = document.createElement("div");
    reward.className = "quest-reward";
    reward.textContent =
      `Награда: ${quest.rewardSkint} Скинта · ${quest.rewardAnti} Анти-скинт`;

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

      button.addEventListener("click", () => {
        completeQuest(quest);
      });
    } else {
      button.textContent = "Предмет ещё не найден";
      button.disabled = true;
    }

    card.append(
      title,
      character,
      description,
      reward,
      button
    );

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

  state.completedQuests.push(quest.id);

  state.skint += quest.rewardSkint;
  state.antiSkint += quest.rewardAnti;

  saveState();
  renderAll();

  showMessage("Задание выполнено! Награда получена.");
}

/* =========================================
   ОБУЧЕНИЕ
========================================= */

const tutorialSteps = [
  {
    title: "Добро пожаловать!",
    text: "Это Merge Worlds. Здесь ты будешь получать предметы, объединять их и открывать новые миры.",
    button: "Начать обучение"
  },
  {
    title: "Призыв предметов",
    text: "Нажми кнопку ниже, чтобы получить два одинаковых предмета. В обычной игре призыв стоит Скинт.",
    button: "Призвать пару"
  },
  {
    title: "Объединение",
    text: "Перетащи один ледяной осколок на другой. Если перетаскивание неудобно, можешь сначала коснуться одного предмета, а потом второго.",
    button: "Жду объединения"
  },
  {
    title: "Квесты",
    text: "На вкладке «Квесты» персонажи будут просить тебя создавать определённые предметы. За выполнение ты получишь награды.",
    button: "Далее"
  },
  {
    title: "Миры",
    text: "На вкладке «Миры» находятся сезоны вселенной. Следующий мир откроется после прохождения предыдущего.",
    button: "Далее"
  },
  {
    title: "Профиль",
    text: "В профиле можно снова запустить обучение. Оно всегда проходит отдельно и не стирает твои основные предметы.",
    button: "Завершить обучение"
  }
];

function startTutorial() {
  tutorialMode = true;
  tutorialBoard = Array(9).fill(null);
  tutorialStep = 0;
  tutorialMerged = false;
  selectedCell = null;

  openPage("homePage");

  tutorialCompleteOverlay.classList.add("hidden");
  tutorialOverlay.classList.remove("hidden");

  tutorialOverlay.style.pointerEvents = "none";

  const tooltip = tutorialOverlay.querySelector(".tutorial-tooltip");

  if (tooltip) {
    tooltip.style.pointerEvents = "auto";
  }

  showTutorialStep();
  renderBoard();
}

function showTutorialStep() {
  const step = tutorialSteps[tutorialStep];

  if (!step) return;

  tutorialTitle.textContent = step.title;
  tutorialText.textContent = step.text;
  tutorialButton.textContent = step.button;

  tutorialStepLabel.textContent =
    `ОБУЧЕНИЕ · ${tutorialStep + 1}/${tutorialSteps.length}`;

  tutorialProgress.style.width =
    `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`;

  tutorialButton.disabled = false;

  if (tutorialStep === 2 && !tutorialMerged) {
    tutorialButton.disabled = true;
    tutorialButton.textContent = "Сначала объедини предметы";
  }

  if (tutorialStep === 1) {
    summonButton.classList.add("tutorial-highlight");
  } else {
    summonButton.classList.remove("tutorial-highlight");
  }

  if (tutorialStep === 2) {
    boardElement.classList.add("tutorial-highlight");
  } else {
    boardElement.classList.remove("tutorial-highlight");
  }
}

tutorialButton.addEventListener("click", () => {
  if (!tutorialMode) return;

  if (tutorialStep === 1) {
    summonTutorialPair();
    return;
  }

  if (tutorialStep === 2 && !tutorialMerged) {
    return;
  }

  if (tutorialStep < tutorialSteps.length - 1) {
    tutorialStep++;
    showTutorialStep();
  } else {
    finishTutorial();
  }
});

function finishTutorial() {
  tutorialMode = false;
  tutorialBoard = Array(9).fill(null);
  tutorialMerged = false;
  selectedCell = null;

  state.tutorialDone = true;
  saveState();

  tutorialOverlay.classList.add("hidden");
  tutorialCompleteOverlay.classList.remove("hidden");

  summonButton.classList.remove("tutorial-highlight");
  boardElement.classList.remove("tutorial-highlight");

  renderAll();
}

function exitTutorial() {
  tutorialMode = false;
  tutorialBoard = Array(9).fill(null);
  tutorialMerged = false;
  selectedCell = null;

  tutorialOverlay.classList.add("hidden");
  tutorialCompleteOverlay.classList.add("hidden");

  summonButton.classList.remove("tutorial-highlight");
  boardElement.classList.remove("tutorial-highlight");

  renderAll();
}

tutorialSkipButton.addEventListener("click", exitTutorial);

tutorialCompleteButton.addEventListener("click", () => {
  tutorialCompleteOverlay.classList.add("hidden");
  openPage("homePage");
  renderAll();
});

restartTutorialButton.addEventListener("click", startTutorial);

/* =========================================
   УВЕДОМЛЕНИЯ
========================================= */

let messageTimer = null;

function showMessage(message) {
  let element = document.querySelector(".game-message");

  if (!element) {
    element = document.createElement("div");
    element.className = "game-message";
    document.body.appendChild(element);
  }

  element.textContent = message;
  element.style.display = "block";

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    element.style.display = "none";
  }, 2200);
}

/* =========================================
   ОБНОВЛЕНИЕ ИГРЫ
========================================= */

function renderAll() {
  renderCurrencies();
  renderBoard();
  renderQuests();
}

/* =========================================
   ЗАПУСК
========================================= */

renderAll();
openPage("homePage");

/*
  Проверяем доход каждые 10 секунд.
  Начисление рассчитывается по времени,
  поэтому закрытие игры не останавливает доход.
*/

updatePassiveIncome();

setInterval(() => {
  updatePassiveIncome();
}, PASSIVE_INTERVAL);

/*
  При возвращении во вкладку сразу
  проверяем накопившийся доход.
*/

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updatePassiveIncome();
  }
});

window.addEventListener("pageshow", () => {
  updatePassiveIncome();
});
