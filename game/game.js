
const SAVE_KEY = "merge_worlds_save_v2";

const recipes = {
  1: {
    name: "Тусклый кристалл",
    icon: "💎",
    next: 2
  },
  2: {
    name: "Светящийся кристалл",
    icon: "🔷",
    next: 3
  },
  3: {
    name: "Магический кристалл",
    icon: "🔮",
    next: 4
  },
  4: {
    name: "Кристалл энергии",
    icon: "💠",
    next: 5
  },
  5: {
    name: "Сердце кристалла",
    icon: "🌟",
    next: null
  }
};

const initialState = {
  skint: 100,
  antiSkint: 0,
  board: [
    1, 1, 2,
    2, 1, null,
    1, null, null
  ],
  acceptedQuests: [],
  completedQuests: [],
  tutorialDone: false
};

let state;

try {
  state = JSON.parse(localStorage.getItem(SAVE_KEY)) || initialState;
} catch {
  state = initialState;
}

const boardElement = document.getElementById("mergeBoard");
const skintElement = document.getElementById("skint");
const antiElement = document.getElementById("antiSkint");

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function updateCurrencies() {
  skintElement.textContent = state.skint;
  antiElement.textContent = state.antiSkint;
  saveGame();
}

function renderBoard() {
  boardElement.innerHTML = "";

  state.board.forEach((level, index) => {
    const cell = document.createElement("button");
    cell.className = "board-cell";
    cell.type = "button";

    if (level !== null) {
      const item = recipes[level];
      cell.innerHTML = `
        <span>${item.icon}</span>
        <small>${item.name}</small>
      `;
    }

    cell.addEventListener("click", () => selectCell(index));
    boardElement.appendChild(cell);
  });
}

let selectedCell = null;

function selectCell(index) {
  const level = state.board[index];

  if (selectedCell === null) {
    if (level === null) return;

    selectedCell = index;
    renderBoard();
    boardElement.children[index].style.borderColor = "#f1d18a";
    return;
  }

  if (selectedCell === index) {
    selectedCell = null;
    renderBoard();
    return;
  }

  const first = state.board[selectedCell];
  const second = state.board[index];

  if (second === null) {
    state.board[index] = first;
    state.board[selectedCell] = null;
  } else if (first === second && recipes[first].next !== null) {
    state.board[index] = recipes[first].next;
    state.board[selectedCell] = null;
    state.skint += first * 5;
  } else {
    selectedCell = index;
    renderBoard();
    boardElement.children[index].style.borderColor = "#f1d18a";
    return;
  }

  selectedCell = null;
  updateCurrencies();
  renderBoard();
}

document.getElementById("summonButton").addEventListener("click", () => {
  if (state.skint < 10) {
    alert("Недостаточно Скинта!");
    return;
  }

  const emptyIndex = state.board.indexOf(null);

  if (emptyIndex === -1) {
    alert("Игровое поле заполнено!");
    return;
  }

  state.skint -= 10;
  state.board[emptyIndex] = 1;

  updateCurrencies();
  renderBoard();
});

const quests = [
  {
    id: "key",
    giver: "Лефтарион",
    title: "Ключ Расшифровки",
    description: "Собери ключ, чтобы прочитать оставленную записку.",
    required: 5,
    rewardSkint: 25,
    rewardAnti: 1
  },
  {
    id: "tablet",
    giver: "Лефтарион",
    title: "Фрагмент Скрижали",
    description: "Создай фрагмент древней Скрижали.",
    required: 4,
    rewardSkint: 40,
    rewardAnti: 1
  },
  {
    id: "cloak",
    giver: "Горбатик",
    title: "Укреплённый путевой плащ",
    description: "Подготовь защиту для путешествия.",
    required: 3,
    rewardSkint: 35,
    rewardAnti: 2
  }
];

function renderQuests() {
  const list = document.getElementById("questList");

  list.innerHTML = "";

  quests.forEach(quest => {
    const accepted = state.acceptedQuests.includes(quest.id);
    const completed = state.completedQuests.includes(quest.id);

    const card = document.createElement("article");
    card.className = "quest-card";

    card.innerHTML = `
      <small>${quest.giver}</small>
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <p>Награда: ${quest.rewardSkint} Скинта и ${quest.rewardAnti} Анти-скинта</p>
      <button class="primary-button">
        ${completed ? "Выполнено" : accepted ? "Сдать задание" : "Принять задание"}
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

      const itemIndex = state.board.indexOf(quest.required);

      if (itemIndex === -1) {
        alert("У тебя пока нет нужного предмета. Собери его на игровом поле!");
        return;
      }

      state.board[itemIndex] = null;
      state.completedQuests.push(quest.id);
      state.skint += quest.rewardSkint;
      state.antiSkint += quest.rewardAnti;

      updateCurrencies();
      renderBoard();
      renderQuests();
    });

    list.appendChild(card);
  });
}

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach(nav =>
      nav.classList.remove("active")
    );

    document.querySelectorAll(".page").forEach(page =>
      page.classList.remove("active")
    );

    button.classList.add("active");

    const target = document.getElementById(button.dataset.page);

    if (target) target.classList.add("active");
  });
});

function startTutorial() {
  if (state.tutorialDone) return;

  alert(
    "Добро пожаловать в Merge Worlds!\n\n" +
    "1. Нажми «Призвать предмет».\n" +
    "2. Выбери предмет на поле.\n" +
    "3. Перетащи его на такой же предмет, выбрав сначала один, затем другой.\n" +
    "4. Одинаковые предметы объединяются в следующий уровень."
  );

  state.tutorialDone = true;
  saveGame();
}

updateCurrencies();
renderBoard();
renderQuests();
startTutorial();
