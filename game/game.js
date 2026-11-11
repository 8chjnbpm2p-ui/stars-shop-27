
const board = document.getElementById("board");
const skintDisplay = document.getElementById("skint");
const summonButton = document.getElementById("summon");

let skint = 100;

const items = [
  { name: "Осколок", icon: "💎" },
  { name: "Кристалл", icon: "🔮" },
  { name: "Руна", icon: "📜" },
  { name: "Камень", icon: "🪨" }
];

let cells = [
  "💎", null, "💎",
  null, "🔮", null,
  null, null, null
];

function render() {
  board.innerHTML = "";

  cells.forEach((item, index) => {
    const slot = document.createElement("button");
    slot.className = "slot";
    slot.textContent = item || "＋";
    slot.style.width = "100%";
    slot.style.padding = "0";
    slot.style.color = "#fff";
    slot.style.background = item
      ? "linear-gradient(145deg,#49376c,#25203b)"
      : "#211b35";

    slot.addEventListener("click", () => selectCell(index));
    board.appendChild(slot);
  });

  skintDisplay.textContent = skint;
}

let selected = null;

function selectCell(index) {
  if (!cells[index]) return;

  if (selected === null) {
    selected = index;
    board.children[index].style.border = "2px solid #f4d48c";
    return;
  }

  if (selected === index) {
    selected = null;
    render();
    return;
  }

  if (cells[selected] === cells[index]) {
    cells[index] = "✨";
    cells[selected] = null;
    skint += 5;
    selected = null;
    render();
    return;
  }

  selected = index;
  render();
  board.children[index].style.border = "2px solid #f4d48c";
}

summonButton.addEventListener("click", () => {
  if (skint < 10) {
    alert("Недостаточно Скинта!");
    return;
  }

  const empty = cells
    .map((item, index) => item === null ? index : -1)
    .filter(index => index !== -1);

  if (empty.length === 0) {
    alert("Нет свободных ячеек!");
    return;
  }

  skint -= 10;

  const position = empty[Math.floor(Math.random() * empty.length)];
  const randomItem = items[Math.floor(Math.random() * items.length)];

  cells[position] = randomItem.icon;
  render();
});

render();
