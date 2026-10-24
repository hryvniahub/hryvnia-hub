// Hryvnia Hub MVP — актуальная версия
const SUPABASE_URL = "https://bxwfnmndxbhrjvcpsffy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KTs3Xo5UIxZ0ArcZV-5oQA_V4wXZog9";
const hasSupabaseConfig = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
const db = hasSupabaseConfig ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let lang = localStorage.getItem("hryvniaHubLanguage") || "uk";

const TIME_ZONES = {
  en: { city: "London",   tz: "Europe/London" },
  uk: { city: "Київ",     tz: "Europe/Kyiv" },
  pl: { city: "Warszawa", tz: "Europe/Warsaw" },
  ru: { city: "Київ",     tz: "Europe/Kyiv" }
};
const LANG_FLAGS = { en: "🇬🇧", uk: "🇺🇦", pl: "🇵🇱" };

function updateLangButton() {
  const flagEl = document.getElementById("langFlag");
  const cityEl = document.getElementById("langCity");
  const meta = TIME_ZONES[lang] || TIME_ZONES.uk;
  if (flagEl) {
    if (lang === "ru") flagEl.innerHTML = '<span class="flag-ru" aria-hidden="true"></span>';
    else flagEl.textContent = LANG_FLAGS[lang] || "";
  }
  if (cityEl) cityEl.textContent = meta.city;
  updateClock();
}

function updateClock() {
  const clockEl = document.getElementById("langClock");
  if (!clockEl) return;
  const meta = TIME_ZONES[lang] || TIME_ZONES.uk;
  try {
    clockEl.textContent = new Intl.DateTimeFormat("uk-UA", {
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: meta.tz
    }).format(new Date());
  } catch {
    clockEl.textContent = "--:--";
  }
}

// === ЧАСТЬ 1 END ===

// === ЧАСТЬ 2: translations (A) ===

const translations = {
  "Категорії": { ru: "Категории", uk: "Категорії", en: "Categories", pl: "Kategorie" },
  "Автомобили": { ru: "Автомобили", uk: "Автомобілі", en: "Cars", pl: "Samochody" },
  "Недвижимость": { ru: "Недвижимость", uk: "Нерухомість", en: "Real estate", pl: "Nieruchomości" },
  "Готовый бизнес": { ru: "Готовый бизнес", uk: "Готовий бізнес", en: "Ready-made business", pl: "Gotowy biznes" },
  "Инвестиции": { ru: "Инвестиции", uk: "Інвестиції", en: "Investments", pl: "Inwestycje" },
  "Все категории": { ru: "Все категории", uk: "Усі категорії", en: "All categories", pl: "Wszystkie kategorie" },
  "Купівля автомобіля": { ru: "Покупка автомобиля", uk: "Купівля автомобіля", en: "Buy a car", pl: "Kupno samochodu" },
  "Оренда автомобіля": { ru: "Аренда автомобиля", uk: "Оренда автомобіля", en: "Rent a car", pl: "Wynajem samochodu" },
  "Русский": { ru: "Русский", uk: "Українська", en: "English", pl: "Polski" },
  "Українська": { ru: "Російська", uk: "Українська", en: "English", pl: "Polski" },
  "English": { ru: "Russian", uk: "Ukrainian", en: "English", pl: "Polish" },
  "Polski": { ru: "Rosyjski", uk: "Ukraiński", en: "English", pl: "Polski" },
  "+ Добавить объявление": { ru: "+ Добавить объявление", uk: "+ Додати оголошення", en: "+ Add listing", pl: "+ Dodaj ogłoszenie" },
  "Найди выгодное": { ru: "Найди выгодное", uk: "Знайди вигідну", en: "Find a great", pl: "Znajdź korzystną" },
  "предложение": { ru: "предложение", uk: "пропозицію", en: "deal", pl: "ofertę" },
  "Find the best deals in Ukraine": {
    ru: "Найдите лучшие предложения в Украине",
    uk: "Знайдіть найкращі пропозиції в Україні",
    en: "Find the best deals in Ukraine",
    pl: "Znajdź najlepsze oferty w Ukrainie"
  },
  "AI Deal Finder": { ru: "AI-поиск выгодных предложений", uk: "AI-пошук вигідних пропозицій", en: "AI Deal Finder", pl: "AI — wyszukiwarka okazji" },
  "Find better offers with artificial intelligence": {
    ru: "Находите лучшие предложения с помощью ИИ",
    uk: "Знаходьте кращі пропозиції за допомогою ШІ",
    en: "Find better offers with AI",
    pl: "Znajduj lepsze oferty dzięki AI"
  },
  "Analyze market prices": { ru: "Анализ рыночных цен", uk: "Аналіз ринкових цін", en: "Analyze market prices", pl: "Analizuj ceny rynkowe" },
  "Find urgent deals": { ru: "Поиск срочных продаж", uk: "Пошук термінових продажів", en: "Find urgent deals", pl: "Znajduj pilne okazje" },
  "✨ Try AI Search": { ru: "✨ Попробовать AI-поиск", uk: "✨ Спробувати AI-пошук", en: "✨ Try AI Search", pl: "✨ Wypróbuj AI" },
  "Market quotes: NBU, CoinGecko and Yahoo Finance": {
    ru: "Котировки: НБУ, CoinGecko и Yahoo Finance",
    uk: "Котирування: НБУ, CoinGecko та Yahoo Finance",
    en: "Quotes: NBU, CoinGecko and Yahoo Finance",
    pl: "Notowania: NBU, CoinGecko i Yahoo Finance"
  },
  "Quote unavailable": { ru: "Нет данных", uk: "Немає даних", en: "Unavailable", pl: "Brak danych" },
  "Автомобили, недвижимость и бизнес в одном месте.": {
    ru: "Автомобили, недвижимость и бизнес в одном месте.",
    uk: "Автомобілі, нерухомість і бізнес в одному місці.",
    en: "Cars, real estate and business all in one place.",
    pl: "Samochody, nieruchomości i biznes wszystko w jednym miejscu."
  },
  "Что ищете? Например: Skoda Octavia": {
    ru: "Что ищете? Например: Skoda Octavia",
    uk: "Що шукаєте? Наприклад: Skoda Octavia",
    en: "What are you looking for? Example: Skoda Octavia",
    pl: "Czego szukasz? Na przykład: Skoda Octavia"
  },
  "Все города": { ru: "Все города", uk: "Усі міста", en: "All cities", pl: "Wszystkie miasta" },
  "Все области": { ru: "Все области", uk: "Всі області", en: "All regions", pl: "Wszystkie regiony" },
  "Найти": { ru: "Найти", uk: "Знайти", en: "Search", pl: "Szukaj" },
  "Все": { ru: "Все", uk: "Усі", en: "All", pl: "Wszystkie" },
  "Все объявления": { ru: "Все объявления", uk: "Усі оголошення", en: "All listings", pl: "Wszystkie ogłoszenia" },
  "Бизнес и предпринимательство": { ru: "Бизнес и предпринимательство", uk: "Бізнес і підприємництво", en: "Business & entrepreneurship", pl: "Biznes i przedsiębiorczość" },
  "Куплю автомобиль": { ru: "Куплю автомобиль", uk: "Куплю автомобіль", en: "Buy a car", pl: "Kupię samochód" },
  "Арендую автомобиль": { ru: "Арендую автомобиль", uk: "Орендую автомобіль", en: "Rent a car", pl: "Wynajmę samochód" },
  "Обменяю автомобиль": { ru: "Обменяю автомобиль", uk: "Обміняю автомобіль", en: "Exchange a car", pl: "Zamienię samochód" },
  "Купівля": { ru: "Покупка", uk: "Купівля", en: "Buying", pl: "Kupno" },
  "Оренда": { ru: "Аренда", uk: "Оренда", en: "Renting", pl: "Wynajem" },
  "Куплю готовый бизнес": { ru: "Куплю готовый бизнес", uk: "Куплю готовий бізнес", en: "Buy an existing business", pl: "Kupię działającą firmę" },
  "Продам готовый бизнес": { ru: "Продам готовый бизнес", uk: "Продам готовий бізнес", en: "Sell an existing business", pl: "Sprzedam działającą firmę" },
  "Ищу бизнес-партнёра": { ru: "Ищу бизнес-партнёра", uk: "Шукаю бізнес-партнера", en: "Looking for a business partner", pl: "Szukam partnera biznesowego" },
  "Услуги": { ru: "Услуги", uk: "Послуги", en: "Services", pl: "Usługi" },
  "Ищу инвестора": { ru: "Ищу инвестора", uk: "Шукаю інвестора", en: "Looking for an investor", pl: "Szukam inwestora" },
  "Стану инвестором": { ru: "Стану инвестором", uk: "Стану інвестором", en: "Become an investor", pl: "Zostanę inwestorem" },
  "Стартапы": { ru: "Стартапы", uk: "Стартапи", en: "Startups", pl: "Startupy" },
  "Столица Украины": { ru: "Столица Украины", uk: "Столиця України", en: "Capital of Ukraine", pl: "Stolica Ukrainy" },
  "Область / регион": { ru: "Область / регион", uk: "Область / регіон", en: "Region", pl: "Region" },
  "Закрыть": { ru: "Закрыть", uk: "Закрити", en: "Close", pl: "Zamknij" },
  "Днепр": { ru: "Днепр", uk: "Дніпро", en: "Dnipro", pl: "Dniepr" },
  "Сумы": { ru: "Сумы", uk: "Суми", en: "Sumy", pl: "Sumy" },
  "Славянск": { ru: "Славянск", uk: "Слов'янськ", en: "Sloviansk", pl: "Słowiańsk" },
  "Новое объявление": { ru: "Новое объявление", uk: "Нове оголошення", en: "New listing", pl: "Nowe ogłoszenie" },
  "Добавить объявление": { ru: "Добавить объявление", uk: "Додати оголошення", en: "Add listing", pl: "Dodaj ogłoszenie" },
  "Категория": { ru: "Категория", uk: "Категорія", en: "Category", pl: "Kategoria" },
  "Название": { ru: "Название", uk: "Назва", en: "Title", pl: "Nazwa" },
  "Город": { ru: "Город", uk: "Місто", en: "City", pl: "Miasto" },
  "Введите название города": { ru: "Введите название города", uk: "Введіть назву міста", en: "Type a city name", pl: "Wpisz nazwę miasta" },
  "Город не найден": { ru: "Город не найден", uk: "Місто не знайдено", en: "No city found", pl: "Nie znaleziono miasta" },
  "Выберите город из списка": {
    ru: "Выберите город из списка", uk: "Виберіть місто зі списку",
    en: "Select a city from the list", pl: "Wybierz miasto z listy"
  },
  "Цена, грн": { ru: "Цена, грн", uk: "Ціна, грн", en: "Price, UAH", pl: "Cena, UAH" },
  "Описание": { ru: "Описание", uk: "Опис", en: "Description", pl: "Opis" },
  "Опубликовать": { ru: "Опубликовать", uk: "Опублікувати", en: "Publish", pl: "Opublikuj" },
  "Например: Skoda Octavia 1.6": {
    ru: "Например: Skoda Octavia 1.6", uk: "Наприклад: Skoda Octavia 1.6",
    en: "Example: Skoda Octavia 1.6", pl: "Na przykład: Skoda Octavia 1.6"
  },
  "Коротко опишите предложение": {
    ru: "Коротко опишите предложение", uk: "Коротко опишіть пропозицію",
    en: "Briefly describe the offer", pl: "Krótko opisz ofertę"
  },
  "Листинг": { ru: "Листинг", uk: "Оголошення", en: "LISTINGS", pl: "OGŁOSZENIA" },
  "Последние объявления": {
    ru: "Последние объявления", uk: "Останні оголошення",
    en: "Latest listings", pl: "Najnowsze ogłoszenia"
  },
  "Объявлений пока нет. Добавьте первое!": {
    ru: "Объявлений пока нет. Добавьте первое!",
    uk: "Оголошень поки немає. Додайте перше!",
    en: "No listings yet. Add the first one!",
    pl: "Nie ma jeszcze ogłoszeń. Dodaj pierwsze!"
  },
  "Загрузка объявлений…": {
    ru: "Загрузка объявлений…", uk: "Завантаження оголошень…",
    en: "Loading listings…", pl: "Ładowanie ogłoszeń…"
  },
  "Легковые и другие": { ru: "Легковые и другие", uk: "Легкові та інші", en: "Cars and more", pl: "Samochody i inne" },
  "Квартиры, дома, земля": {
    ru: "Квартиры, дома, земля", uk: "Квартири, будинки, земля",
    en: "Apartments, houses, land", pl: "Mieszkania, domy, grunty"
  },
  "Готовый бизнес и проекты": {
    ru: "Готовый бизнес и проекты", uk: "Готовий бізнес і проєкти",
    en: "Ready-made businesses and projects", pl: "Gotowe firmy i projekty"
  },
  "Инвестиционные возможности": {
    ru: "Инвестиционные возможности", uk: "Інвестиційні можливості",
    en: "Investment opportunities", pl: "Możliwości inwestycyjne"
  },

// === ЧАСТЬ 2 END (продолжение в Части 3) ===

// === ЧАСТЬ 3: translations (B) ===

  "Главная": { ru: "Главная", uk: "Головна", en: "Home", pl: "Główna" },
  "Избранное": { ru: "Избранное", uk: "Обране", en: "Favorites", pl: "Ulubione" },
  "Сообщения": { ru: "Сообщения", uk: "Повідомлення", en: "Messages", pl: "Wiadomości" },
  "Написать продавцу": { ru: "Написать продавцу", uk: "Написати продавцю", en: "Message seller", pl: "Napisz do sprzedawcy" },
  "Войдите, чтобы написать продавцу.": {
    ru: "Войдите, чтобы написать продавцу.",
    uk: "Увійдіть, щоб написати продавцю.",
    en: "Sign in to message the seller.",
    pl: "Zaloguj się, aby napisać do sprzedawcy."
  },
  "Войдите, чтобы добавить объявление": {
    ru: "Войдите, чтобы добавить объявление",
    uk: "Увійдіть, щоб додати оголошення",
    en: "Sign in to add a listing",
    pl: "Zaloguj się, aby dodać ogłoszenie"
  },
  "Войдите, чтобы видеть сообщения.": {
    ru: "Войдите, чтобы видеть сообщения.",
    uk: "Увійдіть, щоб бачити повідомлення.",
    en: "Sign in to view messages.",
    pl: "Zaloguj się, aby zobaczyć wiadomości."
  },
  "Сообщений пока нет.": {
    ru: "Сообщений пока нет.",
    uk: "Повідомлень поки немає.",
    en: "No messages yet.",
    pl: "Brak wiadomości."
  },
  "В избранном пока ничего нет.": {
    ru: "В избранном пока ничего нет.",
    uk: "В обраному поки нічого немає.",
    en: "Nothing in favorites yet.",
    pl: "Brak ulubionych."
  },
  "Загрузка…": { ru: "Загрузка…", uk: "Завантаження…", en: "Loading…", pl: "Ładowanie…" },
  "← К списку": { ru: "← К списку", uk: "← До списку", en: "← Back to list", pl: "← Do listy" },
  "Отправить": { ru: "Отправить", uk: "Надіслати", en: "Send", pl: "Wyślij" },
  "Ваше сообщение...": { ru: "Ваше сообщение...", uk: "Ваше повідомлення...", en: "Your message...", pl: "Twoja wiadomość..." },
  "Ошибка": { ru: "Ошибка", uk: "Помилка", en: "Error", pl: "Błąd" },
  "Ошибка:": { ru: "Ошибка:", uk: "Помилка:", en: "Error:", pl: "Błąd:" },
  "Это ваше объявление.": {
    ru: "Это ваше объявление.", uk: "Це ваше оголошення.",
    en: "This is your listing.", pl: "To Twoje ogłoszenie."
  },
  "У объявления нет автора.": {
    ru: "У объявления нет автора.", uk: "У оголошення немає автора.",
    en: "Listing has no author.", pl: "Ogłoszenie nie ma autora."
  },
  "Supabase не подключён.": {
    ru: "Supabase не подключён.", uk: "Supabase не підключено.",
    en: "Supabase is not configured.", pl: "Supabase nie jest skonfigurowany."
  },
  "AI не нашёл предложений ниже среднего.": {
    ru: "AI не нашёл предложений ниже среднего по категории.",
    uk: "AI не знайшов пропозицій нижче середнього за категорією.",
    en: "AI found no offers below the category average.",
    pl: "AI nie znalazł ofert poniżej średniej kategorii."
  },
  "Поиск лучших предложений…": {
    ru: "Поиск лучших предложений…", uk: "Пошук найкращих пропозицій…",
    en: "Finding best offers…", pl: "Szukam najlepszych ofert…"
  },
  "AI-подборка: ниже средней цены по категории": {
    ru: "AI-подборка: ниже средней цены по категории",
    uk: "AI-добірка: нижче середньої ціни за категорією",
    en: "AI picks: below the category average",
    pl: "Wybór AI: poniżej średniej kategorii"
  },
  "HOT OFFERS": { ru: "ГОРЯЧИЕ ПРЕДЛОЖЕНИЯ", uk: "ГАРЯЧІ ПРОПОЗИЦІЇ", en: "HOT OFFERS", pl: "GORĄCE OFERTY" },
  "Urgent deals": { ru: "Срочные предложения", uk: "Термінові пропозиції", en: "Urgent deals", pl: "Pilne okazje" },
  "Best offers below market price": { ru: "Лучшие предложения ниже рыночной цены", uk: "Найкращі пропозиції нижче ринкової ціни", en: "Best offers below market price", pl: "Najlepsze oferty poniżej ceny rynkowej" },
  "Urgent deals will appear here once listings are flagged as urgent in the database.": { ru: "Срочные предложения появятся здесь, когда объявления будут отмечены как срочные.", uk: "Термінові пропозиції з'являться тут, коли оголошення будуть позначені як термінові.", en: "Urgent deals will appear here once listings are flagged as urgent in the database.", pl: "Pilne okazje pojawią się tutaj, gdy ogłoszenia zostaną oznaczone jako pilne." },
  "Цена (любая)": { ru: "Цена (любая)", uk: "Ціна (будь-яка)", en: "Price (any)", pl: "Cena (dowolna)" },
  "Радиус поиска": { ru: "Радиус поиска", uk: "Радіус пошуку", en: "Search radius", pl: "Promień wyszukiwania" },
  "Радиус: 30 км": { ru: "Радиус: 30 км", uk: "Радіус: 30 км", en: "Radius: 30 km", pl: "Promień: 30 km" },
  "Радиус: 50 км": { ru: "Радиус: 50 км", uk: "Радіус: 50 км", en: "Radius: 50 km", pl: "Promień: 50 km" },
  "Радиус: 100 км": { ru: "Радиус: 100 км", uk: "Радіус: 100 км", en: "Radius: 100 km", pl: "Promień: 100 km" },
  "Радиус: 200 км": { ru: "Радиус: 200 км", uk: "Радіус: 200 км", en: "Radius: 200 km", pl: "Promień: 200 km" },
  "Область": { ru: "Область", uk: "Область", en: "Region", pl: "Region" },
  "Поиск": { ru: "Поиск", uk: "Пошук", en: "Search", pl: "Szukaj" },
  "Описание не указано.": { ru: "Описание не указано.", uk: "Опис не вказано.", en: "No description provided.", pl: "Brak opisu." },
  "В избранное": { ru: "В избранное", uk: "В обране", en: "Add to favorites", pl: "Dodaj do ulubionych" },
  "Убрать из избранного": { ru: "Убрать из избранного", uk: "Прибрати з обраного", en: "Remove from favorites", pl: "Usuń z ulubionych" },
  "Объявление": { ru: "Объявление", uk: "Оголошення", en: "Listing", pl: "Ogłoszenie" },
  "Розширений пошук": { ru: "Расширенный поиск", uk: "Розширений пошук", en: "Advanced search", pl: "Wyszukiwanie zaawansowane" },
  "Згорнути розширений пошук": { ru: "Свернуть расширенный поиск", uk: "Згорнути розширений пошук", en: "Hide advanced search", pl: "Ukryj wyszukiwanie zaawansowane" },
  "Скинути": { ru: "Сбросить", uk: "Скинути", en: "Reset", pl: "Wyczyść" },
  "Знайти автомобілі": { ru: "Найти автомобили", uk: "Знайти автомобілі", en: "Find cars", pl: "Znajdź samochody" },
  "Оберіть параметри автомобіля": { ru:"Выберите параметры автомобиля", uk:"Оберіть параметри автомобіля", en:"Choose vehicle filters", pl:"Wybierz parametry pojazdu" },
  "Будь-яка ціна": {ru:"Любая",uk:"Будь-яка ціна",en:"Any price",pl:"Dowolna cena"},
  "Всі марки": {ru:"Все марки",uk:"Всі марки",en:"All makes",pl:"Wszystkie marki"},
  "Всі моделі": {ru:"Все модели",uk:"Всі моделі",en:"All models",pl:"Wszystkie modele"},
  "Закрити": {ru:"Закрыть",uk:"Закрити",en:"Close",pl:"Zamknij"},
  "Марка": { ru: "Марка", uk: "Марка", en: "Make", pl: "Marka" },
  "Модель": { ru: "Модель", uk: "Модель", en: "Model", pl: "Model" },
  "Рік від": { ru: "Год от", uk: "Рік від", en: "Year from", pl: "Rok od" },
  "Рік до": { ru: "Год до", uk: "Рік до", en: "Year to", pl: "Rok do" },
  "Ціна від": { ru: "Цена от", uk: "Ціна від", en: "Price from", pl: "Cena od" },
  "Ціна до": { ru: "Цена до", uk: "Ціна до", en: "Price to", pl: "Cena do" },
  "Пробіг від, км": { ru: "Пробег от, км", uk: "Пробіг від, км", en: "Mileage from, km", pl: "Przebieg od, km" },
  "Пробіг до, км": { ru: "Пробег до, км", uk: "Пробіг до, км", en: "Mileage to, km", pl: "Przebieg do, km" },
  "Об’єм двигуна від, л": { ru: "Объём двигателя от, л", uk: "Об’єм двигуна від, л", en: "Engine size from, L", pl: "Pojemność silnika od, l" },
  "Об’єм двигуна до, л": { ru: "Объём двигателя до, л", uk: "Об’єм двигуна до, л", en: "Engine size to, L", pl: "Pojemność silnika do, l" },
  "Тип кузова": { ru: "Тип кузова", uk: "Тип кузова", en: "Body type", pl: "Typ nadwozia" },
  "Паливо": { ru: "Топливо", uk: "Паливо", en: "Fuel", pl: "Paliwo" },
  "Коробка передач": { ru: "Коробка передач", uk: "Коробка передач", en: "Transmission", pl: "Skrzynia biegów" },
  "Усі марки": { ru: "Все марки", uk: "Усі марки", en: "All makes", pl: "Wszystkie marki" },
  "Усі моделі": { ru: "Все модели", uk: "Усі моделі", en: "All models", pl: "Wszystkie modele" },
  "Будь-який": { ru: "Любой", uk: "Будь-який", en: "Any", pl: "Dowolny" },
  "Будь-яка": { ru: "Любая", uk: "Будь-яка", en: "Any", pl: "Dowolna" },
  "Будь-яке": { ru: "Любое", uk: "Будь-яке", en: "Any", pl: "Dowolne" },
  "Перевірте числові значення фільтрів.": { ru: "Проверьте числовые значения фильтров.", uk: "Перевірте числові значення фільтрів.", en: "Check the numeric filter values.", pl: "Sprawdź wartości liczbowe filtrów." },
  "Перевірте діапазони фільтрів.": { ru: "Проверьте диапазоны фильтров.", uk: "Перевірте діапазони фільтрів.", en: "Check the filter ranges.", pl: "Sprawdź zakresy filtrów." },
  "Рік «від» не може бути більшим за рік «до».": { ru: "Год «от» не может быть больше года «до».", uk: "Рік «від» не може бути більшим за рік «до».", en: "Year from cannot be greater than year to.", pl: "Rok początkowy nie może być większy od końcowego." },
  "Ціна «від» не може бути більшою за ціну «до».": { ru: "Цена «от» не может быть больше цены «до».", uk: "Ціна «від» не може бути більшою за ціну «до».", en: "Price from cannot be greater than price to.", pl: "Cena minimalna nie może być większa od maksymalnej." },
  "Пробіг «від» не може бути більшим за пробіг «до».": { ru: "Пробег «от» не может быть больше пробега «до».", uk: "Пробіг «від» не може бути більшим за пробіг «до».", en: "Mileage from cannot be greater than mileage to.", pl: "Przebieg od nie może być większy od przebiegu do." },
  "Об’єм двигуна «від» не може бути більшим за «до».": { ru: "Объём двигателя «от» не может быть больше «до».", uk: "Об’єм двигуна «від» не може бути більшим за «до».", en: "Engine size from cannot be greater than engine size to.", pl: "Pojemność silnika od nie może być większa od pojemności do." },
  "Валюта": {ru:"Валюта",uk:"Валюта",en:"Currency",pl:"Waluta"}, "Стан авто": {ru:"Состояние авто",uk:"Стан авто",en:"Vehicle status",pl:"Stan pojazdu"},
  "Потужність від, к. с.": {ru:"Мощность от, л. с.",uk:"Потужність від, к. с.",en:"Power from, hp",pl:"Moc od, KM"}, "Потужність до, к. с.": {ru:"Мощность до, л. с.",uk:"Потужність до, к. с.",en:"Power to, hp",pl:"Moc do, KM"},
  "Кількість дверей": {ru:"Количество дверей",uk:"Кількість дверей",en:"Number of doors",pl:"Liczba drzwi"}, "Привід": {ru:"Привод",uk:"Привід",en:"Drive type",pl:"Napęd"},
  "Технічний стан": {ru:"Техническое состояние",uk:"Технічний стан",en:"Technical condition",pl:"Stan techniczny"}, "Колір": {ru:"Цвет",uk:"Колір",en:"Color",pl:"Kolor"}, "Продавець": {ru:"Продавец",uk:"Продавець",en:"Seller",pl:"Sprzedawca"},
  "Нове": {ru:"Новое",uk:"Нове",en:"New",pl:"Nowy"}, "Вживане": {ru:"С пробегом",uk:"Вживане",en:"Used",pl:"Używany"}, "Білий": {ru:"Белый",uk:"Білий",en:"White",pl:"Biały"}, "Чорний": {ru:"Чёрный",uk:"Чорний",en:"Black",pl:"Czarny"},
  "Сірий": {ru:"Серый",uk:"Сірий",en:"Gray",pl:"Szary"}, "Сріблястий": {ru:"Серебристый",uk:"Сріблястий",en:"Silver",pl:"Srebrny"}, "Червоний": {ru:"Красный",uk:"Червоний",en:"Red",pl:"Czerwony"}, "Синій": {ru:"Синий",uk:"Синій",en:"Blue",pl:"Niebieski"},
  "Зелений": {ru:"Зелёный",uk:"Зелений",en:"Green",pl:"Zielony"}, "Коричневий": {ru:"Коричневый",uk:"Коричневий",en:"Brown",pl:"Brązowy"}, "Жовтий": {ru:"Жёлтый",uk:"Жовтий",en:"Yellow",pl:"Żółty"}, "Інший": {ru:"Другой",uk:"Інший",en:"Other",pl:"Inny"},
  "Будь-хто": {ru:"Любой",uk:"Будь-хто",en:"Any",pl:"Dowolny"}, "Приватна особа": {ru:"Частное лицо",uk:"Приватна особа",en:"Private seller",pl:"Osoba prywatna"}, "Компанія / автосалон": {ru:"Компания / автосалон",uk:"Компанія / автосалон",en:"Company / dealer",pl:"Firma / dealer"},
  "Повний, що підключається": {ru:"Подключаемый полный привод",uk:"Повний, що підключається",en:"Selectable all-wheel drive",pl:"Dołączany napęd 4x4"}, "На ходу, технічно справний": {ru:"На ходу, технически исправно",uk:"На ходу, технічно справний",en:"Roadworthy and mechanically sound",pl:"Sprawny technicznie, jeżdżący"}, "Задовільний": {ru:"Удовлетворительное",uk:"Задовільний",en:"Fair",pl:"Zadowalający"}, "Потребує ремонту": {ru:"Требует ремонта",uk:"Потребує ремонту",en:"Needs repair",pl:"Wymaga naprawy"}, "Не на ходу": {ru:"Не на ходу",uk:"Не на ходу",en:"Not running",pl:"Niesprawny, nie jeździ"},
  "Потужність «від» не може бути більшою за «до». ": {ru:"Мощность «от» не может быть больше «до».",uk:"Потужність «від» не може бути більшою за «до».",en:"Power from cannot be greater than power to.",pl:"Moc od nie może być większa od mocy do."},
  "Седан": {ru:"Седан",uk:"Седан",en:"Sedan",pl:"Sedan"}, "Хетчбек": {ru:"Хэтчбек",uk:"Хетчбек",en:"Hatchback",pl:"Hatchback"}, "Універсал": {ru:"Универсал",uk:"Універсал",en:"Wagon",pl:"Kombi"}, "Позашляховик": {ru:"Внедорожник",uk:"Позашляховик",en:"SUV",pl:"SUV"}, "Купе": {ru:"Купе",uk:"Купе",en:"Coupe",pl:"Coupe"}, "Мінівен": {ru:"Минивэн",uk:"Мінівен",en:"Minivan",pl:"Minivan"}, "Пікап": {ru:"Пикап",uk:"Пікап",en:"Pickup",pl:"Pickup"},
  "Бензин": {ru:"Бензин",uk:"Бензин",en:"Petrol",pl:"Benzyna"}, "Дизель": {ru:"Дизель",uk:"Дизель",en:"Diesel",pl:"Diesel"}, "Газ/бензин": {ru:"Газ/бензин",uk:"Газ/бензин",en:"LPG/petrol",pl:"LPG/benzyna"}, "Електро": {ru:"Электро",uk:"Електро",en:"Electric",pl:"Elektryczny"}, "Гібрид": {ru:"Гибрид",uk:"Гібрид",en:"Hybrid",pl:"Hybryda"},
  "Механічна": {ru:"Механическая",uk:"Механічна",en:"Manual",pl:"Manualna"}, "Автоматична": {ru:"Автоматическая",uk:"Автоматична",en:"Automatic",pl:"Automatyczna"}, "Варіатор": {ru:"Вариатор",uk:"Варіатор",en:"CVT",pl:"CVT"}, "Робот": {ru:"Робот",uk:"Робот",en:"Automated manual",pl:"Automatyczna zautomatyzowana"},
  "Передній": {ru:"Передний",uk:"Передній",en:"Front-wheel drive",pl:"Napęd na przednie koła"}, "Задній": {ru:"Задний",uk:"Задній",en:"Rear-wheel drive",pl:"Napęd na tylne koła"}, "Повний": {ru:"Полный",uk:"Повний",en:"All-wheel drive",pl:"Napęd na wszystkie koła"}
};

