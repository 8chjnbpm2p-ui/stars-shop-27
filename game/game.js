
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
    icon: "🧱"
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
    icon: "🪡"
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
    icon: "🪬"
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
    icon: "🔰"
  },
  fire_core: {
    name: "Сердцевина пламени",
    icon: "🔥"
  },
  fire_emblem: {
    name: "Печать огненного полубога",
    icon: "♨️"
  },

  broken_persik: {
    name: "Неактивный модуль П.Е.Р.С.И.К.",
    icon: "🛰️"
  },
  power_cell: {
    name: "Аккумулятор высокой ёмкости",
    icon: "🔋"
  },
  persik_prime: {
    name: "Активированный модуль П.Е.Р.С.И.К.",
    icon: "🤖"
  },
  identity_chip: {
    name: "Фрагмент цифрового сертификата",
    icon: "💳"
  },
  forged_document: {
    name: "Поддельные документы",
    icon: "📄"
  },
  alt_city_pass: {
    name: "Сертификат Альт-Сити",
    icon: "🪪"
  },
  carbon_shard: {
    name: "Необогащённый углерод",
    icon: "⚫"
  },
  copper_circuit: {
    name: "Медная микросхема",
    icon: "🔌"
  },
  enriched_carbon: {
    name: "Обогащённый углерод",
    icon: "⬛"
  },
  jammer_core: {
    name: "Основа глушилки",
    icon: "📡"
  },
  stealth_jammer: {
    name: "Усиленная глушилка",
    icon: "📶"
  },
  archive_key: {
    name: "Ключ доступа к архиву",
    icon: "🗝️"
  },
  tower_pass: {
    name: "Пропуск Башни Света",
    icon: "🏙️"
  },
  memory_fragment: {
    name: "Фрагмент памяти Райи",
    icon: "🧩"
  },
  raya_memory: {
    name: "Восстановленный блок памяти Райи",
    icon: "💠"
  },
  imperial_cipher: {
    name: "Шифр Империи",
    icon: "🔐"
  },
  rehoboam_fragment: {
    name: "Фрагмент ядра Rehoboam",
    icon: "🖥️"
  },
  jdh_cipher: {
    name: "Зашифрованное послание JDH",
    icon: "📨"
  }

  ,
  time_ash: { name: "Пепел остановленного времени", icon: "⌛" },
  echo_thread: { name: "Нить временного эха", icon: "🧵" },
  cracked_hourglass: { name: "Треснувшие песочные часы", icon: "⏳" },
  void_gear: { name: "Шестерня Междумирья", icon: "⚙️" },
  paradox_glass: { name: "Парадоксальное стекло", icon: "🪞" },
  memory_sand: { name: "Песок утраченных воспоминаний", icon: "🏺" },
  time_core: { name: "Сердцевина времени", icon: "🌀" },
  time_key: { name: "Ключ временной тюрьмы", icon: "🗝️" },
  echo_compass: { name: "Компас временного эха", icon: "🧭" },
  echo_seal: { name: "Печать временного парадокса", icon: "🔮" },
  prison_core: { name: "Основа печати Видомнии", icon: "🔗" },
  prison_seal: { name: "Печать Видомнии", icon: "⛓️" },

  sun_sand: { name: "Песок солнечного храма", icon: "🌞" },
  black_obsidian: { name: "Осколок чёрного обсидиана", icon: "🪨" },
  sacred_oil: { name: "Священное масло", icon: "🫙" },
  gold_thread: { name: "Золотая нить жреца", icon: "🧵" },
  scarab_shell: { name: "Панцирь скарабея", icon: "🪲" },
  flame_heart: { name: "Уголь божественного пламени", icon: "🔥" },
  altar_core: { name: "Основа солнечного алтаря", icon: "🛕" },
  thirteen_candle: { name: "Тринадцатый огонь", icon: "🕯️" },
  sun_disc: { name: "Диск Окетры", icon: "☀️" },
  scarab_emblem: { name: "Печать песчаного культа", icon: "🔱" },
  oath_core: { name: "Основа клятвы", icon: "📜" },
  oath_seal: { name: "Клятва тринадцати огней", icon: "✨" },

  broken_mask: { name: "Повреждённая маска автоматона", icon: "🤖" },
  data_tape: { name: "Лента университетского архива", icon: "📼" },
  synth_chip: { name: "Синтетический чип", icon: "💾" },
  memory_film: { name: "Плёнка воспоминаний", icon: "🎞️" },
  servo_motor: { name: "Сервопривод", icon: "🔩" },
  code_fragment: { name: "Фрагмент кода JDH", icon: "💻" },
  campus_core: { name: "Основа пропуска Lucky Charms", icon: "🎓" },
  campus_pass: { name: "Пропуск университета", icon: "🪪" },
  automaton_core: { name: "Ядро перепрошивки", icon: "🤖" },
  automaton_key: { name: "Ключ свободы автоматонов", icon: "🔑" },
  mask_core: { name: "Основа маски путешественника", icon: "🎭" },
  jdh_mask: { name: "Маска JDH", icon: "🕶️" },

  cosmic_dust: { name: "Звёздная пыль", icon: "🌌" },
  star_ore: { name: "Руда далёкой звезды", icon: "☄️" },
  gravity_crystal: { name: "Кристалл гравитации", icon: "💠" },
  void_ink: { name: "Чернила пустоты", icon: "🖋️" },
  origin_seed: { name: "Семя первозданной материи", icon: "🌱" },
  resonance_shell: { name: "Оболочка резонанса", icon: "🐚" },
  cosmic_core: { name: "Основа космической линзы", icon: "🔭" },
  cosmic_lens: { name: "Линза мироздания", icon: "🔮" },
  heart_core: { name: "Сердцевина Вселенной", icon: "❤️‍🔥" },
  heart_fragment: { name: "Фрагмент Сердца Вселенной", icon: "💗" },
  origin_core: { name: "Основа первоисточника", icon: "🌀" },
  origin_key: { name: "Ключ первозданной ветви", icon: "🗝️" },

  bunker_scrap: { name: "Металлолом убежища", icon: "🧱" },
  filter_mesh: { name: "Фильтрующая сетка", icon: "🕸️" },
  skint_blood: { name: "Сгусток скинта", icon: "🩸" },
  branch_map: { name: "Карта умирающей ветки", icon: "🗺️" },
  time_cell: { name: "Ячейка времени", icon: "🔋" },
  containment_glass: { name: "Защитное стекло", icon: "🧪" },
  filter_core: { name: "Основа фильтра убежища", icon: "⚗️" },
  shelter_filter: { name: "Фильтр для бункера", icon: "🛡️" },
  branch_core: { name: "Якорь ветки", icon: "⚓" },
  branch_anchor: { name: "Стабилизатор живой ветки", icon: "🌿" },
  mother_core: { name: "Основа сосуда Первой Матери", icon: "🏺" },
  first_mother_vial: { name: "Сосуд крови Первой Матери", icon: "🧬" },

  workshop_ore: { name: "Руда Мастерской", icon: "⛏️" },
  gear_spring: { name: "Пружина точного механизма", icon: "⚙️" },
  blueprint: { name: "Чертёж неизвестной конструкции", icon: "📐" },
  arcane_alloy: { name: "Дуговой сплав", icon: "🔩" },
  living_core: { name: "Живое ядро", icon: "💚" },
  crystal_logic: { name: "Кристалл логики", icon: "💎" },
  mk47_core: { name: "Основа модуля МК-47", icon: "🧩" },
  mk47_module: { name: "Модуль МК-47", icon: "🤖" },
  workshop_core: { name: "Ядро Мастерской", icon: "🏭" },
  workshop_key: { name: "Ключ второго этапа", icon: "🔑" },
  evolution_core: { name: "Основа эволюционного чертежа", icon: "📘" },
  evolution_blueprint: { name: "Чертёж следующей формы", icon: "✨" }

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
  [makePair("order_core", "stone_symbol")]: "order_sign",
  [makePair("strange_glass", "weak_energy")]: "fire_core",
  [makePair("fire_core", "magic_essence")]: "fire_emblem",

  [makePair("broken_persik", "power_cell")]: "persik_prime",
  [makePair("identity_chip", "forged_document")]: "alt_city_pass",
  [makePair("carbon_shard", "copper_circuit")]: "enriched_carbon",
  [makePair("enriched_carbon", "power_cell")]: "jammer_core",
  [makePair("jammer_core", "alt_city_pass")]: "stealth_jammer",
  [makePair("alt_city_pass", "archive_key")]: "tower_pass",
  [makePair("memory_fragment", "persik_prime")]: "raya_memory",
  [makePair("raya_memory", "rehoboam_fragment")]: "jdh_cipher"

  ,
  [makePair("time_ash", "echo_thread")]: "time_core",
  [makePair("time_core", "cracked_hourglass")]: "time_key",
  [makePair("paradox_glass", "void_gear")]: "echo_compass",
  [makePair("echo_compass", "memory_sand")]: "echo_seal",
  [makePair("memory_sand", "time_ash")]: "prison_core",
  [makePair("prison_core", "echo_thread")]: "prison_seal",
  [makePair("sun_sand", "black_obsidian")]: "altar_core",
  [makePair("altar_core", "sacred_oil")]: "thirteen_candle",
  [makePair("scarab_shell", "gold_thread")]: "sun_disc",
  [makePair("sun_disc", "flame_heart")]: "scarab_emblem",
  [makePair("sacred_oil", "flame_heart")]: "oath_core",
  [makePair("oath_core", "black_obsidian")]: "oath_seal",
  [makePair("data_tape", "synth_chip")]: "campus_core",
  [makePair("campus_core", "memory_film")]: "campus_pass",
  [makePair("broken_mask", "servo_motor")]: "automaton_core",
  [makePair("automaton_core", "code_fragment")]: "automaton_key",
  [makePair("memory_film", "code_fragment")]: "mask_core",
  [makePair("mask_core", "broken_mask")]: "jdh_mask",
  [makePair("cosmic_dust", "star_ore")]: "cosmic_core",
  [makePair("cosmic_core", "gravity_crystal")]: "cosmic_lens",
  [makePair("gravity_crystal", "resonance_shell")]: "heart_core",
  [makePair("heart_core", "void_ink")]: "heart_fragment",
  [makePair("origin_seed", "void_ink")]: "origin_core",
  [makePair("origin_core", "cosmic_dust")]: "origin_key",
  [makePair("bunker_scrap", "filter_mesh")]: "filter_core",
  [makePair("filter_core", "containment_glass")]: "shelter_filter",
  [makePair("branch_map", "time_cell")]: "branch_core",
  [makePair("branch_core", "skint_blood")]: "branch_anchor",
  [makePair("skint_blood", "containment_glass")]: "mother_core",
  [makePair("mother_core", "time_cell")]: "first_mother_vial",
  [makePair("workshop_ore", "gear_spring")]: "mk47_core",
  [makePair("mk47_core", "blueprint")]: "mk47_module",
  [makePair("arcane_alloy", "crystal_logic")]: "workshop_core",
  [makePair("workshop_core", "living_core")]: "workshop_key",
  [makePair("living_core", "crystal_logic")]: "evolution_core",
  [makePair("evolution_core", "blueprint")]: "evolution_blueprint"

};

