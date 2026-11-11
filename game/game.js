
const SAVE_KEY = "merge_worlds_save_v3";

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
  stone_fragment: {
    name: "Каменный осколок с древними символами",
    icon: "🪨"
  },
  glowing_dust: {
    name: "Светящаяся пыль",
    icon: "✨"
  },
  metal_plate: {
    name: "Тонкая металлическая пластина",
    icon: "🔩"
  },
  dense_cloth: {
    name: "Плотная ткань",
    icon: "🧶"
  },
  beast_leather: {
    name: "Прочная кожа местного зверя",
    icon: "🐾"
  },
  stable_stone: {
    name: "Небольшой стабильный магический камень",
    icon: "🔮"
  },
  key_core: {
    name: "Основа Ключа Расшифровки",
    icon: "🗝️"
  },
  tablet_core: {
    name: "Основа Фрагмента Скрижали",
    icon: "📜"
  },
  cloak_core: {
    name: "Основа путевого плаща",
    icon: "🧥"
  },
  key: {
    name: "Ключ Расшифровки",
    icon: "🗝️"
  },
  tablet: {
    name: "Фрагмент Скрижали",
    icon: "📜"
  },
  cloak: {
    name: "Укреплённый путевой плащ",
    icon: "🛡️"
  }
};

const recipes = {
  "ice_scale+dim_crystal": "key_core",
  "key_core+rune_cloth": "key",

  "stone_fragment+glowing_dust": "tablet_core",
  "metal_plate+tablet_core": "tablet",

  "beast_leather+dense_cloth": "cloak_core",
  "cloak_core+stable_stone": "cloak"
};

const questData = [
  {
    id: "key",
    giver: "Лефтарион",
    title: "Ключ Расшифровки",
    description: "Брат оставил записку. Мне нужен способ её прочесть.",
    item: "key",
    skint: 25,
    anti: 1
  },
  {
    id: "tablet",
    giver: "Лефтарион",
    title: "Фрагмент Скрижали",
    description: "Собери целый фрагмент древней Скрижали.",
    item: "tablet",
    skint: 40,
    anti: 1
  },
  {
    id: "cloak",
    giver: "Горбатик",
    title: "Укреплённый путевой плащ",
    description: "Подготовь защиту для дальнейшего путешествия.",
    item: "cloak",
    skint: 35,
    anti: 2
  }
];

const initialState = {
  skint: 100,
  antiSkint: 0,
  board: [
    "ice_scale",
    "dim_crystal",
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ],
  acceptedQuests: [],
  completedQuests: [],
  tutorialStep: 0,
  tutorialDone: false
};

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));

    if (!saved || !Array.isArray(saved.board)) {
      return structuredClone(initialState);
    }

    return {
      ...structuredClone(initialState),
      ...saved,
      board: saved.board.slice(0, 9)
    };
  } catch {
    return structuredClone(initialState);
  }
}

let state = loadGame();

const boardElement = document.getElementById("mergeBoard");
const skintElement = document.getElementById("skint");
const antiElement = document.getElementById("antiSkint");
const summonButton = document.getElementById("summonButton");

let dragSource = null;
let dragTarget = null;

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function updateCurrencies() {
  skintElement.textContent = state.skint;
  antiElement.textContent = state.antiSkint;
  saveGame();
}

function getRecipe(first, second) {
  return recipes[`${first}+${second}`] ||
         recipes[`${second}+${first}`] ||
         null;
}

function renderBoard() {
  boardElement.innerHTML = "";

  state.board.forEach((itemId, index) => {
    const cell = document.createElement("button");

    cell.className = "board-cell";
    cell.type = "button";
    cell.dataset.index = index;

    if (itemId && items[itemId]) {
      cell.innerHTML = `<span>${items[itemId].icon}</span>`;
      cell.title = items[itemId].name;
      cell.setAttribute("aria-label", items[itemId].name);
    } else {
      cell.innerHTML = "";
      cell.setAttribute("aria-label", "Пустая клетка");
    }

    cell.addEventListener("pointerdown", event => {
      if (!itemId) return;

      event.preventDefault();

      dragSource = index;
      cell.classList.add("dragging");
    });

    boardElement.appendChild(cell);
  });
}