// === ЧАСТЬ 3 END ===

// === ЧАСТЬ 4: authMessages, authText, t, setButtonLoading ===

const authMessages = {
  ru: { close:"Закрыть", account:"Аккаунт", settings:"Настройки аккаунта", menu:"Меню / Настройки", login:"Вход", register:"Регистрация", email:"Электронная почта", password:"Пароль", confirm:"Подтвердите пароль", forgot:"Забыли пароль?", reset:"Восстановление пароля", resetLink:"Отправить ссылку для сброса", newPassword:"Новый пароль", savePassword:"Сохранить пароль", back:"Назад", signOut:"Выход", signedIn:"Вход выполнен.", signedOut:"Вы вышли из аккаунта.", signingIn:"Вход…", signingUp:"Регистрация…", sending:"Отправка…", saving:"Сохранение…", signingOut:"Выход…", emailRequired:"Введите email", invalidEmail:"Введите корректный email", shortPassword:"Пароль слишком короткий (минимум 6 символов)", mismatch:"Пароли не совпадают", noSupabase:"Supabase не подключён", badLogin:"Неверный email или пароль", confirmEmail:"Подтвердите email", exists:"Пользователь с таким email уже существует", registered:"Регистрация успешна. Проверьте почту для подтверждения.", resetSent:"Ссылка для сброса отправлена. Проверьте почту.", passwordUpdated:"Пароль обновлён.", signOutError:"Не удалось выйти. Попробуйте ещё раз.", signedAs:"Вы вошли как:" },
  uk: { close:"Закрити", account:"Акаунт", settings:"Налаштування акаунта", menu:"Меню / Налаштування", login:"Вхід", register:"Реєстрація", email:"Електронна пошта", password:"Пароль", confirm:"Підтвердіть пароль", forgot:"Забули пароль?", reset:"Відновлення пароля", resetLink:"Надіслати посилання для скидання", newPassword:"Новий пароль", savePassword:"Зберегти пароль", back:"Назад", signOut:"Вихід", signedIn:"Вхід виконано.", signedOut:"Ви вийшли з акаунта.", signingIn:"Вхід…", signingUp:"Реєстрація…", sending:"Надсилання…", saving:"Збереження…", signingOut:"Вихід…", emailRequired:"Введіть email", invalidEmail:"Введіть коректний email", shortPassword:"Пароль занадто короткий (мінімум 6 символів)", mismatch:"Паролі не збігаються", noSupabase:"Supabase не підключено", badLogin:"Невірний email або пароль", confirmEmail:"Підтвердіть email", exists:"Користувач з таким email вже існує", registered:"Реєстрація успішна. Перевірте пошту для підтвердження.", resetSent:"Посилання для скидання надіслано. Перевірте пошту.", passwordUpdated:"Пароль оновлено.", signOutError:"Не вдалося вийти. Спробуйте ще раз.", signedAs:"Ви увійшли як:" },
  en: { close:"Close", account:"Account", settings:"Account settings", menu:"Menu / Settings", login:"Sign in", register:"Sign up", email:"Email", password:"Password", confirm:"Confirm password", forgot:"Forgot password?", reset:"Password reset", resetLink:"Send reset link", newPassword:"New password", savePassword:"Save password", back:"Back", signOut:"Sign out", signedIn:"Signed in successfully.", signedOut:"Signed out.", signingIn:"Signing in…", signingUp:"Signing up…", sending:"Sending…", saving:"Saving…", signingOut:"Signing out…", emailRequired:"Enter your email", invalidEmail:"Enter a valid email", shortPassword:"Password is too short (min 6 characters)", mismatch:"Passwords do not match", noSupabase:"Supabase is not configured", badLogin:"Invalid email or password", confirmEmail:"Confirm your email", exists:"User with this email already exists", registered:"Registration successful. Check your email to confirm.", resetSent:"Reset link sent. Check your email.", passwordUpdated:"Password updated.", signOutError:"Sign out failed. Please try again.", signedAs:"Signed in as:" },
  pl: { close:"Zamknij", account:"Konto", settings:"Ustawienia konta", menu:"Menu / Ustawienia", login:"Zaloguj się", register:"Zarejestruj się", email:"E-mail", password:"Hasło", confirm:"Potwierdź hasło", forgot:"Nie pamiętasz hasła?", reset:"Reset hasła", resetLink:"Wyślij link do resetu", newPassword:"Nowe hasło", savePassword:"Zapisz hasło", back:"Wstecz", signOut:"Wyloguj się", signedIn:"Zalogowano pomyślnie.", signedOut:"Wylogowano.", signingIn:"Logowanie…", signingUp:"Rejestracja…", sending:"Wysyłanie…", saving:"Zapisywanie…", signingOut:"Wylogowywanie…", emailRequired:"Podaj email", invalidEmail:"Podaj poprawny email", shortPassword:"Hasło jest za krótkie (min. 6 znaków)", mismatch:"Hasła nie są takie same", noSupabase:"Supabase nie jest skonfigurowany", badLogin:"Nieprawidłowy email lub hasło", confirmEmail:"Potwierdź email", exists:"Użytkownik z tym e-mailem już istnieje", registered:"Rejestracja zakończona. Sprawdź pocztę, aby potwierdzić.", resetSent:"Link do resetu wysłany. Sprawdź pocztę.", passwordUpdated:"Hasło zaktualizowane.", signOutError:"Nie udało się wylogować. Spróbuj ponownie.", signedAs:"Zalogowano jako:" }
};

function authText(key) { return (authMessages[lang] || authMessages.ru)[key] || key; }
function t(key) { return translations[key]?.[lang] || translations[key]?.ru || key; }

function setButtonLoading(button, loading, loadingText = "") {
  if (!button) return;
  if (loading) {
    if (button.dataset.originalHtml === undefined) button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.classList.add("is-loading");
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${loadingText ? `<span>${escapeHtml(loadingText)}</span>` : ""}`;
  } else {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.classList.remove("is-loading");
    if (button.dataset.originalHtml !== undefined) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
  }
}

// === ЧАСТЬ 4 END ===
// === ЧАСТЬ 5: DOM refs + утилиты ===

const listing = document.getElementById("listing");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogCitySearchInput = document.getElementById("catalogCitySearchInput");
const catalogCitySuggestions = document.getElementById("catalogCitySuggestions");
const catalogRegionSelect = document.getElementById("catalogRegionSelect");
const cityRegionSelect = document.getElementById("cityRegionSelect");
const citySearchInput = document.getElementById("citySearchInput");
const citySuggestions = document.getElementById("citySuggestions");
const citySelect = document.getElementById("citySelect");
let availableCities = [];
let citySearchIndex = [];
let regionNames = {};
let selectedCatalogCityId = "";
let activeRegionCode = "";
let formRegionCode = "";
const addModal = document.getElementById("addModal");
const formMessage = document.getElementById("formMessage");

const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const authGuest = document.getElementById("authGuest");
const authLoggedIn = document.getElementById("authLoggedIn");
const authUserEmail = document.getElementById("authUserEmail");
const authSignOut = document.getElementById("authSignOut");
const authSignOutMessage = document.getElementById("authSignOutMessage");
const authLoginForm = document.getElementById("authLoginForm");
const authRegisterForm = document.getElementById("authRegisterForm");
const authResetForm = document.getElementById("authResetForm");
const authNewPasswordForm = document.getElementById("authNewPasswordForm");
const authShowReset = document.getElementById("authShowReset");
const authBackToLogin = document.getElementById("authBackToLogin");
const accountBtn = document.getElementById("accountBtn");
const accountLabel = document.getElementById("accountLabel");
let currentUser = null;
let authRecoveryMode = false;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

const LISTING_RATES_KEY = "hryvniaHubListingRates";
let listingRates = loadListingRates();

function loadListingRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(LISTING_RATES_KEY) || "null");
    if (saved && Number(saved.usdUah) > 0 && Number(saved.plnUah) > 0) {
      return { usdUah: Number(saved.usdUah), plnUah: Number(saved.plnUah), rateDate: saved.rateDate || "", checkedAt: saved.checkedAt || "" };
    }
  } catch {}
  return null;
}

function listingCurrencyForLanguage() {
  return lang === "en" ? "USD" : lang === "pl" ? "PLN" : "UAH";
}

function money(value, sourceCurrency = "UAH") {
  const localeMap = { uk: "uk-UA", ru: "ru-RU", en: "en-US", pl: "pl-PL" };
  const source = String(sourceCurrency || "UAH").toUpperCase();
  const target = listingCurrencyForLanguage();
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  // Do not relabel an amount as another currency if we have no usable exchange rate.
  if (source !== target && !listingRates) {
    try {
      return new Intl.NumberFormat(localeMap[lang] || "uk-UA", {
        style: "currency", currency: ["UAH", "USD", "PLN"].includes(source) ? source : "UAH",
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${amount} ${source}`;
    }
  }

  const uahPerCurrency = {
    UAH: 1,
    USD: listingRates?.usdUah,
    PLN: listingRates?.plnUah
  };
  const sourceRate = uahPerCurrency[source];
  const targetRate = uahPerCurrency[target];

  if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
    try {
      return new Intl.NumberFormat(localeMap[lang] || "uk-UA", {
        style: "currency", currency: ["UAH", "USD", "PLN"].includes(source) ? source : "UAH",
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${amount} ${source}`;
    }
  }

  const converted = amount * sourceRate / targetRate;
  try {
    return new Intl.NumberFormat(localeMap[lang] || "uk-UA", {
      style: "currency",
      currency: target,
      maximumFractionDigits: 0
    }).format(converted);
  } catch {
    return `${Math.round(converted)} ${target}`;
  }
}

function listingPhotos(item) {
  return [...new Set([item.image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])])]
    .filter(url => typeof url === "string" && /^https?:\/\//i.test(url));
}

function listingCover(item) {
  const url = listingPhotos(item)[0];
  if (typeof url === "string" && /^https?:\/\//i.test(url)) {
    return `<img class="listing-photo" tabindex="0" role="button" src="${escapeHtml(url)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
  }
  const category = String(item.category || "");
  const drawings = {
    "Автомобили": '<path d="M4 17h16l-1.5-6a2 2 0 0 0-2-1.5h-9A2 2 0 0 0 5.5 11L4 17Z"/><path d="M3 17v3h3v-3m12 0v3h3v-3M7 9l1.5-4h7L17 9M7 13h.01M17 13h.01"/>',
    "Недвижимость": '<path d="m3 11 9-7 9 7v9H3Z"/><path d="M9 20v-6h6v6M7 11h.01M17 11h.01"/>',
    "Готовый бизнес": '<path d="M3 9h18v11H3zM8 9V5h8v4M3 13h18M10 13v2h4v-2"/>',
    "Инвестиции": '<path d="M4 20V4m0 16h17M7 16l4-5 3 2 6-8M16 5h4v4"/>'
  };
  const drawing = drawings[category] || drawings["Готовый бизнес"];
  return `<div class="listing-placeholder" aria-label="${escapeHtml(item.category || "Hryvnia Hub")}"><svg viewBox="0 0 24 24" role="img" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg></div>`;
}

// === ЧАСТЬ 5 END ===
// === ЧАСТЬ 6: АВТОРИЗАЦИЯ ===

function setAuthMessage(form, message, kind = "") {
  const msg = form?.querySelector(".form-message");
  if (!msg) return;
  msg.textContent = message;
  msg.classList.remove("error", "success");
  if (kind) msg.classList.add(kind);
}

function mapAuthError(error) {
  const raw = String(error?.message || "").toLowerCase();
  if (raw.includes("invalid login") || raw.includes("invalid credentials")) return authText("badLogin");
  if (raw.includes("email not confirmed")) return authText("confirmEmail");
  if (raw.includes("already registered") || raw.includes("already exists") || raw.includes("user already")) return authText("exists");
  if (raw.includes("password should be") || raw.includes("password is too short") || raw.includes("weak password")) return authText("shortPassword");
  if (raw.includes("email") && (raw.includes("invalid") || raw.includes("valid"))) return authText("invalidEmail");
  return error?.message || "Error";
}

function showAuthView(view) {
  const views = { login: authLoginForm, register: authRegisterForm, reset: authResetForm, newPassword: authNewPasswordForm };
  Object.values(views).forEach(form => form?.classList.add("hidden"));
  views[view]?.classList.remove("hidden");
  document.querySelectorAll("[data-auth-tab]").forEach(button => {
    const active = button.dataset.authTab === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  Object.values(views).forEach(form => {
    const msg = form?.querySelector(".form-message");
    if (msg) { msg.textContent = ""; msg.classList.remove("error", "success"); }
  });
}

function updateAccountButton() {
  if (!accountLabel) return;
  const email = currentUser?.email || "";
  accountLabel.textContent = currentUser
    ? (email.length > 18 ? email.slice(0, 16) + "…" : email || authText("account"))
    : authText("account");
  if (accountBtn) accountBtn.setAttribute("aria-label", authText("account"));
}

function renderAuthModal() {
  if (!authModal) return;
  if (currentUser) {
    ensureAccountMenuUI();
    updateAccountMenuLabels();
    showAccountMenuList();
    authGuest?.classList.add("hidden");
    authLoggedIn?.classList.remove("hidden");
    if (authUserEmail) authUserEmail.textContent = currentUser.email || "";
    if (authSignOutMessage) { authSignOutMessage.textContent = ""; authSignOutMessage.classList.remove("error", "success"); }
  } else {
    authGuest?.classList.remove("hidden");
    authLoggedIn?.classList.add("hidden");
    showAuthView(authRecoveryMode ? "newPassword" : "login");
  }
}

function openAuthModal() { renderAuthModal(); authModal?.classList.remove("hidden"); authClose?.focus(); }
function closeAuthModal() { authModal?.classList.add("hidden"); }

// ==== STAGE A: show/hide password ====
const PASSWORD_TOGGLE_LABELS = {
  ru: { show: "Показать пароль", hide: "Скрыть пароль" },
  uk: { show: "Показати пароль", hide: "Приховати пароль" },
  en: { show: "Show password", hide: "Hide password" },
  pl: { show: "Pokaż hasło", hide: "Ukryj hasło" }
};
function passwordToggleLabel(key) {
  return (PASSWORD_TOGGLE_LABELS[lang] || PASSWORD_TOGGLE_LABELS.ru)[key];
}
function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const field = btn.closest(".password-field");
      const input = field?.querySelector("input");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", passwordToggleLabel(show ? "hide" : "show"));
      const icon = btn.querySelector(".password-toggle-icon");
      if (icon) icon.textContent = show ? "🙈" : "👁";
      field.classList.toggle("is-visible", show);
      input.focus({ preventScroll: true });
    });
  });
}

function updateAuthTranslations() {
  const setText = (s, k) => { const el = document.querySelector(s); if (el) el.textContent = authText(k); };
  setText("#authEyebrow", "account");
  setText("#authTitle", "settings");
  setText('[data-auth-tab="login"]', "login");
  setText('[data-auth-tab="register"]', "register");
  setText("#authShowReset", "forgot");
  setText("#authBackToLogin", "back");
  setText("#authLoginForm label:nth-of-type(1) span", "email");
  setText("#authLoginForm label:nth-of-type(2) span", "password");
  setText("#authRegisterForm label:nth-of-type(1) span", "email");
  setText("#authRegisterForm label:nth-of-type(2) span", "password");
  setText("#authRegisterForm label:nth-of-type(3) span", "confirm");
  setText("#authResetForm h3", "reset");
  setText("#authResetForm label span", "email");
  setText("#authNewPasswordForm h3", "newPassword");
  setText("#authNewPasswordForm label:nth-of-type(1) span", "newPassword");
  setText("#authNewPasswordForm label:nth-of-type(2) span", "confirm");
  setText("#authLoggedIn .muted", "signedAs");
  setText("#authSignOut", "signOut");
  setText("#authOpenMenu", "menu");
  [["#authLoginForm button[type='submit']", "login"], ["#authRegisterForm button[type='submit']", "register"], ["#authResetForm button[type='submit']", "resetLink"], ["#authNewPasswordForm button[type='submit']", "savePassword"]].forEach(([s, k]) => setText(s, k));
  if (authClose) authClose.setAttribute("aria-label", authText("close"));
  updateAccountButton();
  initPasswordToggles();
  document.querySelectorAll("[data-password-toggle]").forEach(btn => {
    const pressed = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-label", passwordToggleLabel(pressed ? "hide" : "show"));
  });
}