/* =========================================
   УЛУЧШЕННЫЕ ПРЕДМЕТЫ
========================================= */

const evolutionNames = ["", "Совершенная", "Вознесённая", "Легендарная", "Мифическая", "Божественная"];
const evolutionMarks = ["", "✧", "♛", "♜", "✺", "☼"];

function ensureUpgradeItem(itemId) {
  if (!itemId || items[itemId]) return;

  const evolvedMatch = itemId.match(/^evolved_(\d+)_(.+)$/);
  if (evolvedMatch) {
    const tier = Number(evolvedMatch[1]);
    const rootId = evolvedMatch[2];
    ensureUpgradeItem(rootId);
    if (!items[rootId]) return;
    const root = items[rootId];
    items[itemId] = {
      name: root.name + " · " + (evolutionNames[tier] || "Вознесённая"),
      icon: root.icon + (evolutionMarks[tier] || "✧"),
      baseItemId: root.baseItemId || rootId,
      upgradeLevel: 0,
      evolutionTier: tier
    };
    return;
  }

  if (itemId.startsWith("refined_")) {
    const parentId = itemId.slice("refined_".length);
    ensureUpgradeItem(parentId);
    if (!items[parentId]) return;
    const parent = items[parentId];
    items[itemId] = {
      name: parent.name + " ✦",
      icon: parent.icon + "✦",
      baseItemId: parent.baseItemId || parentId,
      upgradeLevel: (parent.upgradeLevel || 0) + 1,
      evolutionTier: parent.evolutionTier || 0
    };
  }
}

function getUpgradeId(itemId) {
  ensureUpgradeItem(itemId);
  const current = items[itemId];
  if (!current) return itemId;

  const rootId = current.baseItemId || itemId;
  const nextLevel = (current.upgradeLevel || 0) + 1;
  const tier = current.evolutionTier || 0;

  // Четвёртое объединение превращает предмет в новую ступень,
  // а не добавляет бесконечное количество одинаковых звёзд.
  if (nextLevel >= 4) {
    const nextTier = tier + 1;
    const evolvedId = "evolved_" + nextTier + "_" + rootId;
    ensureUpgradeItem(evolvedId);
    return evolvedId;
  }

  const refinedId = "refined_" + itemId;
  if (!items[refinedId]) {
    items[refinedId] = {
      name: current.name + " ✦",
      icon: current.icon + "✦",
      baseItemId: rootId,
      upgradeLevel: nextLevel,
      evolutionTier: tier
    };
  }
  return refinedId;
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
    name: "Мастерская",
    description: "Искусственный, созданный мир-симуляция. Здесь всё подчиняется правилам, которые можно понять… или сломать."
  }
];

/* =========================================
   СЮЖЕТНЫЕ СТАТУСЫ ПРОФИЛЯ
========================================= */

const profileRanks = {
  1: "Искра",
  2: "Междумирец",
  3: "Бунтарь",
  4: "Хранитель",
  5: "Освободитель",
  6: "Отражение",
  7: "Первый",
  8: "Выживший",
  9: "Создатель МК-47"
};