function mergeItems(from, to) {
  if (from === to) return false;

  const first = state.board[from];
  const second = state.board[to];

  if (!first || !second) return false;

  const result = getRecipe(first, second);

  if (!result) {
    return false;
  }

  state.board[to] = result;
  state.board[from] = null;

  state.skint += 5;

  updateCurrencies();
  renderBoard();

  return true;
}

function finishDrag(event) {
  if (dragSource === null) return;

  const source = dragSource;
  const targetElement = document.elementFromPoint(
    event.clientX,
    event.clientY
  );

  const targetCell = targetElement?.closest(".board-cell");
  const target = targetCell
    ? Number(targetCell.dataset.index)
    : null;

  dragSource = null;
  dragTarget = null;

  if (target !== null && target !== source) {
    const merged = mergeItems(source, target);

    if (merged && state.tutorialStep === 1) {
      nextTutorialStep();
    }
  }

  renderBoard();
}

document.addEventListener("pointerup", finishDrag);
document.addEventListener("pointercancel", () => {
  dragSource = null;
  dragTarget = null;
  renderBoard();
});

summonButton.addEventListener("click", () => {
  if (state.skint < 10) {
    alert("Недостаточно Скинта!");
    return;
  }

  const emptyIndex = state.board.indexOf(null);

  if (emptyIndex === -1) {
    alert("Игровое поле заполнено!");
    return;
  }

  const availableItems = [
    "ice_scale",
    "dim_crystal",
    "rune_cloth",
    "stone_fragment",
    "glowing_dust",
    "metal_plate",
    "dense_cloth",
    "beast_leather",
    "stable_stone"
  ];

  state.skint -= 10;

  // Во время обучения выдаём нужный предмет.
  // После обучения предметы выбираются случайно.
  if (state.tutorialStep === 0) {
    state.board[emptyIndex] = "rune_cloth";
  } else {
    const randomIndex = Math.floor(
      Math.random() * availableItems.length
    );

    state.board[emptyIndex] = availableItems[randomIndex];
  }

  updateCurrencies();
  renderBoard();

  if (state.tutorialStep === 0) {
    nextTutorialStep();
  }
});

/* Квесты */