accountBtn?.addEventListener("click", openAuthModal);
authClose?.addEventListener("click", closeAuthModal);
authModal?.addEventListener("click", event => { if (event.target === authModal) closeAuthModal(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && authModal && !authModal.classList.contains("hidden")) closeAuthModal();
});
document.querySelectorAll("[data-auth-tab]").forEach(button => button.addEventListener("click", () => {
  authRecoveryMode = false;
  showAuthView(button.dataset.authTab);
}));
authShowReset?.addEventListener("click", () => { authRecoveryMode = false; showAuthView("reset"); });
authBackToLogin?.addEventListener("click", () => { authRecoveryMode = false; showAuthView("login"); });
// === ACCOUNT MENU: standard account sections, scoped to the existing auth modal ===
const ACCOUNT_MENU_TEXT = {
  ru: { profile:"Мой профиль", listings:"Мои объявления", favorites:"Избранное", messages:"Сообщения", settings:"Настройки", security:"Безопасность аккаунта", signOut:"Выйти из аккаунта", back:"← Назад в меню", profileTitle:"Мой профиль", displayName:"Имя или название организации", username:"Никнейм", profileHint:"Укажите имя, псевдоним или название компании — как вас будут видеть другие пользователи.", saveProfile:"Сохранить профиль", profileSaved:"Профиль сохранён.", profileSaveError:"Не удалось сохранить профиль.", email:"Электронная почта", userId:"ID аккаунта", settingsTitle:"Настройки", settingsNote:"Дополнительные настройки будут добавляться постепенно. Язык интерфейса уже переключается в верхней панели.", securityTitle:"Безопасность аккаунта", newPassword:"Новый пароль", confirmPassword:"Подтвердите новый пароль", save:"Сохранить пароль", passwordSaved:"Пароль успешно изменён.", passwordMismatch:"Пароли не совпадают.", passwordShort:"Пароль должен содержать не менее 6 символов.", listingsEmpty:"У вас пока нет объявлений.", loading:"Загрузка…", error:"Не удалось загрузить данные." },
  uk: { profile:"Мій профіль", listings:"Мої оголошення", favorites:"Обране", messages:"Повідомлення", settings:"Налаштування", security:"Безпека облікового запису", signOut:"Вийти з облікового запису", back:"← Назад до меню", profileTitle:"Мій профіль", displayName:"Ім’я або назва організації", username:"Нікнейм", profileHint:"Вкажіть ім’я, псевдонім або назву компанії — так вас бачитимуть інші користувачі.", saveProfile:"Зберегти профіль", profileSaved:"Профіль збережено.", profileSaveError:"Не вдалося зберегти профіль.", email:"Електронна пошта", userId:"ID облікового запису", settingsTitle:"Налаштування", settingsNote:"Додаткові налаштування додаватимемо поступово. Мова інтерфейсу вже перемикається у верхній панелі.", securityTitle:"Безпека облікового запису", newPassword:"Новий пароль", confirmPassword:"Підтвердьте новий пароль", save:"Зберегти пароль", passwordSaved:"Пароль успішно змінено.", passwordMismatch:"Паролі не збігаються.", passwordShort:"Пароль має містити щонайменше 6 символів.", listingsEmpty:"У вас поки немає оголошень.", loading:"Завантаження…", error:"Не вдалося завантажити дані." },
  en: { profile:"My profile", listings:"My listings", favorites:"Favorites", messages:"Messages", settings:"Settings", security:"Account security", signOut:"Sign out", back:"← Back to menu", profileTitle:"My profile", displayName:"Name or organization", username:"Username", profileHint:"Enter your name, nickname, or company name as other users will see it.", saveProfile:"Save profile", profileSaved:"Profile saved.", profileSaveError:"Could not save profile.", email:"Email", userId:"Account ID", settingsTitle:"Settings", settingsNote:"More settings will be added gradually. The interface language can already be changed from the top bar.", securityTitle:"Account security", newPassword:"New password", confirmPassword:"Confirm new password", save:"Save password", passwordSaved:"Password changed successfully.", passwordMismatch:"Passwords do not match.", passwordShort:"Password must be at least 6 characters.", listingsEmpty:"You have no listings yet.", loading:"Loading…", error:"Could not load data." },
  pl: { profile:"Mój profil", listings:"Moje ogłoszenia", favorites:"Ulubione", messages:"Wiadomości", settings:"Ustawienia", security:"Bezpieczeństwo konta", signOut:"Wyloguj się", back:"← Wróć do menu", profileTitle:"Mój profil", displayName:"Imię lub nazwa organizacji", username:"Pseudonim", profileHint:"Podaj imię, pseudonim lub nazwę firmy widoczną dla innych użytkowników.", saveProfile:"Zapisz profil", profileSaved:"Profil został zapisany.", profileSaveError:"Nie udało się zapisać profilu.", email:"E-mail", userId:"ID konta", settingsTitle:"Ustawienia", settingsNote:"Dodatkowe ustawienia będziemy dodawać stopniowo. Język interfejsu można już zmienić na górnym pasku.", securityTitle:"Bezpieczeństwo konta", newPassword:"Nowe hasło", confirmPassword:"Potwierdź nowe hasło", save:"Zapisz hasło", passwordSaved:"Hasło zostało zmienione.", passwordMismatch:"Hasła nie są zgodne.", passwordShort:"Hasło musi mieć co najmniej 6 znaków.", listingsEmpty:"Nie masz jeszcze ogłoszeń.", loading:"Ładowanie…", error:"Nie udało się wczytać danych." }
};
function accountMenuText(key) { return (ACCOUNT_MENU_TEXT[lang] || ACCOUNT_MENU_TEXT.uk)[key] || key; }

let accountMenuRoot = null;
let accountListingsModal = null;
function ensureAccountMenuUI() {
  if (!authLoggedIn || accountMenuRoot) return;
  const oldMenuButton = document.getElementById("authOpenMenu");
  if (oldMenuButton) oldMenuButton.classList.add("hidden");

  accountMenuRoot = document.createElement("div");
  accountMenuRoot.id = "accountMenuRoot";
  accountMenuRoot.innerHTML = `
    <nav class="account-menu-list" aria-label="Account menu">
      <button type="button" class="account-menu-item" data-account-action="profile"><span aria-hidden="true">👤</span><span data-account-label="profile"></span><span aria-hidden="true">›</span></button>
      <button type="button" class="account-menu-item" data-account-action="listings"><span aria-hidden="true">📋</span><span data-account-label="listings"></span><span aria-hidden="true">›</span></button>
      <button type="button" class="account-menu-item" data-account-action="favorites"><span aria-hidden="true">♥</span><span data-account-label="favorites"></span><span aria-hidden="true">›</span></button>
      <button type="button" class="account-menu-item" data-account-action="messages"><span aria-hidden="true">✉</span><span data-account-label="messages"></span><span aria-hidden="true">›</span></button>
      <button type="button" class="account-menu-item" data-account-action="settings"><span aria-hidden="true">⚙</span><span data-account-label="settings"></span><span aria-hidden="true">›</span></button>
      <button type="button" class="account-menu-item" data-account-action="security"><span aria-hidden="true">🔐</span><span data-account-label="security"></span><span aria-hidden="true">›</span></button>
    </nav>
    <section id="accountMenuPanel" class="account-menu-panel hidden" aria-live="polite"></section>`;
  const emailEl = document.getElementById("authUserEmail");
  if (emailEl) emailEl.insertAdjacentElement("afterend", accountMenuRoot);

  const signOutMessage = document.getElementById("authSignOutMessage");
  const signOut = document.getElementById("authSignOut");
  if (signOut) {
    signOut.classList.add("account-signout-btn");
    signOut.textContent = accountMenuText("signOut");
  }
  if (signOutMessage && signOut) signOut.insertAdjacentElement("afterend", signOutMessage);

  updateAccountMenuLabels();
  accountMenuRoot.addEventListener("click", handleAccountMenuClick);
}
function updateAccountMenuLabels() {
  if (!accountMenuRoot) return;
  accountMenuRoot.querySelectorAll("[data-account-label]").forEach(el => { el.textContent = accountMenuText(el.dataset.accountLabel); });
  const signOut = document.getElementById("authSignOut");
  if (signOut) signOut.textContent = accountMenuText("signOut");
}
function showAccountMenuPanel(title, bodyHTML) {
  ensureAccountMenuUI();
  const list = accountMenuRoot?.querySelector(".account-menu-list");
  const panel = document.getElementById("accountMenuPanel");
  if (!panel || !list) return;
  list.classList.add("hidden");
  panel.innerHTML = `<button type="button" class="account-menu-back" data-account-action="back">${escapeHtml(accountMenuText("back"))}</button><h3>${escapeHtml(title)}</h3>${bodyHTML}`;
  panel.classList.remove("hidden");
}
function showAccountMenuList() {
  const list = accountMenuRoot?.querySelector(".account-menu-list");
  const panel = document.getElementById("accountMenuPanel");
  list?.classList.remove("hidden");
  if (panel) { panel.classList.add("hidden"); panel.innerHTML = ""; }
}
async function showMyListings() {
  if (!db || !currentUser) return;
  showAccountMenuPanel(accountMenuText("listings"), `<p class="muted">${escapeHtml(accountMenuText("loading"))}</p>`);
  const panel = document.getElementById("accountMenuPanel");
  const { data, error } = await db.from("listings").select("id,title,price,currency,created_at").eq("user_id", currentUser.id).order("created_at", { ascending: false });
  if (!panel || panel.classList.contains("hidden")) return;
  if (error) { panel.insertAdjacentHTML("beforeend", `<p class="form-message error">${escapeHtml(accountMenuText("error"))}</p>`); return; }
  if (!data?.length) { panel.insertAdjacentHTML("beforeend", `<p class="muted">${escapeHtml(accountMenuText("listingsEmpty"))}</p>`); return; }
  const rows = data.map(item => `<button type="button" class="account-listing-row" data-account-listing-id="${escapeHtml(String(item.id))}"><strong>${escapeHtml(item.title || t("Объявление"))}</strong><span>${escapeHtml(money(item.price, item.currency || "UAH"))}</span></button>`).join("");
  panel.insertAdjacentHTML("beforeend", rows);
}
async function handleAccountMenuClick(event) {
  const listingBtn = event.target.closest("[data-account-listing-id]");
  if (listingBtn) {
    const id = listingBtn.dataset.accountListingId;
    const item = visibleListings.find(x => String(x.id) === id);
    if (item) { closeAuthModal(); openListing(item); }
    else { closeAuthModal(); await loadListings(); const found = visibleListings.find(x => String(x.id) === id); if (found) openListing(found); }
    return;
  }
  const btn = event.target.closest("[data-account-action]");
  if (!btn) return;
  const action = btn.dataset.accountAction;
  if (action === "back") { showAccountMenuList(); return; }
  if (action === "profile") {
    const metadata = currentUser?.user_metadata || {};
    showAccountMenuPanel(accountMenuText("profileTitle"), `<form id="accountProfileForm"><p class="muted">${escapeHtml(accountMenuText("profileHint"))}</p><label><span>${escapeHtml(accountMenuText("displayName"))}</span><input name="displayName" type="text" maxlength="80" autocomplete="name" value="${escapeHtml(metadata.display_name || metadata.full_name || "")}" placeholder="${escapeHtml(accountMenuText("displayName"))}"></label><label><span>${escapeHtml(accountMenuText("username"))}</span><input name="username" type="text" maxlength="30" autocomplete="nickname" value="${escapeHtml(metadata.username || "")}" placeholder="@nickname"></label><p><strong>${escapeHtml(accountMenuText("email"))}</strong><br>${escapeHtml(currentUser?.email || "—")}</p><p><strong>${escapeHtml(accountMenuText("userId"))}</strong><br><small>${escapeHtml(currentUser?.id || "—")}</small></p><button class="account-save" type="submit">${escapeHtml(accountMenuText("saveProfile"))}</button><p class="form-message" role="status" aria-live="polite"></p></form>`);
    const form = document.getElementById("accountProfileForm");
    form?.addEventListener("submit", async e => {
      e.preventDefault();
      if (!db || !currentUser) return;
      const displayName = String(form.elements.displayName.value || "").trim();
      const username = String(form.elements.username.value || "").trim().replace(/^@+/, "");
      const message = form.querySelector(".form-message");
      const submit = form.querySelector("button[type=submit]");
      setButtonLoading(submit, true);
      const { data, error } = await db.auth.updateUser({ data: { display_name: displayName, username } });
      setButtonLoading(submit, false);
      if (!error && data?.user) currentUser = data.user;
      message.textContent = error ? `${accountMenuText("profileSaveError")} ${error.message || ""}` : accountMenuText("profileSaved");
      message.classList.toggle("error", Boolean(error));
      message.classList.toggle("success", !error);
    });
  } else if (action === "listings") {
    await showMyListings();
  } else if (action === "favorites") {
    closeAuthModal(); openFavoritesModal();
  } else if (action === "messages") {
    closeAuthModal(); openMessagesModal();
  } else if (action === "settings") {
    showAccountMenuPanel(accountMenuText("settingsTitle"), `<p class="muted">${escapeHtml(accountMenuText("settingsNote"))}</p>`);
  } else if (action === "security") {
    showAccountMenuPanel(accountMenuText("securityTitle"), `<form id="accountPasswordForm"><label><span>${escapeHtml(accountMenuText("newPassword"))}</span><input name="password" type="password" minlength="6" autocomplete="new-password" required></label><label><span>${escapeHtml(accountMenuText("confirmPassword"))}</span><input name="password2" type="password" minlength="6" autocomplete="new-password" required></label><button class="account-save" type="submit">${escapeHtml(accountMenuText("save"))}</button><p class="form-message" role="status" aria-live="polite"></p></form>`);
    const form = document.getElementById("accountPasswordForm");
    form?.addEventListener("submit", async e => {
      e.preventDefault();
      const p1 = String(form.elements.password.value || "");
      const p2 = String(form.elements.password2.value || "");
      const message = form.querySelector(".form-message");
      if (p1.length < 6) { message.textContent = accountMenuText("passwordShort"); message.classList.add("error"); return; }
      if (p1 !== p2) { message.textContent = accountMenuText("passwordMismatch"); message.classList.add("error"); return; }
      const submit = form.querySelector("button[type=submit]");
      setButtonLoading(submit, true);
      const { error } = await db.auth.updateUser({ password: p1 });
      setButtonLoading(submit, false);
      message.textContent = error ? (error.message || accountMenuText("error")) : accountMenuText("passwordSaved");
      message.classList.toggle("error", Boolean(error));
      message.classList.toggle("success", !error);
      if (!error) form.reset();
    });
  }
}

document.getElementById("authOpenMenu")?.addEventListener("click", () => {
  closeAuthModal();
  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) menuToggle.checked = true;
});

async function handleAuthSubmit(form, kind) {
  if (!form || form.dataset.submitting === "1") return;
  const email = String(form.elements.email?.value || "").trim();
  const password = String(form.elements.password?.value || "");
  const password2 = String(form.elements.password2?.value || "");
  if (kind !== "newPassword" && (!email || (kind !== "login" && !/^\S+@\S+\.\S+$/.test(email)))) return setAuthMessage(form, authText(kind === "login" ? "emailRequired" : "invalidEmail"), "error");
  if ((kind === "login" || kind === "register" || kind === "newPassword") && password.length < 6) return setAuthMessage(form, authText("shortPassword"), "error");
  if ((kind === "register" || kind === "newPassword") && password !== password2) return setAuthMessage(form, authText("mismatch"), "error");
  if (!db) return setAuthMessage(form, authText("noSupabase"), "error");
  const btn = form.querySelector("button[type='submit']");
  const loadingKey = { login: "signingIn", register: "signingUp", reset: "sending", newPassword: "saving" }[kind];
  form.dataset.submitting = "1";
  setAuthMessage(form, "");
  setButtonLoading(btn, true, authText(loadingKey));
  try {
    let result;
    if (kind === "login") result = await db.auth.signInWithPassword({ email, password });
    else if (kind === "register") result = await db.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
    else if (kind === "reset") result = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
    else result = await db.auth.updateUser({ password });
    if (result?.error) { setAuthMessage(form, mapAuthError(result.error), "error"); return; }
    if (kind === "login") {
      setAuthMessage(form, authText("signedIn"), "success");
      setTimeout(() => { closeAuthModal(); form.reset(); }, 500);
    }
    if (kind === "register") {
      if (result?.data?.session) {
        setAuthMessage(form, authText("signedIn"), "success");
        setTimeout(() => { closeAuthModal(); form.reset(); }, 500);
      } else {
        setAuthMessage(form, authText("registered"), "success");
      }
    }
    if (kind === "reset") setAuthMessage(form, authText("resetSent"), "success");
    if (kind === "newPassword") {
      authRecoveryMode = false;
      setAuthMessage(form, authText("passwordUpdated"), "success");
      setTimeout(() => { closeAuthModal(); form.reset(); }, 800);
    }
  } catch (error) {
    setAuthMessage(form, mapAuthError(error), "error");
  } finally {
    setButtonLoading(btn, false);
    delete form.dataset.submitting;
  }
}

[[authLoginForm, "login"], [authRegisterForm, "register"], [authResetForm, "reset"], [authNewPasswordForm, "newPassword"]].forEach(([form, kind]) => form?.addEventListener("submit", event => { event.preventDefault(); handleAuthSubmit(form, kind); }));

authSignOut?.addEventListener("click", async () => {
  if (!db || authSignOut.dataset.submitting === "1") return;
  authSignOut.dataset.submitting = "1";
  if (authSignOutMessage) { authSignOutMessage.textContent = ""; authSignOutMessage.classList.remove("error", "success"); }
  setButtonLoading(authSignOut, true, authText("signingOut"));
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    closeAuthModal();
  } catch (error) {
    console.error("Sign out failed:", error);
    if (authSignOutMessage) { authSignOutMessage.textContent = authText("signOutError"); authSignOutMessage.classList.add("error"); }
  } finally {
    setButtonLoading(authSignOut, false);
    delete authSignOut.dataset.submitting;
  }
});

async function initAuth() {
  updateAuthTranslations();
  if (!db) { updateAccountButton(); return; }
  try {
    const { data, error } = await db.auth.getSession();
    if (error) throw error;
    currentUser = data?.session?.user || null;
    updateAccountButton();
    if (currentUser && authUserEmail) authUserEmail.textContent = currentUser.email || "";
    if (currentUser) {
      await syncFavoritesOnLogin();
      await updateUnreadMessageIndicators();
      subscribeToGlobalMessages();
    }
  } catch (error) {
    console.error("getSession failed:", error);
  }
  db.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user || null;
    updateAccountButton();
    if (currentUser) {
      setTimeout(updateUnreadMessageIndicators, 0);
      subscribeToGlobalMessages();
    } else if (globalMessagesChannel) {
      try { db.removeChannel(globalMessagesChannel); } catch {}
      globalMessagesChannel = null;
      updateUnreadMessageIndicators();
    }
    if (event === "PASSWORD_RECOVERY") {
      authRecoveryMode = true;
      openAuthModal();
      return;
    }
    if (event === "SIGNED_IN") {
      if (authModal && !authModal.classList.contains("hidden")) renderAuthModal();
      await syncFavoritesOnLogin();
      subscribeToGlobalMessages();
      await updateUnreadMessageIndicators();
      renderListings(visibleListings);
    }
    if (event === "SIGNED_OUT") {
      authRecoveryMode = false;
      closeAuthModal();
      if (globalMessagesChannel) { try { db.removeChannel(globalMessagesChannel); } catch {} globalMessagesChannel = null; }
      updateUnreadMessageIndicators();
      renderListings(visibleListings);
    }
  });
}

// === ЧАСТЬ 6 END ===
// === ЧАСТЬ 7: ФОТОГРАФИИ + ИЗБРАННОЕ ===

const PHOTO_BUCKET = "listing-photos";
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const photoFields = document.getElementById("photoFields");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const photoMessage = document.getElementById("photoMessage");
const addForm = document.getElementById("addForm");
let selectedPhotos = [];
let publishing = false;
let validatingPhotos = false;

const photoTranslations = {
  ru: { label: "Фотографии", add: "Добавить фотографии", hint: "До 10 фото: JPEG, PNG или WebP, до 10 МБ каждое. Первое фото — главное.", main: "Главное фото", makeMain: "Сделать главным", remove: "Удалить", limit: "Можно добавить не больше 10 фотографий.", invalid: "Выберите изображения JPEG, PNG или WebP размером до 10 МБ каждое.", unreadable: "Не удалось открыть изображение. Выберите другой файл.", saving: "Сохраняем объявление и фотографии…", failed: "Не удалось сохранить объявление с фотографиями. Попробуйте ещё раз.", setup: "Загрузка фотографий пока недоступна. Попробуйте позже." },
  uk: { label: "Фотографії", add: "Додати фотографії", hint: "До 10 фото: JPEG, PNG або WebP, до 10 МБ кожне. Перше фото — головне.", main: "Головне фото", makeMain: "Зробити головним", remove: "Видалити", limit: "Можна додати не більше 10 фотографій.", invalid: "Виберіть зображення JPEG, PNG або WebP розміром до 10 МБ кожне.", unreadable: "Не вдалося відкрити зображення. Виберіть інший файл.", saving: "Зберігаємо оголошення та фотографії…", failed: "Не вдалося зберегти оголошення з фотографіями. Спробуйте ще раз.", setup: "Завантаження фотографій поки недоступне. Спробуйте пізніше." },
  en: { label: "Photos", add: "Add photos", hint: "Up to 10 photos: JPEG, PNG or WebP, up to 10 MB each. The first photo is the cover.", main: "Cover photo", makeMain: "Make cover", remove: "Remove", limit: "You can add up to 10 photos.", invalid: "Choose JPEG, PNG or WebP images up to 10 MB each.", unreadable: "This image could not be opened. Choose another file.", saving: "Saving the listing and photos…", failed: "Could not save the listing with photos. Please try again.", setup: "Photo uploads are currently unavailable. Please try later." },
  pl: { label: "Zdjęcia", add: "Dodaj zdjęcia", hint: "Do 10 zdjęć: JPEG, PNG lub WebP, do 10 MB każde. Pierwsze zdjęcie jest główne.", main: "Zdjęcie główne", makeMain: "Ustaw jako główne", remove: "Usuń", limit: "Możesz dodać maksymalnie 10 zdjęć.", invalid: "Wybierz obrazy JPEG, PNG lub WebP o rozmiarze do 10 MB każdy.", unreadable: "Nie można otworzyć obrazu. Wybierz inny plik.", saving: "Zapisywanie ogłoszenia i zdjęć…", failed: "Nie udało się zapisać ogłoszenia ze zdjęciami. Spróbuj ponownie.", setup: "Przesyłanie zdjęć jest obecnie niedostępne. Spróbuj później." }
};

function photoText(key) { return (photoTranslations[lang] || photoTranslations.ru)[key]; }

