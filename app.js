// Hryvnia Hub MVP
// Вставим реальные значения Supabase перед публикацией.
// ВАЖНО: используем только публичный anon/publishable key, не service_role.

const SUPABASE_URL = "https://bxwfnmndxbhrjvcpsffy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KTs3Xo5UIxZ0ArcZV-5oQA_V4wXZog9";

const hasSupabaseConfig =
  !SUPABASE_URL.startsWith("YOUR_") &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

const db = hasSupabaseConfig
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const listing = document.getElementById("listing");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const addModal = document.getElementById("addModal");
const formMessage = document.getElementById("formMessage");

let currentCategory = "";

function money(value) {
  return new Intl.NumberFormat("uk-UA").format(Number(value || 0)) + " грн";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function renderListings(items) {
  resultCount.textContent = `${items.length} объявлений`;

  if (!items.length) {
    listing.innerHTML = `<div class="empty">Объявлений пока нет. Добавьте первое!</div>`;
    return;
  }

  listing.innerHTML = items.map(item => `
    <article class="card">
      <div class="card-top">
        <span class="badge">${escapeHtml(item.category)}</span>
        <span class="city">${escapeHtml(item.city)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="price">${money(item.price)}</p>
      <p class="desc">${escapeHtml(item.description || "Описание не указано.")}</p>
    </article>
  `).join("");
}

async function loadListings() {
  if (!db) {
    renderListings([
      {category:"Автомобили", title:"Пример: Skoda Octavia 1.6", city:"Днепр", price:250000, description:"Демо-карточка. После подключения Supabase здесь будут реальные объявления."},
      {category:"Недвижимость", title:"2-комнатная квартира", city:"Днепр", price:1000000, description:"Демо-карточка для проверки дизайна MVP."},
      {category:"Готовый бизнес", title:"Готовый бизнес", city:"Сумы", price:500000, description:"Демо-карточка. Данные будут загружаться из Supabase."},
      {category:"Инвестиции", title:"Инвестиционная возможность", city:"Киев", price:1000000, description:"Демо-карточка для категории инвестиций."}
    ]);
    return;
  }

  let query = db.from("listings").select("*").order("created_at", {ascending:false});

  if (currentCategory) query = query.eq("category", currentCategory);
  if (cityFilter.value) query = query.eq("city", cityFilter.value);

  const term = searchInput.value.trim();
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

  const { data, error } = await query;

  if (error) {
    listing.innerHTML = `<div class="empty">Не удалось загрузить объявления: ${escapeHtml(error.message)}</div>`;
    return;
  }

  renderListings(data || []);
  const { data: cityData, error: cityError } =
  await db.from("listings").select("city");

if (!cityError) {
  updateCities(cityData || []);
}
}

function updateCities(items) {
  const cityTranslations = {
  ru: "Все города",
  uk: "Усі міста",
  en: "All cities",
  pl: "Wszystkie miasta"
};
  const selected = cityFilter.value;
  const cities = [...new Set(items.map(x => x.city).filter(Boolean))].sort();
  cityFilter.innerHTML = `<option value="">${cityTranslations[lang]}</option>` +
    cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join("");
  cityFilter.value = selected;
}

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.category;
    loadListings();
  });
});

document.getElementById("searchBtn").addEventListener("click", loadListings);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") loadListings();
});
cityFilter.addEventListener("change", loadListings);

document.getElementById("openAdd").addEventListener("click", () => {
  addModal.classList.remove("hidden");
});
document.getElementById("closeAdd").addEventListener("click", () => {
  addModal.classList.add("hidden");
});
addModal.addEventListener("click", e => {
  if (e.target === addModal) addModal.classList.add("hidden");
});

document.getElementById("addForm").addEventListener("submit", async e => {
  e.preventDefault();
  formMessage.textContent = "";

  if (!db) {
    formMessage.textContent = "Сначала подключим Supabase — сейчас работает демо-режим.";
    return;
  }

  const form = new FormData(e.target);
  const payload = {
    category: form.get("category"),
    title: form.get("title"),
    city: form.get("city"),
    price: Number(form.get("price")),
    description: form.get("description") || ""
  };

  const { error } = await db.from("listings").insert(payload);

  if (error) {
    formMessage.textContent = `Ошибка: ${error.message}`;
    return;
  }

  e.target.reset();
  formMessage.textContent = "Объявление опубликовано!";
  await loadListings();
  setTimeout(() => addModal.classList.add("hidden"), 700);
});

loadListings();
// ===============================
// 🌍 HRYVNIA HUB — ЯЗЫКИ
// ===============================

