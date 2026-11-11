
const items = [
  { name: "Осколок", icon: "❄️", level: 1 },
  { name: "Осколок", icon: "❄️", level: 1 },
  { name: "Кристалл", icon: "💎", level: 2 },
  { name: "Руна", icon: "🔮", level: 3 },
  { name: "Пыль", icon: "✨", level: 1 },
  null, null, null, null
];

let skint = Number(localStorage.getItem("mw_skint") || 100);
let antiSkint = Number(localStorage.getItem("mw_anti") || 0);
let selected = null;

const board = document.getElementById("mergeBoard");
const skintDisplay = document.getElementById("skint");
const antiDisplay = document.getElementById("antiSkint");

function save() {
  localStorage.setItem("mw_skint", skint);
  localStorage.setItem("mw_anti", antiSkint);
}

function updateCurrencies() {
  skintDisplay.textContent = skint;
  antiDisplay.textContent = antiSkint;
  save();
}

function renderBoard() {
  board.innerHTML = "";

  items.forEach((item, index) => {
    const cell = document.createElement("div");
    cell.className = "board-cell";
    cell.dataset.index = index;

    if (item) {
      cell.textContent = item.icon;
      cell.title = item.name;
    }

    if (selected === index) {
      cell.style.borderColor = "#f1d18a";
      cell.style.boxShadow = "0 0 15px #e9c77d88";
    }

    cell.addEventListener("click", () => selectItem(index));
    board.appendChild(cell);
  });
}

function selectItem(index) {
  if (!items[index]) {
    if (selected !== null) {
      items[index] = items[selected];
      items[selected] = null;
      selected = null;
      renderBoard();
    }
    return;
  }

  if (selected === null) {
    selected = index;
    renderBoard();
    return;
  }

  if (selected === index) {
    selected = null;
    renderBoard();
    return;
  }

  const first = items[selected];
  const second = items[index];

  if (first.level === second.level) {
    items[index] = {
      name: "Усиленный предмет",
      icon: first.level >= 3 ? "🌟" : "💠",
      level: first.level + 1
    };

    items[selected] = null;
    skint += first.level * 5;
    updateCurrencies();
  } else {
    items[selected] = second;
    items[index] = first;
  }

  selected = null;
  renderBoard();
}

document.getElementById("summonButton").addEventListener("click", () => {
  if (skint < 10) {
    alert("Недостаточно Скинта!");
    return;
  }

  const empty = items.findIndex(item => item === null);

  if (empty === -1) {
    alert("Нет свободных ячеек!");
    return;
  }

  skint -= 10;

  const level = Math.random() < 0.75 ? 1 : 2;

  items[empty] = {
    name: level === 1 ? "Осколок" : "Кристалл",
    icon: level === 1 ? "❄️" : "💎",
    level
  };

  updateCurrencies();
  renderBoard();
});

const quests = [
  {
    title: "Ключ Расшифровки",
    giver: "Лефтарион",
    description: "Собери предмет, который поможет прочесть оставленную записку.",
    reward: "25 Скинта и 1 Анти-скинт"
  },
  {
    title: "Фрагмент Скрижали",
    giver: "Лефтарион",
    description: "Собери фрагмент древней Скрижали.",
    reward: "40 Скинта и 1 Анти-скинт"
  },
  {
    title: "Укреплённый путевой плащ",
    giver: "Горбатик",
    description: "Подготовь защиту для дальнейшего путешествия.",
    reward: "35 Скинта и 2 Анти-скинта"
  }
];

function renderQuests() {
  const list = document.getElementById("questList");

  list.innerHTML = quests.map(quest => `
    <article class="quest-card">
      <small>${quest.giver}</small>
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <p>Награда: ${quest.reward}</p>
    </article>
  `).join("");
}

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach(item =>
      item.classList.remove("active")
    );

    document.querySelectorAll(".page").forEach(page =>
      page.classList.remove("active")
    );

    button.classList.add("active");
    document.getElementById(button.dataset.page).classList.add("active");
  });
});

updateCurrencies();
renderBoard();
renderQuests();