function renderPhotoPreview() {
  if (!photoPreview) return;
  photoPreview.innerHTML = selectedPhotos.map((photo, index) => `
    <div class="photo-item">
      <img src="${photo.previewUrl}" alt="${escapeHtml(photo.file.name)}">
      <span>${index === 0 ? photoText("main") : index + 1}</span>
      <div class="photo-actions">
        ${index > 0 ? `<button type="button" class="btn" data-photo-main="${index}">${photoText("makeMain")}</button>` : ""}
        <button type="button" class="btn" data-photo-remove="${index}" aria-label="${escapeHtml(photoText("remove") + ': ' + photo.file.name)}">${photoText("remove")}</button>
      </div>
    </div>`).join("");
}

function updatePhotoFields() {
  if (!photoFields) return;
  photoFields.disabled = publishing || validatingPhotos;
  const labelEl = document.getElementById("photoLabel");
  const pickerEl = document.getElementById("photoPickerButton");
  const hintEl = document.getElementById("photoHint");
  if (labelEl) labelEl.textContent = photoText("label");
  if (pickerEl) pickerEl.textContent = photoText("add");
  if (hintEl) hintEl.textContent = photoText("hint");
  renderPhotoPreview();
}

function resetPhotos() {
  selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
  selectedPhotos = [];
  if (photoInput) photoInput.value = "";
  if (photoMessage) photoMessage.textContent = "";
  updatePhotoFields();
}

if (photoInput) {
  const pickerBtn = document.getElementById("photoPickerButton");
  if (pickerBtn) pickerBtn.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", async () => {
    if (publishing || validatingPhotos) return;
    const files = [...photoInput.files];
    photoInput.value = "";
    if (photoMessage) photoMessage.textContent = "";
    if (files.length + selectedPhotos.length > MAX_PHOTOS) {
      if (photoMessage) photoMessage.textContent = photoText("limit");
      return;
    }
    if (files.some(file => !PHOTO_TYPES[file.type] || !file.size || file.size > MAX_PHOTO_BYTES)) {
      if (photoMessage) photoMessage.textContent = photoText("invalid");
      return;
    }
    validatingPhotos = true;
    updatePhotoFields();
    const additions = [];
    try {
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        additions.push({ file, previewUrl });
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = previewUrl;
        });
      }
      selectedPhotos.push(...additions);
    } catch {
      additions.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
      if (photoMessage) photoMessage.textContent = photoText("unreadable");
    } finally {
      validatingPhotos = false;
      updatePhotoFields();
    }
  });
}

if (photoPreview) {
  photoPreview.addEventListener("click", event => {
    if (publishing || validatingPhotos) return;
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.photoRemove !== undefined) {
      const [removed] = selectedPhotos.splice(Number(button.dataset.photoRemove), 1);
      URL.revokeObjectURL(removed.previewUrl);
    } else if (button.dataset.photoMain !== undefined) {
      selectedPhotos.unshift(...selectedPhotos.splice(Number(button.dataset.photoMain), 1));
    }
    if (photoMessage) photoMessage.textContent = "";
    renderPhotoPreview();
  });
}

// ==== STAGE A: client-side photo compression ====
const COMPRESS_MAX_SIDE = 1920;
const COMPRESS_QUALITY = 0.82;
const COMPRESS_MIME = "image/webp";

function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode-failed")); };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

async function compressPhoto(file) {
  let img;
  try {
    img = await loadImageFromBlob(file);
  } catch {
    return { blob: file, mime: file.type, width: 0, height: 0, compressed: false, undecodable: true };
  }
  const ratio = Math.min(1, COMPRESS_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * ratio));
  const height = Math.max(1, Math.round(img.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return { blob: file, mime: file.type, width, height, compressed: false, undecodable: false };
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.filter = "brightness(1.05) contrast(1.06) saturate(1.04)";
  ctx.drawImage(img, 0, 0, width, height);
  ctx.filter = "none";

  if (ratio === 1 && file.size <= 350 * 1024) {
    return { blob: file, mime: file.type, width, height, compressed: false, undecodable: false };
  }

  let blob = await canvasToBlob(canvas, COMPRESS_MIME, COMPRESS_QUALITY);
  let mime = COMPRESS_MIME;
  if (!blob) {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
    mime = "image/jpeg";
  }
  if (!blob) return { blob: file, mime: file.type, width, height, compressed: false, undecodable: false };
  return { blob, mime, width, height, compressed: true, undecodable: false };
}

async function uploadListingPhotos() {
  const { error: schemaError } = await db.from("listings").select("image_urls").limit(0);
  if (schemaError) throw new Error(photoText("setup"));
  const bucket = db.storage.from(PHOTO_BUCKET);
  const urls = [];
  for (const photo of selectedPhotos) {
    if (photo.uploadedUrl) { urls.push(photo.uploadedUrl); continue; }

    const result = await compressPhoto(photo.file);
    if (result.undecodable) throw new Error(photoText("unreadable"));
    if (result.blob.size > MAX_PHOTO_BYTES) throw new Error(photoText("invalid"));
    const ext = result.mime === "image/webp" ? "webp"
              : result.mime === "image/jpeg" ? "jpg"
              : result.mime === "image/png" ? "png"
              : "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await bucket.upload(path, result.blob, { contentType: result.mime, upsert: false });
    if (error) throw new Error(photoText("failed"));
    photo.uploadedUrl = bucket.getPublicUrl(path).data.publicUrl;
    urls.push(photo.uploadedUrl);
  }
  return urls;
}

const FAV_KEY = "hryvniaHubFavorites";
const favoritesModal = document.getElementById("favoritesModal");
const closeFavorites = document.getElementById("closeFavorites");
const favoritesList = document.getElementById("favoritesList");

function getLocalFavorites() {
  try {
    const arr = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch { return []; }
}
function saveLocalFavorites(list) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...new Set(list.map(String))])); } catch {}
}
function isFavorite(id) { return getLocalFavorites().includes(String(id)); }

function toggleFavorite(id) {
  const key = String(id);
  const list = getLocalFavorites();
  const wasFav = list.includes(key);
  const next = wasFav ? list.filter(x => x !== key) : [...list, key];
  saveLocalFavorites(next);
  if (db && currentUser) {
    if (wasFav) db.from("favorites").delete().eq("user_id", currentUser.id).eq("listing_id", key).then(() => {});
    else db.from("favorites").insert({ user_id: currentUser.id, listing_id: key })
      .then(({ error }) => { if (error) console.warn("fav insert:", error.message); });
  }
  document.querySelectorAll(`.fav-btn[data-fav-id="${CSS.escape(key)}"]`).forEach(btn => {
    btn.classList.toggle("active", !wasFav);
    btn.setAttribute("aria-pressed", String(!wasFav));
    btn.setAttribute("aria-label", !wasFav ? t("Убрать из избранного") : t("В избранное"));
    const span = btn.querySelector("span");
    if (span) span.textContent = !wasFav ? "♥" : "♡";
  });
}

async function syncFavoritesOnLogin() {
  if (!db || !currentUser) return;
  const local = getLocalFavorites();
  try {
    const { data, error } = await db.from("favorites").select("listing_id").eq("user_id", currentUser.id);
    if (error) { console.warn("favorites fetch error:", error.message); return; }
    const remote = (data || []).map(r => String(r.listing_id));
    const merged = [...new Set([...local, ...remote])];
    saveLocalFavorites(merged);
    const toUpload = merged.filter(id => !remote.includes(id));
    if (toUpload.length) {
      await db.from("favorites").insert(toUpload.map(listing_id => ({ user_id: currentUser.id, listing_id })));
    }
  } catch (err) { console.warn("syncFavorites:", err); }
}

function openFavoritesModal() { favoritesModal?.classList.remove("hidden"); renderFavoritesList(); }
function closeFavoritesModal() { favoritesModal?.classList.add("hidden"); }

async function renderFavoritesList() {
  if (!favoritesList) return;
  const favs = getLocalFavorites();
  if (!favs.length) { favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("В избранном пока ничего нет."))}</p>`; return; }
  if (!db) { favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("В избранном пока ничего нет."))}</p>`; return; }
  favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("Загрузка…"))}</p>`;
  const { data, error } = await db.from("listings").select("*, cities!inner(name_ru, name_uk, name_en, name_pl)").in("id", favs);
  if (error) { favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`; return; }
  if (!data || !data.length) {
    saveLocalFavorites([]);
    favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("В избранном пока ничего нет."))}</p>`;
    return;
  }
  const remoteIds = new Set(data.map(item => String(item.id)));
  const local = getLocalFavorites();
  const pruned = local.filter(id => remoteIds.has(id));
  if (pruned.length !== local.length) saveLocalFavorites(pruned);

  favoritesList.innerHTML = data.map(item => `
    <article class="card fav-card" data-fav-open-id="${escapeHtml(String(item.id))}" tabindex="0">
      ${listingCover(item)}
      <h3>${escapeHtml(item.title)}</h3>
      <p class="price">${money(item.price, item.currency || "UAH")}</p>
    </article>
  `).join("");
}
favoritesList?.addEventListener("click", (e) => {
  const card = e.target.closest("[data-fav-open-id]");
  if (!card) return;
  const id = card.dataset.favOpenId;
  const item = visibleListings.find(l => String(l.id) === id);
  if (item) { closeFavoritesModal(); openListing(item); }
});
closeFavorites?.addEventListener("click", closeFavoritesModal);
favoritesModal?.addEventListener("click", (e) => { if (e.target === favoritesModal) closeFavoritesModal(); });

// === ЧАСТЬ 7 END ===
// === ЧАСТЬ 8: СООБЩЕНИЯ + НАВИГАЦИЯ + AI + TICKER ===

const messagesModal = document.getElementById("messagesModal");
const closeMessagesBtn = document.getElementById("closeMessages");
const messagesGuestHint = document.getElementById("messagesGuestHint");
const conversationsList = document.getElementById("conversationsList");
const messagesThread = document.getElementById("messagesThread");
const threadMessages = document.getElementById("threadMessages");
const sendMessageForm = document.getElementById("sendMessageForm");
const backToConvs = document.getElementById("backToConvs");
let currentConversation = null;
let messagesChannel = null;
const renderedMessageIds = new Set();

async function updateUnreadMessageIndicators() {
  const navButtons = [...document.querySelectorAll('[data-nav="messages"]')];
  const badge = document.getElementById("messagesBadge");
  const account = document.getElementById("accountBtn");
  const clearAll = () => {
    if (badge) { badge.hidden = true; badge.textContent = ""; }
    navButtons.forEach(button => button.querySelector(".unread-count")?.remove());
    account?.querySelector(".unread-count")?.remove();
  };
  if (!db || !currentUser) { clearAll(); return; }
  try {
    const { data: reads, error: readError } = await db.from("conversation_reads")
      .select("conversation_id,last_read_at").eq("user_id", currentUser.id);
    if (readError) throw readError;
    const readMap = new Map((reads || []).map(r => [String(r.conversation_id), r.last_read_at]));
    const { data: convs, error: convError } = await db.from("conversations")
      .select("id").or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`);
    if (convError) throw convError;
    const counts = await Promise.all((convs || []).map(async conv => {
      let q = db.from("messages").select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id).neq("sender_id", currentUser.id);
      const lastRead = readMap.get(String(conv.id));
      if (lastRead) q = q.gt("created_at", lastRead);
      const result = await q;
      if (result.error) throw result.error;
      return result.count || 0;
    }));
    const unread = counts.reduce((sum, count) => sum + count, 0);
    const display = unread > 99 ? "99+" : String(unread);
    if (unread > 0 && badge) {
      badge.textContent = display;
      badge.hidden = false;
      badge.setAttribute("aria-label", `${unread} unread messages`);
    } else if (badge) {
      badge.hidden = true;
      badge.textContent = "";
    }
    // Совместимость с возможными старыми бейджами в навигации/кнопке аккаунта.
    navButtons.forEach(button => button.querySelector(".unread-count")?.remove());
    account?.querySelector(".unread-count")?.remove();
  } catch (error) {
    console.warn("Unread message indicator requires conversation_reads migration:", error.message);
    clearAll();
  }
}

function openMessagesModal() {
  messagesModal?.classList.remove("hidden");
  renderMessagesModal();
}
function closeMessagesModal() {
  messagesModal?.classList.add("hidden");
  currentConversation = null;
  messagesThread?.classList.add("hidden");
  conversationsList?.classList.remove("hidden");
  if (messagesChannel) { try { db.removeChannel(messagesChannel); } catch {} messagesChannel = null; }
}