const translations = {
  "Русский": {
    ru: "Русский",
    uk: "Українська",
    en: "English",
    pl: "Polski"
  },

  "Українська": {
    ru: "Російська",
    uk: "Українська",
    en: "English",
    pl: "Polski"
  },

  "English": {
    ru: "Russian",
    uk: "Ukrainian",
    en: "English",
    pl: "Polish"
  },

  "Polski": {
    ru: "Rosyjski",
    uk: "Ukraiński",
    en: "English",
    pl: "Polski"
  },

  "+ Добавить объявление": {
    ru: "+ Добавить объявление",
    uk: "+ Додати оголошення",
    en: "+ Add listing",
    pl: "+ Dodaj ogłoszenie"
  },

  "Найди выгодное": {
    ru: "Найди выгодное",
    uk: "Знайди вигідну",
    en: "Find a great",
    pl: "Znajdź korzystną"
  },

  "предложение": {
    ru: "предложение",
    uk: "пропозицію",
    en: "deal",
    pl: "ofertę"
  },

  "Автомобили, недвижимость и готовый бизнес — в одном месте.": {
    ru: "Автомобили, недвижимость и готовый бизнес — в одном месте.",
    uk: "Автомобілі, нерухомість і готовий бізнес — в одному місці.",
    en: "Cars, real estate and ready-made businesses — all in one place.",
    pl: "Samochody, nieruchomości i gotowy biznes — wszystko w jednym miejscu."
  },

  "Что ищете? Например: Skoda Octavia": {
    ru: "Что ищете? Например: Skoda Octavia",
    uk: "Що шукаєте? Наприклад: Skoda Octavia",
    en: "What are you looking for? Example: Skoda Octavia",
    pl: "Czego szukasz? Na przykład: Skoda Octavia"
  },

  "Все города": {
    ru: "Все города",
    uk: "Усі міста",
    en: "All cities",
    pl: "Wszystkie miasta"
  },

  "Найти": {
    ru: "Найти",
    uk: "Знайти",
    en: "Search",
    pl: "Szukaj"
  },

  "КАТЕГОРИИ": {
    ru: "КАТЕГОРИИ",
    uk: "КАТЕГОРІЇ",
    en: "CATEGORIES",
    pl: "KATEGORIE"
  },

  "Что ищем?": {
    ru: "Что ищем?",
    uk: "Що шукаємо?",
    en: "What are we looking for?",
    pl: "Czego szukamy?"
  },

  "Все": {
    ru: "Все",
    uk: "Усі",
    en: "All",
    pl: "Wszystkie"
  },

  "Все объявления": {
    ru: "Все объявления",
    uk: "Усі оголошення",
    en: "All listings",
    pl: "Wszystkie ogłoszenia"
  },

  "Автомобили": {
    ru: "Автомобили",
    uk: "Автомобілі",
    en: "Cars",
    pl: "Samochody"
  },

  "Недвижимость": {
    ru: "Недвижимость",
    uk: "Нерухомість",
    en: "Real estate",
    pl: "Nieruchomości"
  },

  "Готовый бизнес": {
    ru: "Готовый бизнес",
    uk: "Готовий бізнес",
    en: "Ready-made business",
    pl: "Gotowy biznes"
  },

  "Инвестиции": {
    ru: "Инвестиции",
    uk: "Інвестиції",
    en: "Investments",
    pl: "Inwestycje"
  }
};
// ===============================
// Текущий язык
// ===============================
let lang =
  localStorage.getItem("hryvniaHubLanguage") || "ru";


// ===============================
// Перевод одного элемента
// ===============================
function translateTextElement(element, original) {
  if (!element) return;

  const item = translations[original];

  if (item && item[lang]) {
    element.textContent = item[lang];
  }
}