function renderQuests() {
  const list = document.getElementById("questList");
  list.innerHTML = "";

  questData.forEach(quest => {
    const accepted = state.acceptedQuests.includes(quest.id);
    const completed = state.completedQuests.includes(quest.id);

    const card = document.createElement("article");
    card.className = "quest-card";

    let buttonText = "Принять задание";

    if (completed) {
      buttonText = "Выполнено";
    } else if (accepted) {
      buttonText = "Сдать задание";
    }

    card.innerHTML = `
      <small>${quest.giver}</small>
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <p>
        Награда: ${quest.skint} Скинта
        и ${quest.anti} Анти-скинта
      </p>
      <button class="primary-button" type="button">
        ${buttonText}
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      if (completed) return;

      if (!accepted) {
        state.acceptedQuests.push(quest.id);
        saveGame();
        renderQuests();
        return;
      }

      const itemIndex = state.board.indexOf(quest.item);

      if (itemIndex === -1) {
        alert(
          `На поле пока нет предмета «${quest.title}». ` +
          "Сначала собери его!"
        );
        return;
      }

      state.board[itemIndex] = null;
      state.completedQuests.push(quest.id);

      state.skint += quest.skint;
      state.antiSkint += quest.anti;

      updateCurrencies();
      renderBoard();
      renderQuests();
      renderWorlds();
    });

    list.appendChild(card);
  });
}

/* Миры */

function renderWorlds() {
  const worldCards = document.querySelectorAll(".world-card");

  const firstWorldComplete = questData.every(quest =>
    state.completedQuests.includes(quest.id)
  );

  if (worldCards.length > 1 && firstWorldComplete) {
    worldCards[1].classList.remove("locked");

    const label = worldCards[1].querySelector("span");
    const description = worldCards[1].querySelector("p");
    const lock = worldCards[1].querySelector(".lock");

    if (label) label.textContent = "МИР 02 · ДОСТУПЕН";
    if (description) {
      description.textContent = "Мир открыт. Скоро здесь начнётся новое путешествие.";
    }
    if (lock) lock.remove();
  }
}

/* Переключение экранов */

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
    openPage(button.dataset.page);

    const expectedPages = {
      2: "questsPage",
      3: "worldPage",
      4: "profilePage"
    };

    if (
      !state.tutorialDone &&
      expectedPages[state.tutorialStep] === button.dataset.page
    ) {
      nextTutorialStep();
    }
  });
});

/* Интерактивное обучение */

const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");
const tutorialProgress = document.getElementById("tutorialProgress");
const tutorialButton = document.getElementById("tutorialButton");

const tutorialSteps = [
  {
    title: "Призови предмет",
    text: "Нажми на кнопку «Призвать предмет». За это потребуется 10 Скинта.",
    target: "#summonButton"
  },
  {
    title: "Объедини предметы",
    text: "Зажми первый предмет и перетащи его на подходящий второй предмет.",
    target: "#mergeBoard"
  },
  {
    title: "Твои задания",
    text: "Здесь находятся задания персонажей. Выполняй их, чтобы получать награды и открывать новые миры.",
    target: '[data-page="questsPage"]'
  },
  {
    title: "Миры",
    text: "Здесь собраны все миры. Следующие миры открываются после выполнения заданий предыдущего.",
    target: '[data-page="worldPage"]'
  },
  {
    title: "Твой профиль",
    text: "Здесь находится информация о твоём путешественнике и его прогрессе.",
    target: '[data-page="profilePage"]'
  }
];

let arrowElement = null;

function clearTutorialHighlight() {
  document.querySelectorAll(".tutorial-highlight").forEach(element => {
    element.classList.remove("tutorial-highlight");
  });

  if (arrowElement) {
    arrowElement.remove();
    arrowElement = null;
  }

  document.querySelector(".game-tabs").style.zIndex = "";
}

function showTutorial() {
  if (state.tutorialDone) {
    tutorialOverlay.classList.add("hidden");
    clearTutorialHighlight();
    return;
  }

  const step = tutorialSteps[state.tutorialStep];

  if (!step) {
    finishTutorial();
    return;
  }

  clearTutorialHighlight();

  tutorialOverlay.classList.remove("hidden");

  tutorialTitle.textContent = step.title;
  tutorialText.textContent = step.text;

  tutorialProgress.style.width =
    `${((state.tutorialStep + 1) / tutorialSteps.length) * 100}%`;

  tutorialButton.style.display = "none";

  const target = document.querySelector(step.target);

  if (target) {
    target.classList.add("tutorial-highlight");

    if (target.closest(".game-tabs")) {
      document.querySelector(".game-tabs").style.zIndex = "102";
    }

    arrowElement = document.createElement("div");
    arrowElement.className = "tutorial-arrow";
    arrowElement.textContent = "⬇";

    document.body.appendChild(arrowElement);

    const rect = target.getBoundingClientRect();

    arrowElement.style.left =
      `${rect.left + rect.width / 2 - 14}px`;

    arrowElement.style.top =
      `${Math.max(5, rect.top - 38)}px`;
  }

  saveGame();
}

function nextTutorialStep() {
  state.tutorialStep++;

  if (state.tutorialStep >= tutorialSteps.length) {
    finishTutorial();
    return;
  }

  showTutorial();
}

function finishTutorial() {
  state.tutorialDone = true;

  tutorialOverlay.classList.add("hidden");
  clearTutorialHighlight();

  saveGame();

  alert("Обучение завершено! Удачного путешествия, мироходец.");
}

tutorialButton.addEventListener("click", () => {
  finishTutorial();
});

/* Запуск */

updateCurrencies();
renderBoard();
renderQuests();
renderWorlds();
openPage("homePage");
showTutorial();