let globalMessagesChannel = null;
function subscribeToGlobalMessages() {
  if (!db) return;
  if (globalMessagesChannel) { try { db.removeChannel(globalMessagesChannel); } catch {} globalMessagesChannel = null; }
  globalMessagesChannel = db.channel("messages:global-inserts")
    .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, payload => {
      const newMsg = payload.new;
      if (!newMsg) return;
      // Не увеличиваем счётчик собственными сообщениями.
      if (currentUser && String(newMsg.sender_id) === String(currentUser.id)) return;
      updateUnreadMessageIndicators();
      showNewMessageToast();
      if (messagesModal && !messagesModal.classList.contains("hidden") && !currentConversation) loadConversations();
    })
    .subscribe();
}
function showNewMessageToast() {
  if (document.hidden) return;
  let toast = document.getElementById("newMessageToast");
  if (!toast) {
    toast = document.createElement("button");
    toast.type = "button";
    toast.id = "newMessageToast";
    toast.className = "new-message-toast";
    toast.addEventListener("click", () => { toast.classList.remove("visible"); openMessagesModal(); });
    document.body.appendChild(toast);
  }
  toast.textContent = lang === "uk" ? "✉ Нове повідомлення — відкрити" : lang === "en" ? "✉ New message — open" : lang === "pl" ? "✉ Nowa wiadomość — otwórz" : "✉ Новое сообщение — открыть";
  toast.classList.add("visible");
  clearTimeout(showNewMessageToast.timer);
  showNewMessageToast.timer = setTimeout(() => toast.classList.remove("visible"), 7000);
}
// Realtime may be unavailable or delayed by Supabase configuration; refresh unread counts as a fallback.
setInterval(() => { if (currentUser && db) updateUnreadMessageIndicators(); }, 20000);
async function renderMessagesModal() {
  if (!db) {
    if (messagesGuestHint) { messagesGuestHint.textContent = t("Supabase не подключён."); messagesGuestHint.classList.remove("hidden"); }
    conversationsList?.classList.add("hidden");
    messagesThread?.classList.add("hidden");
    return;
  }
  if (!currentUser) {
    if (messagesGuestHint) { messagesGuestHint.textContent = t("Войдите, чтобы видеть сообщения."); messagesGuestHint.classList.remove("hidden"); }
    conversationsList?.classList.add("hidden");
    messagesThread?.classList.add("hidden");
    return;
  }
  messagesGuestHint?.classList.add("hidden");
  conversationsList?.classList.remove("hidden");
  messagesThread?.classList.add("hidden");
  await loadConversations();
  await updateUnreadMessageIndicators();
}
async function loadConversations() {
  if (!db || !currentUser || !conversationsList) return;
  conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Загрузка…"))}</p>`;
  const { data, error } = await db.from("conversations")
    .select("id, listing_id, buyer_id, seller_id, updated_at, listings(title)")
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("updated_at", { ascending: false });
  if (error) { conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`; return; }
  if (!data || !data.length) {
    conversationsList.innerHTML = `<div class="messages-empty"><span class="messages-empty-icon" aria-hidden="true">✉</span><p class="muted">${escapeHtml(t("Сообщений пока нет."))}</p></div>`;
    return;
  }
  const reads = await db.from("conversation_reads").select("conversation_id,last_read_at").eq("user_id", currentUser.id);
  const readMap = new Map((reads.data || []).map(r => [String(r.conversation_id), r.last_read_at]));
  const locale = ({ ru:"ru-RU", uk:"uk-UA", en:"en-GB", pl:"pl-PL" })[lang] || "uk-UA";
  const cards = await Promise.all(data.map(async c => {
    const last = await db.from("messages").select("body, created_at, sender_id")
      .eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const lastMessage = last.data || null;
    const lastRead = readMap.get(String(c.id));
    let unreadQ = db.from("messages").select("id", { count: "exact", head: true })
      .eq("conversation_id", c.id).neq("sender_id", currentUser.id);
    if (lastRead) unreadQ = unreadQ.gt("created_at", lastRead);
    const unreadRes = await unreadQ;
    const unreadCount = unreadRes.count || 0;
    const when = lastMessage?.created_at || c.updated_at;
    let timeLabel = "";
    if (when) {
      const d = new Date(when);
      if (!Number.isNaN(d.getTime())) {
        const sameDay = d.toDateString() === new Date().toDateString();
        try { timeLabel = sameDay ? d.toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" }) : d.toLocaleDateString(locale, { day:"2-digit", month:"2-digit" }); }
        catch { timeLabel = ""; }
      }
    }
    return { id:c.id, title:c.listings?.title || t("Объявление"), preview:lastMessage?.body || "", timeLabel, unreadCount };
  }));
  conversationsList.innerHTML = cards.map(c => `
    <button type="button" class="conversation-card ${c.unreadCount > 0 ? "is-unread" : ""}" data-conv-id="${escapeHtml(String(c.id))}" aria-label="${escapeHtml(c.title)}">
      <span class="conv-icon" aria-hidden="true">✉</span>
      <span class="conv-main"><span class="conv-title">${escapeHtml(c.title)}</span><span class="conv-last">${escapeHtml(c.preview || "—")}</span></span>
      <span class="conv-side"><span class="conv-time">${escapeHtml(c.timeLabel)}</span>${c.unreadCount > 0 ? `<span class="conv-unread">${c.unreadCount > 99 ? "99+" : c.unreadCount}</span>` : ""}</span>
    </button>`).join("");
}

conversationsList?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-conv-id]");
  if (!btn) return;
  openConversation(btn.dataset.convId);
});
async function openConversation(id) {
  if (!db || !currentUser) return;
  currentConversation = id;
  renderedMessageIds.clear();
  conversationsList?.classList.add("hidden");
  messagesThread?.classList.remove("hidden");
  await loadThread(id);
  if (db && currentUser) {
    const { error } = await db.from("conversation_reads").upsert({ user_id:currentUser.id, conversation_id:id, last_read_at:new Date().toISOString() }, { onConflict:"user_id,conversation_id" });
    if (error) console.warn("Could not mark conversation read:",error.message);
    await updateUnreadMessageIndicators();
  }
  subscribeToThread(id);
}
async function loadThread(id) {
  if (!threadMessages) return;
  threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Загрузка…"))}</p>`;
  const { data, error } = await db.from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (error) { threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`; return; }
  threadMessages.innerHTML = "";
  renderedMessageIds.clear();
  if (!data || !data.length) { threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Сообщений пока нет."))}</p>`; return; }
  data.forEach(m => appendMessageBubble(m));
  threadMessages.scrollTop = threadMessages.scrollHeight;
}
function appendMessageBubble(m) {
  if (!threadMessages || renderedMessageIds.has(m.id)) return;
  renderedMessageIds.add(m.id);
  const placeholder = threadMessages.querySelector(".muted");
  if (placeholder) placeholder.remove();
  const mine = m.sender_id === currentUser?.id;
  const el = document.createElement("div");
  el.className = `bubble ${mine ? "bubble-mine" : "bubble-theirs"}`;
  el.textContent = m.body;
  threadMessages.appendChild(el);
}
function subscribeToThread(id) {
  if (!db) return;
  if (messagesChannel) { try { db.removeChannel(messagesChannel); } catch {} }
  messagesChannel = db.channel(`messages:${id}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, (payload) => {
      if (payload.new) { appendMessageBubble(payload.new); if (threadMessages) threadMessages.scrollTop = threadMessages.scrollHeight; }
    })
    .subscribe();
}
sendMessageForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!db || !currentUser || !currentConversation) return;
  const body = String(sendMessageForm.elements.body.value || "").trim();
  if (!body) return;
  const btn = sendMessageForm.querySelector("button[type='submit']");
  setButtonLoading(btn, true);
  const { error } = await db.from("messages").insert({ conversation_id: currentConversation, sender_id: currentUser.id, body });
  setButtonLoading(btn, false);
  if (error) { console.warn("send message:", error.message); return; }
  sendMessageForm.reset();
  await db.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", currentConversation);
  await updateUnreadMessageIndicators();
});
backToConvs?.addEventListener("click", () => {
  currentConversation = null;
  renderedMessageIds.clear();
  messagesThread?.classList.add("hidden");
  conversationsList?.classList.remove("hidden");
  if (messagesChannel) { try { db.removeChannel(messagesChannel); } catch {} messagesChannel = null; }
  loadConversations();
});
closeMessagesBtn?.addEventListener("click", closeMessagesModal);
messagesModal?.addEventListener("click", (e) => { if (e.target === messagesModal) closeMessagesModal(); });

async function startConversation(item) {
  if (!currentUser) { alert(t("Войдите, чтобы написать продавцу.")); return; }
  if (!item.user_id) { alert(t("У объявления нет автора.")); return; }
  if (item.user_id === currentUser.id) { alert(t("Это ваше объявление.")); return; }
  if (!db) { alert(t("Supabase не подключён.")); return; }
  const existing = await db.from("conversations").select("id").eq("listing_id", item.id).eq("buyer_id", currentUser.id).maybeSingle();
  let convId = existing.data?.id;
  if (!convId) {
    const ins = await db.from("conversations").insert({ listing_id: item.id, buyer_id: currentUser.id, seller_id: item.user_id }).select("id").single();
    if (ins.error) { alert(ins.error.message); return; }
    convId = ins.data.id;
  }
  openMessagesModal();
  await new Promise(r => setTimeout(r, 60));
  await openConversation(convId);
}

document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.addEventListener("click", () => {
    const nav = btn.dataset.nav;
    document.querySelectorAll("[data-nav]").forEach(b => b.classList.toggle("active", b === btn));
    if (nav === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (nav === "favorites") openFavoritesModal();
    else if (nav === "messages") openMessagesModal();
  });
});
if (window.visualViewport) {
  const bottomNavEl = document.querySelector(".bottom-nav");
  window.visualViewport.addEventListener("resize", () => {
    if (!bottomNavEl) return;
    const keyboardOpen = window.visualViewport.height < window.innerHeight * 0.85;
    bottomNavEl.classList.toggle("keyboard-open", keyboardOpen);
  });
}

const aiSearchBtn = document.getElementById("aiSearchBtn");
async function runAiSearch() {
  if (!db) { alert(t("Supabase не подключён.")); return; }
  if (!aiSearchBtn) return;
  setButtonLoading(aiSearchBtn, true, t("Поиск лучших предложений…"));
  try {
    let query = db.from("listings").select("*, cities!inner(name_ru, name_uk, name_en, name_pl, region_katottg_code)");
    if (currentCategory) query = query.eq("category", currentCategory);
    if (selectedCatalogCityId) query = query.eq("city_id", selectedCatalogCityId);
    else if (activeRegionCode) query = query.eq("cities.region_katottg_code", activeRegionCode);
    const { data, error } = await query;
    if (error) { alert(t("Ошибка") + ": " + error.message); return; }
    const items = data || [];
    if (!items.length) { alert(t("AI не нашёл предложений ниже среднего.")); return; }
    const prices = items.map(x => Number(x.price)).filter(Number.isFinite).sort((a, b) => a - b);
    if (!prices.length) { alert(t("AI не нашёл предложений ниже среднего.")); return; }
    const median = prices[Math.floor(prices.length / 2)];
    const threshold = median * 0.85;
    const belowMedian = items.filter(x => Number(x.price) < threshold);
    if (!belowMedian.length) { alert(t("AI не нашёл предложений ниже среднего.")); return; }
    belowMedian.sort((a, b) => Number(a.price) - Number(b.price));
    const listingLabelEl = document.getElementById("listingLabel");
    const latestListingsTitleEl = document.getElementById("latestListingsTitle");
    if (listingLabelEl) listingLabelEl.textContent = t("AI-подборка: ниже средней цены по категории");
    if (latestListingsTitleEl) latestListingsTitleEl.textContent = t("AI Deal Finder");
    renderListings(belowMedian);
  } finally {
    setButtonLoading(aiSearchBtn, false);
  }
}
if (aiSearchBtn) aiSearchBtn.addEventListener("click", runAiSearch);

const TICKER_PREV_KEY = "hryvniaHubTickerPrev";
function loadTickerPrev() {
  try { return JSON.parse(localStorage.getItem(TICKER_PREV_KEY) || "{}") || {}; }
  catch { return {}; }
}
function saveTickerPrev(data) {
  try { localStorage.setItem(TICKER_PREV_KEY, JSON.stringify(data)); } catch {}
}
function setTickerValue(key, display, numeric, comparisonKey = key) {
  const el = document.querySelector(`[data-ticker="${key}"]`);
  if (el) el.textContent = display;
  const arrow = document.querySelector(`[data-ticker-arrow="${key}"]`);
  if (!arrow) return;
  arrow.className = "ticker-arrow"; arrow.textContent = "";
  if (!Number.isFinite(numeric)) return;
  const prev = loadTickerPrev(); const prevVal = Number(prev[comparisonKey]);
  if (Number.isFinite(prevVal) && prevVal !== 0) {
    if (numeric > prevVal) { arrow.textContent = "▲"; arrow.classList.add("up"); }
    else if (numeric < prevVal) { arrow.textContent = "▼"; arrow.classList.add("down"); }
    else { arrow.textContent = "•"; arrow.classList.add("flat"); }
  }
  prev[comparisonKey] = numeric; saveTickerPrev(prev);
}
const tickerLocale = { ru: "ru-RU", uk: "uk-UA", en: "en-US", pl: "pl-PL" };
function formatTickerNumber(value, digits = 2) {
  return new Intl.NumberFormat(tickerLocale[lang] || "uk-UA", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
async function fetchJsonWithFallback(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (directError) {
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    const response = await fetch(proxyUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
}
function tickerBaseCurrency() { return lang === "pl" ? "PLN" : lang === "en" ? "USD" : "UAH"; }
function tickerDate(dateValue) {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(tickerLocale[lang] || "uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}
function tickerSetText(attribute, key, value) {
  const el = document.querySelector(`[data-ticker-${attribute}="${key}"]`);
  if (el) el.textContent = value;
}
async function loadMarketQuotes() {
  const note = document.getElementById("tickerNote");
  const unavailable = () => (translations["Quote unavailable"]?.[lang] || "Unavailable");
  const base = tickerBaseCurrency();
  const pairs = {
    UAH: { usd: "USD/UAH", pln: "PLN/UAH", btc: "BTC/UAH", xau: "XAU/UAH" },
    PLN: { usd: "USD/PLN", pln: "UAH/PLN", btc: "BTC/PLN", xau: "XAU/PLN" },
    USD: { usd: "PLN/USD", pln: "UAH/USD", btc: "BTC/USD", xau: "XAU/USD" }
  };
  const icons = base === "UAH"
    ? { usd: "🇺🇸", pln: "🇵🇱", xau: "🥇" }
    : base === "PLN"
      ? { usd: "🇺🇸", pln: "🇺🇦", xau: "🥇" }
      : { usd: "🇵🇱", pln: "🇺🇦", xau: "🥇" };
  for (const key of ["usd", "pln", "btc", "xau"]) tickerSetText("label", key, pairs[base][key]);
  tickerSetText("icon", "usd", icons.usd);
  tickerSetText("icon", "pln", icons.pln);
  tickerSetText("icon", "xau", icons.xau);

  // Единица измерения золота — тройская унция (troy ounce).
  const goldUnitLabel = lang === "pl"
    ? "za uncję trojańską"
    : lang === "en"
      ? "per troy ounce"
      : lang === "ru"
        ? "за тройскую унцию"
        : "за тройську унцію";

  try {
    const [usdResult, plnResult, btcResult, xauResult] = await Promise.allSettled([
      fetchJsonWithFallback("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json"),
      fetchJsonWithFallback("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=PLN&json"),
      fetchJsonWithFallback("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah"),
      // XAU в USD: CoinGecko Tether Gold (XAUT), привязан к тройской унции золота.
      fetchJsonWithFallback("https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd")
    ]);
    if (usdResult.status !== "fulfilled" || plnResult.status !== "fulfilled") {
      throw new Error("NBU exchange rates unavailable");
    }
    const usdData = usdResult.value, plnData = plnResult.value;
    const btcData = btcResult.status === "fulfilled" ? btcResult.value : null;
    const xauData = xauResult.status === "fulfilled" ? xauResult.value : null;

    const usdRow = Array.isArray(usdData) ? usdData[0] : null;
    const plnRow = Array.isArray(plnData) ? plnData[0] : null;
    const usdUah = Number(usdRow?.rate), plnUah = Number(plnRow?.rate);
    const btcUah = Number(btcData?.bitcoin?.uah);
    const xauUsd = Number(xauData?.["tether-gold"]?.usd);

    if (![usdUah, plnUah].every(Number.isFinite) || usdUah <= 0 || plnUah <= 0) {
      throw new Error("NBU currency quote missing");
    }
    listingRates = {
      usdUah,
      plnUah,
      rateDate: usdRow?.exchangedate || plnRow?.exchangedate || "",
      checkedAt: new Date().toISOString()
    };
    try { localStorage.setItem(LISTING_RATES_KEY, JSON.stringify(listingRates)); } catch {}

    // Конвертация из USD (база XAU) в валюту интерфейса по актуальным курсам НБУ.
    const rates = base === "UAH"
      ? { usd: usdUah, pln: plnUah, btc: btcUah, xau: Number.isFinite(xauUsd) ? xauUsd * usdUah : NaN }
      : base === "PLN"
        ? { usd: usdUah / plnUah, pln: 1 / plnUah, btc: btcUah / plnUah, xau: Number.isFinite(xauUsd) ? xauUsd * usdUah / plnUah : NaN }
        : { usd: plnUah / usdUah, pln: 1 / usdUah, btc: btcUah / usdUah, xau: Number.isFinite(xauUsd) ? xauUsd : NaN };

    const date = tickerDate(usdRow?.exchangedate || plnRow?.exchangedate);
    const sourceDate = date || (lang === "pl" ? "data NBP" : lang === "en" ? "NBU rate" : "курс НБУ");
    const checkedAt = new Intl.DateTimeFormat(tickerLocale[lang] || "uk-UA", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

    setTickerValue("usd", formatTickerNumber(rates.usd, 2), rates.usd, pairs[base].usd);
    setTickerValue("pln", formatTickerNumber(rates.pln, base === "USD" ? 4 : 2), rates.pln, pairs[base].pln);

    if (Number.isFinite(btcUah) && btcUah > 0) {
      setTickerValue("btc", formatTickerNumber(rates.btc, 0), rates.btc, pairs[base].btc);
      tickerSetText("source", "btc", `CoinGecko · ${checkedAt}`);
    } else {
      setTickerValue("btc", unavailable(), null);
      tickerSetText("source", "btc", "");
    }

    if (Number.isFinite(rates.xau) && rates.xau > 0) {
      // Для XAU в UAH/PLN сумма крупная — без копеек; в USD — 2 знака.
      const digits = base === "USD" ? 2 : 0;
      setTickerValue("xau", formatTickerNumber(rates.xau, digits), rates.xau, pairs[base].xau);
      tickerSetText("source", "xau", `Gold · ${goldUnitLabel} · ${checkedAt}`);
    } else {
      setTickerValue("xau", unavailable(), null);
      tickerSetText("source", "xau", "");
    }

    tickerSetText("source", "usd", `${lang === "pl" ? "NBP" : "НБУ"} · ${sourceDate}`);
    tickerSetText("source", "pln", `${lang === "pl" ? "NBP" : "НБУ"} · ${sourceDate}`);
    if (note) note.textContent = lang === "pl"
      ? `Kursy walut · sprawdzono ${checkedAt}`
      : lang === "en"
        ? `Currency rates · checked ${checkedAt}`
        : lang === "ru"
          ? `Курсы валют · проверено ${checkedAt}`
          : `Курси валют · перевірено ${checkedAt}`;
  } catch (error) {
    console.warn("Currency ticker unavailable:", error);
    if (listingRates) {
      const rates = base === "UAH"
        ? { usd: listingRates.usdUah, pln: listingRates.plnUah }
        : base === "PLN"
          ? { usd: listingRates.usdUah / listingRates.plnUah, pln: 1 / listingRates.plnUah }
          : { usd: listingRates.plnUah / listingRates.usdUah, pln: 1 / listingRates.usdUah };
      setTickerValue("usd", formatTickerNumber(rates.usd, 2), rates.usd, pairs[base].usd);
      setTickerValue("pln", formatTickerNumber(rates.pln, base === "USD" ? 4 : 2), rates.pln, pairs[base].pln);
      tickerSetText("source", "usd", `NBU · ${listingRates.rateDate || "last saved rate"}`);
      tickerSetText("source", "pln", `NBU · ${listingRates.rateDate || "last saved rate"}`);
      setTickerValue("xau", unavailable(), null);
      tickerSetText("source", "btc", "");
      tickerSetText("source", "xau", "");
      if (note) note.textContent = lang === "pl"
        ? `Używany ostatni zapisany kurs · ${listingRates.rateDate || "data niedostępna"}`
        : lang === "en"
          ? `Using last saved rate · ${listingRates.rateDate || "date unavailable"}`
          : lang === "ru"
            ? `Используется последний сохранённый курс · ${listingRates.rateDate || "дата неизвестна"}`
            : `Використовується останній збережений курс · ${listingRates.rateDate || "дату не вказано"}`;
    } else {
      for (const key of ["usd", "pln", "btc", "xau"]) {
        setTickerValue(key, unavailable(), null);
        tickerSetText("source", key, "");
      }
      if (note) note.textContent = lang === "pl"
        ? "Brak zapisanych kursów"
        : lang === "en"
          ? "No saved exchange rates available"
          : lang === "ru"
            ? "Нет сохранённых курсов валют"
            : "Немає збережених курсів валют";
    }
  } finally {
    // Перерисовываем цены объявлений при смене курсов/языка.
    if (Array.isArray(visibleListings) && visibleListings.length) renderListings(visibleListings);
  }
}

// === ЧАСТЬ 8 END ===
// === ЧАСТЬ 9a: ГОРОДА ===

function cityTranslation(key) { return translations[key]?.[lang] || translations[key]?.ru || key; }
function cityName(city) {
  return String(city[`name_${lang}`] || city.name_ru || city.name_uk || city.name_en || city.name_pl || "").trim();
}
function normalizeCitySearch(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}
const UK_LAYOUT_MAP = { "q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ","p":"з","[":"х","]":"ї","a":"ф","s":"і","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж","'":"є","z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",",":"б",".":"ю","/":"." };
const EN_LAYOUT_MAP = Object.fromEntries(Object.entries(UK_LAYOUT_MAP).map(([en, uk]) => [uk, en]));
function swapLayout(str, map) { let out = ""; for (const ch of String(str || "")) out += map[ch] ?? ch; return out; }
function getQueryVariants(text) {
  const base = normalizeCitySearch(text);
  if (!base) return [];
  const variants = new Set([base]);
  variants.add(swapLayout(base, UK_LAYOUT_MAP));
  variants.add(swapLayout(base, EN_LAYOUT_MAP));
  return [...variants].filter(Boolean);
}
function transliterate(name) {
  const map = {"а":"a","б":"b","в":"v","г":"h","ґ":"g","д":"d","е":"e","є":"ye","ж":"zh","з":"z","и":"y","і":"i","ї":"yi","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"kh","ц":"ts","ч":"ch","ш":"sh","щ":"shch","ь":"","ю":"yu","я":"ya","ы":"y","э":"e","ё":"yo","ъ":""};
  return String(name || "").split("").map(char => map[char] || char).join("");
}
function buildCityEntry(city) {
  const rawNames = ["name_ru", "name_uk", "name_en", "name_pl"]
    .map(key => normalizeCitySearch(city[key]))
    .filter(Boolean);
  const nameTokens = new Set(rawNames);
  rawNames.forEach(name => {
    if (/[а-яёїєґ]/i.test(name)) {
      const translit = transliterate(name);
      if (translit) nameTokens.add(translit);
    }
  });
  const isCapital = String(city.official_code || "") === "UA80000000000093317" || Number(city.id) === 29707;
  const regionNameUk = isCapital ? cityTranslation("Столица Украины") : (regionNames[String(city.region_katottg_code)] || "");
  const regionToken = normalizeCitySearch(regionNameUk);
  return { city, nameTokens: [...nameTokens], regionToken, regionNameUk, isCapital };
}
function rankCityEntry(entry, queryVariants) {
  if (!queryVariants.length) return 0;
  const { nameTokens, regionToken } = entry;
  if (queryVariants.some(q => nameTokens.some(n => n === q))) return 0;
  if (queryVariants.some(q => nameTokens.some(n => n.startsWith(q)))) return 1;
  if (queryVariants.some(q => nameTokens.some(n => n.includes(q)))) return 2;
  if (regionToken && queryVariants.some(q => regionToken.includes(q))) return 3;
  return -1;
}
function renderCitySuggestionButton(entry, className) {
  const regionLine = entry.regionNameUk ? `<span class="city-suggestion-region">${escapeHtml(entry.regionNameUk)}</span>` : "";
  return `<button type="button" class="${className}" role="option" data-city-id="${escapeHtml(entry.city.id)}">
    <span class="city-suggestion-name">${escapeHtml(cityName(entry.city))}</span>
    ${regionLine}
  </button>`;
}
function closeCatalogCitySuggestions() {
  if (!catalogCitySuggestions) return;
  catalogCitySuggestions.hidden = true;
  catalogCitySearchInput?.setAttribute("aria-expanded", "false");
}
function renderCatalogCitySuggestions() {
  if (!catalogCitySuggestions || !catalogCitySearchInput) return;
  const term = catalogCitySearchInput.value;
  const queryVariants = getQueryVariants(term);
  const base = activeRegionCode ? citySearchIndex.filter(e => String(e.city.region_katottg_code) === activeRegionCode) : citySearchIndex;
  const ranked = term ? base.map(entry => ({ entry, rank: rankCityEntry(entry, queryVariants) }))
    .filter(item => item.rank >= 0)
    .sort((a, b) => a.rank - b.rank || cityName(a.entry.city).localeCompare(cityName(b.entry.city)))
    .slice(0, 12).map(item => item.entry) : [];
  catalogCitySuggestions.innerHTML = ranked.length
    ? ranked.map(entry => renderCitySuggestionButton(entry, "catalog-city-suggestion")).join("")
    : `<div class="city-suggestion-empty" role="status">${escapeHtml(term ? cityTranslation("Город не найден") : cityTranslation("Введите название города"))}</div>`;
  catalogCitySuggestions.hidden = false;
  catalogCitySearchInput.setAttribute("aria-expanded", "true");
}
function selectCatalogCity(city) {
  selectedCatalogCityId = String(city.id);
  catalogCitySearchInput.value = cityName(city);
  const isCapital = String(city.official_code || "") === "UA80000000000093317" || Number(city.id) === 29707;
  activeRegionCode = isCapital ? "" : String(city.region_katottg_code || "");
  if (catalogRegionSelect) catalogRegionSelect.value = activeRegionCode;
  closeCatalogCitySuggestions();
  loadListings();
}
function updateCatalogCitySearchLanguage() {
  if (!catalogCitySearchInput) return;
  catalogCitySearchInput.placeholder = cityTranslation("Введите название города");
  catalogCitySearchInput.setAttribute("aria-label", cityTranslation("Город"));
  const selectedCity = availableCities.find(city => String(city.id) === selectedCatalogCityId);
  if (selectedCity) catalogCitySearchInput.value = cityName(selectedCity);
  if (document.activeElement === catalogCitySearchInput && !catalogCitySuggestions.hidden) renderCatalogCitySuggestions();
}
function closeCitySuggestions() {
  if (!citySuggestions) return;
  citySuggestions.hidden = true;
  citySearchInput?.setAttribute("aria-expanded", "false");
}
function renderCitySuggestions() {
  if (!citySuggestions || !citySearchInput) return;
  const term = citySearchInput.value;
  const queryVariants = getQueryVariants(term);
  const base = citySearchIndex.filter(entry => !formRegionCode || String(entry.city.region_katottg_code) === formRegionCode);
  const ranked = base.map(entry => ({ entry, rank: rankCityEntry(entry, queryVariants) }))
    .filter(item => item.rank >= 0)
    .sort((a, b) => a.rank - b.rank || cityName(a.entry.city).localeCompare(cityName(b.entry.city)))
    .slice(0, 12).map(item => item.entry);
  citySuggestions.innerHTML = ranked.length
    ? ranked.map(entry => renderCitySuggestionButton(entry, "city-suggestion")).join("")
    : `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Город не найден"))}</div>`;
  citySuggestions.hidden = false;
  citySearchInput.setAttribute("aria-expanded", "true");
}
function selectCity(city) {
  citySelect.value = String(city.id);
  citySearchInput.value = cityName(city);
  const isCapital = String(city.official_code || "") === "UA80000000000093317" || Number(city.id) === 29707;
  formRegionCode = isCapital ? "" : String(city.region_katottg_code || "");
  if (cityRegionSelect) cityRegionSelect.value = isCapital ? "__capital__" : formRegionCode;
  closeCitySuggestions();
  if (formMessage) formMessage.textContent = "";
}
function updateCitySearchLanguage() {
  if (!citySearchInput) return;
  citySearchInput.placeholder = cityTranslation("Введите название города");
  const selectedCity = availableCities.find(city => String(city.id) === citySelect.value);
  if (selectedCity) citySearchInput.value = cityName(selectedCity);
  if (document.activeElement === citySearchInput && !citySuggestions.hidden) renderCitySuggestions();
}
function updateCities(items, names = {}) {
  availableCities = items || [];
  regionNames = names || {};
  citySearchIndex = availableCities.map(buildCityEntry);
  const regionCodes = [...new Set(availableCities.map(city => city.region_katottg_code).filter(code => code !== null && code !== undefined && code !== ""))].map(String).sort();
  const allRegionsLabel = cityTranslation("Все области");
  [[catalogRegionSelect, activeRegionCode], [cityRegionSelect, formRegionCode]].forEach(([select, current]) => {
    if (!select) return;
    const capitalOption = select === cityRegionSelect ? `<option value="__capital__">${escapeHtml(cityTranslation("Столица Украины"))}</option>` : "";
    select.innerHTML = `<option value="">${escapeHtml(allRegionsLabel)}</option>` + capitalOption +
      regionCodes.map(code => `<option value="${escapeHtml(code)}">${escapeHtml(regionNames[code] || "")}</option>`).join("");
    const selectedFormCity = select === cityRegionSelect ? availableCities.find(city => String(city.id) === String(citySelect?.value || "")) : null;
    const isCapital = selectedFormCity && (String(selectedFormCity.official_code || "") === "UA80000000000093317" || Number(selectedFormCity.id) === 29707);
    select.value = isCapital ? "__capital__" : (regionCodes.includes(current) ? current : "");
  });
  updateCitySearchLanguage();
  updateCatalogCitySearchLanguage();
}
async function loadCities() {
  if (!db) return;
  if (window.hryvniaCitiesLoaded) return;
  const allCities = [];
  const pageSize = 1000;
  let from = 0;
  let cityError = null;
  while (true) {
    const { data, error } = await db.from("cities").select("id, name_ru, name_uk, name_en, name_pl, region_katottg_code").order("id").range(from, from + pageSize - 1);
    if (error) { cityError = error; break; }
    allCities.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  if (cityError) { console.error("Не удалось загрузить города:", cityError); return; }
  regionNames = {};
  let regionsLoaded = false;
  try {
    const { data: regionsData, error: regionsError } = await db.from("regions").select("katottg_code, name_uk");
    if (regionsError) { console.error("Не удалось загрузить регионы:", regionsError); }
    else if (regionsData) {
      regionsData.forEach(region => {
        if (region && region.katottg_code != null) {
          const name = String(region.name_uk || "").trim();
          if (name) regionNames[String(region.katottg_code)] = name;
        }
      });
      regionsLoaded = Object.keys(regionNames).length > 0;
    }
  } catch (err) { console.error("Не удалось загрузить регионы:", err); }
  updateCities(allCities, regionNames);
  window.hryvniaCitiesLoaded = regionsLoaded;
}
if (catalogRegionSelect) {
  catalogRegionSelect.addEventListener("change", () => {
    activeRegionCode = catalogRegionSelect.value;
    selectedCatalogCityId = "";
    if (catalogCitySearchInput) catalogCitySearchInput.value = "";
    loadListings();
  });
}
if (cityRegionSelect) {
  cityRegionSelect.addEventListener("change", () => {
    formRegionCode = cityRegionSelect.value === "__capital__" ? "" : cityRegionSelect.value;
    if (citySelect) citySelect.value = "";
    if (citySearchInput) citySearchInput.value = "";
    renderCitySuggestions();
  });
}
if (catalogCitySearchInput) {
  catalogCitySearchInput.addEventListener("input", () => { selectedCatalogCityId = ""; renderCatalogCitySuggestions(); });
  catalogCitySearchInput.addEventListener("focus", renderCatalogCitySuggestions);
  catalogCitySearchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCatalogCitySuggestions();
    if (event.key === "ArrowDown" && !catalogCitySuggestions.hidden) {
      const firstOption = catalogCitySuggestions.querySelector("[data-city-id]");
      if (firstOption) { event.preventDefault(); firstOption.focus(); }
    }
    if (event.key === "Enter" && !catalogCitySuggestions.hidden) {
      const firstOption = catalogCitySuggestions.querySelector("[data-city-id]");
      const city = availableCities.find(item => String(item.id) === firstOption?.dataset.cityId);
      if (city) { event.preventDefault(); selectCatalogCity(city); }
    }
  });
}
if (catalogCitySuggestions) {
  catalogCitySuggestions.addEventListener("mousedown", event => { if (event.target.closest("[data-city-id]")) event.preventDefault(); });
  catalogCitySuggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-city-id]");
    if (!option) return;
    const city = availableCities.find(item => String(item.id) === option.dataset.cityId);
    if (city) selectCatalogCity(city);
  });
}
if (citySearchInput) {
  citySearchInput.addEventListener("input", () => { if (citySelect) citySelect.value = ""; renderCitySuggestions(); });
  citySearchInput.addEventListener("focus", renderCitySuggestions);
  citySearchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCitySuggestions();
    if (event.key === "ArrowDown" && !citySuggestions.hidden) {
      const firstOption = citySuggestions.querySelector("[data-city-id]");
      if (firstOption) { event.preventDefault(); firstOption.focus(); }
    }
  });
}
if (citySuggestions) {
  citySuggestions.addEventListener("mousedown", event => { if (event.target.closest("[data-city-id]")) event.preventDefault(); });
  citySuggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-city-id]");
    if (!option) return;
    const city = availableCities.find(item => String(item.id) === option.dataset.cityId);
    if (city) selectCity(city);
  });
}
document.addEventListener("click", event => {
  if (citySearchInput && !citySearchInput.parentElement.contains(event.target)) closeCitySuggestions();
  if (catalogCitySearchInput && !catalogCitySearchInput.parentElement.contains(event.target)) closeCatalogCitySuggestions();
});