/* Локальные SVG-портреты: не зависят от внешних хостингов изображений. */
function localPortrait(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
const characterPortraits = {
  watcher: localPortrait(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="b" x2="0" y2="1"><stop stop-color="#24233a"/><stop offset="1" stop-color="#05060c"/></linearGradient><linearGradient id="c" x2="1" y2="1"><stop stop-color="#343348"/><stop offset="1" stop-color="#090a12"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="240" height="240" rx="28" fill="url(#b)"/><circle cx="120" cy="100" r="76" fill="#11121d"/><path d="M43 240 58 112Q61 43 120 35q59 8 62 77l15 128Z" fill="url(#c)" stroke="#555468" stroke-width="3"/><path d="M66 76Q78 15 120 18q42-3 54 58l-16-17q-38-22-76 0Z" fill="#080910"/><path d="M77 98q18-17 38-2-18 20-38 2m48-2q20-15 38 2-20 18-38-2" fill="#f7fbff" filter="url(#g)"/><path d="M77 98q18-17 38-2-18 20-38 2m48-2q20-15 38 2-20 18-38-2" fill="#fff"/><path d="M58 145q62 30 124 0l-8 25q-54 26-108 0Z" fill="#d9d8e2"/><path d="M68 175 44 240h152l-24-65q-52 25-104 0Z" fill="#171824"/><path d="M77 183 55 240m108-57 22 57" stroke="#555468" stroke-width="5"/></svg>`),
  sindbad: localPortrait(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="b" x2="0" y2="1"><stop stop-color="#e8a64f"/><stop offset="1" stop-color="#69351e"/></linearGradient></defs><rect width="240" height="240" rx="28" fill="#42291f"/><circle cx="120" cy="100" r="77" fill="#d18a52"/><path d="M35 240q6-65 55-82h60q49 17 55 82" fill="#75452e"/><path d="M68 92q-4-55 52-64 47-8 62 37l-16 20q-38-21-98 7Z" fill="#7b1e2a"/><path d="M67 81q45-32 107-4l-6 15q-53-18-98 8Z" fill="#a52b37"/><path d="M84 105q14-8 27 0m20 0q14-8 27 0" stroke="#20212a" stroke-width="5" fill="none"/><path d="M116 112q-6 22 6 27" stroke="#70412e" stroke-width="4" fill="none"/><path d="M87 145q33 22 66 0l-8 25q-27 20-52 0Z" fill="#39251e"/><path d="M91 145q28 16 58 0" stroke="#201714" stroke-width="7" fill="none"/><path d="M66 188q54 24 108 0" stroke="#c38b4d" stroke-width="8" fill="none"/></svg>`),
  sderik: localPortrait(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="b" x2="0" y2="1"><stop stop-color="#b9c7d1"/><stop offset="1" stop-color="#46515b"/></linearGradient></defs><rect width="240" height="240" rx="28" fill="#26333b"/><circle cx="120" cy="98" r="76" fill="#c48c65"/><path d="M34 240q7-65 57-83h58q50 18 57 83" fill="#e9e9e5"/><path d="M65 78q4-55 55-58 50 2 57 58l-14 8q-43-26-85 0Z" fill="#d7d9d9"/><path d="M84 104q14-9 27 0m20 0q14-9 27 0" stroke="#20242a" stroke-width="5" fill="none"/><path d="M117 112q-5 20 6 24" stroke="#80563e" stroke-width="4" fill="none"/><path d="M88 145q32 17 64 0l-8 20q-24 17-48 0Z" fill="#55443d"/><path d="M75 183 120 204l45-21" stroke="#c4a66d" stroke-width="7" fill="none"/><path d="M88 188v52m64-52v52" stroke="#fff" stroke-width="13"/></svg>`)
};

/* =========================================
   КВЕСТЫ
========================================= */

const questData = [
  {
    id: "keyQuest",
    title: "Ключ Расшифровки",
    character: "Лефтарион",
    portrait: "https://i.ytimg.com/vi/QmDd6KExmMA/maxresdefault.jpg",
    description: "Брат оставил записку. Мне нужен способ её прочесть.",
    target: "key",
    rewardSkint: 25,
    rewardAnti: 1
  },
  {
    id: "tabletQuest",
    title: "Фрагмент Скрижали",
    character: "Лефтарион",
    portrait: "https://i.ytimg.com/vi/QmDd6KExmMA/maxresdefault.jpg",
    description: "Собери целый фрагмент древней Скрижали.",
    target: "tablet",
    rewardSkint: 40,
    rewardAnti: 1
  },
  {
    id: "cloakQuest",
    title: "Укреплённый путевой плащ",
    character: "Горбатик",
    portrait: "https://fanfics.me/images/fandoms_heroes/3106-1756472497-big.jpg",
    description: "Без хорошей защиты далеко не уйдёшь.",
    target: "cloak",
    rewardSkint: 35,
    rewardAnti: 2
  },
  {
    id: "anomalyCoreQuest",
    world: 2,
    title: "Следы утраченной памяти",
    character: "Джодах",
    portrait: "https://image.jannyai.com/bot-avatars/fc6dklHKojmABpArtOvZc.webp",
    description: "Воспоминания о прошлом всё ещё скрыты. Собери основу стабилизатора, чтобы исследовать странную аномалию и найти первую зацепку о своей истинной природе.",
    target: "anomaly_core",
    rewardSkint: 55,
    rewardAnti: 2
  },
  {
    id: "anomalyStabilizerQuest",
    world: 2,
    title: "Путь Ангела Смерти",
    character: "Джодах",
    portrait: "https://image.jannyai.com/bot-avatars/fc6dklHKojmABpArtOvZc.webp",
    description: "Джодах направляет тебя сквозь опасности этого мира. Создай стабилизатор аномалии — он поможет удержать разлом и продолжить поиски ответов.",
    target: "anomaly_stabilizer",
    rewardSkint: 90,
    rewardAnti: 3
  },
  {
    id: "luciusFireQuest",
    world: 2,
    title: "Испытание огнём",
    character: "Люциус",
    portrait: "https://i.pinimg.com/736x/73/45/f1/7345f1dc85ce5ba7a5c476e223cf805b.jpg",
    description: "Полубог огня не собирается доверять тебе просто так. Создай печать огненного полубога, чтобы доказать, что способен выдержать его испытание. Со временем между вами может появиться настоящая дружба.",
    target: "fire_emblem",
    rewardSkint: 70,
    rewardAnti: 2
  },
  {
    id: "magicMentorsQuest",
    world: 2,
    title: "Уроки магии",
    character: "Бастиан и Воланд",
    portrait: "https://i.pinimg.com/736x/f8/19/72/f81972f93dfe250d149afd3e236c7421.jpg",
    description: "Опытные маги предлагают помощь. Восстанови фрагмент Амулета Эолы — он поможет изучать древнюю магию этого мира.",
    target: "eola_amulet",
    rewardSkint: 80,
    rewardAnti: 2
  },
  {
    id: "emrisQuest",
    world: 2,
    title: "Знак сопротивления",
    character: "Бастиан и Воланд",
    portrait: "https://i.pinimg.com/736x/f8/19/72/f81972f93dfe250d149afd3e236c7421.jpg",
    description: "Эмрис стремится подчинить магию и даже богов своей воле. Создай защитный знак Ордена, чтобы противостоять его планам.",
    target: "order_sign",
    rewardSkint: 120,
    rewardAnti: 4
  },
  {
    id: "perfectRayaActivationQuest",
    world: 3,
    title: "Пробуждение П.Е.Р.С.И.К.",
    character: "Райя-Прайм",
    portrait: "https://images.hiwaifu.com/uploads/Api/robot_avatar/202501/8d98645505c931ccd27e9ceacb0b3729.webp",
    description: "Ты очнулся в незнакомом мире, а рядом обнаружился неактивный модуль. Я — Райя-Прайм. Найди аккумулятор и активируй П.Е.Р.С.И.К. Нам нужно понять, почему система выбрала именно тебя.",
    target: "persik_prime",
    rewardSkint: 60,
    rewardAnti: 2
  },
  {
    id: "perfectKateIdentityQuest",
    world: 3,
    requires: "perfectRayaActivationQuest",
    title: "Личность под вопросом",
    character: "Кейт",
    portrait: "https://cdn.ibispaint.com/movie/855/667/855667098/image855667098.png",
    description: "Я — RATARETO. Империя не оставляет в покое тех, у кого нет правильных документов. Собери цифровой сертификат, чтобы пройти проверку и попасть в Альт-Сити. И не верь всему, что говорят по громкоговорителям.",
    target: "alt_city_pass",
    rewardSkint: 75,
    rewardAnti: 2
  },
  {
    id: "perfectRadanJammerQuest",
    world: 3,
    requires: "perfectKateIdentityQuest",
    title: "Доверие строится делом",
    character: "Радан",
    portrait: "https://pbs.twimg.com/media/Fdbwh_5WAAAJW7g?format=jpg&name=4096x4096",
    description: "Не думай, что я тебе уже доверяю. Помоги собрать усиленную глушилку: с ней мы сможем безопаснее работать с имперскими системами. И да, не трогай мои инструменты без спроса.",
    target: "stealth_jammer",
    rewardSkint: 90,
    rewardAnti: 3
  },
  {
    id: "perfectKateTowerQuest",
    world: 3,
    requires: "perfectRadanJammerQuest",
    title: "Путь к Башне Света",
    character: "Кейт",
    portrait: "https://cdn.ibispaint.com/movie/855/667/855667098/image855667098.png",
    description: "В центре Альт-Сити находится Башня Света. Нам нужен доступ к её архивам. Подготовь пропуск и будь готов: если нас заметят, обратного пути может не быть.",
    target: "tower_pass",
    rewardSkint: 105,
    rewardAnti: 3
  },
  {
    id: "perfectCalebWarningQuest",
    world: 3,
    requires: "perfectKateTowerQuest",
    title: "Предупреждение главного секретаря",
    character: "Калеб",
    portrait: "https://i.pinimg.com/736x/56/1a/cf/561acf2e99081a96f8a5a96db493c9ca.jpg",
    description: "Ты слишком близко подобрался к правде. Империя следит за каждым шагом, а стирание личности — не пустая угроза. Я не обязан тебе помогать… но кое-что в этой системе давно пошло не так. Добудь шифр Империи.",
    target: "imperial_cipher",
    rewardSkint: 120,
    rewardAnti: 4
  },
  {
    id: "perfectRayaMemoryQuest",
    world: 3,
    requires: "perfectCalebWarningQuest",
    title: "Память, которой не должно быть",
    character: "Райя-Прайм",
    portrait: "https://images.hiwaifu.com/uploads/Api/robot_avatar/202501/8d98645505c931ccd27e9ceacb0b3729.webp",
    description: "В архиве обнаружились данные, связанные с моим прошлым. Мне нужно восстановить повреждённый блок памяти. Возможно, я знаю об этой системе гораздо больше, чем помню.",
    target: "raya_memory",
    rewardSkint: 140,
    rewardAnti: 4
  },
  {
    id: "perfectJdhSignalQuest",
    world: 3,
    requires: "perfectRayaMemoryQuest",
    title: "Сигнал из глубины системы",
    character: "JDH",
    portrait: "https://i.pinimg.com/736x/40/d3/79/40d379735827e89f6d2996a2a6016f30.jpg",
    description: "Это JDH. Ты нашёл след, который должен был оставаться скрытым. Соедини восстановленные данные Райи с фрагментом ядра Rehoboam. Тогда станет ясно, кто стоял за технологиями этого мира и почему их создали.",
    target: "jdh_cipher",
    rewardSkint: 180,
    rewardAnti: 5
  },
  {
    id: "voiceJodahQuest",
    world: 4,
    title: "След временной петли",
    character: "Джодах",
    portrait: "https://i.pinimg.com/originals/03/d7/ab/03d7ab4a275895f3ed6883307f3b1ab9.jpg",
    description: "Ты снова замечаешь следы временной петли. Собери ключ, чтобы открыть путь к запечатанным воспоминаниям.",
    target: "time_key",
    rewardSkint: 115,
    rewardAnti: 4
  },
  {
    id: "voiceFaragondaQuest",
    world: 4,
    requires: "voiceJodahQuest",
    title: "Компас потерянных мгновений",
    character: "Фарагонда",
    portrait: "https://i.postimg.cc/L6GPB2P2/IMG-1786.jpg",
    description: "Временное эхо сбивает ориентиры. Создай компас и закрепи его печатью, чтобы найти правильную ветвь.",
    target: "echo_seal",
    rewardSkint: 135,
    rewardAnti: 4
  },
  {
    id: "voiceEbardoQuest",
    world: 4,
    requires: "voiceFaragondaQuest",
    title: "Тюрьма для парадокса",
    character: "Эбардо",
    portrait: "https://i.pinimg.com/736x/db/82/fa/db82fa36b7dbc2d0cd88961f5beda470.jpg",
    description: "Парадокс нельзя оставить без контроля. Подготовь печать Видомнии — она удержит разлом хотя бы на время.",
    target: "prison_seal",
    rewardSkint: 160,
    rewardAnti: 5
  },
  {
    id: "flamesOketraQuest",
    world: 5,

    title: "Знак солнечного храма",
    character: "Окетра",
    portrait: "https://i.pinimg.com/736x/69/9b/8e/699b8e07c38b7b959407eeeaf06918c9.jpg",
    description: "Храм не примет чужака без подношения. Восстанови алтарь и зажги тринадцатый огонь.",
    target: "thirteen_candle",
    rewardSkint: 125,
    rewardAnti: 4
  },
  {
    id: "flamesSindbadQuest",
    world: 5,
    requires: "flamesOketraQuest",

    title: "Путь через пески",
    character: "Синдбад",
    portrait: "https://i.postimg.cc/L6GPB2P2/IMG-1786.jpg",
    description: "Мне нужен знак, который укажет безопасный путь через пустыню. Собери диск и наполни его жаром древнего пламени.",
    target: "sun_disc",
    rewardSkint: 145,
    rewardAnti: 4
  },
  {
    id: "flamesSderikQuest",
    world: 5,
    requires: "flamesSindbadQuest",

    title: "Клятва тринадцати",
    character: "Сдерик",
    portrait: "https://i.postimg.cc/TwkLy6xZ/IMG-1788.jpg",
    description: "Боги не должны решать судьбу каждого. Создай печать клятвы, чтобы объединить тех, кто готов сопротивляться.",
    target: "oath_seal",
    rewardSkint: 175,
    rewardAnti: 5
  },
  {
    id: "realityJennaQuest",
    world: 6,

    title: "Студенческий пропуск",
    character: "Дженна",
    portrait: "https://fanfics.me/images/fandoms_heroes/3106-1756472578.jpg",
    description: "Без записи в базе Lucky Charms тебе не попасть в общежитие. Восстанови архивные данные и оформи пропуск.",
    target: "campus_pass",
    rewardSkint: 130,
    rewardAnti: 4
  },
  {
    id: "realityDylanQuest",
    world: 6,
    requires: "realityJennaQuest",

    title: "Память на плёнке",
    character: "Дилан",
    portrait: "https://i.pinimg.com/736x/38/53/8a/38538a712b4ef350f441e9f22ab66106.jpg",
    description: "Записи Тима могут помочь разобраться с автоматонами. Собери ключ перепрошивки, не повредив их память.",
    target: "automaton_key",
    rewardSkint: 150,
    rewardAnti: 4
  },
  {
    id: "realitySolusQuest",
    world: 6,
    requires: "realityDylanQuest",

    title: "Маска для плана",
    character: "Саймон Солус",
    portrait: "https://i.pinimg.com/736x/f6/06/14/f60614f5569b7aa95edfac94e121525c.jpg",
    description: "Нам нужно перехитрить систему и защитить друзей. Подготовь маску, связанную с кодом JDH.",
    target: "jdh_mask",
    rewardSkint: 185,
    rewardAnti: 5
  },
  {
    id: "heartShangrinQuest",
    world: 7,

    title: "Звёздная оптика",
    character: "Шангрин",
    portrait: "https://i.pinimg.com/736x/2c/c4/6c/2cc46c676d7fba85fe6e5e49c6fb7a3f.jpg",
    description: "Звёздная пыль реагирует на гравитацию. Создай линзу, чтобы увидеть структуру пространства между мирами.",
    target: "cosmic_lens",
    rewardSkint: 145,
    rewardAnti: 4
  },
  {
    id: "heartWatcherQuest",
    world: 7,
    requires: "heartShangrinQuest",

    title: "Пульс мироздания",
    character: "Смотрящий",
    portrait: "https://i.postimg.cc/cJB8S3bC/IMG-1787.webp",
    description: "Сердце Вселенной откликается на резонанс. Собери фрагмент, способный удержать его импульс.",
    target: "heart_fragment",
    rewardSkint: 175,
    rewardAnti: 5
  },
  {
    id: "heartJodahQuest",
    world: 7,
    requires: "heartWatcherQuest",

    title: "Первоисточник",
    character: "Джодах",
    portrait: "https://i.pinimg.com/originals/03/d7/ab/03d7ab4a275895f3ed6883307f3b1ab9.jpg",
    description: "Чтобы понять устройство ветвей, найди след первозданной материи и создай ключ к её истоку.",
    target: "origin_key",
    rewardSkint: 205,
    rewardAnti: 6
  },
  {
    id: "pointLaiyaQuest",
    world: 8,

    title: "Воздух для убежища",
    character: "Лайетана",
    portrait: "https://i.postimg.cc/rFvMmqn0/IMG-1796.png",
    description: "В убежище нельзя долго оставаться без фильтрации. Собери надёжный фильтр из уцелевших деталей.",
    target: "shelter_filter",
    rewardSkint: 150,
    rewardAnti: 4
  },
  {
    id: "pointValdharQuest",
    world: 8,
    requires: "pointLaiyaQuest",

    title: "Якорь живой ветки",
    character: "Вальдхар",
    portrait: "https://i.postimg.cc/XJH00WBG/IMG-1797.jpg",
    description: "Ветка умирает, а времени почти не осталось. Создай якорь, который поможет удержать её от распада.",
    target: "branch_anchor",
    rewardSkint: 185,
    rewardAnti: 5
  },
  {
    id: "pointKacperQuest",
    world: 8,
    requires: "pointValdharQuest",

    title: "Сосуд Первой Матери",
    character: "Кацпер Малецки",
    portrait: "https://i.postimg.cc/fyPZYswR/IMG-1795.jpg",
    description: "Для исследования нужен защищённый сосуд. Подготовь его и сохрани образец крови Первой Матери.",
    target: "first_mother_vial",
    rewardSkint: 220,
    rewardAnti: 6
  },
  {
    id: "workshopAitorQuest",
    world: 9,

    title: "Сборка МК-47",
    character: "Иветт",
    portrait: "https://i.postimg.cc/HLTQq1gd/IMG-1800.jpg",
    description: "Новый этап требует самостоятельности. Собери базовый модуль МК-47 из руды, пружины и чертежа.",
    target: "mk47_module",
    rewardSkint: 160,
    rewardAnti: 5
  },
  {
    id: "workshopMilandraQuest",
    world: 9,
    requires: "workshopAitorQuest",

    title: "Ядро Мастерской",
    character: "Риз",
    portrait: "https://i.postimg.cc/1z1W4dZx/IMG-1798.jpg",
    description: "После катаклизма лагерю нужна новая опора. Создай ядро и активируй ключ Мастерской.",
    target: "workshop_key",
    rewardSkint: 190,
    rewardAnti: 5
  },
  {
    id: "workshopWatcherQuest",
    world: 9,
    requires: "workshopMilandraQuest",

    title: "Следующая форма",
    character: "Г.Л.А.С.",
    portrait: "https://i.postimg.cc/Y9pbzm9T/IMG-1799.webp",
    description: "Предел развития ещё не достигнут. Объедини живое ядро с кристаллом логики и восстанови чертёж следующей формы.",
    target: "evolution_blueprint",
    rewardSkint: 230,
    rewardAnti: 7
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
    nickname: "",

    tutorialDone: false,
    avatarDataUrl: "",

    mergedCount: 0,
    soldCount: 0,
    summonedCount: 0,

    unlockedWorld: 1,
    currentWorld: 1,

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

    // Предметы первого мира не должны переноситься или оставаться в сохранении второго мира.
    const savedWorld = Math.min(9, Math.max(1, Number(parsed.currentWorld) || 1));
    const firstWorldItems = new Set([
      "ice_scale", "dim_crystal", "rune_cloth", "key_core", "key",
      "stone_fragment", "glowing_dust", "metal_plate", "tablet_core", "tablet",
      "dense_cloth", "beast_leather", "stable_stone", "cloak_core", "cloak"
    ]);
    const secondWorldItems = new Set([
      "strange_glass", "copper_wire", "weak_energy", "anomaly_core", "anomaly_stabilizer",
      "amulet_fragment", "silver_thread", "magic_essence", "amulet_core", "eola_amulet",
      "tree_bark", "dark_feather", "stone_symbol", "order_core", "order_sign",
      "fire_core", "fire_emblem"
    ]);
    const world3Items = new Set(["broken_persik","power_cell","persik_prime","identity_chip","forged_document","alt_city_pass","carbon_shard","copper_circuit","enriched_carbon","jammer_core","stealth_jammer","archive_key","tower_pass","memory_fragment","raya_memory","imperial_cipher","rehoboam_fragment","jdh_cipher"]);
    const world4Items = new Set(["time_ash","echo_thread","cracked_hourglass","void_gear","paradox_glass","memory_sand","time_core","time_key","echo_compass","echo_seal","prison_core","prison_seal"]);
    const world5Items = new Set(["sun_sand","black_obsidian","sacred_oil","gold_thread","scarab_shell","flame_heart","altar_core","thirteen_candle","sun_disc","scarab_emblem","oath_core","oath_seal"]);
    const world6Items = new Set(["broken_mask","data_tape","synth_chip","memory_film","servo_motor","code_fragment","campus_core","campus_pass","automaton_core","automaton_key","mask_core","jdh_mask"]);
    const world7Items = new Set(["cosmic_dust","star_ore","gravity_crystal","void_ink","origin_seed","resonance_shell","cosmic_core","cosmic_lens","heart_core","heart_fragment","origin_core","origin_key"]);
    const world8Items = new Set(["bunker_scrap","filter_mesh","skint_blood","branch_map","time_cell","containment_glass","filter_core","shelter_filter","branch_core","branch_anchor","mother_core","first_mother_vial"]);
    const world9Items = new Set(["workshop_ore","gear_spring","blueprint","arcane_alloy","living_core","crystal_logic","mk47_core","mk47_module","workshop_core","workshop_key","evolution_core","evolution_blueprint"]);
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (board[i]) ensureUpgradeItem(board[i]);
      const rootId = items[board[i]]?.baseItemId || board[i];
      const belongsToPreviousWorld =
        (savedWorld >= 2 && firstWorldItems.has(rootId)) ||
        (savedWorld >= 3 && secondWorldItems.has(rootId)) ||
        (savedWorld >= 4 && world3Items.has(rootId)) ||
        (savedWorld >= 5 && world4Items.has(rootId)) ||
        (savedWorld >= 6 && world5Items.has(rootId)) ||
        (savedWorld >= 7 && world6Items.has(rootId)) ||
        (savedWorld >= 8 && world7Items.has(rootId)) ||
        (savedWorld >= 9 && world8Items.has(rootId)) ||
        (savedWorld >= 10 && world9Items.has(rootId));
      if (board[i] && (!items[board[i]] || belongsToPreviousWorld)) {
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
      nickname: typeof parsed.nickname === "string"
        ? (parsed.nickname === "Nami_993" ? "Nami" : parsed.nickname)
        : "",

      // Текущий мир всегда считается уже открытым, даже если старое сохранение
      // не успело обновить unlockedWorld после перехода.
      unlockedWorld: Math.min(
        9,
        Math.max(
          1,
          Number(parsed.currentWorld) || 1,
          Number(parsed.unlockedWorld) || 1
        )
      ),
      currentWorld: Math.min(
        9,
        Math.max(1, Number(parsed.currentWorld) || 1)
      ),
      // Сбрасываем таймер при загрузке: офлайн-доход не начисляется.
      lastSkintUpdate: Date.now()
    };
  } catch (error) {
    console.error("Ошибка загрузки сохранения:", error);
    return createInitialState();
  }
}

let state = loadState();

// Прямая ссылка для просмотра мира без прохождения предыдущих заданий.
// Параметр действует только в этой вкладке и не перезаписывает сохранение.
const previewWorldParam = Number(new URLSearchParams(window.location.search).get("world"));
if (Number.isInteger(previewWorldParam) && previewWorldParam >= 1 && previewWorldParam <= 9) {
  state.currentWorld = previewWorldParam;
  state.unlockedWorld = Math.max(state.unlockedWorld, previewWorldParam);
  state.board = Array(BOARD_SIZE).fill(null);
  state.boardValues = Array(BOARD_SIZE).fill(0);
}

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (state.nickname) scheduleGameProfileSync();
  } catch (error) {
    console.error("Ошибка сохранения:", error);
  }
}

/* =========================================
   ПАССИВНЫЙ ДОХОД
========================================= */

function updatePassiveIncome() {
  if (document.hidden) return;

  const now = Date.now();

  if (!state.lastSkintUpdate) {
    state.lastSkintUpdate = now;
    return;
  }

  const elapsed = now - state.lastSkintUpdate;
  const minutes = Math.floor(elapsed / 60000);

  if (minutes <= 0) return;

  state.skint = Number(state.skint || 0) + minutes * PASSIVE_SKINT_PER_MINUTE;
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

// Шансы обычного призыва. Предметы не получают бонус к выпадению
// только потому, что уже лежат на поле.
const worldSummonDrops = {
  1: [
    { id: "ice_scale", weight: 18 },
    { id: "rune_cloth", weight: 12 },
    { id: "stone_fragment", weight: 10 },
    { id: "glowing_dust", weight: 10 },
    { id: "metal_plate", weight: 10 },
    { id: "dense_cloth", weight: 10 },
    { id: "beast_leather", weight: 10 },
    { id: "stable_stone", weight: 10 }
  ],
  2: [
    { id: "strange_glass", weight: 15 },
    { id: "copper_wire", weight: 15 },
    { id: "weak_energy", weight: 15 },
    { id: "amulet_fragment", weight: 15 },
    { id: "silver_thread", weight: 10 },
    { id: "magic_essence", weight: 10 },
    { id: "tree_bark", weight: 10 },
    { id: "dark_feather", weight: 5 },
    { id: "stone_symbol", weight: 5 }
  ],
  3: [
    { id: "broken_persik", weight: 15 },
    { id: "power_cell", weight: 12 },
    { id: "identity_chip", weight: 12 },
    { id: "forged_document", weight: 10 },
    { id: "carbon_shard", weight: 12 },
    { id: "copper_circuit", weight: 12 },
    { id: "archive_key", weight: 10 },
    { id: "memory_fragment", weight: 8 },
    { id: "imperial_cipher", weight: 5 },
    { id: "rehoboam_fragment", weight: 4 }
  ]

  ,
  4: [
    { id: "time_ash", weight: 16 }, { id: "echo_thread", weight: 16 },
    { id: "cracked_hourglass", weight: 14 }, { id: "void_gear", weight: 14 },
    { id: "paradox_glass", weight: 14 }, { id: "memory_sand", weight: 14 }
  ],
  5: [
    { id: "sun_sand", weight: 17 }, { id: "black_obsidian", weight: 16 },
    { id: "sacred_oil", weight: 15 }, { id: "gold_thread", weight: 14 },
    { id: "scarab_shell", weight: 14 }, { id: "flame_heart", weight: 12 }
  ],
  6: [
    { id: "broken_mask", weight: 17 }, { id: "data_tape", weight: 16 },
    { id: "synth_chip", weight: 16 }, { id: "memory_film", weight: 15 },
    { id: "servo_motor", weight: 14 }, { id: "code_fragment", weight: 10 }
  ],
  7: [
    { id: "cosmic_dust", weight: 18 }, { id: "star_ore", weight: 16 },
    { id: "gravity_crystal", weight: 16 }, { id: "void_ink", weight: 14 },
    { id: "origin_seed", weight: 14 }, { id: "resonance_shell", weight: 12 }
  ],
  8: [
    { id: "bunker_scrap", weight: 18 }, { id: "filter_mesh", weight: 17 },
    { id: "skint_blood", weight: 12 }, { id: "branch_map", weight: 15 },
    { id: "time_cell", weight: 14 }, { id: "containment_glass", weight: 14 }
  ],
  9: [
    { id: "workshop_ore", weight: 18 }, { id: "gear_spring", weight: 17 },
    { id: "blueprint", weight: 14 }, { id: "arcane_alloy", weight: 15 },
    { id: "living_core", weight: 12 }, { id: "crystal_logic", weight: 14 }
  ]

};

function getRandomSummonItem() {
  const drops = worldSummonDrops[Number(state.currentWorld) || 1] || worldSummonDrops[1];
  const totalWeight = drops.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of drops) {
    roll -= item.weight;
    if (roll < 0) return item.id;
  }

  return drops[drops.length - 1].id;
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
  renderCurrencies();

  if (summonButton) {
    summonButton.disabled = full || state.skint < SUMMON_COST;
  }

  if (antiSummonButton) {
    antiSummonButton.disabled =
      full || state.antiSkint < ANTI_SUMMON_COST;
  }
}


/* Стикеры-предметы: у каждого мира свои эмодзи из каталога items. */
function createItemVisual(itemId, className = "item-icon") {
  const id = String(itemId || "");
  const sticker = document.createElement("span");
  sticker.className = className;
  sticker.textContent = items[id]?.icon || "✨";
  sticker.setAttribute("role", "img");
  sticker.setAttribute("aria-label", items[id]?.name || id || "Игровой предмет");
  return sticker;
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
    if (!tutorialMode && selectedBoardIndex === index) cell.classList.add("selected");
    cell.dataset.index = index;

    if (itemId && items[itemId]) {
      cell.appendChild(createItemVisual(itemId));
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

  // Предмет добавляется без всплывающей надписи.
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
    sellItemIcon.replaceChildren(createItemVisual(itemId, "sell-item-art"));
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

  // Сначала проверяем рецепт пары разных предметов; одинаковые предметы
  // без отдельного рецепта переходят на следующий уровень.
  const recipeResult = recipes[makePair(first, second)];
  const result = recipeResult || (first === second ? getUpgradeId(first) : null);

  if (!result) {
    showMessage("Для этих предметов пока нет рецепта объединения.");
    return false;
  }
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
let selectedBoardIndex = null;
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
          const sourceIcon = sourceCell.querySelector(".item-icon");
          dragGhost = sourceIcon ? sourceIcon.cloneNode(true) : document.createElement("span");
          dragGhost.className = "item-drag-ghost";
          if (!sourceIcon) dragGhost.replaceWith(createItemVisual(sourceItem, "item-drag-ghost"));
          dragGhost.style.width = Math.round(rect.width * 0.76) + "px";
          dragGhost.style.height = Math.round(rect.height * 0.76) + "px";
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
          const pairHasRecipe = Boolean(
            recipes[makePair(currentBoard[sourceIndex], currentBoard[targetIndex])]
          );
          if (currentBoard[sourceIndex] === currentBoard[targetIndex] || pairHasRecipe) {
            mergeItems(sourceIndex, targetIndex);
          } else if (!tutorialMode) {
            const sourceItem = currentBoard[sourceIndex];
            const targetItem = currentBoard[targetIndex];
            currentBoard[sourceIndex] = targetItem;
            currentBoard[targetIndex] = sourceItem;
            const sourceValue = state.boardValues[sourceIndex] || SUMMON_COST;
            state.boardValues[sourceIndex] = state.boardValues[targetIndex] || SUMMON_COST;
            state.boardValues[targetIndex] = sourceValue;
            saveState();
            renderBoard();
          }
        }
      }
      lastTappedIndex = null;
      lastTapAt = 0;
    } else if (!pointerMoved) {
      if (tutorialMode) {
        handleTutorialTap(sourceIndex);
      } else {
        handleBoardTap(sourceIndex);
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


function handleBoardTap(index) {
  const board = state.board;
  const now = Date.now();

  if (selectedBoardIndex === null) {
    if (!board[index]) return;
    selectedBoardIndex = index;
    lastTappedIndex = index;
    lastTapAt = now;
    renderBoard();
    return;
  }

  if (selectedBoardIndex === index) {
    if (lastTappedIndex === index && now - lastTapAt < 650) {
      openSellWindow(index);
    }
    selectedBoardIndex = null;
    lastTappedIndex = null;
    lastTapAt = 0;
    renderBoard();
    return;
  }

  const source = selectedBoardIndex;
  const sourceItem = board[source];
  const targetItem = board[index];

  if (!sourceItem) {
    selectedBoardIndex = null;
    renderBoard();
    return;
  }

  if (!targetItem) {
    board[index] = sourceItem;
    board[source] = null;
    state.boardValues[index] = state.boardValues[source] || SUMMON_COST;
    state.boardValues[source] = 0;
    selectedBoardIndex = null;
    saveState();
    renderAll();
    return;
  }

  const pairHasRecipe = Boolean(recipes[makePair(sourceItem, targetItem)]);
  if (sourceItem === targetItem || pairHasRecipe) {
    selectedBoardIndex = null;
    mergeItems(source, index);
    renderBoard();
    return;
  }

  board[source] = targetItem;
  board[index] = sourceItem;
  const sourceValue = state.boardValues[source] || SUMMON_COST;
  state.boardValues[source] = state.boardValues[index] || SUMMON_COST;
  state.boardValues[index] = sourceValue;
  selectedBoardIndex = null;
  saveState();
  renderAll();
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

  // Показываем все задания текущего мира, но выполненные всегда отправляем в конец списка.
  const worldQuests = questData.filter(quest =>
    Number(quest.world || 1) === Number(state.currentWorld || 1)
  );
  const visibleQuests = [
    ...worldQuests.filter(quest => !state.completedQuests.includes(quest.id)),
    ...worldQuests.filter(quest => state.completedQuests.includes(quest.id))
  ];

  visibleQuests.forEach(quest => {
    const completed = state.completedQuests.includes(quest.id);
    const accepted = state.acceptedQuests.includes(quest.id);
    const hasTarget = state.board.includes(quest.target);
    const locked = Boolean(
      quest.requires && !state.completedQuests.includes(quest.requires)
    );

    const card = document.createElement("article");
    card.className = "quest-card" +
      (completed ? " quest-card-completed" : "") +
      (locked ? " quest-card-locked" : "");

    const person = document.createElement("div");
    person.className = "quest-person";

    const portraitFrame = document.createElement("div");
    portraitFrame.className = "quest-portrait-frame";
    const portrait = document.createElement("img");
    portrait.className = "quest-portrait";
    portrait.alt = "Портрет персонажа " + quest.character;
    portrait.loading = "lazy";
    // Postimg может блокировать запросы с Referer; отключаем его для прямых аватаров.
    portrait.referrerPolicy = "no-referrer";
    // Изображение должно оставаться загружаемым: display:none может мешать lazy-load.
    portrait.hidden = false;
    const portraitFallback = document.createElement("span");
    portraitFallback.className = "quest-portrait-fallback";
    // Показываем инициалы сразу: круг не будет пустым, даже если внешний хостинг фото недоступен.
    portraitFallback.hidden = false;
    portraitFallback.textContent = quest.character
      .split(/[\s-]+/)
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "✦";
    portraitFallback.setAttribute("aria-hidden", "true");
    portraitFrame.append(portrait, portraitFallback);

    if (quest.portrait) {
      portrait.onerror = () => {
        portrait.hidden = true;
        portraitFallback.hidden = false;
        portraitFrame.classList.add("quest-portrait-unavailable");
      };
      portrait.onload = () => {
        portrait.hidden = false;
        portraitFallback.hidden = true;
        portraitFrame.classList.remove("quest-portrait-unavailable");
      };
      portrait.src = quest.portrait;
    } else {
      portrait.hidden = true;
      portraitFallback.hidden = false;
    }

    const giver = document.createElement("div");
    const label = document.createElement("span");
    label.className = "quest-giver-label";
    label.textContent = "Задание от";
    const giverName = document.createElement("strong");
    giverName.className = "quest-giver-name quest-giver-name-clickable";
    giverName.textContent = quest.character;
    giverName.setAttribute("role", "button");
    giverName.setAttribute("tabindex", "0");
    giverName.setAttribute("aria-expanded", "false");
    giverName.setAttribute("aria-label", "Показать, как получить предмет для квеста: " + quest.title);
    giver.append(label, giverName);
    person.append(portraitFrame, giver);

    const title = document.createElement("h3");
    title.textContent = quest.title;

    const worldLabel = document.createElement("span");
    worldLabel.className = "quest-world-label";
    const questWorld = Number(quest.world || 1);
    worldLabel.textContent = "МИР " + String(questWorld).padStart(2, "0") +
      " · " + (worlds[questWorld - 1]?.name || "Неизвестный мир");

    const toggleQuestGuide = () => {
      const existingGuide = card.querySelector(".quest-guide-panel");
      if (existingGuide) {
        existingGuide.remove();
        giverName.setAttribute("aria-expanded", "false");
        return;
      }
      const guide = createQuestGuide(quest);
      card.insertBefore(guide, person.nextSibling);
      giverName.setAttribute("aria-expanded", "true");
    };
    giverName.addEventListener("click", toggleQuestGuide);
    giverName.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleQuestGuide();
      }
    });

    const description = document.createElement("p");
    description.textContent = quest.description;

    const reward = document.createElement("div");
    reward.className = "quest-reward";
    reward.textContent =
      "Награда: " + quest.rewardSkint + " Скинтов · " +
      quest.rewardAnti + " Анти-скинтов";

    const button = document.createElement("button");
    button.className = "primary-button";
    if (completed) {
      button.textContent = "Задание выполнено";
      button.disabled = true;
    } else if (locked) {
      const requiredQuest = questData.find(item => item.id === quest.requires);
      button.textContent = "🔒 Сначала заверши: " +
        (requiredQuest?.title || "предыдущий квест");
      button.disabled = true;
      const lockNote = document.createElement("p");
      lockNote.className = "quest-lock-note";
      lockNote.textContent = "Это задание откроется после выполнения предыдущего по сюжету.";
      card.append(person, title, worldLabel, description, reward, lockNote, button);
      questListElement.appendChild(card);
      return;
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

    card.append(person, title, worldLabel, description, reward, button);
    questListElement.appendChild(card);
  });
}

function createQuestGuide(quest) {
  const guide = document.createElement("section");
  guide.className = "quest-guide-panel";
  guide.setAttribute("aria-label", "Пошаговый рецепт");

  const heading = document.createElement("h4");
  heading.textContent = "Как получить предмет";
  guide.appendChild(heading);

  const guideRecipes = {
    key: [
      ["ice_scale", "ice_scale", "dim_crystal"],
      ["ice_scale", "dim_crystal", "key_core"],
      ["key_core", "rune_cloth", "key"]
    ],
    tablet: [
      ["stone_fragment", "glowing_dust", "tablet_core"],
      ["tablet_core", "metal_plate", "tablet"]
    ],
    cloak: [
      ["beast_leather", "dense_cloth", "cloak_core"],
      ["cloak_core", "stable_stone", "cloak"]
    ],
    anomaly_core: [
      ["strange_glass", "copper_wire", "anomaly_core"]
    ],
    anomaly_stabilizer: [
      ["strange_glass", "copper_wire", "anomaly_core"],
      ["anomaly_core", "weak_energy", "anomaly_stabilizer"]
    ],
    eola_amulet: [
      ["amulet_fragment", "silver_thread", "amulet_core"],
      ["amulet_core", "magic_essence", "eola_amulet"]
    ],
    fire_emblem: [
      ["strange_glass", "weak_energy", "fire_core"],
      ["fire_core", "magic_essence", "fire_emblem"]
    ],
    order_sign: [
      ["tree_bark", "dark_feather", "order_core"],
      ["order_core", "stone_symbol", "order_sign"]
    ],
    persik_prime: [
      ["broken_persik", "power_cell", "persik_prime"]
    ],
    alt_city_pass: [
      ["identity_chip", "forged_document", "alt_city_pass"]
    ],
    stealth_jammer: [
      ["carbon_shard", "copper_circuit", "enriched_carbon"],
      ["enriched_carbon", "power_cell", "jammer_core"],
      ["jammer_core", "alt_city_pass", "stealth_jammer"]
    ],
    tower_pass: [
      ["identity_chip", "forged_document", "alt_city_pass"],
      ["alt_city_pass", "archive_key", "tower_pass"]
    ],
    raya_memory: [
      ["memory_fragment", "persik_prime", "raya_memory"]
    ],
    jdh_cipher: [
      ["memory_fragment", "persik_prime", "raya_memory"],
      ["raya_memory", "rehoboam_fragment", "jdh_cipher"]
    ]

    ,
    time_key: [["time_ash","echo_thread","time_core"],["time_core","cracked_hourglass","time_key"]],
    echo_seal: [["paradox_glass","void_gear","echo_compass"],["echo_compass","memory_sand","echo_seal"]],
    prison_seal: [["memory_sand","time_ash","prison_core"],["prison_core","echo_thread","prison_seal"]],
    thirteen_candle: [["sun_sand","black_obsidian","altar_core"],["altar_core","sacred_oil","thirteen_candle"]],
    sun_disc: [["scarab_shell","gold_thread","sun_disc"]],
    oath_seal: [["sacred_oil","flame_heart","oath_core"],["oath_core","black_obsidian","oath_seal"]],
    campus_pass: [["data_tape","synth_chip","campus_core"],["campus_core","memory_film","campus_pass"]],
    automaton_key: [["broken_mask","servo_motor","automaton_core"],["automaton_core","code_fragment","automaton_key"]],
    jdh_mask: [["memory_film","code_fragment","mask_core"],["mask_core","broken_mask","jdh_mask"]],
    cosmic_lens: [["cosmic_dust","star_ore","cosmic_core"],["cosmic_core","gravity_crystal","cosmic_lens"]],
    heart_fragment: [["gravity_crystal","resonance_shell","heart_core"],["heart_core","void_ink","heart_fragment"]],
    origin_key: [["origin_seed","void_ink","origin_core"],["origin_core","cosmic_dust","origin_key"]],
    shelter_filter: [["bunker_scrap","filter_mesh","filter_core"],["filter_core","containment_glass","shelter_filter"]],
    branch_anchor: [["branch_map","time_cell","branch_core"],["branch_core","skint_blood","branch_anchor"]],
    first_mother_vial: [["skint_blood","containment_glass","mother_core"],["mother_core","time_cell","first_mother_vial"]],
    mk47_module: [["workshop_ore","gear_spring","mk47_core"],["mk47_core","blueprint","mk47_module"]],
    workshop_key: [["arcane_alloy","crystal_logic","workshop_core"],["workshop_core","living_core","workshop_key"]],
    evolution_blueprint: [["living_core","crystal_logic","evolution_core"],["evolution_core","blueprint","evolution_blueprint"]]

  };

  const steps = guideRecipes[quest.target] || [];
  const list = document.createElement("ol");
  if (quest.target === "imperial_cipher") {
    const directDrop = document.createElement("p");
    directDrop.textContent = "Шифр Империи не создаётся в мастерской. Он выпадает напрямую при обычном или усиленном призыве предметов в 3-м мире «Идеальный Мир». Переключись на 3-й мир и используй кнопку призыва, пока предмет не выпадет.";
    guide.appendChild(directDrop);
  }
  steps.forEach((recipe, index) => {
    const [firstId, secondId, resultId] = recipe;
    const first = items[firstId];
    const second = items[secondId];
    const result = items[resultId];
    if (!first || !second || !result) return;

    const step = document.createElement("li");
    const instruction = document.createElement("strong");
    instruction.textContent = "Шаг " + (index + 1);
    const combination = document.createElement("div");
    combination.className = "quest-guide-combination";
    combination.textContent =
      first.icon + " " + first.name + "  +  " +
      second.icon + " " + second.name + "  →  " +
      result.icon + " " + result.name;
    const hint = document.createElement("p");
    hint.textContent = "Положи оба предмета на поле и объедини их касанием или перетаскиванием.";
    step.append(instruction, combination, hint);
    list.appendChild(step);
  });

  guide.appendChild(list);
  const note = document.createElement("p");
  note.className = "quest-guide-note";
  note.textContent = "Нужные начальные материалы получаются через призыв предметов.";
  guide.appendChild(note);
  return guide;
}

function completeQuest(quest) {
  if (
    state.completedQuests.includes(quest.id) ||
    !state.acceptedQuests.includes(quest.id)
  ) return;

  const index = state.board.indexOf(quest.target);

  if (index === -1) {
    showMessage("Нужный предмет не найден!");
    return;
  }

  // Сдаём один точный предмет, начисляем награду один раз.
  state.board[index] = null;
  state.boardValues[index] = 0;
  state.completedQuests.push(quest.id);
  if (areCurrentWorldQuestsComplete() && state.currentWorld < 9) {
    state.unlockedWorld = Math.max(state.unlockedWorld, state.currentWorld + 1);
  }
  state.skint = Number(state.skint || 0) + Number(quest.rewardSkint || 0);
  state.antiSkint = Number(state.antiSkint || 0) + Number(quest.rewardAnti || 0);

  saveState();
  renderAll();

  showMessage("Предмет сдан! Награда получена.");
}

/* =========================================
   МИРЫ
========================================= */

function getWorldQuests(worldNumber) {
  return questData.filter(quest => (quest.world || 1) === worldNumber);
}

// Восстанавливаем открытый мир по уже выполненным заданиям.
// Это также исправляет сохранения, созданные до исправления переходов.
function updateUnlockedWorldProgress() {
  let highestUnlocked = Math.max(1, Number(state.unlockedWorld) || 1);

  for (let worldNumber = 1; worldNumber <= 9; worldNumber++) {
    const quests = getWorldQuests(worldNumber);
    if (!quests.length) break;
    const allComplete = quests.every(quest =>
      state.completedQuests.includes(quest.id)
    );
    if (!allComplete) break;
    highestUnlocked = Math.max(highestUnlocked, Math.min(9, worldNumber + 1));
  }

  const changed = highestUnlocked !== state.unlockedWorld;
  state.unlockedWorld = highestUnlocked;
  if (changed) saveState();
  return changed;
}

function renderWorlds() {
  updateUnlockedWorldProgress();
  // Нельзя показывать замок на мире, в котором игрок уже находится.
  state.unlockedWorld = Math.max(state.unlockedWorld, state.currentWorld);
  const cards = document.querySelectorAll(".world-card");

  cards.forEach(card => {
    const number = Number(card.dataset.world);
    const locked = number > state.unlockedWorld;
    const active = number === state.currentWorld;
    const status = card.querySelector(".world-status");

    card.classList.toggle("locked", locked);
    card.classList.toggle("unlocked", !locked);
    card.classList.toggle("world-card-active", active);

    if (status) {
      status.textContent = locked ? "🔒 Закрыт" : active ? "✦ Текущий мир" : "✓ Открыт";
    }
    card.setAttribute("aria-current", active ? "true" : "false");
  });
}

function areCurrentWorldQuestsComplete() {
  const currentQuests = getWorldQuests(state.currentWorld);
  return currentQuests.length === 0 ||
    currentQuests.every(quest => state.completedQuests.includes(quest.id));
}

document.querySelectorAll(".world-card").forEach(card => {
  card.addEventListener("click", () => {
    const number = Number(card.dataset.world);

    if (!number) return;

    updateUnlockedWorldProgress();

    if (number > state.unlockedWorld) {
      showMessage("Сначала открой предыдущий мир!");
      return;
    }

    if (number === state.currentWorld) {
      showMessage("Ты уже находишься в этом мире.");
      return;
    }

    if (!areCurrentWorldQuestsComplete()) {
      const remaining = getWorldQuests(state.currentWorld)
        .filter(quest => !state.completedQuests.includes(quest.id)).length;
      showMessage("Сначала выполни все задания текущего мира. Осталось: " + remaining + ".");
      openPage("questsPage");
      return;
    }

    const destination = worlds[number - 1];
    const confirmed = window.confirm(
      "Перейти в мир «" + destination.name + "»?\n\n" +
      "Скинты будут сброшены, Анти-скинты сохранятся."
    );
    if (!confirmed) return;

    state.currentWorld = number;
    state.unlockedWorld = Math.max(state.unlockedWorld, number);
    // Каждый мир начинается с чистого поля; призыв выдаёт материалы только текущего мира.
    state.board = Array(BOARD_SIZE).fill(null);
    state.boardValues = Array(BOARD_SIZE).fill(0);
    selectedBoardIndex = null;
    state.skint = 0;
    state.lastSkintUpdate = Date.now();
    saveState();
    renderAll();
    openPage("homePage");
    showMessage("Ты перешёл в мир: " + destination.name + ".");
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
    profileName: state.nickname || "Nami",
    profileRank: profileRanks[Number(state.currentWorld) || 1] || profileRanks[1],
    profileWorld: worlds[(state.currentWorld || 1) - 1]?.name || worlds[0].name,
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
   ИГРОВОЙ ПРОФИЛЬ И ДРУЗЬЯ
========================================= */

const GAME_API_BASE = "https://starsshopbot27.onrender.com";
let gameProfileSyncTimer = null;
let friendSearchPlayer = null;

function getGameTelegramInitData() {
  try {
    return window.Telegram?.WebApp?.initData ||
      window.parent?.Telegram?.WebApp?.initData ||
      "";
  } catch (_) {
    return "";
  }
}

async function gameApi(path, options = {}) {
  const initData = getGameTelegramInitData();
  if (!initData) {
    throw new Error("Открой игру через Telegram, чтобы пользоваться друзьями.");
  }
  const response = await fetch(GAME_API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.error || data.message || ("Сервер ответил HTTP " + response.status + ".");
    throw new Error(detail);
  }
  return data;
}

function getPublicGameProgress() {
  return {
    currentWorld: state.currentWorld,
    unlockedWorld: state.unlockedWorld,
    completedQuests: state.completedQuests.length,
    mergedCount: state.mergedCount
  };
}

function scheduleGameProfileSync() {
  if (gameProfileSyncTimer) clearTimeout(gameProfileSyncTimer);
  gameProfileSyncTimer = setTimeout(syncGameProfile, 1200);
}

async function syncGameProfile() {
  if (!state.nickname) return;
  try {
    await gameApi("/api/game/profile", {
      method: "POST",
      body: JSON.stringify({
        nickname: state.nickname,
        progress: getPublicGameProgress()
      })
    });
  } catch (error) {
    console.warn("Не удалось обновить игровой профиль:", error.message);
  }
}

function setSocialStatus(message, isError = false) {
  const element = document.getElementById("gameFriendsStatus");
  if (element) {
    element.textContent = message;
    element.classList.toggle("error", isError);
  }
}

function appendFriendProfile(container, player, actionLabel, onAction) {
  const card = document.createElement("div");
  card.className = "game-friend-card";
  const info = document.createElement("div");
  info.className = "game-friend-info";
  const name = document.createElement("strong");
  name.textContent = player.nickname;
  const progress = document.createElement("span");
  if (player.current_world !== undefined) {
    const worldNumber = Number(player.current_world) || 1;
    const worldName = worlds[worldNumber - 1]?.name || worlds[0].name;
    progress.textContent = "Мир " + worldNumber + " · " + worldName +
      " · Квестов: " + (player.completed_quests || 0) +
      " · Объединений: " + (player.merged_count || 0);
  } else {
    progress.textContent = "После добавления будет виден прогресс игрока";
  }
  info.append(name, progress);
  card.appendChild(info);
  if (actionLabel && onAction) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = actionLabel;
    button.addEventListener("click", onAction);
    card.appendChild(button);
  }
  container.appendChild(card);
}

async function refreshGameFriends() {
  const list = document.getElementById("gameFriendsList");
  if (!list) return;
  list.innerHTML = "";
  if (!state.nickname) {
    setSocialStatus("Сначала создай игровой ник в профиле.");
    return;
  }
  try {
    const data = await gameApi("/api/game/friends");
    setSocialStatus("");
    if (data.incoming?.length) {
      const heading = document.createElement("h4");
      heading.textContent = "Входящие заявки";
      list.appendChild(heading);
      data.incoming.forEach(request => {
        appendFriendProfile(list, { nickname: request.nickname }, "Принять", async () => {
          try {
            await gameApi("/api/game/friends/respond", {
              method: "POST",
              body: JSON.stringify({ request_id: request.id, accept: true })
            });
            await refreshGameFriends();
          } catch (error) {
            setSocialStatus(error.message, true);
          }
        });
      });
    }
    if (data.friends?.length) {
      const heading = document.createElement("h4");
      heading.textContent = "Мои друзья";
      list.appendChild(heading);
      data.friends.forEach(friend => appendFriendProfile(list, friend));
    }
    if (data.outgoing?.length) {
      const heading = document.createElement("h4");
      heading.textContent = "Ожидают ответа";
      list.appendChild(heading);
      data.outgoing.forEach(nickname => {
        const pending = document.createElement("p");
        pending.className = "friend-pending";
        pending.textContent = nickname + " · заявка отправлена";
        list.appendChild(pending);
      });
    }
    if (!data.incoming?.length && !data.friends?.length && !data.outgoing?.length) {
      const empty = document.createElement("p");
      empty.className = "friend-pending";
      empty.textContent = "Пока здесь пусто. Найди друга по нику выше.";
      list.appendChild(empty);
    }
  } catch (error) {
    setSocialStatus(error.message, true);
  }
}

const profileNicknameButton = document.getElementById("profileNicknameButton");
const gameNicknamePanel = document.getElementById("gameNicknamePanel");
if (profileNicknameButton && gameNicknamePanel) {
  profileNicknameButton.addEventListener("click", () => {
    const isOpening = gameNicknamePanel.classList.contains("hidden");
    gameNicknamePanel.classList.toggle("hidden", !isOpening);
    profileNicknameButton.setAttribute("aria-expanded", String(isOpening));
    if (isOpening) {
      const nicknameInput = document.getElementById("gameNicknameInput");
      if (nicknameInput) {
        nicknameInput.value = state.nickname || "";
        nicknameInput.focus();
      }
    }
  });
}

const saveGameNicknameButton = document.getElementById("saveGameNicknameButton");
if (saveGameNicknameButton) {
  saveGameNicknameButton.addEventListener("click", async () => {
    const input = document.getElementById("gameNicknameInput");
    const status = document.getElementById("gameNicknameStatus");
    const nickname = (input?.value || "").trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
      if (status) status.textContent = "Ник: 3–16 символов, латиница, цифры и _.";
      return;
    }
    saveGameNicknameButton.disabled = true;
    if (status) status.textContent = "Сохраняю ник…";
    try {
      if (getGameTelegramInitData()) {
        const data = await gameApi("/api/game/profile", {
          method: "POST",
          body: JSON.stringify({ nickname, progress: getPublicGameProgress() })
        });
        state.nickname = data.profile.nickname;
        await refreshGameFriends();
      } else {
        state.nickname = nickname;
      }
      saveState();
      renderProfile();
      if (status) status.textContent = getGameTelegramInitData()
        ? "Ник сохранён!"
        : "Ник сохранён на этом устройстве.";
      if (gameNicknamePanel) gameNicknamePanel.classList.add("hidden");
      if (profileNicknameButton) profileNicknameButton.setAttribute("aria-expanded", "false");
    } catch (error) {
      if (status) status.textContent = error.message || "Не удалось сохранить ник. Проверь соединение и попробуй ещё раз.";
    } finally {
      saveGameNicknameButton.disabled = false;
    }
  });
}

const searchFriendButton = document.getElementById("searchFriendButton");
if (searchFriendButton) {
  searchFriendButton.addEventListener("click", async () => {
    const input = document.getElementById("friendNicknameInput");
    const result = document.getElementById("friendSearchResult");
    const nickname = (input?.value || "").trim();
    if (result) result.innerHTML = "";
    if (!nickname) {
      setSocialStatus("Введи ник игрока.", true);
      return;
    }
    searchFriendButton.disabled = true;
    try {
      const data = await gameApi("/api/game/friends/search", {
        method: "POST",
        body: JSON.stringify({ nickname })
      });
      friendSearchPlayer = data.player;
      setSocialStatus("");
      if (result) {
        appendFriendProfile(result, data.player, "Добавить", async () => {
          try {
            const response = await gameApi("/api/game/friends/request", {
              method: "POST",
              body: JSON.stringify({ nickname: data.player.nickname })
            });
            setSocialStatus(response.message || "Заявка отправлена.");
            result.innerHTML = "";
            await refreshGameFriends();
          } catch (error) {
            setSocialStatus(error.message, true);
          }
        });
      }
    } catch (error) {
      setSocialStatus(error.message, true);
    } finally {
      searchFriendButton.disabled = false;
    }
  });
}

const nicknameInput = document.getElementById("gameNicknameInput");
if (nicknameInput && state.nickname) nicknameInput.value = state.nickname;
if (state.nickname) {
  syncGameProfile();
  refreshGameFriends();
}
setInterval(() => {
  if (state.nickname) syncGameProfile();
}, 60000);

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
    text: "Здесь ты получаешь предметы за Скинты, собираешь коллекцию и открываешь новые миры.",
    button: "Начать"
  },
  {
    title: "Призыв предметов",
    text: "Обычный призыв стоит 10 Скинтов. Нажми кнопку, чтобы получить предметы.",
    button: "Далее"
  },
  {
    title: "Перемещение и объединение",
    text: "Нажми на предмет, затем на второй. Одинаковые предметы объединяются в улучшенный, а некоторые разные предметы объединяются по специальному рецепту. Если рецепта нет — они меняются местами. В пустую клетку предмет просто перемещается. Можно также перетаскивать пальцем.",
    button: "Далее"
  },
  {
    title: "Продажа",
    text: "Дважды нажми на предмет, чтобы открыть продажу. Ты получишь половину его стоимости.",
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
    nextTutorialStep();
  });
}

if (tutorialSkipButton) {
  tutorialSkipButton.addEventListener("click", finishTutorial);
}

if (tutorialCompleteButton) {
  tutorialCompleteButton.addEventListener("click", () => {
    if (tutorialCompleteOverlay) {
      tutorialCompleteOverlay.classList.remove("active");
      tutorialCompleteOverlay.classList.remove("hidden");
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
  // Всплывающие уведомления отключены: в Telegram WebView они перекрывают поле.
  const element = document.getElementById("gameMessage");
  if (element) element.remove();
}

/* =========================================
   ОБНОВЛЕНИЕ ИГРЫ
========================================= */

function renderLobby() {
  const world = worlds[(state.currentWorld || 1) - 1] || worlds[0];
  document.body.dataset.world = String(world.number);
  const name = document.getElementById("lobbyWorldName");
  const description = document.getElementById("lobbyWorldDescription");
  const number = document.getElementById("lobbyWorldNumber");
  if (name) name.textContent = world.name;
  if (description) description.textContent = world.description;
  if (number) number.textContent = "МИР " + String(world.number).padStart(2, "0");
}

function renderAll() {
  renderLobby();
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
    updatePassiveIncome();
    state.lastSkintUpdate = Date.now();
    savePlayTime();
  } else {
    state.lastSessionStart = Date.now();
    state.lastSkintUpdate = Date.now();
    saveState();
  }
});

window.addEventListener("pagehide", () => {
  updatePassiveIncome();
  savePlayTime();
});

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