// ===============================
// Перевод только интерфейса
// ===============================
function translatePage(selectedLanguage) {

  lang = selectedLanguage;

  document.documentElement.lang = lang;

  localStorage.setItem(
    "hryvniaHubLanguage",
    lang
  );


  // --------------------------------
  // Кнопка добавления объявления
  // --------------------------------
  translateTextElement(
    document.getElementById("openAdd"),
    "+ Добавить объявление"
  );


  // --------------------------------
  // Главный заголовок
  // --------------------------------
  const heroTitle =
    document.querySelector(".hero h1");

  if (heroTitle) {
    const title =
      translations["Найди выгодное"];

    const deal =
      translations["предложение"];

    if (title && deal) {
      heroTitle.innerHTML =
        `${title[lang]}<br>${deal[lang]}`;
    }
  }


  // --------------------------------
  // Описание главного экрана
  // --------------------------------
  translateTextElement(
    document.querySelector(".hero-text"),
    "Автомобили, недвижимость и готовый бизнес — в одном месте."
  );


  // --------------------------------
  // Поиск
  // --------------------------------
  if (searchInput) {

    const placeholder =
      translations[
        "Что ищете? Например: Skoda Octavia"
      ];

    if (placeholder) {
      searchInput.placeholder =
        placeholder[lang];
    }
  }


  translateTextElement(
    document.getElementById("searchBtn"),
    "Найти"
  );


  // --------------------------------
  // Города
  // --------------------------------
  if (
    cityFilter &&
    cityFilter.options.length
  ) {

    const city =
      translations["Все города"];

    if (city) {
      cityFilter.options[0].textContent =
        city[lang];
    }
  }


  // --------------------------------
  // Заголовок категорий
  // --------------------------------
  const sectionEyebrow =
    document.querySelector(".section .eyebrow");

  if (sectionEyebrow) {

    const key =
      sectionEyebrow.textContent.trim();

    const item =
      translations[key] ||
      translations["КАТЕГОРИИ"] ||
      translations["Категории"];

    if (item && item[lang]) {
      sectionEyebrow.textContent =
        item[lang];
    }
  }


  const categoryTitle =
    document.querySelector(".section h2");

  if (categoryTitle) {

    const item =
      translations["Что ищем?"];

    if (item && item[lang]) {
      categoryTitle.textContent =
        item[lang];
    }
  }


  // --------------------------------
  // Категории
  // --------------------------------
  const categoryButtons =
    document.querySelectorAll(".category");

  const categoryNames = [
    "Все",
    "Автомобили",
    "Недвижимость",
    "Готовый бизнес",
    "Инвестиции"
  ];

  const categoryDescriptions = {

    "Все": {
      ru: "Все объявления",
      uk: "Усі оголошення",
      en: "All listings",
      pl: "Wszystkie ogłoszenia"
    },

    "Автомобили": {
      ru: "Легковые и другие",
      uk: "Легкові та інші",
      en: "Cars and more",
      pl: "Samochody i inne"
    },

    "Недвижимость": {
      ru: "Квартиры, дома, земля",
      uk: "Квартири, будинки, земля",
      en: "Apartments, houses, land",
      pl: "Mieszkania, domy, grunty"
    },

    "Готовый бизнес": {
      ru: "Готовый бизнес и проекты",
      uk: "Готовий бізнес і проєкти",
      en: "Ready-made businesses and projects",
      pl: "Gotowe firmy i projekty"
    },

    "Инвестиции": {
      ru: "Инвестиционные возможности",
      uk: "Інвестиційні можливості",
      en: "Investment opportunities",
      pl: "Możliwości inwestycyjne"
    }
  };


  categoryButtons.forEach(
    (button, index) => {

      const name =
        categoryNames[index];

      if (!name) return;


      const span =
        button.querySelector("span");

      const small =
        button.querySelector("small");


      // Название категории
      if (span) {

        const item =
          translations[name];

        if (item && item[lang]) {

          const emoji =
            span.textContent.match(
              /^[^\p{L}\p{N}]*/u
            )?.[0] || "";

          span.textContent =
            emoji +
                item[lang];
        }
      }
    


    // Описание категории
    if (small) {

      const description =
        categoryDescriptions[name];

      if (
        description &&
        description[lang]
      ) {
        small.textContent =
          description[lang];
      }
    }
  });


  // --------------------------------
  // Языковой переключатель
  // --------------------------------
  const languageSwitcher =
    document.getElementById(
      "languageSwitcher"
    );

  if (languageSwitcher) {

    const names = translations;

    if (languageSwitcher.options[0]) {
      languageSwitcher.options[0].textContent =
        "🇷🇺 " +
        names["Русский"][lang];
    }

    if (languageSwitcher.options[1]) {
      languageSwitcher.options[1].textContent =
        "🇺🇦 " +
        names["Українська"][lang];
    }

    if (languageSwitcher.options[2]) {
      languageSwitcher.options[2].textContent =
        "🇬🇧 " +
        names["English"][lang];
    }

    if (languageSwitcher.options[3]) {
      languageSwitcher.options[3].textContent =
        "🇵🇱 " +
        names["Polski"][lang];
    }
  }
}


// ===============================
// Переключатель языка
// ===============================
const languageSwitcher =
  document.getElementById(
    "languageSwitcher"
  );

if (languageSwitcher) {

  languageSwitcher.addEventListener(
    "change",
    function () {
      translatePage(this.value);
    }
  );


  const savedLanguage =
    localStorage.getItem(
      "hryvniaHubLanguage"
    );


  if (savedLanguage) {

    languageSwitcher.value =
      savedLanguage;

    translatePage(
      savedLanguage
    );

  } else {

    translatePage("ru");
  }
}