// === ЧАСТЬ 9a END ===
// === ЧАСТЬ 9b: ЛИСТИНГИ + ФОРМА + ПЕРЕВОД + INIT ===

let currentCategory = "";
let visibleListings = [];
let isSearching = false;
// Used by loadListings() before the vehicle-search UI helpers are declared.
let vehicleClientFilters = null;

function categoryLabel(item) { return escapeHtml(translations[item.category]?.[lang] || item.category); }

function openListing(item, galleryOnly = false) {
  if (!item || document.getElementById("listingDialog")) return;
  const labels = {
    ru: ["Закрыть", "Предыдущее фото", "Следующее фото", "Фотографии"],
    uk: ["Закрити", "Попереднє фото", "Наступне фото", "Фотографії"],
    en: ["Close", "Previous photo", "Next photo", "Photos"],
    pl: ["Zamknij", "Poprzednie zdjęcie", "Następne zdjęcie", "Zdjęcia"]
  }[lang] || ["Close", "Previous photo", "Next photo", "Photos"];
  const photos = listingPhotos(item);
  const previousFocus = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.id = "listingDialog";
  dialog.className = "modal-card";
  dialog.setAttribute("aria-labelledby", "listingDialogTitle");
  dialog.style.cssText = "border:0;color:var(--text);max-width:calc(100% - 24px);max-height:90dvh;overflow-wrap:anywhere;";
  const showContact = !galleryOnly && item.user_id;
  const isOwner = !galleryOnly && currentUser && item.user_id && String(currentUser.id) === String(item.user_id);
  const ownerLabels = {
    ru: { edit: "Редактировать", del: "Удалить", confirm: "Удалить объявление? Это действие необратимо.", failed: "Не удалось выполнить действие. Проверьте права доступа.", denied: "Это не ваше объявление." },
    uk: { edit: "Редагувати", del: "Видалити", confirm: "Видалити оголошення? Цю дію не можна скасувати.", failed: "Не вдалося виконати дію. Перевірте права доступу.", denied: "Це не ваше оголошення." },
    en: { edit: "Edit", del: "Delete", confirm: "Delete this listing? This cannot be undone.", failed: "Could not complete the action. Check your permissions.", denied: "This is not your listing." },
    pl: { edit: "Edytuj", del: "Usuń", confirm: "Usunąć ogłoszenie? Tej czynności nie można cofnąć.", failed: "Nie udało się wykonać akcji. Sprawdź uprawnienia.", denied: "To nie jest Twoje ogłoszenie." }
  }[lang] || { edit: "Edit", del: "Delete", confirm: "Delete this listing?", failed: "Failed.", denied: "Not your listing." };
  dialog.innerHTML = `
    <button type="button" class="modal-close" aria-label="${labels[0]}" data-close>×</button>
    <h2 id="listingDialogTitle" style="padding-right:24px">${escapeHtml(item.title)}</h2>
    ${photos.length ? `<section aria-label="${labels[3]}">
      <img data-gallery-image alt="${escapeHtml(item.title)}" style="display:block;width:100%;height:auto;max-height:55dvh;object-fit:contain;border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0">
        <button type="button" class="btn" data-previous aria-label="${labels[1]}" ${photos.length < 2 ? "disabled" : ""}>←</button>
        <span data-counter role="status" aria-live="polite"></span>
        <button type="button" class="btn" data-next aria-label="${labels[2]}" ${photos.length < 2 ? "disabled" : ""}>→</button>
      </div>
    </section>` : ""}
    ${galleryOnly ? "" : `<span class="badge">${categoryLabel(item)}</span>
      <p class="city">${escapeHtml(item.cities?.[`name_${lang}`] || item.cities?.name_ru || item.city || "")}</p>
      ${item.created_at ? `<p class="listing-published-date">${escapeHtml(({ru:"Опубликовано",uk:"Опубліковано",en:"Published",pl:"Opublikowano"})[lang] || "Published")}: ${escapeHtml(new Date(item.created_at).toLocaleDateString(({ru:"ru-RU",uk:"uk-UA",en:"en-GB",pl:"pl-PL"})[lang] || "uk-UA"))}</p>` : ""}
      <p class="price">${item.previous_price != null && Number(item.previous_price) !== Number(item.price) ? `<span class="old-price">${money(item.previous_price, item.currency || "UAH")}</span> ` : ""}${money(item.price, item.currency || "UAH")}</p>
      ${item.previous_price != null && Number(item.previous_price) !== Number(item.price) ? `<p class="price-change-note">${escapeHtml(({ru:"Цена изменена",uk:"Ціну змінено",en:"Price changed",pl:"Zmieniono cenę"})[lang] || "Price changed")}: ${money(Math.abs(Number(item.previous_price)-Number(item.price)), item.currency || "UAH")} (${Number(item.price)<Number(item.previous_price)?"−":"+"}${(Math.abs(Number(item.previous_price)-Number(item.price))/Math.max(1,Number(item.previous_price))*100).toFixed(1)}%)</p>` : ""}
      <p class="desc" style="white-space:pre-wrap">${escapeHtml(item.description || "")}</p>
      ${isOwner ? `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-owner-edit="${escapeHtml(String(item.id))}">${escapeHtml(ownerLabels.edit)}</button>
        <button type="button" class="btn" data-owner-delete="${escapeHtml(String(item.id))}" style="background:#ffe5e5;color:#8a1a1a;border:1px solid #e6a8a8">${escapeHtml(ownerLabels.del)}</button>
      </div>` : ""}
      ${showContact && currentUser && currentUser.id !== item.user_id
        ? `<button type="button" class="btn btn-primary full btn-contact" data-contact="${escapeHtml(String(item.id))}">${escapeHtml(t("Написать продавцу"))}</button>`
        : ""}
      ${showContact && !currentUser
        ? `<p class="muted" style="margin-top:12px">${escapeHtml(t("Войдите, чтобы написать продавцу."))}</p>`
        : ""}
    `}`;
  let photoIndex = 0;
  const showPhoto = delta => {
    if (!photos.length) return;
    photoIndex = (photoIndex + delta + photos.length) % photos.length;
    dialog.querySelector("[data-gallery-image]").src = photos[photoIndex];
    dialog.querySelector("[data-counter]").textContent = `${photoIndex + 1} / ${photos.length}`;
  };
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-previous]")?.addEventListener("click", () => showPhoto(-1));
  dialog.querySelector("[data-next]")?.addEventListener("click", () => showPhoto(1));
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); showPhoto(event.key === "ArrowLeft" ? -1 : 1); }
  });
  dialog.querySelector("[data-contact]")?.addEventListener("click", async (evt) => {
    const id = evt.currentTarget.dataset.contact;
    const target = visibleListings.find(l => String(l.id) === id);
    if (!target) return;
    dialog.close();
    await startConversation(target);
  });
  dialog.querySelector("[data-owner-edit]")?.addEventListener("click", async (evt) => {
    const id = evt.currentTarget.dataset.ownerEdit;
    const target = visibleListings.find(l => String(l.id) === id);
    if (!target) return;
    dialog.close();
    await editListing(target, ownerLabels);
  });
  dialog.querySelector("[data-owner-delete]")?.addEventListener("click", async (evt) => {
    const id = evt.currentTarget.dataset.ownerDelete;
    const target = visibleListings.find(l => String(l.id) === id);
    if (!target) return;
    if (!confirm(ownerLabels.confirm)) return;
    dialog.close();
    await deleteListing(target, ownerLabels);
  });
  const oldOverflow = document.body.style.overflow;
  dialog.addEventListener("close", () => {
    document.body.style.overflow = oldOverflow;
    dialog.remove();
    if (previousFocus?.isConnected) previousFocus.focus();
  }, { once: true });
  document.body.append(dialog);
  showPhoto(0);
  dialog.showModal();
  document.body.style.overflow = "hidden";
}

// ==== БЕЗОПАСНОЕ РЕДАКТИРОВАНИЕ/УДАЛЕНИЕ: только владелец; финальная проверка — на RLS ====
async function editListing(item, labels) {
  if (!db || !currentUser) { alert(labels.denied); return; }
  if (String(currentUser.id) !== String(item.user_id || "")) { alert(labels.denied); return; }
  const cityOptions = availableCities.map(city => `<option value="${escapeHtml(String(city.id))}" ${String(city.id) === String(item.city_id || item.cities?.id || "") ? "selected" : ""}>${escapeHtml(city[`name_${lang}`] || city.name_uk || city.name_ru || city.name || "")}</option>`).join("");
  const categoryOptions = ["Автомобили", "Недвижимость", "Готовый бизнес", "Инвестиции"].map(cat => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${escapeHtml(translations[cat]?.[lang] || cat)}</option>`).join("");
  const photos = listingPhotos(item);
  const dialog = document.createElement("dialog");
  dialog.className = "modal-card listing-edit-dialog";
  dialog.style.cssText = "width:min(680px,calc(100% - 24px));max-height:90dvh;overflow:auto;border:1px solid var(--border,#d9e0d9);border-radius:16px;color:var(--text,#1b2b20);";
  const labelsByLang = {
    ru: {title:"Название",category:"Категория",city:"Город",price:"Цена (грн)",description:"Описание",photos:"Фотографии (URL через новую строку)",hot:"Горячее объявление",urgent:"Срочная продажа",save:"Сохранить изменения",cancel:"Отмена",published:"Опубликовано",priceDown:"Цена изменена"},
    uk: {title:"Назва",category:"Категорія",city:"Місто",price:"Ціна (грн)",description:"Опис",photos:"Фотографії (URL з нового рядка)",hot:"Гаряче оголошення",urgent:"Терміновий продаж",save:"Зберегти зміни",cancel:"Скасувати",published:"Опубліковано",priceDown:"Ціну змінено"},
    en: {title:"Title",category:"Category",city:"City",price:"Price (UAH)",description:"Description",photos:"Photos (one URL per line)",hot:"Hot listing",urgent:"Urgent sale",save:"Save changes",cancel:"Cancel",published:"Published",priceDown:"Price changed"},
    pl: {title:"Tytuł",category:"Kategoria",city:"Miasto",price:"Cena (UAH)",description:"Opis",photos:"Zdjęcia (jeden URL w wierszu)",hot:"Gorące ogłoszenie",urgent:"Pilna sprzedaż",save:"Zapisz zmiany",cancel:"Anuluj",published:"Opublikowano",priceDown:"Zmieniono cenę"}
  };
  const L = labelsByLang[lang] || labelsByLang.uk;
  dialog.innerHTML = `<form class="listing-edit-form"><h2>${escapeHtml(labels.edit)}</h2>
    <label>${escapeHtml(L.title)}<input name="title" required maxlength="180" value="${escapeHtml(item.title || "")}"></label>
    <label>${escapeHtml(L.category)}<select name="category" required>${categoryOptions}</select></label>
    <label>${escapeHtml(L.city)}<select name="city_id" required>${cityOptions}</select></label>
    <label>${escapeHtml(L.price)}<input name="price" type="number" min="0" step="0.01" required value="${escapeHtml(String(item.price ?? ""))}"></label>
    <label>${escapeHtml(L.description)}<textarea name="description" rows="5" maxlength="10000">${escapeHtml(item.description || "")}</textarea></label>
    <label>${escapeHtml(L.photos)}<textarea name="photo_urls" rows="3">${escapeHtml(photos.join("\n"))}</textarea></label>
    <label class="hot-toggle"><input type="checkbox" name="is_hot" ${item.is_hot ? "checked" : ""}> ${escapeHtml(L.hot)}</label>
    <label class="hot-toggle"><input type="checkbox" name="is_urgent" ${item.is_urgent ? "checked" : ""}> ${escapeHtml(L.urgent)}</label>
    <p class="muted">${escapeHtml(L.published)}: ${item.created_at ? escapeHtml(new Date(item.created_at).toLocaleDateString()) : "—"}</p>
    <div class="edit-actions"><button class="btn btn-primary" type="submit">${escapeHtml(L.save)}</button><button class="btn" type="button" data-edit-cancel>${escapeHtml(L.cancel)}</button></div><p class="form-message" role="status"></p></form>`;
  document.body.append(dialog); dialog.showModal();
  dialog.querySelector("[data-edit-cancel]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove(), { once:true });
  dialog.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget; const button = form.querySelector('button[type="submit"]'); const message = form.querySelector(".form-message");
    const price = Number(form.elements.price.value);
    if (!Number.isFinite(price) || price < 0) { message.textContent = labels.failed; return; }
    const urls = [...new Set(form.elements.photo_urls.value.split(/\r?\n/).map(x=>x.trim()).filter(x=>/^https?:\/\//i.test(x)))].slice(0,10);
    const payload = { title: form.elements.title.value.trim(), category: form.elements.category.value, city_id: Number(form.elements.city_id.value), price, previous_price: Number(item.price) !== price ? Number(item.price) : (item.previous_price ?? null), description: form.elements.description.value.trim(), image_urls: urls, image_url: urls[0] || null, is_hot: form.elements.is_hot.checked, is_urgent: Boolean(form.elements.is_urgent?.checked) };
    if (!payload.title) { message.textContent = labels.failed; return; }
    button.disabled = true; message.textContent = "…";
    try {
      const { data, error } = await db.from("listings").update(payload).eq("id", item.id).eq("user_id", currentUser.id).select("id,title,price,user_id,created_at").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(labels.denied);
      if (Number(item.price) !== price) {
        const { error: historyError } = await db.from("listing_price_history").insert({ listing_id:item.id, user_id:currentUser.id, old_price:Number(item.price), new_price:price, changed_at:new Date().toISOString() });
        if (historyError) console.warn("Price history was not saved; apply the Hryvnia Hub SQL migration.", historyError.message);
      }
      dialog.close(); await loadListings();
    } catch (error) { message.textContent = error?.message || labels.failed; button.disabled = false; }
  });
}
async function deleteListing(item, labels) {
  if (!db || !currentUser) { alert(labels.denied); return; }
  if (String(currentUser.id) !== String(item.user_id || "")) { alert(labels.denied); return; }
  const { data, error } = await db
    .from("listings")
    .delete()
    .eq("id", item.id)
    .eq("user_id", currentUser.id)
    .select("id")
    .maybeSingle();
  if (error || !data) { alert(error?.message ? error.message : labels.failed); return; }
  await loadListings();
}

async function renderHotListings(items) {
  const host = document.querySelector(".urgent-deals-grid");
  if (!host) return;
  // Загружаем горячие и срочные объявления независимо от текущих фильтров.
  if (db) {
    const { data, error } = await db.from("listings")
      .select("*, cities!inner(name_ru, name_uk, name_en, name_pl, region_katottg_code)")
      .or("is_hot.eq.true,is_urgent.eq.true")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) items = data || [];
    else console.warn("Hot listings query failed; apply the Hryvnia Hub SQL migration:", error.message);
  }
  items = (items || []).filter(item => item.is_hot || item.is_urgent);
  const langPack = {
    ru: { hot:"⚡ Горячее", urgent:"⏱ Срочно", empty:"Горячих и срочных объявлений пока нет." },
    uk: { hot:"⚡ Гаряче", urgent:"⏱ Терміново", empty:"Гарячих і термінових оголошень поки немає." },
    en: { hot:"⚡ Hot", urgent:"⏱ Urgent", empty:"No hot or urgent listings yet." },
    pl: { hot:"⚡ Gorące", urgent:"⏱ Pilne", empty:"Brak gorących i pilnych ogłoszeń." }
  };
  const L = langPack[lang] || langPack.ru;
  if (!items.length) {
    host.innerHTML = `<div class="empty">${escapeHtml(L.empty)}</div>`;
    return;
  }
  host.innerHTML = `<div class="hot-listings-row">${items.map(item => {
    const badges = [
      item.is_hot ? `<span class="hot-listing-badge">${escapeHtml(L.hot)}</span>` : "",
      item.is_urgent ? `<span class="urgent-listing-badge">${escapeHtml(L.urgent)}</span>` : ""
    ].join("");
    return `<button type="button" class="hot-listing-card" data-hot-id="${escapeHtml(String(item.id))}">
      ${listingCover(item)}
      <span class="hot-card-badges">${badges}</span>
      <span class="hot-card-title">${escapeHtml(item.title || "")}</span>
      <strong>${money(item.price, item.currency || "UAH")}</strong>
      <small>${escapeHtml(item.cities?.[`name_${lang}`] || item.cities?.name_ru || "")}</small>
    </button>`;
  }).join("")}</div>`;
  host.querySelectorAll("[data-hot-id]").forEach(btn => btn.addEventListener("click", () => {
    const item = items.find(x => String(x.id) === btn.dataset.hotId);
    if (item) openListing(item);
  }));
}

function renderListings(items) {
  visibleListings = items;
  renderHotListings(items.filter(item => item.is_hot));
  if (resultCount) {
    const wordMap = { uk: ["оголошення", "оголошень", "оголошення"], ru: ["объявление", "объявлений", "объявления"], en: ["listing", "listings", "listings"], pl: ["ogłoszenie", "ogłoszeń", "ogłoszenia"] };
    const [one, many, few] = wordMap[lang] || wordMap.ru;
    const n = items.length; const mod10 = n % 10; const mod100 = n % 100;
    let word = many;
    if (lang === "ru" || lang === "uk") {
      if (mod10 === 1 && mod100 !== 11) word = one;
      else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = few;
    } else { word = n === 1 ? one : many; }
    resultCount.textContent = `${n} ${word}`;
  }
  if (!listing) return;
  if (!items.length) {
    listing.innerHTML = `<div class="empty">${escapeHtml(translations["Объявлений пока нет. Добавьте первое!"][lang])}</div>`;
    return;
  }
  listing.innerHTML = items.map((item, index) => {
    const fav = isFavorite(item.id);
    const cover = listingCover(item);
    const hasCover = cover !== "";
    const isOwner = Boolean(currentUser?.id && item.user_id && String(currentUser.id) === String(item.user_id));
    const myListingLabel = ({
      uk: "Моє оголошення",
      ru: "Моё объявление",
      en: "My listing",
      pl: "Moje ogłoszenie"
    })[lang] || "My listing";
    return `
    <article class="card${hasCover ? " has-cover" : " no-cover"}" data-listing-index="${index}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}" style="cursor:pointer">
      <button class="fav-btn ${fav ? "active" : ""}" data-fav-id="${escapeHtml(String(item.id))}" type="button" aria-pressed="${fav ? "true" : "false"}" aria-label="${fav ? "Убрать из избранного" : "В избранное"}">
        <span aria-hidden="true">${fav ? "♥" : "♡"}</span>
      </button>
      ${cover}
      <div class="card-top">
        <span class="badge">${categoryLabel(item)}</span>
        ${item.is_hot ? `<span class="hot-listing-badge">⚡ ${escapeHtml(({ru:"Горячее",uk:"Гаряче",en:"Hot",pl:"Gorące"})[lang] || "Hot")}</span>` : ""}
        ${item.is_urgent ? `<span class="urgent-listing-badge">⏱ ${escapeHtml(({ru:"Срочно",uk:"Терміново",en:"Urgent",pl:"Pilne"})[lang] || "Urgent")}</span>` : ""}
        ${isOwner ? `<span class="owner-listing-badge">✓ ${escapeHtml(myListingLabel)}</span>` : ""}
        <span class="city">${escapeHtml(item.cities?.[`name_${lang}`] || item.cities?.name_ru || "")}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="price">${item.previous_price != null && Number(item.previous_price) !== Number(item.price) ? `<span class="old-price">${money(item.previous_price, item.currency || "UAH")}</span> ` : ""}${money(item.price, item.currency || "UAH")}</p>
      ${item.previous_price != null && Number(item.previous_price) !== Number(item.price) ? `<p class="price-change-note">${escapeHtml(({ru:"Цена изменена",uk:"Ціну змінено",en:"Price changed",pl:"Zmieniono cenę"})[lang] || "Price changed")}: ${money(Math.abs(Number(item.previous_price)-Number(item.price)), item.currency || "UAH")} (${Number(item.price)<Number(item.previous_price)?"−":"+"}${(Math.abs(Number(item.previous_price)-Number(item.price))/Math.max(1,Number(item.previous_price))*100).toFixed(1)}%)</p>` : ""}
      <p class="desc">${escapeHtml(item.description || "Описание не указано.")}</p>
    </article>`;
  }).join("");
}

if (listing) {
  listing.addEventListener("click", event => {
    const favBtn = event.target.closest(".fav-btn");
    if (favBtn) { event.stopPropagation(); toggleFavorite(favBtn.dataset.favId); return; }
    const card = event.target.closest("[data-listing-index]");
    if (!card) return;
    openListing(visibleListings[Number(card.dataset.listingIndex)], !!event.target.closest(".listing-photo"));
  });
  listing.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-listing-index]");
    if (!card) return;
    event.preventDefault();
    openListing(visibleListings[Number(card.dataset.listingIndex)], event.target.matches(".listing-photo"));
  });
}

async function loadListings() {
  if (isSearching) return;
  if (!db) {
    renderListings([
      { id: "demo-1", category: "Автомобили", title: "Пример: Skoda Octavia 1.6", city: "Днепр", price: 250000, description: "Демо-карточка." },
      { id: "demo-2", category: "Недвижимость", title: "2-комнатная квартира", city: "Днепр", price: 1000000, description: "Демо-карточка." },
      { id: "demo-3", category: "Готовый бизнес", title: "Готовый бизнес", city: "Сумы", price: 500000, description: "Демо-карточка." },
      { id: "demo-4", category: "Инвестиции", title: "Инвестиционная возможность", city: "Киев", price: 1000000, description: "Демо-карточка." }
    ]);
    return;
  }
  let query = db.from("listings").select("*, cities!inner(name_ru, name_uk, name_en, name_pl, region_katottg_code)").order("created_at", { ascending: false });
  if (currentCategory) query = query.eq("category", currentCategory);
  if (selectedCatalogCityId) query = query.eq("city_id", selectedCatalogCityId);
  else if (activeRegionCode) query = query.eq("cities.region_katottg_code", activeRegionCode);
  const term = searchInput?.value.trim();
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

  vehicleClientFilters = null;
  if (currentCategory === "Автомобили") {
    const value = id => document.getElementById(id)?.value?.trim() ?? "";
    const numberValue = id => value(id) === "" ? null : Number(value(id));
    const make = value("vehicleSearchMake");
    const model = value("vehicleSearchModel");
    const yearFrom = numberValue("vehicleYearFrom");
    const yearTo = numberValue("vehicleYearTo");
    const priceFrom = numberValue("vehiclePriceFrom");
    const priceTo = numberValue("vehiclePriceTo");
    const currency = value("vehiclePriceCurrency") || "UAH";
    const mileageFrom = numberValue("vehicleMileageFrom");
    const mileageTo = numberValue("vehicleMileageTo");
    const engineFrom = numberValue("vehicleEngineFrom");
    const engineTo = numberValue("vehicleEngineTo");
    const body = value("vehicleBodyType");
    const fuel = value("vehicleFuel");
    const transmission = value("vehicleTransmission");
    const status = value("vehicleSearchStatus");
    const powerFrom = numberValue("vehiclePowerFrom");
    const powerTo = numberValue("vehiclePowerTo");
    const doors = value("vehicleDoors");
    const drive = value("vehicleDrive");
    const conditionIds = getSelectedConditionIds("vehicleSearchConditions");
    const color = value("vehicleColor");
    const sellerType = value("vehicleSellerType");
    const message = document.getElementById("vehicleSearchMessage");
    if (message) { message.textContent = ""; message.classList.remove("error"); }
    const ranges = [
      [yearFrom, yearTo, "Рік «від» не може бути більшим за рік «до»."],
      [priceFrom, priceTo, "Ціна «від» не може бути більшою за ціну «до»."],
      [mileageFrom, mileageTo, "Пробіг «від» не може бути більшим за пробіг «до»."],
      [engineFrom, engineTo, "Об’єм двигуна «від» не може бути більшим за «до»."],
      [powerFrom, powerTo, "Потужність «від» не може бути більшою за «до». "]
    ];
    const numbers = [yearFrom, yearTo, priceFrom, priceTo, mileageFrom, mileageTo, engineFrom, engineTo, powerFrom, powerTo];
    const invalidNumber = numbers.some(n => n !== null && (!Number.isFinite(n) || n < 0));
    const invalidRange = ranges.some(([from, to]) => from !== null && to !== null && from > to);
    if (invalidNumber || invalidRange) {
      if (message) {
        const rangeError = ranges.find(([from, to]) => from !== null && to !== null && from > to)?.[2];
        message.textContent = t(invalidNumber ? "Перевірте числові значення фільтрів." : (rangeError || "Перевірте діапазони фільтрів."));
        message.classList.add("error");
      }
      return;
    }
    vehicleClientFilters = { make, model, yearFrom, yearTo, priceFrom, priceTo, currency, mileageFrom, mileageTo, engineFrom, engineTo, body, fuel, transmission, status, powerFrom, powerTo, doors, drive, conditionIds, color, sellerType };
    if (make) query = query.eq("vehicle_make_slug", make);
    if (model) query = query.eq("vehicle_model_slug", model);
    if (yearFrom !== null) query = query.gte("vehicle_year", yearFrom);
    if (yearTo !== null) query = query.lte("vehicle_year", yearTo);
    query = query.eq("currency", currency);
    if (priceFrom !== null) query = query.gte("price", priceFrom);
    if (priceTo !== null) query = query.lte("price", priceTo);
    if (mileageFrom !== null) query = query.gte("vehicle_mileage_km", mileageFrom);
    if (mileageTo !== null) query = query.lte("vehicle_mileage_km", mileageTo);
    if (engineFrom !== null) query = query.gte("vehicle_engine_liters", engineFrom);
    if (engineTo !== null) query = query.lte("vehicle_engine_liters", engineTo);
    if (body) query = query.eq("vehicle_body_type", body);
    if (fuel) query = query.eq("vehicle_fuel_type", fuel);
    if (transmission) query = query.eq("vehicle_transmission", transmission);
    if (status) query = query.eq("vehicle_condition", status);
  }
  isSearching = true;
  setButtonLoading(searchBtn, true, "");
  try {
    const { data, error } = await query;
    if (error) { if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + error.message)}</div>`; return; }
    let rows = (data || []).slice();
    if (currentCategory === "Автомобили" && vehicleClientFilters?.conditionIds?.length) {
      const wanted = vehicleClientFilters.conditionIds;
      // Проверяем только связи для объявлений, уже прошедших основные фильтры.
      // Это не загружает из Supabase связи всех объявлений по выбранным состояниям.
      const candidateIds = rows.map(item => item.id).filter(id => id !== null && id !== undefined);
      if (!candidateIds.length) {
        renderListings([]);
        return;
      }
      const matches = new Map();
      // Ограничиваем размер .in(), чтобы не создавать чрезмерно длинный запрос.
      for (let start = 0; start < candidateIds.length; start += 500) {
        const idChunk = candidateIds.slice(start, start + 500);
        const { data: links, error: linksError } = await db.from("listing_vehicle_conditions")
          .select("listing_id, condition_id")
          .in("listing_id", idChunk)
          .in("condition_id", wanted);
        if (linksError) throw linksError;
        (links || []).forEach(link => {
          const id = String(link.listing_id);
          if (!matches.has(id)) matches.set(id, new Set());
          matches.get(id).add(Number(link.condition_id));
        });
      }
      const matchingListingIds = new Set([...matches.entries()]
        .filter(([, ids]) => wanted.every(id => ids.has(Number(id))))
        .map(([id]) => id));
      if (!matchingListingIds.size) {
        renderListings([]);
        return;
      }
      rows = rows.filter(item => matchingListingIds.has(String(item.id)));
    }
    if (currentCategory === "Автомобили" && vehicleClientFilters) {
      const f = vehicleClientFilters;
      const within = (value, min, max) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return min === null && max === null;
        return (min === null || n >= min) && (max === null || n <= max);
      };
      rows = rows.filter(item =>
        (!f.make || item.vehicle_make_slug === f.make) &&
        (!f.model || item.vehicle_model_slug === f.model) &&
        within(item.vehicle_year, f.yearFrom, f.yearTo) &&
        within(item.price, f.priceFrom, f.priceTo) &&
        within(item.vehicle_mileage_km, f.mileageFrom, f.mileageTo) &&
        within(item.vehicle_engine_liters, f.engineFrom, f.engineTo) &&
        (!f.body || item.vehicle_body_type === f.body) &&
        (!f.fuel || item.vehicle_fuel_type === f.fuel) &&
        (!f.transmission || item.vehicle_transmission === f.transmission) &&
        (!f.status || item.vehicle_condition === f.status) &&
        within(item.vehicle_power_hp, f.powerFrom, f.powerTo) &&
        (!f.doors || String(item.vehicle_doors ?? "") === f.doors) &&
        (!f.drive || item.vehicle_drive === f.drive) &&
        (!f.color || String(item.vehicle_color || "").toLowerCase() === f.color) &&
        (!f.sellerType || item.seller_type === f.sellerType) &&
        (String(item.currency || "UAH").toUpperCase() === f.currency)
      );
    }
    rows.sort((a, b) =>
      Number(Boolean(b.is_urgent || b.is_hot)) - Number(Boolean(a.is_urgent || a.is_hot))
    );
    renderListings(rows);
  } catch (error) {
    if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + (error.message || String(error)))}</div>`;
  } finally {
    isSearching = false;
    setButtonLoading(searchBtn, false);
  }
}

// === СПРАВОЧНИК ТЕХНИЧЕСКИХ СОСТОЯНИЙ АВТО ===
let operationalConditions = [];
let operationalConditionsPromise = null;

async function loadOperationalConditions() {
  if (!db) return [];
  if (operationalConditions.length) return operationalConditions;
  if (operationalConditionsPromise) return operationalConditionsPromise;
  operationalConditionsPromise = (async () => {
    const { data, error } = await db.from("vehicle_operational_conditions")
      .select("id, name_uk, name_ru, name_en, name_pl").order("id");
    if (error) throw error;
    operationalConditions = data || [];
    return operationalConditions;
  })();
  try { return await operationalConditionsPromise; }
  catch (error) { operationalConditionsPromise = null; console.error("Не удалось загрузить технические состояния автомобилей", error); throw error; }
}
function conditionDisplayName(condition) {
  return condition?.[`name_${lang}`] || condition?.name_uk || condition?.name_ru || "";
}
function getSelectedConditionIds(container) {
  if (typeof container === "string") container = document.getElementById(container);
  return container ? [...container.querySelectorAll('input[type="checkbox"][data-condition-id]:checked')]
    .map(input => Number(input.dataset.conditionId)).filter(Number.isFinite) : [];
}
function clearConditionsCheckboxes(container) {
  if (typeof container === "string") container = document.getElementById(container);
  if (container) container.querySelectorAll('input[type="checkbox"][data-condition-id]').forEach(input => { input.checked = false; });
}
function renderConditionsCheckboxes(container, selectedIds = []) {
  if (typeof container === "string") container = document.getElementById(container);
  if (!container) return;
  const selected = new Set((selectedIds || []).map(Number));
  container.innerHTML = operationalConditions.map(condition => `
    <label class="vehicle-condition-option" style="display:flex;align-items:center;gap:8px;margin:5px 0;">
      <input type="checkbox" data-condition-id="${Number(condition.id)}" value="${Number(condition.id)}" ${selected.has(Number(condition.id)) ? "checked" : ""}>
      <span>${escapeHtml(conditionDisplayName(condition))}</span>
    </label>`).join("");
}
async function renderAllConditionGroups() {
  await loadOperationalConditions();
  ["vehicleListingConditions", "vehicleSearchConditions"].forEach(id => {
    const container = document.getElementById(id);
    if (container) renderConditionsCheckboxes(container, getSelectedConditionIds(container));
  });
}
async function rerenderConditionsOnLangChange() {
  if (!operationalConditions.length) return;
  ["vehicleListingConditions", "vehicleSearchConditions"].forEach(id => {
    const container = document.getElementById(id);
    if (container) renderConditionsCheckboxes(container, getSelectedConditionIds(container));
  });
}

const categorySubcategories = {
  "Недвижимость": ["Купівля", "Оренда"],
  "Готовый бизнес": ["Куплю готовый бизнес", "Продам готовый бизнес", "Ищу бизнес-партнёра", "Услуги"],
  "Инвестиции": ["Ищу инвестора", "Стану инвестором", "Стартапы"]
};
const categoryMenu = document.getElementById("categoryMenu");
const categoryMenuBackdrop = document.getElementById("categoryMenuBackdrop");
const categoryMenuTitle = document.getElementById("categoryMenuTitle");
const categoryMenuOptions = document.getElementById("categoryMenuOptions");
const categorySelectTrigger = document.getElementById("categorySelectTrigger");
const categorySelectLabel = document.getElementById("categorySelectLabel");
const vehicleSearchMenu = document.getElementById("vehicleSearchMenu");
const vehicleSearchBackdrop = document.getElementById("vehicleSearchBackdrop");
let selectedSearchCategory = "";
let vehicleModelsCache = [];
let vehicleModelsPromise = null;
function closeCategoryMenu() {
  categoryMenu?.classList.add("hidden"); categoryMenuBackdrop?.classList.add("hidden");
  categorySelectTrigger?.setAttribute("aria-expanded", "false");
}
function closeVehicleSearch() { vehicleSearchMenu?.classList.add("hidden"); vehicleSearchBackdrop?.classList.add("hidden"); }
function openCategoryMenu(parentCategory = "") {
  if (!categoryMenu || !categoryMenuOptions) return;
  const cats = [
    ["", "▦", "Все категории"], ["Автомобили", "🚗"], ["Недвижимость", "⌂"], ["Готовый бизнес", "▣"], ["Инвестиции", "▥"]
  ];
  if (parentCategory) {
    categoryMenuTitle.textContent = t(parentCategory === "Готовый бизнес" ? "Бизнес и предпринимательство" : parentCategory);
    const options = categorySubcategories[parentCategory] || [];
    categoryMenuOptions.innerHTML = options.map(label => `<button type="button" class="category-menu-option" data-search-category="${escapeHtml(parentCategory)}" data-search-subcategory="${escapeHtml(label)}"><span class="category-menu-icon" aria-hidden="true">•</span><span class="category-menu-option-label">${escapeHtml(t(label))}</span><span aria-hidden="true">›</span></button>`).join("");
  } else {
    categoryMenuTitle.textContent = t("Категорії");
    categoryMenuOptions.innerHTML = cats.map(([key, icon, label]) => `<button type="button" class="category-menu-option" data-search-category="${escapeHtml(key)}" ${key ? 'data-open-submenu="1"' : 'data-all-categories="1"'}><span class="category-menu-icon" aria-hidden="true">${icon}</span><span class="category-menu-option-label">${escapeHtml(t(label || (key === "Готовый бизнес" ? "Бизнес и предпринимательство" : key)))}</span><span aria-hidden="true">›</span></button>`).join("");
  }
  categoryMenu.classList.remove("hidden"); categoryMenuBackdrop?.classList.remove("hidden");
  categorySelectTrigger?.setAttribute("aria-expanded", "true");
}
function setVehicleSearchAdvanced(isOpen) {
  const advanced = document.getElementById("vehicleSearchAdvanced");
  const toggle = document.getElementById("vehicleSearchToggleAdvanced");
  if (advanced) advanced.classList.toggle("hidden", !isOpen);
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    toggle.textContent = t(isOpen ? "Згорнути розширений пошук" : "Розширений пошук");
  }
}
function prepareVehicleSearchUI() {
  const menu = document.getElementById("vehicleSearchMenu");
  // The advanced filters already exist in index.html. Select only the primary grid;
  // otherwise querySelector() can accidentally return #vehicleSearchAdvanced itself.
  const grid = menu?.querySelector(".vehicle-search-grid:not(#vehicleSearchAdvanced)");
  if (!menu || !grid || menu.dataset.searchUiPrepared === "1") return;

  // Hide legacy urgent/hot checkboxes: results are prioritized automatically.
  menu.querySelectorAll("#vehicleOnlyUrgent, #vehicleOnlyHot").forEach(input => input.closest("label")?.remove());

  let toggle = document.getElementById("vehicleSearchToggleAdvanced");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "vehicleSearchToggleAdvanced";
    toggle.className = "btn vehicle-search-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "vehicleSearchAdvanced");
    toggle.style.cssText = "width:100%; margin:0 0 12px; padding:10px 14px; border:1px solid var(--accent-border, #d4ff00); border-radius:10px; background:var(--accent-soft, rgba(212,255,0,.08)); color:inherit; font:inherit; font-weight:600; cursor:pointer;";
    grid.insertAdjacentElement("afterend", toggle);
    toggle.addEventListener("click", () => {
      setVehicleSearchAdvanced(document.getElementById("vehicleSearchAdvanced")?.classList.contains("hidden"));
    });
  }

  const advancedIds = ["vehicleMileageFrom", "vehicleMileageTo", "vehicleEngineFrom", "vehicleEngineTo", "vehicleBodyType", "vehicleFuel", "vehicleTransmission", "vehicleSearchStatus", "vehicleDoors", "vehicleDrive", "vehicleColor", "vehicleSellerType"];
  let advanced = document.getElementById("vehicleSearchAdvanced");
  if (!advanced) {
    advanced = document.createElement("div");
    advanced.id = "vehicleSearchAdvanced";
    advanced.className = "vehicle-search-grid vehicle-search-advanced hidden";
    advanced.style.cssText = "grid-column:1 / -1; display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px;";
    grid.insertAdjacentElement("afterend", advanced);
  } else {
    // Keep the existing HTML structure and its labels intact; do not create a duplicate
    // or move controls around on every language switch.
    advancedIds.forEach(id => {
      const input = document.getElementById(id);
      const label = input?.closest("label");
      if (label && !advanced.contains(label)) advanced.appendChild(label);
    });
  }

  menu.dataset.searchUiPrepared = "1";
  setVehicleSearchAdvanced(false);
}
function openVehicleSearch() {
  closeCategoryMenu();
  prepareVehicleSearchUI();
  vehicleSearchMenu?.classList.remove("hidden");
  vehicleSearchBackdrop?.classList.remove("hidden");
  loadVehicleMakes();
}
async function fetchAllVehicleModels() {
  if (!db) return [];
  if (vehicleModelsPromise) return vehicleModelsPromise;
  vehicleModelsPromise = (async () => {
  const all = []; const pageSize = 1000; let from = 0;
  while (true) {
    const {data, error} = await db.from("vehicle_models").select("make_slug,make_name,model_slug,model_name,body_types").order("make_name").order("model_name").range(from, from + pageSize - 1);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return all;
  })();
  try { vehicleModelsCache = await vehicleModelsPromise; return vehicleModelsCache; }
  catch (error) { vehicleModelsPromise = null; throw error; }
}
async function loadVehicleMakes() {
  const makeSelect = document.getElementById("vehicleSearchMake");
  const spinner = document.getElementById("vehicleMakeSpinner");
  const status = document.getElementById("vehicleMakeLoadStatus");
  if (!makeSelect || makeSelect.dataset.loaded === "1" || makeSelect.dataset.loading === "1") return;
  if (!db) {
    if (status) status.textContent = vehicleMakeStatusText("unavailable");
    return;
  }
  makeSelect.dataset.loading = "1";
  makeSelect.disabled = true;
  spinner?.classList.remove("hidden");
  if (status) status.textContent = vehicleMakeStatusText("loading");
  try {
    const data = await fetchAllVehicleModels();
    vehicleModelsCache = data;
    const makes = [...new Map(data.map(x => [x.make_slug, x.make_name])).entries()].sort((a,b) => a[1].localeCompare(b[1]));
    makeSelect.innerHTML = `<option value="">${escapeHtml(t("Усі марки"))}</option>` + makes.map(([slug,name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`).join("");
    makeSelect.dataset.loaded = "1";
    if (status) status.textContent = makes.length ? "" : vehicleMakeStatusText("empty");
  } catch (error) {
    console.error("Не удалось загрузить марки автомобилей", error);
    if (status) {
      status.textContent = vehicleMakeStatusText("error") + " ";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = vehicleMakeStatusText("retry");
      retry.addEventListener("click", () => { if (status) status.textContent = ""; loadVehicleMakes(); });
      status.appendChild(retry);
    }
  } finally {
    delete makeSelect.dataset.loading;
    makeSelect.disabled = makeSelect.dataset.loaded !== "1";
    spinner?.classList.add("hidden");
  }
}
function vehicleMakeStatusText(state) {
  const messages = {
    loading: { ru: "Загружаем марки автомобилей…", uk: "Завантажуємо марки автомобілів…", en: "Loading car makes…", pl: "Ładowanie marek samochodów…" },
    error: { ru: "Не удалось загрузить марки.", uk: "Не вдалося завантажити марки.", en: "Could not load car makes.", pl: "Nie udało się załadować marek." },
    retry: { ru: "Повторить", uk: "Повторити", en: "Retry", pl: "Ponów" },
    empty: { ru: "Список марок пока пуст.", uk: "Список марок поки порожній.", en: "No car makes found yet.", pl: "Nie znaleziono jeszcze marek." },
    unavailable: { ru: "Загрузка марок временно недоступна.", uk: "Завантаження марок тимчасово недоступне.", en: "Car makes are temporarily unavailable.", pl: "Ładowanie marek jest chwilowo niedostępne." }
  };
  return messages[state]?.[lang] || messages[state]?.ru || "";
}
document.getElementById("vehicleSearchMake")?.addEventListener("change", event => {
  const make = event.target.value; const modelSelect = document.getElementById("vehicleSearchModel");
  const models = vehicleModelsCache.filter(x => !make || x.make_slug === make);
  modelSelect.innerHTML = '<option value="">Усі моделі</option>' + [...new Map(models.map(x => [x.model_slug,x.model_name])).entries()].map(([slug,name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`).join("");
  modelSelect.disabled = !make;
});
// Vehicle-specific fields in the existing listing form (other categories remain unchanged).
const vehicleListingFields = document.getElementById("vehicleListingFields");
const listingCategorySelect = addForm?.querySelector('select[name="category"]');
const vehicleListingMake = document.getElementById("vehicleListingMake");
const vehicleListingModel = document.getElementById("vehicleListingModel");
const vehicleListingMakeSpinner = document.getElementById("vehicleListingMakeSpinner");
const vehicleListingMakeStatus = document.getElementById("vehicleListingMakeStatus");
const listingTitleField = document.getElementById("listingTitleField");
function syncVehicleListingFields() {
  const category = listingCategorySelect?.value || "";
  const isVehicle = category === "Автомобили";
  const hidesManualTitle = isVehicle || category === "Недвижимость";
  if (vehicleListingFields) vehicleListingFields.hidden = !isVehicle;
  vehicleListingFields?.querySelectorAll("input,select").forEach(el => { el.disabled = !isVehicle; });
  if (listingTitleField) {
    listingTitleField.hidden = hidesManualTitle;
    const titleInput = listingTitleField.querySelector('input[name="title"]');
    if (titleInput) {
      titleInput.required = !hidesManualTitle;
      titleInput.disabled = hidesManualTitle;
    }
  }
  if (isVehicle) loadVehicleListingMakes();
}
async function loadVehicleListingMakes() {
  if (!vehicleListingMake || !db || vehicleListingMake.dataset.loaded === "1" || vehicleListingMake.dataset.loading === "1") return;
  vehicleListingMake.dataset.loading = "1";
  vehicleListingMake.disabled = true;
  vehicleListingMakeSpinner?.classList.remove("hidden");
  if (vehicleListingMakeStatus) vehicleListingMakeStatus.textContent = "Загрузка марок автомобилей…";
  try {
    const data = await fetchAllVehicleModels();
    vehicleModelsCache = data;
    const makes = [...new Map(data.map(row => [row.make_slug,row.make_name])).entries()].sort((a,b) => a[1].localeCompare(b[1]));
    vehicleListingMake.innerHTML = '<option value="">Выберите марку</option>' + makes.map(([slug,name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`).join("");
    vehicleListingMake.dataset.loaded = "1";
    if (vehicleListingMakeStatus) vehicleListingMakeStatus.textContent = makes.length ? "" : "Марки автомобилей не найдены.";
  } catch (error) {
    console.error("Не удалось загрузить каталог автомобилей", error);
    if (vehicleListingMakeStatus) vehicleListingMakeStatus.textContent = "Не удалось загрузить марки. Закройте и откройте форму повторно.";
  } finally {
    vehicleListingMake.dataset.loading = "0";
    vehicleListingMake.disabled = false;
    vehicleListingMakeSpinner?.classList.add("hidden");
  }
}
vehicleListingMake?.addEventListener("change", () => {
  const make = vehicleListingMake.value;
  const models = vehicleModelsCache.filter(row => row.make_slug === make);
  if (vehicleListingModel) {
    vehicleListingModel.innerHTML = '<option value="">Выберите модель</option>' + [...new Map(models.map(row => [row.model_slug,row.model_name])).entries()].map(([slug,name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`).join("");
    vehicleListingModel.disabled = !make;
  }
});
listingCategorySelect?.addEventListener("change", syncVehicleListingFields);
syncVehicleListingFields();

categorySelectTrigger?.addEventListener("click", () => openCategoryMenu());
categoryMenuOptions?.addEventListener("click", event => {
  const option = event.target.closest("[data-search-category]"); if (!option) return;
  const category = option.dataset.searchCategory || "";
  if (option.hasAttribute("data-open-submenu")) {
    if (category === "Автомобили") {
      selectedSearchCategory = category; currentCategory = category;
      if (categorySelectLabel) categorySelectLabel.textContent = t(category);
      document.querySelectorAll(".category").forEach(b => b.classList.toggle("active", (b.dataset.category || "") === category));
      openVehicleSearch();
      return;
    }
    openCategoryMenu(category); return;
  }
  const subcategory = option.dataset.searchSubcategory;
  selectedSearchCategory = category; currentCategory = category;
  if (subcategory && searchInput) searchInput.value = subcategory;
  if (categorySelectLabel) categorySelectLabel.textContent = category ? t(category === "Готовый бизнес" ? "Бизнес и предпринимательство" : category) : t("Все категории");
  document.querySelectorAll(".category").forEach(b => b.classList.toggle("active", (b.dataset.category || "") === category));
  closeCategoryMenu();
  if (category === "Автомобили" && subcategory) {
    const title = document.getElementById("vehicleSearchTitle");
    if (title) title.textContent = t(subcategory);
    openVehicleSearch();
    return;
  }
  loadListings();
});
document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category || "";
    if (button.classList.contains("category-card") && category) {
      selectedSearchCategory = category; currentCategory = category;
      if (categorySelectLabel) categorySelectLabel.textContent = t(category === "Готовый бизнес" ? "Бизнес и предпринимательство" : category);
      if (category === "Автомобили") { openVehicleSearch(); return; }
      openCategoryMenu(category);
      return;
    }
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active")); button.classList.add("active");
    currentCategory = category; selectedSearchCategory = category;
    if (categorySelectLabel) categorySelectLabel.textContent = category ? t(category) : t("Все категории");
    loadListings();
  });
});
document.getElementById("categoryMenuClose")?.addEventListener("click", closeCategoryMenu);
categoryMenuBackdrop?.addEventListener("click", closeCategoryMenu);
document.getElementById("vehicleSearchClose")?.addEventListener("click", closeVehicleSearch);
vehicleSearchBackdrop?.addEventListener("click", closeVehicleSearch);
document.getElementById("vehicleSearchToggleAdvanced")?.addEventListener("click", () => {
  setVehicleSearchAdvanced(document.getElementById("vehicleSearchAdvanced")?.classList.contains("hidden"));
});
document.getElementById("vehicleSearchReset")?.addEventListener("click", () => {
  ["vehicleSearchMake","vehicleSearchModel","vehicleYearFrom","vehicleYearTo","vehiclePriceFrom","vehiclePriceTo","vehicleMileageFrom","vehicleMileageTo","vehicleEngineFrom","vehicleEngineTo","vehicleBodyType","vehicleFuel","vehicleTransmission","vehicleSearchStatus","vehiclePowerFrom","vehiclePowerTo","vehicleDoors","vehicleDrive","vehicleColor","vehicleSellerType"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
  clearConditionsCheckboxes("vehicleSearchConditions");
  const currency = document.getElementById("vehiclePriceCurrency"); if (currency) currency.value = "UAH";
  const make = document.getElementById("vehicleSearchMake");
  const model = document.getElementById("vehicleSearchModel");
  if (model) {
    model.innerHTML = `<option value="">${t("Усі моделі")}</option>`;
    model.disabled = true;
  }
  if (make) make.value = "";
  vehicleClientFilters = null;
  const message = document.getElementById("vehicleSearchMessage");
  if (message) { message.textContent = ""; message.classList.remove("error"); }
  setVehicleSearchAdvanced(false);
});
document.getElementById("vehicleSearchApply")?.addEventListener("click", () => {
  currentCategory = "Автомобили"; closeVehicleSearch(); loadListings();
});
document.addEventListener("keydown", event => { if (event.key === "Escape") { closeCategoryMenu(); closeVehicleSearch(); closeAddCategoryMenu(); } });
if (searchBtn) searchBtn.addEventListener("click", loadListings);
if (searchInput) searchInput.addEventListener("keydown", e => { if (e.key === "Enter") loadListings(); });

// ==== STAGE A: запрет создания объявления без авторизации ====
const openAddBtn = document.getElementById("openAdd");
if (openAddBtn) openAddBtn.addEventListener("click", () => {
  if (!currentUser) {
    openAuthModal();
    const hint = document.createElement("p");
    hint.className = "form-message stage-a-hint";
    hint.setAttribute("role", "status");
    hint.textContent = t("Войдите, чтобы добавить объявление");
    const guest = document.getElementById("authGuest");
    if (guest) {
      guest.querySelectorAll(".stage-a-hint").forEach(n => n.remove());
      guest.prepend(hint);
      setTimeout(() => hint.remove(), 6000);
    }
    return;
  }
  openAddCategoryMenu();
});
const addCategoryMenu = document.getElementById("addCategoryMenu");
const addCategoryBackdrop = document.getElementById("addCategoryBackdrop");
function closeAddCategoryMenu() {
  addCategoryMenu?.classList.add("hidden");
  addCategoryBackdrop?.classList.add("hidden");
}
function openAddCategoryMenu() {
  if (!addCategoryMenu) {
    addModal?.classList.remove("hidden");
    return;
  }
  closeCategoryMenu();
  closeVehicleSearch();
  addCategoryMenu.classList.remove("hidden");
  addCategoryBackdrop?.classList.remove("hidden");
}
document.getElementById("addCategoryClose")?.addEventListener("click", closeAddCategoryMenu);
addCategoryBackdrop?.addEventListener("click", closeAddCategoryMenu);
document.getElementById("addCategoryOptions")?.addEventListener("click", event => {
  const option = event.target.closest("[data-add-category]");
  if (!option) return;
  const category = option.dataset.addCategory;
  const categorySelect = addForm?.querySelector('select[name="category"]');
  if (!categorySelect || ![...categorySelect.options].some(item => item.value === category)) return;
  categorySelect.value = category;
  categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
  // Re-sync visibility before showing the form, so vehicle listings start directly at car characteristics.
  syncVehicleListingFields();
  closeAddCategoryMenu();
  addModal?.classList.remove("hidden");
});
const closeAddBtn = document.getElementById("closeAdd");
if (closeAddBtn) closeAddBtn.addEventListener("click", () => addModal?.classList.add("hidden"));
if (addModal) addModal.addEventListener("click", e => { if (e.target === addModal) addModal.classList.add("hidden"); });

if (addForm) {
  addForm.addEventListener("submit", async e => {
    e.preventDefault();
    // STAGE A: запрет добавления без авторизации (UI-уровень).
    if (!currentUser) {
      if (formMessage) {
        formMessage.textContent = t("Войдите, чтобы добавить объявление");
        formMessage.classList.remove("success");
        formMessage.classList.add("error");
      }
      addModal?.classList.add("hidden");
      openAuthModal();
      return;
    }
    if (publishing || validatingPhotos) return;
    if (formMessage) formMessage.textContent = "";
    if (!db) { if (formMessage) formMessage.textContent = "Сначала подключим Supabase — сейчас работает демо-режим."; return; }
    const form = new FormData(e.target);
    const cityId = form.get("city_id");
    if (!cityId || !availableCities.some(city => String(city.id) === cityId)) {
      if (formMessage) formMessage.textContent = cityTranslation("Выберите город из списка");
      citySearchInput?.focus();
      return;
    }
    const selectedCategory = String(form.get("category") || "");
    const vehicleMakeName = vehicleListingMake?.selectedOptions?.[0]?.textContent?.trim() || "";
    const vehicleModelName = vehicleListingModel?.selectedOptions?.[0]?.textContent?.trim() || "";
    const description = String(form.get("description") || "").trim();
    const generatedVehicleTitle = selectedCategory === "Автомобили" ? [vehicleMakeName, vehicleModelName].filter(Boolean).join(" ") : "";
    const generatedRealEstateTitle = selectedCategory === "Недвижимость"
      ? (description.split(/\r?\n/)[0].trim().slice(0, 100) || (translations["Недвижимость"]?.[lang] || "Недвижимость"))
      : "";
    const payload = {
      category: selectedCategory,
      title: selectedCategory === "Автомобили" ? generatedVehicleTitle : selectedCategory === "Недвижимость" ? generatedRealEstateTitle : String(form.get("title") || "").trim(),
      city_id: Number(form.get("city_id")),
      price: Number(form.get("price")),
      description,
      is_hot: false,
      is_urgent: false,
      user_id: currentUser.id
    };
    if (form.get("category") === "Автомобили") {
      const makeSlug = String(form.get("vehicle_make_slug") || "").trim();
      const modelSlug = String(form.get("vehicle_model_slug") || "").trim();
      if (!makeSlug || !modelSlug) {
        if (formMessage) formMessage.textContent = "Выберите марку и модель автомобиля.";
        (!makeSlug ? vehicleListingMake : vehicleListingModel)?.focus();
        return;
      }

      // Ensure the catalog is loaded before resolving slugs to display names.
      // This prevents saving a valid slug with a null make/model name when the cache is empty.
      let catalog;
      try {
        catalog = await fetchAllVehicleModels();
      } catch (error) {
        console.error("Не удалось проверить марку и модель автомобиля", error);
        if (formMessage) formMessage.textContent = "Не удалось проверить каталог автомобилей. Повторите попытку.";
        return;
      }
      const makeRow = catalog.find(row => String(row.make_slug) === makeSlug);
      const modelRow = catalog.find(row => String(row.make_slug) === makeSlug && String(row.model_slug) === modelSlug);
      if (!makeRow || !modelRow) {
        if (formMessage) formMessage.textContent = "Марка или модель не найдена в каталоге. Выберите их заново.";
        if (!makeRow) vehicleListingMake?.focus();
        else vehicleListingModel?.focus();
        return;
      }
      payload.title = [makeRow.make_name, modelRow.model_name].filter(Boolean).join(" ");
      Object.assign(payload, {
        vehicle_make_slug: makeSlug,
        vehicle_make_name: makeRow.make_name,
        vehicle_model_slug: modelSlug,
        vehicle_model_name: modelRow.model_name,
        vehicle_year: form.get("vehicle_year") ? Number(form.get("vehicle_year")) : null,
        vehicle_body_type: form.get("vehicle_body_type") || null,
        vehicle_fuel_type: form.get("vehicle_fuel_type") || null,
        vehicle_engine_liters: form.get("vehicle_engine_liters") ? Number(form.get("vehicle_engine_liters")) : null,
        vehicle_power_hp: form.get("vehicle_power_hp") ? Number(form.get("vehicle_power_hp")) : null,
        vehicle_transmission: form.get("vehicle_transmission") || null,
        vehicle_drive: form.get("vehicle_drive") || null,
        vehicle_mileage_km: form.get("vehicle_mileage_km") ? Number(form.get("vehicle_mileage_km")) : null,
        vehicle_condition: form.get("vehicle_condition") || null,
        vehicle_doors: form.get("vehicle_doors") ? Number(form.get("vehicle_doors")) : null,
        vehicle_color: form.get("vehicle_color") || null,
        seller_type: form.get("seller_type") || "private"
      });
    }
    if (!String(payload.title || "").trim()) {
      if (formMessage) formMessage.textContent = "Выберите марку и модель автомобиля или добавьте описание объявления.";
      if (selectedCategory === "Автомобили") vehicleListingMake?.focus();
      else addForm?.querySelector('textarea[name="description"]')?.focus();
      return;
    }
    const selectedListingConditionIds = form.get("category") === "Автомобили" ? getSelectedConditionIds("vehicleListingConditions") : [];
    const withPhotos = selectedPhotos.length > 0;
    publishing = true;
    const controls = [...addForm.elements].map(control => [control, control.disabled]);
    controls.forEach(([control]) => { control.disabled = true; });
    if (withPhotos && formMessage) formMessage.textContent = photoText("saving");
    try {
      if (withPhotos) {
        payload.image_urls = await uploadListingPhotos();
        payload.image_url = payload.image_urls[0];
      }
      const { data: insertedListings, error } = await db.from("listings").insert(payload).select("id");
      if (error) {
        // RLS-отказ или другая ошибка Supabase. Не выдаём «успех».
        const raw = String(error.message || "");
        if (/row-level security|permission denied|new row violates/i.test(raw)) {
          throw new Error(t("Ошибка") + ": " + raw + " — проверьте права доступа.");
        }
        throw error;
      }
      const newListingId = insertedListings?.[0]?.id;
      if (selectedListingConditionIds.length) {
        if (!newListingId) throw new Error("Объявление сохранено, но не удалось получить его ID для сохранения технических состояний.");
        const links = selectedListingConditionIds.map(condition_id => ({ listing_id: newListingId, condition_id }));
        const { error: conditionsError } = await db.from("listing_vehicle_conditions").insert(links);
        if (conditionsError) throw new Error("Объявление сохранено, но технические состояния не сохранены: " + conditionsError.message);
      }
      e.target.reset();
      clearConditionsCheckboxes("vehicleListingConditions");
      resetPhotos();
      if (formMessage) formMessage.textContent = "Объявление опубликовано!";
      await loadListings();
      setTimeout(() => addModal?.classList.add("hidden"), 700);
    } catch (error) {
      if (formMessage) {
        const errorText = error?.message || String(error);
        formMessage.textContent = withPhotos
          ? (errorText === photoText("setup")
              ? errorText
              : `${photoText("failed")} ${errorText}`)
          : `Ошибка: ${errorText}`;
      }
    } finally {
      publishing = false;
      controls.forEach(([control, disabled]) => { control.disabled = disabled; });
      updatePhotoFields();
    }
  });
}

function translateTextElement(element, original) {
  if (!element) return;
  const item = translations[original];
  if (item && item[lang]) element.textContent = item[lang];
}
function translateVehicleSearchUI() {
  const menu = document.getElementById("vehicleSearchMenu");
  if (!menu) return;
  const title = document.getElementById("vehicleSearchTitle");
  if (title) title.textContent = t("Автомобили");
  const intro = menu.querySelector(".vehicle-search-intro");
  if (intro) intro.textContent = t("Оберіть параметри автомобіля");
  const labelKeys = {
    vehicleSearchMake: "Марка", vehicleSearchModel: "Модель", vehicleYearFrom: "Рік від", vehicleYearTo: "Рік до",
    vehiclePriceFrom: "Ціна від", vehiclePriceTo: "Ціна до", vehicleMileageFrom: "Пробіг від, км", vehicleMileageTo: "Пробіг до, км",
    vehicleEngineFrom: "Об’єм двигуна від, л", vehicleEngineTo: "Об’єм двигуна до, л", vehicleBodyType: "Тип кузова",
    vehicleFuel: "Паливо", vehicleTransmission: "Коробка передач", vehicleSearchStatus: "Стан авто",
    vehiclePowerFrom: "Потужність від, к. с.", vehiclePowerTo: "Потужність до, к. с.", vehicleDoors: "Кількість дверей",
    vehicleDrive: "Привід", vehicleColor: "Колір", vehicleSellerType: "Продавець"
  };
  Object.entries(labelKeys).forEach(([id, key]) => {
    const el = document.getElementById(id);
    const label = el?.closest("label");
    if (!label) return;
    const textNode = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = t(key) + " ";
  });
  const make = document.getElementById("vehicleSearchMake");
  const model = document.getElementById("vehicleSearchModel");
  if (make?.options[0]) make.options[0].textContent = t("Усі марки");
  if (model?.options[0]) model.options[0].textContent = t("Усі моделі");
  const placeholderOptions = { vehicleBodyType: "Будь-який", vehicleFuel: "Будь-яке", vehicleTransmission: "Будь-яка", vehicleSearchStatus: "Будь-який", vehicleDoors: "Будь-яка", vehicleDrive: "Будь-який", vehicleColor: "Будь-який", vehicleSellerType: "Будь-хто" };
  Object.entries(placeholderOptions).forEach(([id, key]) => {
    const select = document.getElementById(id);
    if (select?.options[0]) select.options[0].textContent = t(key);
  });
  menu.querySelectorAll("select option").forEach(option => {
    if (option.value === "UAH") option.textContent = "₴ UAH";
    else if (option.value === "USD") option.textContent = "$ USD";
    else if (option.value && /^[0-9]+$/.test(option.value)) return;
    else {
      if (!option.dataset.i18nOriginal) option.dataset.i18nOriginal = option.textContent.trim();
      const original = option.dataset.i18nOriginal;
      if (translations[original]) option.textContent = t(original);
    }
  });
  const currencyLabel = document.getElementById("vehiclePriceCurrency")?.closest("label");
  if (currencyLabel) { const textNode = [...currencyLabel.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()); if (textNode) textNode.textContent = t("Валюта") + " "; }
  const placeholderKeys = {
    vehicleYearFrom: "2010", vehicleYearTo: "2026", vehiclePriceFrom: "0",
    vehiclePriceTo: "Будь-яка ціна", vehicleMileageFrom: "Будь-який", vehicleMileageTo: "Будь-який",
    vehicleEngineFrom: "Будь-який", vehicleEngineTo: "Будь-який", vehiclePowerFrom: "Будь-яка", vehiclePowerTo: "Будь-яка"
  };
  Object.entries(placeholderKeys).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = key === "2010" || key === "2026" || key === "0" ? key : t(key);
  });
  const close = document.getElementById("vehicleSearchClose");
  if (close) close.setAttribute("aria-label", t("Закрыть"));
  const makeStatus = document.getElementById("vehicleMakeLoadStatus");
  if (makeStatus && !makeStatus.textContent.trim()) makeStatus.textContent = "";
  const reset = document.getElementById("vehicleSearchReset");
  const apply = document.getElementById("vehicleSearchApply");
  if (reset) reset.textContent = t("Скинути");
  if (apply) apply.textContent = t("Знайти автомобілі");
  const toggle = document.getElementById("vehicleSearchToggleAdvanced");
  if (toggle) toggle.textContent = t(document.getElementById("vehicleSearchAdvanced")?.classList.contains("hidden") ? "Розширений пошук" : "Згорнути розширений пошук");
  setVehicleSearchAdvanced(Boolean(document.getElementById("vehicleSearchAdvanced") && !document.getElementById("vehicleSearchAdvanced").classList.contains("hidden")));
}
function translatePage(selectedLanguage) {
  lang = selectedLanguage;
  if (typeof loadMarketQuotes === "function") loadMarketQuotes();
  document.documentElement.lang = lang;
  localStorage.setItem("hryvniaHubLanguage", lang);
  updateLangButton();
  updateAuthTranslations();
  document.querySelectorAll("[data-i18n]").forEach(el => translateTextElement(el, el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const item = translations[el.dataset.i18nPlaceholder];
    if (item && item[lang]) el.placeholder = item[lang];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const item = translations[el.dataset.i18nAria];
    if (item && item[lang]) el.setAttribute("aria-label", item[lang]);
  });
  updatePhotoFields();
  prepareVehicleSearchUI();
  translateVehicleSearchUI();
  if (typeof rerenderConditionsOnLangChange === "function") rerenderConditionsOnLangChange();
  translateTextElement(document.getElementById("openAdd"), "+ Добавить объявление");
  translateTextElement(document.getElementById("addCategoryTitle"), "Выберите категорию объявления");
  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) {
    const title = translations["Найди выгодное"];
    const deal = translations["предложение"];
    if (title && deal) heroTitle.innerHTML = `${title[lang]}<br>${deal[lang]}`;
  }
  translateTextElement(document.querySelector(".hero-text"), "Автомобили, недвижимость и бизнес в одном месте.");
  translateTextElement(document.querySelector(".banner-title"), "Find the best deals in Ukraine");
  if (searchInput) {
    const placeholder = translations["Что ищете? Например: Skoda Octavia"];
    if (placeholder) searchInput.placeholder = placeholder[lang];
  }
  translateTextElement(document.getElementById("searchBtn"), "Найти");
  updateCitySearchLanguage();
  updateCatalogCitySearchLanguage();
  [catalogRegionSelect, cityRegionSelect].forEach(select => {
    if (!select) return;
    const first = select.options[0];
    if (first && first.value === "") first.textContent = cityTranslation("Все области");
  });
  const listingLabelEl = document.getElementById("listingLabel");
  if (listingLabelEl) { const item = translations["Листинг"]; if (item && item[lang]) listingLabelEl.textContent = item[lang]; }
  const latestListingsTitleEl = document.getElementById("latestListingsTitle");
  if (latestListingsTitleEl) { const item = translations["Последние объявления"]; if (item && item[lang]) latestListingsTitleEl.textContent = item[lang]; }
  if (addModal) {
    translateTextElement(addModal.querySelector(".eyebrow"), "Новое объявление");
    translateTextElement(addModal.querySelector("h2"), "Добавить объявление");
    const labels = [...addModal.querySelector("#addForm").children].filter(el => el.tagName === "LABEL");
    const labelKeys = ["Категория", "Название", "Город", "Область / регион", "Цена, грн", "Описание"];
    labels.forEach((label, index) => {
      const key = labelKeys[index];
      if (!key) return;
      const item = translations[key];
      if (!item || !item[lang]) return;
      const textNode = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = item[lang] + "\n";
    });
    const categorySelect = addModal.querySelector('select[name="category"]');
    if (categorySelect) {
      const categoryKeys = ["Автомобили", "Недвижимость", "Бизнес и предпринимательство", "Инвестиции"];
      [...categorySelect.options].forEach((option, index) => {
        const key = categoryKeys[index];
        const item = translations[key];
        if (item && item[lang]) option.textContent = item[lang];
      });
    }
    const titleInput = addModal.querySelector('input[name="title"]');
    if (titleInput) titleInput.placeholder = translations["Например: Skoda Octavia 1.6"][lang];
    const descriptionInput = addModal.querySelector('textarea[name="description"]');
    if (descriptionInput) descriptionInput.placeholder = translations["Коротко опишите предложение"][lang];
    const publishButton = addModal.querySelector('button[type="submit"]');
    if (publishButton) translateTextElement(publishButton, "Опубликовать");
  }
  const innerSwitcher = document.getElementById("languageSwitcher");
  if (innerSwitcher) {
    if (innerSwitcher.options[0]) innerSwitcher.options[0].textContent = "Русский";
    if (innerSwitcher.options[1]) innerSwitcher.options[1].textContent = "Українська";
    if (innerSwitcher.options[2]) innerSwitcher.options[2].textContent = "English";
    if (innerSwitcher.options[3]) innerSwitcher.options[3].textContent = "Polski";
  }
  if (sendMessageForm?.elements.body) {
    const ph = translations["Ваше сообщение..."];
    if (ph) sendMessageForm.elements.body.placeholder = ph[lang];
    const sub = sendMessageForm.querySelector("button[type='submit']");
    if (sub) sub.textContent = t("Отправить");
  }
  const backBtn = document.getElementById("backToConvs");
  if (backBtn) backBtn.textContent = t("← К списку");
  renderListings(visibleListings);
}

const languageSwitcher = document.getElementById("languageSwitcher");
if (languageSwitcher) {
  languageSwitcher.addEventListener("change", function () { translatePage(this.value); });
  const savedLanguage = localStorage.getItem("hryvniaHubLanguage");
  languageSwitcher.value = savedLanguage || "uk";
  translatePage(savedLanguage || "uk");
} else {
  translatePage(lang);
}

const langTrigger = document.getElementById("langTrigger");
const langDropdown = document.getElementById("langDropdown");
function closeLangDropdown() {
  if (!langDropdown) return;
  langDropdown.classList.add("hidden");
  langTrigger?.setAttribute("aria-expanded", "false");
}
if (langTrigger && langDropdown) {
  langTrigger.addEventListener("click", event => {
    event.stopPropagation();
    if (langDropdown.classList.contains("hidden")) {
      langDropdown.classList.remove("hidden");
      langTrigger.setAttribute("aria-expanded", "true");
    } else {
      closeLangDropdown();
    }
  });
  langDropdown.addEventListener("click", event => {
    const btn = event.target.closest("[data-lang-value]");
    if (!btn) return;
    const value = btn.dataset.langValue;
    if (languageSwitcher) languageSwitcher.value = value;
    translatePage(value);
    closeLangDropdown();
  });
  document.addEventListener("click", event => {
    if (langDropdown.classList.contains("hidden")) return;
    if (langTrigger.contains(event.target)) return;
    if (langDropdown.contains(event.target)) return;
    closeLangDropdown();
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeLangDropdown(); });
}

setInterval(updateClock, 30000);
updateClock();
loadMarketQuotes();
setInterval(loadMarketQuotes, 5 * 60 * 1000);
loadListings();
loadCities();
initAuth();
if (typeof renderAllConditionGroups === "function") renderAllConditionGroups().catch(error => console.error("Ошибка инициализации технических состояний", error));

// === КОНЕЦ ФАЙЛА ===

