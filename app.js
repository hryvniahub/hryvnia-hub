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

const translations = {
  // Stable slug keys for vehicle select options; values saved to Supabase stay unchanged.
  "roadworthy": { ru: "На ходу, технически исправен", uk: "На ходу, технічно справний", en: "Roadworthy, mechanically sound", pl: "Sprawny technicznie, jeżdżący" },
  "needs_repair": { ru: "Требует ремонта", uk: "Потребує ремонту", en: "Needs repair", pl: "Wymaga naprawy" },
  "not_running": { ru: "Не на ходу", uk: "Не на ходу", en: "Not running", pl: "Nie jeździ" },
  "after_accident": { ru: "После ДТП", uk: "Після ДТП", en: "After an accident", pl: "Po wypadku" },
  "new": { ru: "Новое", uk: "Нове", en: "New", pl: "Nowe" },
  "used": { ru: "С пробегом", uk: "З пробігом", en: "Used", pl: "Używane" },
  "Категорії": { ru: "Категории", uk: "Категорії", en: "Categories", pl: "Kategorie" },
  "Автомобили": { ru: "Автомобили", uk: "Автомобілі", en: "Cars", pl: "Samochody" },
  "Недвижимость": { ru: "Недвижимость", uk: "Нерухомість", en: "Real estate", pl: "Nieruchomości" },
  "Продажа": { ru: "Продажа", uk: "Продаж", en: "For sale", pl: "Sprzedaż" },
  "Аренда": { ru: "Аренда", uk: "Оренда", en: "For rent", pl: "Wynajem" },
  "Квартиры": { ru: "Квартиры", uk: "Квартири", en: "Apartments", pl: "Mieszkania" },
  "Дома": { ru: "Дома", uk: "Будинки", en: "Houses", pl: "Domy" },
  "Комнаты": { ru: "Комнаты", uk: "Кімнати", en: "Rooms", pl: "Pokoje" },
  "Коммерческая недвижимость": { ru: "Коммерческая недвижимость", uk: "Комерційна нерухомість", en: "Commercial property", pl: "Nieruchomości komercyjne" },
  "Гаражи и парковочные места": { ru: "Гаражи и парковочные места", uk: "Гаражі та паркомісця", en: "Garages and parking spaces", pl: "Garaże i miejsca parkingowe" },
  "Земельные участки": { ru: "Земельные участки", uk: "Земельні ділянки", en: "Land plots", pl: "Działki" },
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
  "More than just listings": {
    ru: "Больше",
    uk: "Більше",
    en: "More",
    pl: "Więcej"
  },
  "than just listings": {
    ru: "чем просто объявления",
    uk: "ніж просто оголошення",
    en: "than just listings",
    pl: "niż tylko ogłoszenia"
  },
  "We open opportunities for entrepreneurs, business and investment": {
    ru: "Мы открываем возможности для предпринимателей, бизнеса и инвестиций.",
    uk: "Ми відкриваємо можливості для підприємців, бізнесу та інвестицій.",
    en: "We open opportunities for entrepreneurs, business and investment.",
    pl: "Otwieramy możliwości dla przedsiębiorców, biznesu i inwestycji."
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
  "Quote unavailable": { ru: "Нет данных", uk: "Немає даних", en: "Unavailable", pl: "Brak danych" },

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
  "Hot": { ru: "Горячее", uk: "Гаряче", en: "Hot", pl: "Gorące" },
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
  "Локація": { ru: "Местоположение", uk: "Локація", en: "Location", pl: "Lokalizacja" },
  "Категорія нерухомості": { ru: "Категория недвижимости", uk: "Категорія нерухомості", en: "Property type", pl: "Rodzaj nieruchomości" },
  "Оберіть категорію": { ru: "Выберите категорию", uk: "Оберіть категорію", en: "Choose a category", pl: "Wybierz kategorię" },
  "Тип угоди": { ru: "Тип сделки", uk: "Тип угоди", en: "Deal type", pl: "Rodzaj transakcji" },
  "Адреса або точка на карті": { ru: "Адрес или точка на карте", uk: "Адреса або точка на карті", en: "Address or point on map", pl: "Adres lub punkt na mapie" },
  "Радіус, км": { ru: "Радиус, км", uk: "Радіус, км", en: "Radius, km", pl: "Promień, km" },
  "Вказати точку на карті": { ru: "Указать точку на карте", uk: "Вказати точку на карті", en: "Set a point on the map", pl: "Wskaż punkt na mapie" },
  "Більше фільтрів": { ru: "Больше фильтров", uk: "Більше фільтрів", en: "More filters", pl: "Więcej filtrów" },
  "Ціна від": { ru: "Цена от", uk: "Ціна від", en: "Price from", pl: "Cena od" },
  "Ціна до": { ru: "Цена до", uk: "Ціна до", en: "Price to", pl: "Cena do" },
  "Площа від, м²": { ru: "Площадь от, м²", uk: "Площа від, м²", en: "Area from, m²", pl: "Powierzchnia od, m²" },
  "Площа до, м²": { ru: "Площадь до, м²", uk: "Площа до, м²", en: "Area to, m²", pl: "Powierzchnia do, m²" },
  "Введіть адресу або орієнтир": { ru: "Введите адрес или ориентир", uk: "Введіть адресу або орієнтир", en: "Enter address or landmark", pl: "Wpisz adres lub punkt orientacyjny" },
  "Розширений пошук": { ru: "Больше", uk: "Більше", en: "More", pl: "Więcej" },
  "Згорнути розширений пошук": { ru: "Меньше", uk: "Менше", en: "Less", pl: "Mniej" },
  "Скинути": { ru: "Сбросить", uk: "Скинути", en: "Reset", pl: "Wyczyść" },
  "Знайти автомобілі": { ru: "Найти автомобили", uk: "Знайти автомобілі", en: "Find cars", pl: "Znajdź samochody" },
  "Застосувати": { ru: "Применить", uk: "Застосувати", en: "Apply", pl: "Zastosuj" },
  "Оберіть параметри автомобіля": { ru:"Выберите параметры автомобиля", uk:"Оберіть параметри автомобіля", en:"Choose vehicle filters", pl:"Wybierz parametry pojazdu" },
  "Будь-яка ціна": {ru:"Любая",uk:"Будь-яка ціна",en:"Any price",pl:"Dowolna cena"},
  "Всі марки": {ru:"Все марки",uk:"Всі марки",en:"All makes",pl:"Wszystkie marki"},
  "Всі моделі": {ru:"Все модели",uk:"Всі моделі",en:"All models",pl:"Wszystkie modele"},
  "Спочатку оберіть марку": {ru:"Сначала выберите марку",uk:"Спочатку оберіть марку",en:"Choose a make first",pl:"Najpierw wybierz markę"},
  "Марка": { ru: "Марка", uk: "Марка", en: "Make", pl: "Marka" },
  "Модель": { ru: "Модель", uk: "Модель", en: "Model", pl: "Model" },
  "Рік від": { ru: "Год от", uk: "Рік від", en: "Year from", pl: "Rok od" },
  "Рік до": { ru: "Год до", uk: "Рік до", en: "Year to", pl: "Rok do" },


  "Пробіг від, км": { ru: "Пробег от, км", uk: "Пробіг від, км", en: "Mileage from, km", pl: "Przebieg od, km" },
  "Пробіг до, км": { ru: "Пробег до, км", uk: "Пробіг до, км", en: "Mileage to, km", pl: "Przebieg do, km" },
  "Об’єм двигуна від, л": { ru: "Объём двигателя от, л", uk: "Об’єм двигуна від, л", en: "Engine size from, L", pl: "Pojemność silnika od, l" },
  "Об’єм двигуна до, л": { ru: "Объём двигателя до, л", uk: "Об’єм двигуна до, л", en: "Engine size to, L", pl: "Pojemność silnika do, l" },
  "Тип кузова": { ru: "Тип кузова", uk: "Тип кузова", en: "Body type", pl: "Typ nadwozia" },
  "Паливо": { ru: "Топливо", uk: "Паливо", en: "Fuel", pl: "Paliwo" },
  "Топливо": { ru: "Топливо", uk: "Паливо", en: "Fuel", pl: "Paliwo" },
  "Привод": { ru: "Привод", uk: "Привід", en: "Drive type", pl: "Napęd" },
  "Количество дверей": { ru: "Количество дверей", uk: "Кількість дверей", en: "Number of doors", pl: "Liczba drzwi" },
  "Цвет": { ru: "Цвет", uk: "Колір", en: "Color", pl: "Kolor" },
  "Коробка передач": { ru: "Коробка передач", uk: "Коробка передач", en: "Transmission", pl: "Skrzynia biegów" },
  "Будь-який": { ru: "Любой", uk: "Будь-який", en: "Any", pl: "Dowolny" },
  "Будь-яка": { ru: "Любая", uk: "Будь-яка", en: "Any", pl: "Dowolna" },
  "Будь-яке": { ru: "Любое", uk: "Будь-яке", en: "Any", pl: "Dowolne" },
  "Перевірте числові значення фільтрів.": { ru: "Проверьте числовые значения фильтров.", uk: "Перевірте числові значення фільтрів.", en: "Check the numeric filter values.", pl: "Sprawdź wartości liczbowe filtrów." },
  "Перевірте діапазони фільтрів.": { ru: "Проверьте диапазоны фильтров.", uk: "Перевірте діапазони фільтрів.", en: "Check the filter ranges.", pl: "Sprawdź zakresy filtrów." },
  "Рік «від» не може бути більшим за рік «до».": { ru: "Год «от» не может быть больше года «до».", uk: "Рік «від» не може бути більшим за рік «до».", en: "Year from cannot be greater than year to.", pl: "Rok początkowy nie może być większy od końcowego." },
  "Ціна «від» не може бути більшою за ціну «до».": { ru: "Цена «от» не может быть больше цены «до».", uk: "Ціна «від» не може бути більшою за ціну «до».", en: "Price from cannot be greater than price to.", pl: "Cena minimalna nie może być większa od maksymalnej." },
  "Пробіг «від» не може бути більшим за пробіг «до».": { ru: "Пробег «от» не может быть больше пробега «до».", uk: "Пробіг «від» не може бути більшим за пробіг «до».", en: "Mileage from cannot be greater than mileage to.", pl: "Przebieg od nie może być większy od przebiegu do." },
  "Об’єм двигуна «від» не може бути більшим за «до».": { ru: "Объём двигателя «от» не может быть больше «до».", uk: "Об’єм двигуна «від» не може бути більшим за «до».", en: "Engine size from cannot be greater than engine size to.", pl: "Pojemność silnika od nie może być większa od pojemności do." },
  "Потужність «від» не може бути більшою за «до». ": { ru:"Мощность «от» не может быть больше «до».",uk:"Потужність «від» не може бути більшою за «до».",en:"Power from cannot be greater than power to.",pl:"Moc od nie może być większa od mocy do."},
  "Валюта": {ru:"Валюта",uk:"Валюта",en:"Currency",pl:"Waluta"},
  "Стан авто": {ru:"Состояние авто",uk:"Стан авто",en:"Vehicle status",pl:"Stan pojazdu"},
  "Тип авто": {ru:"Тип авто",uk:"Тип авто",en:"Vehicle type",pl:"Typ pojazdu"},
  "Потужність від, к. с.": {ru:"Мощность от, л. с.",uk:"Потужність від, к. с.",en:"Power from, hp",pl:"Moc od, KM"},
  "Потужність до, к. с.": {ru:"Мощность до, л. с.",uk:"Потужність до, к. с.",en:"Power to, hp",pl:"Moc do, KM"},
  "Кількість дверей": {ru:"Количество дверей",uk:"Кількість дверей",en:"Number of doors",pl:"Liczba drzwi"},
  "Привід": {ru:"Привод",uk:"Привід",en:"Drive type",pl:"Napęd"},
  "Технічний стан": {ru:"Техническое состояние",uk:"Технічний стан",en:"Technical condition",pl:"Stan techniczny"},
  "Техническое состояние": {ru:"Техническое состояние",uk:"Технічний стан",en:"Technical condition",pl:"Stan techniczny"},
  "Колір": {ru:"Цвет",uk:"Колір",en:"Color",pl:"Kolor"},
  "Продавець": {ru:"Продавец",uk:"Продавець",en:"Seller",pl:"Sprzedawca"},
  "Нове": {ru:"Новое",uk:"Нове",en:"New",pl:"Nowy"},
  "Новий": {ru:"Новый",uk:"Новий",en:"New",pl:"Nowy"},
  "Вживане": {ru:"С пробегом",uk:"Вживане",en:"Used",pl:"Używany"},
  "З пробігом": {ru:"С пробегом",uk:"З пробігом",en:"Used",pl:"Używany"},
  "Білий": {ru:"Белый",uk:"Білий",en:"White",pl:"Biały"},
  "Чорний": {ru:"Чёрный",uk:"Чорний",en:"Black",pl:"Czarny"},
  "Сірий": {ru:"Серый",uk:"Сірий",en:"Gray",pl:"Szary"},
  "Сріблястий": {ru:"Серебристый",uk:"Сріблястий",en:"Silver",pl:"Srebrny"},
  "Червоний": {ru:"Красный",uk:"Червоний",en:"Red",pl:"Czerwony"},
  "Синій": {ru:"Синий",uk:"Синій",en:"Blue",pl:"Niebieski"},
  "Зелений": {ru:"Зелёный",uk:"Зелений",en:"Green",pl:"Zielony"},
  "Коричневий": {ru:"Коричневый",uk:"Коричневий",en:"Brown",pl:"Brązowy"},
  "Жовтий": {ru:"Жёлтый",uk:"Жовтий",en:"Yellow",pl:"Żółty"},
  "Інший": {ru:"Другой",uk:"Інший",en:"Other",pl:"Inny"},
  "Будь-хто": {ru:"Любой",uk:"Будь-хто",en:"Any",pl:"Dowolny"},
  "Приватна особа": {ru:"Частное лицо",uk:"Приватна особа",en:"Private seller",pl:"Osoba prywatna"},
  "Компанія / автосалон": {ru:"Компания / автосалон",uk:"Компанія / автосалон",en:"Company / dealer",pl:"Firma / dealer"},
  "Повний, що підключається": {ru:"Подключаемый полный привод",uk:"Повний, що підключається",en:"Selectable all-wheel drive",pl:"Dołączany napęd 4x4"},
  "Повний підключаємий": {ru:"Подключаемый полный привод",uk:"Повний, що підключається",en:"Selectable all-wheel drive",pl:"Dołączany napęd 4x4"},
  "На ходу, технічно справний": {
    ru:"На ходу, технически исправен",
    uk:"На ходу, технічно справний",
    en:"Roadworthy, mechanically sound",
    pl:"Sprawny technicznie, jeżdżący"
  },
  "На ходу, технически исправен": {
    ru:"На ходу, технически исправен",
    uk:"На ходу, технічно справний",
    en:"Roadworthy, mechanically sound",
    pl:"Sprawny technicznie, jeżdżący"
  },
  "Потребує ремонту": {ru:"Требует ремонта",uk:"Потребує ремонту",en:"Needs repair",pl:"Wymaga naprawy"},
  "Требует ремонта": {ru:"Требует ремонта",uk:"Потребує ремонту",en:"Needs repair",pl:"Wymaga naprawy"},
  "Не на ходу": {ru:"Не на ходу",uk:"Не на ходу",en:"Not running",pl:"Nie jeździ"},
  "Після ДТП": {ru:"После ДТП",uk:"Після ДТП",en:"After an accident",pl:"Po wypadku"},
  "После ДТП": {ru:"После ДТП",uk:"Після ДТП",en:"After an accident",pl:"Po wypadku"},
  "Выберите состояние": {ru:"Выберите состояние",uk:"Виберіть стан",en:"Choose condition",pl:"Wybierz stan"},
  "Седан": {ru:"Седан",uk:"Седан",en:"Sedan",pl:"Sedan"},
  "Хетчбек": {ru:"Хэтчбек",uk:"Хетчбек",en:"Hatchback",pl:"Hatchback"},
  "Універсал": {ru:"Универсал",uk:"Універсал",en:"Wagon",pl:"Kombi"},
  "Универсал": {ru:"Универсал",uk:"Універсал",en:"Wagon",pl:"Kombi"},
  "Позашляховик": {ru:"Внедорожник",uk:"Позашляховик",en:"SUV",pl:"SUV"},
  "Купе": {ru:"Купе",uk:"Купе",en:"Coupe",pl:"Coupe"},
  "Мінівен": {ru:"Минивэн",uk:"Мінівен",en:"Minivan",pl:"Minivan"},
  "Пікап": {ru:"Пикап",uk:"Пікап",en:"Pickup",pl:"Pickup"},
  "Бензин": {ru:"Бензин",uk:"Бензин",en:"Petrol",pl:"Benzyna"},
  "Дизель": {ru:"Дизель",uk:"Дизель",en:"Diesel",pl:"Diesel"},
  "Газ/бензин": {ru:"Газ/бензин",uk:"Газ/бензин",en:"LPG/petrol",pl:"LPG/benzyna"},
  "Електро": {ru:"Электро",uk:"Електро",en:"Electric",pl:"Elektryczny"},
  "Гібрид": {ru:"Гибрид",uk:"Гібрид",en:"Hybrid",pl:"Hybryda"},
  "Гибрид": {ru:"Гибрид",uk:"Гібрид",en:"Hybrid",pl:"Hybryda"},
  "Механічна": {ru:"Механическая",uk:"Механічна",en:"Manual",pl:"Manualna"},
  "Автоматична": {ru:"Автоматическая",uk:"Автоматична",en:"Automatic",pl:"Automatyczna"},
  "Варіатор": {ru:"Вариатор",uk:"Варіатор",en:"CVT",pl:"CVT"},
  "Робот": {ru:"Робот",uk:"Робот",en:"Automated manual",pl:"Automatyczna zautomatyzowana"},
  "Передній": {ru:"Передний",uk:"Передній",en:"Front-wheel drive",pl:"Napęd na przednie koła"},
  "Задній": {ru:"Задний",uk:"Задній",en:"Rear-wheel drive",pl:"Napęd na tylne koła"},
  "Повний": {ru:"Полный",uk:"Повний",en:"All-wheel drive",pl:"Napęd na wszystkie koła"},
  "Выберите марку": {ru:"Выберите марку",uk:"Виберіть марку",en:"Choose make",pl:"Wybierz markę"},
  "Выберите модель": {ru:"Выберите модель",uk:"Виберіть модель",en:"Choose model",pl:"Wybierz model"},
  "Выберите тип кузова": {ru:"Выберите тип кузова",uk:"Виберіть тип кузова",en:"Choose body type",pl:"Wybierz typ nadwozia"},
  "Выберите топливо": {ru:"Выберите топливо",uk:"Виберіть паливо",en:"Choose fuel",pl:"Wybierz paliwo"},
  "Выберите коробку": {ru:"Выберите коробку",uk:"Виберіть коробку",en:"Choose transmission",pl:"Wybierz skrzynię"},
  "Выберите привод": {ru:"Выберите привод",uk:"Виберіть привід",en:"Choose drivetrain",pl:"Wybierz napęd"},
  "Выберите количество": {ru:"Выберите количество",uk:"Виберіть кількість",en:"Choose number",pl:"Wybierz liczbę"},
  "Выберите цвет": {ru:"Выберите цвет",uk:"Виберіть колір",en:"Choose color",pl:"Wybierz kolor"},
  "Выберите тип": {ru:"Выберите тип",uk:"Виберіть тип",en:"Choose type",pl:"Wybierz typ"},
  "Характеристики автомобиля": {ru:"Характеристики автомобиля",uk:"Характеристики автомобіля",en:"Vehicle specifications",pl:"Dane pojazdu"},
  "Марка автомобиля": {ru:"Марка автомобиля",uk:"Марка автомобіля",en:"Car make",pl:"Marka samochodu"},
  "Модель автомобиля": {ru:"Модель автомобиля",uk:"Модель автомобіля",en:"Car model",pl:"Model samochodu"},
  "Год выпуска": {ru:"Год выпуска",uk:"Рік випуску",en:"Year",pl:"Rok produkcji"},
  "Объём двигателя, л": {ru:"Объём двигателя, л",uk:"Об'єм двигуна, л",en:"Engine size, L",pl:"Pojemność silnika, l"},
  "Мощность, л.с.": {ru:"Мощность, л.с.",uk:"Потужність, к.с.",en:"Power, hp",pl:"Moc, KM"},
  "Тип продавца": {ru:"Тип продавца",uk:"Тип продавця",en:"Seller type",pl:"Typ sprzedawcy"},
  "Пробег, км": {ru:"Пробег, км",uk:"Пробіг, км",en:"Mileage, km",pl:"Przebieg, km"},
  "Новое": {ru:"Новое",uk:"Нове",en:"New",pl:"Nowy"},
  "С пробегом": {ru:"С пробегом",uk:"З пробігом",en:"Used",pl:"Używany"},
  "Частное лицо": {ru:"Частное лицо",uk:"Приватна особа",en:"Private seller",pl:"Osoba prywatna"},
  "Компания / бизнес": {ru:"Компания / бизнес",uk:"Компанія / бізнес",en:"Company / business",pl:"Firma / biznes"},
  "Основное": {ru:"Основное",uk:"Основне",en:"Basics",pl:"Podstawowe"},
  "Детали": {ru:"Детали",uk:"Деталі",en:"Details",pl:"Szczegóły"},
  "Фото": {ru:"Фото",uk:"Фото",en:"Photos",pl:"Zdjęcia"},
  "Публикация": {ru:"Публикация",uk:"Публікація",en:"Publish",pl:"Publikacja"},
  "Ориентировочная рыночная цена": {ru:"Ориентировочная рыночная цена",uk:"Орієнтовна ринкова ціна",en:"Estimated market price",pl:"Szacunkowa cena rynkowa"},
  "Ниже рынка": {ru:"Ниже рынка",uk:"Нижче ринку",en:"Below market",pl:"Poniżej rynku"},
  "Рыночная цена": {ru:"Рыночная цена",uk:"Ринкова ціна",en:"Market price",pl:"Cena rynkowa"},
  "Выше рынка": {ru:"Выше рынка",uk:"Вище ринку",en:"Above market",pl:"Powyżej rynku"},
  "Рассчитываем ориентировочную цену…": {ru:"Рассчитываем ориентировочную цену…",uk:"Розраховуємо орієнтовну ціну…",en:"Estimating market price…",pl:"Szacujemy cenę rynkową…"},
  "Ищем похожие объявления в базе Hryvnia Hub.": {ru:"Ищем похожие объявления в базе Hryvnia Hub.",uk:"Шукаємо схожі оголошення в базі Hryvnia Hub.",en:"Searching similar listings in the Hryvnia Hub database.",pl:"Szukamy podobnych ogłoszeń w bazie Hryvnia Hub."},
  "Выберите марку, модель и год выпуска": {ru:"Выберите марку, модель и год выпуска",uk:"Оберіть марку, модель і рік випуску",en:"Select make, model and year",pl:"Wybierz markę, model i rok"},
  "Для предварительной оценки нужны все три параметра.": {ru:"Для предварительной оценки нужны все три параметра.",uk:"Для попередньої оцінки потрібні всі три параметри.",en:"All three details are needed for an estimate.",pl:"Do wstępnej wyceny potrzebne są wszystkie trzy dane."},
  "Оценка пока недоступна": {ru:"Оценка пока недоступна",uk:"Оцінка наразі недоступна",en:"Estimate unavailable",pl:"Wycena jest niedostępna"},
  "Не удалось подключиться к базе объявлений.": {ru:"Не удалось подключиться к базе объявлений.",uk:"Не вдалося підключитися до бази оголошень.",en:"Could not connect to the listings database.",pl:"Nie udało się połączyć z bazą ogłoszeń."},
  "Пока недостаточно данных для оценки": {ru:"Пока недостаточно данных для оценки",uk:"Поки недостатньо даних для оцінки",en:"Not enough data to estimate yet",pl:"Na razie za mało danych do wyceny"},
  "В базе пока нет достаточно похожих объявлений. Не будем придумывать цену.": {ru:"В базе пока нет достаточно похожих объявлений. Не будем придумывать цену.",uk:"У базі поки недостатньо схожих оголошень. Не будемо вигадувати ціну.",en:"There are not enough similar listings in the database. We won't invent a price.",pl:"W bazie jest za mało podobnych ogłoszeń. Nie będziemy wymyślać ceny."},
  "Войдите или зарегистрируйтесь, чтобы получить более точную рыночную оценку и продолжить заполнение объявления.": {ru:"Войдите или зарегистрируйтесь, чтобы получить более точную рыночную оценку и продолжить заполнение объявления.",uk:"Увійдіть або зареєструйтеся, щоб отримати точнішу ринкову оцінку та продовжити заповнення оголошення.",en:"Sign in or register to get a more accurate market estimate and continue creating your listing.",pl:"Zaloguj się lub zarejestruj, aby uzyskać dokładniejszą wycenę rynkową i kontynuować tworzenie ogłoszenia."},
  "Не удалось получить сопоставимые объявления.": {ru:"Не удалось получить сопоставимые объявления.",uk:"Не вдалося отримати порівнювані оголошення.",en:"Could not retrieve comparable listings.",pl:"Nie udało się pobrać porównywalnych ogłoszeń."}
};
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
  const count = Math.max(0, Number(button.dataset.loadingCount) || 0);

  if (loading) {
    // Preserve the original state once; nested callers must not overwrite it.
    if (count === 0) {
      button.dataset.originalHtml = button.innerHTML;
      button.dataset.originalDisabled = String(button.disabled);
      button.dataset.loadingCount = "1";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.classList.add("is-loading");
      button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${loadingText ? `<span>${escapeHtml(loadingText)}</span>` : ""}`;
    } else {
      button.dataset.loadingCount = String(count + 1);
    }
    return;
  }

  if (count > 1) {
    button.dataset.loadingCount = String(count - 1);
    return;
  }
  if (count === 0 && button.dataset.originalHtml === undefined) return;

  button.removeAttribute("aria-busy");
  button.classList.remove("is-loading");
  if (button.dataset.originalHtml !== undefined) {
    button.innerHTML = button.dataset.originalHtml;
    delete button.dataset.originalHtml;
  }
  button.disabled = button.dataset.originalDisabled === "true";
  delete button.dataset.originalDisabled;
  delete button.dataset.loadingCount;
}

const listing = document.getElementById("listing");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogCitySearchInput = document.getElementById("catalogCitySearchInput");
const catalogCitySuggestions = document.getElementById("catalogCitySuggestions");
const catalogRegionSelect = document.getElementById("catalogRegionSelect");
const vehicleSearchCityInput = document.getElementById("vehicleSearchCity");
const vehicleSearchCitySuggestions = document.getElementById("vehicleSearchCitySuggestions");
const vehicleSearchRegionSelect = document.getElementById("vehicleSearchRegion");
const cityRegionSelect = document.getElementById("cityRegionSelect");
const citySearchInput = document.getElementById("citySearchInput");
const citySuggestions = document.getElementById("citySuggestions");
const citySelect = document.getElementById("citySelect");
let availableCities = [];
let citySearchIndex = [];
let citiesLoadPromise = null;
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
    return `<span class="listing-photo-wrap"><img class="listing-photo" tabindex="0" role="button" src="${escapeHtml(url)}" alt="${escapeHtml(item.title)}" loading="lazy"><span class="photo-watermark" aria-hidden="true"><span>HRYVNIA</span><span>HUB</span></span></span>`;
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
function closeAuthModal() {
  authModal?.classList.add("hidden");
  // If the visitor closes auth without signing in, keep the form but cancel auto-publish.
  if (typeof pendingListingPublish !== "undefined" && pendingListingPublish && !currentUser) {
    pendingListingPublish = false;
  }
}

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
const ACCOUNT_MENU_TEXT = {
  ru: { profile:"Мой профиль", listings:"Мои объявления", favorites:"Избранное", messages:"Сообщения", settings:"Настройки", security:"Безопасность аккаунта", signOut:"Выйти из аккаунта", back:"← Назад в меню", profileTitle:"Мой профиль", displayName:"Имя или название организации", username:"Никнейм", profileHint:"Укажите имя, псевдоним или название компании — как вас будут видеть другие пользователи.", saveProfile:"Сохранить профиль", profileSaved:"Профиль сохранён.", profileSaveError:"Не удалось сохранить профиль.", email:"Электронная почта", userId:"ID аккаунта", settingsTitle:"Настройки", settingsNote:"Дополнительные настройки будут добавляться постепенно. Язык интерфейса уже переключается в верхней панели.", securityTitle:"Безопасность аккаунта", newPassword:"Новый пароль", confirmPassword:"Подтвердите новый пароль", save:"Сохранить пароль", passwordSaved:"Пароль успешно изменён.", passwordMismatch:"Пароли не совпадают.", passwordShort:"Пароль должен содержать не менее 6 символов.", listingsEmpty:"У вас пока нет объявлений.", loading:"Загрузка…", error:"Не удалось загрузить данные." },
  uk: { profile:"Мій профіль", listings:"Мої оголошення", favorites:"Обране", messages:"Повідомлення", settings:"Налаштування", security:"Безпека облікового запису", signOut:"Вийти з облікового запису", back:"← Назад до меню", profileTitle:"Мій профіль", displayName:"Ім’я або назва організації", username:"Нікнейм", profileHint:"Вкажіть ім’я, псевдонім або назву компанії — так вас бачитимуть інші користувачі.", saveProfile:"Зберегти профіль", profileSaved:"Профіль збережено.", profileSaveError:"Не вдалося зберегти профіль.", email:"Електронна пошта", userId:"ID облікового запису", settingsTitle:"Налаштування", settingsNote:"Додаткові налаштування додаватимемо поступово. Мова інтерфейсу вже перемикається у верхній панелі.", securityTitle:"Безпека облікового запису", newPassword:"Новий пароль", confirmPassword:"Підтвердьте новий пароль", save:"Зберегти пароль", passwordSaved:"Пароль успішно змінено.", passwordMismatch:"Паролі не збігаються.", passwordShort:"Пароль має містити щонайменше 6 символів.", listingsEmpty:"У вас поки немає оголошень.", loading:"Завантаження…", error:"Не вдалося завантажити дані." },
  en: { profile:"My profile", listings:"My listings", favorites:"Favorites", messages:"Messages", settings:"Settings", security:"Account security", signOut:"Sign out", back:"← Back to menu", profileTitle:"My profile", displayName:"Name or organization", username:"Username", profileHint:"Enter your name, nickname, or company name as other users will see it.", saveProfile:"Save profile", profileSaved:"Profile saved.", profileSaveError:"Could not save profile.", email:"Email", userId:"Account ID", settingsTitle:"Settings", settingsNote:"More settings will be added gradually. The interface language can already be changed from the top bar.", securityTitle:"Account security", newPassword:"New password", confirmPassword:"Confirm new password", save:"Save password", passwordSaved:"Password changed successfully.", passwordMismatch:"Passwords do not match.", passwordShort:"Password must be at least 6 characters.", listingsEmpty:"You have no listings yet.", loading:"Loading…", error:"Could not load data." },
  pl: { profile:"Mój profil", listings:"Moje ogłoszenia", favorites:"Ulubione", messages:"Wiadomości", settings:"Ustawienia", security:"Bezpieczeństwo konta", signOut:"Wyloguj się", back:"← Wróć do menu", profileTitle:"Mój profil", displayName:"Imię lub nazwa organizacji", username:"Pseudonim", profileHint:"Podaj imię, pseudonim lub nazwę firmy widoczną dla innych użytkowników.", saveProfile:"Zapisz profil", profileSaved:"Profil został zapisany.", profileSaveError:"Nie udało się zapisać profilu.", email:"E-mail", userId:"ID konta", settingsTitle:"Ustawienia", settingsNote:"Dodatkowe ustawienia będziemy dodawać stopniowo. Język interfejsu można już zmienić na górnym pasku.", securityTitle:"Bezpieczeństwo konta", newPassword:"Nowe hasło", confirmPassword:"Potwierdź nowe hasło", save:"Zapisz hasło", passwordSaved:"Hasło zostało zmienione.", passwordMismatch:"Hasła nie są zgodne.", passwordShort:"Hasło musi mieć co najmniej 6 znaków.", listingsEmpty:"Nie masz jeszcze ogłoszeń.", loading:"Ładowanie…", error:"Nie udało się wczytać danych." }
};
function accountMenuText(key) { return (ACCOUNT_MENU_TEXT[lang] || ACCOUNT_MENU_TEXT.uk)[key] || key; }

let accountMenuRoot = null;
function ensureAccountMenuUI() {
  if (!authLoggedIn || accountMenuRoot) return;
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
      if (vehicleMarketPanel && !vehicleMarketPanel.hidden && listingCategorySelect?.value === "Автомобили") {
        if (vehicleMarketAuthPrompt) vehicleMarketAuthPrompt.hidden = true;
        closeAuthModal();
        setVehicleAdvancedFields(true);
      }
      if (pendingListingPublish && addForm) {
        pendingListingPublish = false;
        closeAuthModal();
        setTimeout(() => addForm.requestSubmit(), 0);
      }
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
let pendingListingPublish = false;
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
  // Preserve the original colors; optimize size without artificial brightness or saturation changes.
  ctx.drawImage(img, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, COMPRESS_MIME, COMPRESS_QUALITY);
  let mime = COMPRESS_MIME;
  if (!blob) {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
    mime = "image/jpeg";
  }
  if (!blob) return { blob: file, mime: file.type, width, height, compressed: false, undecodable: false };
  // If no resizing was needed and WebP is not smaller, keep the original instead of making it heavier.
  if (ratio === 1 && blob.size >= file.size) {
    return { blob: file, mime: file.type, width, height, compressed: false, undecodable: false };
  }
  return { blob, mime, width, height, compressed: true, undecodable: false };
}

async function uploadListingPhotos(photosToUpload = selectedPhotos) {
  const { error: schemaError } = await db.from("listings").select("image_urls").limit(0);
  if (schemaError) throw new Error(photoText("setup"));
  const bucket = db.storage.from(PHOTO_BUCKET);
  const urls = [];
  for (const photo of photosToUpload) {
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
  const next = wasFav ? list.filter(value => value !== key) : [...list, key];

  saveLocalFavorites(next);
  updateFavoriteButtons(key, !wasFav);

  if (db && currentUser) {
    const userId = currentUser.id;
    const request = wasFav
      ? db.from("favorites").delete().eq("user_id", userId).eq("listing_id", key)
      : db.from("favorites").upsert(
          { user_id: userId, listing_id: key },
          { onConflict: "user_id,listing_id", ignoreDuplicates: true }
        );

    request.then(({ error }) => {
      if (error) {
        console.warn("favorite update:", error.message);
        // Restore the local state and button appearance if the database operation failed.
        const current = getLocalFavorites();
        const restored = wasFav
          ? [...new Set([...current, key])]
          : current.filter(value => value !== key);
        saveLocalFavorites(restored);
        updateFavoriteButtons(key, wasFav);
      }
    }).catch(error => {
      console.warn("favorite update:", error?.message || error);
    });
  }
}

function updateFavoriteButtons(key, active) {
  document.querySelectorAll(`.fav-btn[data-fav-id="${CSS.escape(key)}"]`).forEach(btn => {
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
    btn.setAttribute("aria-label", active ? t("Убрать из избранного") : t("В избранное"));
    const span = btn.querySelector("span");
    if (span) span.textContent = active ? "♥" : "♡";
  });
}

async function syncFavoritesOnLogin() {
  if (!db || !currentUser) return;

  const userId = currentUser.id;
  const local = getLocalFavorites();

  try {
    const { data, error } = await db.from("favorites")
      .select("listing_id")
      .eq("user_id", userId);

    if (error) throw error;

    const remote = (data || []).map(row => String(row.listing_id));
    const merged = [...new Set([...local, ...remote])];
    saveLocalFavorites(merged);

    const remoteSet = new Set(remote);
    const toUpload = merged
      .filter(id => !remoteSet.has(String(id)))
      .map(listing_id => ({ user_id: userId, listing_id }));

    if (toUpload.length) {
      const { error: upsertError } = await db.from("favorites")
        .upsert(toUpload, { onConflict: "user_id,listing_id", ignoreDuplicates: true });
      if (upsertError) throw upsertError;
    }
  } catch (error) {
    console.warn("syncFavorites:", error?.message || error);
  }
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

let unreadIndicatorRequest = null;
async function updateUnreadMessageIndicators() {
  if (!db || !currentUser) {
    const badge = document.getElementById("messagesBadge");
    if (badge) { badge.hidden = true; badge.textContent = ""; }
    return;
  }
  if (unreadIndicatorRequest) return unreadIndicatorRequest;

  unreadIndicatorRequest = (async () => {
    const badge = document.getElementById("messagesBadge");
    try {
      // One database call replaces the previous per-conversation count queries.
      const { data, error } = await db.rpc("get_unread_messages_count");
      if (error) throw error;
      const unread = Math.max(0, Number(data) || 0);
      if (!badge) return;
      badge.textContent = unread > 99 ? "99+" : String(unread);
      badge.hidden = unread === 0;
      if (unread > 0) badge.setAttribute("aria-label", `${unread} unread messages`);
      else badge.removeAttribute("aria-label");
    } catch (error) {
      // Preserve the last known badge instead of hiding it because of a transient request failure.
      console.warn("Could not refresh unread message indicator:", error.message);
    }
  })();

  try { await unreadIndicatorRequest; }
  finally { unreadIndicatorRequest = null; }
}

function openMessagesModal() {
  messagesModal?.classList.remove("hidden");
  messagesModal?.querySelector(".messages-card")?.classList.remove("is-thread-open");
  renderMessagesModal();
}
function closeMessagesModal() {
  messagesModal?.classList.add("hidden");
  messagesModal?.querySelector(".messages-card")?.classList.remove("is-thread-open");
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
// Realtime handles normal updates; this visible-tab poll is a fallback only.
setInterval(() => {
  if (currentUser && db && !document.hidden) updateUnreadMessageIndicators();
}, 60000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentUser && db) updateUnreadMessageIndicators();
});
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
  const { data, error } = await db.rpc("get_conversation_summaries");
  if (error) {
    conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`;
    return;
  }
  if (!data?.length) {
    conversationsList.innerHTML = `<div class="messages-empty"><span class="messages-empty-icon" aria-hidden="true">✉</span><p class="muted">${escapeHtml(t("Сообщений пока нет."))}</p></div>`;
    return;
  }

  const locale = ({ ru:"ru-RU", uk:"uk-UA", en:"en-GB", pl:"pl-PL" })[lang] || "uk-UA";

  // Resolve each conversation to its listing cover without changing the RPC.
  // If either lookup is unavailable, the existing category/message icon remains.
  const conversationIds = data.map(c => c.conversation_id).filter(Boolean);
  let listingByConversation = {};
  if (conversationIds.length) {
    const { data: links, error: linksError } = await db.from("conversations")
      .select("id, listing_id")
      .in("id", conversationIds);
    if (!linksError && links?.length) {
      const listingIds = [...new Set(links.map(x => x.listing_id).filter(Boolean))];
      if (listingIds.length) {
        const { data: listingRows, error: listingsError } = await db.from("listings")
          .select("id, image_url, image_urls")
          .in("id", listingIds);
        if (!listingsError && listingRows?.length) {
          const listingMap = new Map(listingRows.map(item => {
            const urls = [item.image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])]
              .filter(url => typeof url === "string" && /^https?:\/\//i.test(url));
            return [String(item.id), urls[0] || ""];
          }));
          for (const link of links) listingByConversation[String(link.id)] = listingMap.get(String(link.listing_id)) || "";
        }
      }
    }
  }

  const cards = data.map(c => {
    const when = c.last_message_at || c.updated_at;
    let timeLabel = "";
    if (when) {
      const d = new Date(when);
      if (!Number.isNaN(d.getTime())) {
        const sameDay = d.toDateString() === new Date().toDateString();
        try {
          timeLabel = sameDay
            ? d.toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" })
            : d.toLocaleDateString(locale, { day:"2-digit", month:"2-digit" });
        } catch { timeLabel = ""; }
      }
    }
    const unreadCount = Math.max(0, Number(c.unread_count) || 0);
    return {
      id: c.conversation_id,
      title: c.title || t("Объявление"),
      preview: c.preview || "",
      timeLabel,
      unreadCount,
      imageUrl: listingByConversation[String(c.conversation_id)] || "",
    };
  });

  conversationsList.innerHTML = cards.map(c => `
    <button type="button" class="conversation-card ${c.unreadCount > 0 ? "is-unread" : ""}" data-conv-id="${escapeHtml(String(c.id))}" aria-label="${escapeHtml(c.title)}">
      ${c.imageUrl ? `<img class="conv-thumb" src="${escapeHtml(c.imageUrl)}" alt="" loading="lazy">` : `<span class="conv-icon" aria-hidden="true">✉</span>`}
      <span class="conv-main"><span class="conv-title">${escapeHtml(c.title)}</span><span class="conv-last">${escapeHtml(c.preview || "—")}</span></span>
      <span class="conv-side"><span class="conv-time">${escapeHtml(c.timeLabel)}</span>${c.unreadCount > 0 ? `<span class="conv-unread">${c.unreadCount > 99 ? "99+" : c.unreadCount}</span>` : ""}</span>
    </button>`).join("");
}

conversationsList?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-conv-id]");
  if (!btn) return;
  openConversation(btn.dataset.convId);
});
async function markConversationRead(id) {
  if (!db || !currentUser || !id || currentConversation !== id || messagesModal?.classList.contains("hidden")) return false;
  const { error } = await db.from("conversation_reads").upsert(
    { user_id:currentUser.id, conversation_id:id, last_read_at:new Date().toISOString() },
    { onConflict:"user_id,conversation_id" }
  );
  if (error) {
    console.warn("Could not mark conversation read:", error.message);
    return false;
  }
  await updateUnreadMessageIndicators();
  return true;
}
async function openConversation(id) {
  if (!db || !currentUser) return;
  messagesModal?.querySelector(".messages-card")?.classList.add("is-thread-open");
  currentConversation = id;
  renderedMessageIds.clear();
  conversationsList?.classList.add("hidden");
  messagesThread?.classList.remove("hidden");
  const loaded = await loadThread(id);
  // Do not mark messages as read unless the thread was loaded successfully.
  if (loaded && currentConversation === id) await markConversationRead(id);
  subscribeToThread(id);
}
async function loadThread(id) {
  if (!threadMessages || !db) return false;
  threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Загрузка…"))}</p>`;
  const { data, error } = await db.from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (error) {
    threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`;
    return false;
  }
  // Ignore stale results if the user switched to another conversation while loading.
  if (currentConversation !== id) return false;
  threadMessages.innerHTML = "";
  renderedMessageIds.clear();
  if (!data || !data.length) {
    threadMessages.innerHTML = `<p class="muted">${escapeHtml(t("Сообщений пока нет."))}</p>`;
    return true;
  }
  data.forEach(m => appendMessageBubble(m));
  threadMessages.scrollTop = threadMessages.scrollHeight;
  return true;
}
function appendMessageBubble(m) {
  if (!threadMessages || renderedMessageIds.has(m.id)) return;
  renderedMessageIds.add(m.id);
  const placeholder = threadMessages.querySelector(".muted");
  if (placeholder) placeholder.remove();

  const locale = ({ ru:"ru-RU", uk:"uk-UA", en:"en-GB", pl:"pl-PL" })[lang] || "uk-UA";
  const date = m.created_at ? new Date(m.created_at) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const dateKey = validDate ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : "unknown";
  const previousBubble = [...threadMessages.querySelectorAll(".bubble[data-date-key]")].at(-1);
  if (validDate && previousBubble?.dataset.dateKey !== dateKey) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const dayLabel = isToday
      ? ({ ru:"Сегодня", uk:"Сьогодні", en:"Today", pl:"Dzisiaj" })[lang]
      : isYesterday
        ? ({ ru:"Вчера", uk:"Учора", en:"Yesterday", pl:"Wczoraj" })[lang]
        : date.toLocaleDateString(locale, { day:"numeric", month:"long", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
    const divider = document.createElement("div");
    divider.className = "message-day-divider";
    divider.textContent = dayLabel;
    divider.dataset.dateKey = dateKey;
    threadMessages.appendChild(divider);
  }

  const mine = String(m.sender_id || "") === String(currentUser?.id || "");
  const el = document.createElement("div");
  el.className = `bubble ${mine ? "bubble-mine" : "bubble-theirs"}`;
  el.dataset.senderType = mine ? "mine" : "theirs";
  el.dataset.dateKey = dateKey;

  Object.assign(el.style, {
    display: "block",
    boxSizing: "border-box",
    width: "fit-content",
    maxWidth: "82%",
    padding: "8px 12px 6px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    alignSelf: mine ? "flex-end" : "flex-start",
    marginLeft: mine ? "auto" : "0",
    marginRight: mine ? "0" : "auto",
    background: mine ? "var(--accent, #d4ff00)" : "#ffffff",
    color: mine ? "#17210a" : "var(--text, #26332b)",
    border: mine ? "1px solid transparent" : "1px solid #cbd7c9",
    borderBottomRightRadius: mine ? "4px" : "14px",
    borderBottomLeftRadius: mine ? "14px" : "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,.06)"
  });

  const senderLabel = document.createElement("div");
  senderLabel.textContent = mine ? t("Вы") : t("Собеседник");
  Object.assign(senderLabel.style, { fontSize:"10px", fontWeight:"700", opacity:".72", marginBottom:"3px" });
  const messageText = document.createElement("div");
  messageText.textContent = String(m.body ?? "");
  el.append(senderLabel, messageText);

  if (validDate) {
    const timestamp = document.createElement("time");
    timestamp.className = "bubble-time";
    timestamp.dateTime = date.toISOString();
    timestamp.textContent = date.toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" });
    el.appendChild(timestamp);
  }
  threadMessages.appendChild(el);
}

function subscribeToThread(id) {
  if (!db) return;
  if (messagesChannel) { try { db.removeChannel(messagesChannel); } catch {} }
  messagesChannel = db.channel(`messages:${id}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, async (payload) => {
      // A delayed realtime event from an old thread must not affect the current thread.
      if (!payload.new || currentConversation !== id || messagesModal?.classList.contains("hidden")) return;
      appendMessageBubble(payload.new);
      if (threadMessages) threadMessages.scrollTop = threadMessages.scrollHeight;
      // The user is actively viewing this conversation, so mark the incoming message read.
      if (String(payload.new.sender_id || "") !== String(currentUser?.id || "")) {
        await markConversationRead(id);
      }
    })
    .subscribe();
}
function getSendMessageStatusElement() {
  if (!sendMessageForm) return null;
  let status = sendMessageForm.querySelector("[data-send-message-status]");
  if (!status) {
    status = document.createElement("p");
    status.className = "form-message";
    status.dataset.sendMessageStatus = "true";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    sendMessageForm.appendChild(status);
  }
  return status;
}
function showSendMessageStatus(kind, message = "") {
  const status = getSendMessageStatusElement();
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", kind === "error");
  status.classList.toggle("success", kind === "success");
  status.hidden = !message;
}
function sendMessageErrorText() {
  return ({
    ru: "Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.",
    uk: "Не вдалося надіслати повідомлення. Перевірте з’єднання та спробуйте ще раз.",
    en: "Could not send the message. Check your connection and try again.",
    pl: "Nie udało się wysłać wiadomości. Sprawdź połączenie i spróbuj ponownie."
  })[lang] || "Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.";
}

sendMessageForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!db || !currentUser || !currentConversation) {
    showSendMessageStatus("error", sendMessageErrorText());
    return;
  }
  const body = String(sendMessageForm.elements.body.value || "").trim();
  if (!body) return;
  showSendMessageStatus("");
  const btn = sendMessageForm.querySelector("button[type='submit']");
  setButtonLoading(btn, true);
  const conversationId = currentConversation;
  try {
    const { data: insertedMessage, error } = await db.from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUser.id, body })
      .select("id")
      .single();
    if (error) throw error;
    sendMessageForm.reset();
    showSendMessageStatus("");
    const { error: conversationError } = await db.from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
    if (conversationError) console.warn("Could not update conversation timestamp:", conversationError.message);
    // The server validates the participants and enforces the 12-hour email cooldown.
    void db.functions.invoke("notify-new-message", {
      body: { conversation_id: conversationId, message_id: insertedMessage.id }
    }).then(({ error: notificationError }) => {
      if (notificationError) console.warn("Email notification was not sent:", notificationError.message);
    }).catch(error => console.warn("Email notification was not sent:", error.message));
    await updateUnreadMessageIndicators();
  } catch (error) {
    console.warn("send message:", error?.message || error);
    const detail = String(error?.message || "").trim();
    showSendMessageStatus("error", detail ? `${sendMessageErrorText()} (${detail})` : sendMessageErrorText());
  } finally {
    setButtonLoading(btn, false);
  }
});
backToConvs?.addEventListener("click", () => {
  messagesModal?.querySelector(".messages-card")?.classList.remove("is-thread-open");
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
  if (!item?.user_id) { alert(t("У объявления нет автора.")); return; }
  if (String(item.user_id) === String(currentUser.id)) { alert(t("Это ваше объявление.")); return; }
  if (!db) { showAiCategoryPrompt(t("Не вдалося підключитися до сервера. Перевірте з’єднання та спробуйте ще раз."), "AI Deal Finder"); return; }

  try {
    // First try to reuse the existing conversation.
    const existing = await db.from("conversations")
      .select("id")
      .eq("listing_id", item.id)
      .eq("buyer_id", currentUser.id)
      .maybeSingle();

    if (existing.error) throw existing.error;
    let convId = existing.data?.id;

    if (!convId) {
      // The unique constraint on (listing_id, buyer_id) protects against races.
      const ins = await db.from("conversations")
        .insert({
          listing_id: item.id,
          buyer_id: currentUser.id,
          seller_id: item.user_id
        })
        .select("id")
        .single();

      if (ins.error) {
        // If another request created the conversation first, fetch and reuse it.
        const retry = await db.from("conversations")
          .select("id")
          .eq("listing_id", item.id)
          .eq("buyer_id", currentUser.id)
          .maybeSingle();

        if (retry.error || !retry.data?.id) throw ins.error;
        convId = retry.data.id;
      } else {
        convId = ins.data.id;
      }
    }

    openMessagesModal();
    await new Promise(resolve => setTimeout(resolve, 60));
    await openConversation(convId);
  } catch (error) {
    console.error("startConversation:", error);
    alert(t("Ошибка") + ": " + (error?.message || t("Не удалось открыть переписку.")));
  }
}

document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.addEventListener("click", () => {
    const nav = btn.dataset.nav;
    document.querySelectorAll("[data-nav]").forEach(b => b.classList.toggle("active", b === btn));
    if (nav === "home") {
      if (currentCategory === "Автомобили") {
        ensureVehicleSearchTabs();
        captureVehicleSearchTab();
        openVehicleSearch();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    else if (nav === "favorites") openFavoritesModal();
    else if (nav === "messages") openMessagesModal();
  });
});
function showAiCategoryPrompt(message, title = "AI Deal Finder") {
  document.querySelector(".hh-ai-prompt-backdrop")?.remove();
  const anchor = document.querySelector("#aiSearchBtn") || document.querySelector(".ai-panel");
  const rect = anchor?.getBoundingClientRect();
  const backdrop = document.createElement("div");
  backdrop.className = "hh-ai-prompt-backdrop";
  backdrop.innerHTML = `<section class="hh-ai-prompt" role="dialog" aria-modal="false" aria-labelledby="hhAiPromptTitle"><button class="hh-ai-prompt-close" type="button" aria-label="Close">×</button><div class="hh-ai-prompt-badge" aria-hidden="true">AI</div><h3 id="hhAiPromptTitle">${escapeHtml(t(title))}</h3><p>${escapeHtml(message)}</p><button class="hh-ai-prompt-ok" type="button">${escapeHtml(t("Зрозуміло"))}</button></section>`;
  const panel = backdrop.querySelector(".hh-ai-prompt");
  // Keep the branded message beside the AI panel when space allows; never scroll to the page footer.
  if (rect && window.innerWidth > 700) {
    panel.style.position = "fixed";
    panel.style.left = `${Math.max(16, Math.min(rect.left, window.innerWidth - 376))}px`;
    panel.style.top = `${Math.max(80, Math.min(rect.bottom + 10, window.innerHeight - 260))}px`;
  }
  const close = () => backdrop.remove();
  backdrop.addEventListener("click", event => { if (event.target === backdrop || event.target.closest("button")) close(); });
  const onEscape = event => { if (event.key === "Escape") { close(); document.removeEventListener("keydown", onEscape); } };
  document.addEventListener("keydown", onEscape);
  document.body.appendChild(backdrop);
  backdrop.querySelector(".hh-ai-prompt-ok")?.focus({ preventScroll: true });
}

const aiSearchBtn = document.getElementById("aiSearchBtn");
async function runAiSearch() {
  if (!db) { showAiCategoryPrompt(t("Не вдалося підключитися до сервера. Перевірте з’єднання та спробуйте ще раз."), "AI Deal Finder"); return; }
  if (!aiSearchBtn) return;
  if (!currentCategory) {
    const categoryPrompt = ({
      ru: "Сначала выберите категорию: автомобили, недвижимость, готовый бизнес или инвестиции.",
      uk: "Спочатку виберіть категорію: автомобілі, нерухомість, готовий бізнес або інвестиції.",
      en: "Please select a category first: automobiles, real estate, ready businesses, or investments.",
      pl: "Najpierw wybierz kategorię: samochody, nieruchomości, gotowe firmy lub inwestycje."
    })[lang] || "Сначала выберите категорию.";
    showAiCategoryPrompt(categoryPrompt);
    return;
  }
  setButtonLoading(aiSearchBtn, true, t("Поиск лучших предложений…"));
  try {
    let query = db.from("listings").select("*, cities!inner(name_ru, name_uk, name_en, name_pl, region_katottg_code)");
    if (currentCategory) query = query.eq("category", currentCategory);
    if (selectedCatalogCityId) query = query.eq("city_id", selectedCatalogCityId);
    else if (activeRegionCode) query = query.eq("cities.region_katottg_code", activeRegionCode);
    const { data, error } = await query;
    if (error) { showAiCategoryPrompt(t("Не вдалося завантажити пропозиції. Перевірте інтернет і спробуйте ще раз."), "AI Deal Finder"); return; }
    const items = data || [];
    if (!items.length) { showAiCategoryPrompt(t("Поки що немає достатньо оголошень у цій категорії для підбору. Спробуйте пізніше або змініть фільтри."), "AI Deal Finder"); return; }
    const prices = items.map(x => Number(x.price)).filter(Number.isFinite).sort((a, b) => a - b);
    if (!prices.length) { showAiCategoryPrompt(t("Для цієї категорії поки недостатньо цінових даних для порівняння."), "AI Deal Finder"); return; }
    const median = prices[Math.floor(prices.length / 2)];
    const threshold = median * 0.85;
    const belowMedian = items.filter(x => Number(x.price) < threshold);
    if (!belowMedian.length) { showAiCategoryPrompt(t("Зараз не знайдено оголошень, які помітно дешевші за типову ціну. Спробуйте пізніше."), "AI Deal Finder"); return; }
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
function setTickerValue(key, display, numeric, comparisonKey = key, digits = 2, arrowOnly = false) {
  const el = document.querySelector(`[data-ticker="${key}"]`);
  if (el) el.textContent = display;
  const arrow = document.querySelector(`[data-ticker-arrow="${key}"]`);
  const change = document.querySelector(`[data-ticker-change="${key}"]`);
  const badge = change?.closest(".ticker-change-badge");
  if (arrow) { arrow.className = "ticker-arrow"; arrow.textContent = ""; }
  if (change) { change.className = "ticker-change"; change.textContent = ""; }
  if (badge) { badge.classList.remove("up", "down", "flat"); badge.classList.add("is-empty"); }
  if (!Number.isFinite(numeric)) return;

  const prev = loadTickerPrev();
  const prevVal = Number(prev[comparisonKey]);
  if (Number.isFinite(prevVal) && prevVal !== 0) {
    const delta = numeric - prevVal;
    if (delta > 0) {
      if (arrow) { arrow.textContent = "▲"; arrow.classList.add("up"); }
      if (change && !arrowOnly) { change.textContent = `+${formatTickerNumber(Math.abs(delta), digits)}`; change.classList.add("up"); }
      if (badge) { badge.classList.remove("is-empty"); badge.classList.add("up"); }
    } else if (delta < 0) {
      if (arrow) { arrow.textContent = "▼"; arrow.classList.add("down"); }
      if (change && !arrowOnly) { change.textContent = `−${formatTickerNumber(Math.abs(delta), digits)}`; change.classList.add("down"); }
      if (badge) { badge.classList.remove("is-empty"); badge.classList.add("down"); }
    } else {
      if (change && !arrowOnly) { change.textContent = formatTickerNumber(0, digits); change.classList.add("flat"); }
      if (badge && !arrowOnly) { badge.classList.remove("is-empty"); badge.classList.add("flat"); }
    }
  }
  prev[comparisonKey] = numeric;
  saveTickerPrev(prev);
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
const TICKER_CACHE_PREFIX = "hryvniaHubQuoteCache:";
async function fetchCachedQuote(url, ttlMs) {
  const key = TICKER_CACHE_PREFIX + url;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (cached && cached.savedAt && Date.now() - cached.savedAt < ttlMs && cached.data) return cached.data;
  } catch {}
  const data = await fetchJsonWithFallback(url);
  try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
  return data;
}
const FIAT_QUOTE_TTL = 12 * 60 * 60 * 1000;
const LIVE_ASSET_QUOTE_TTL = 60 * 60 * 1000;
function tickerBaseCurrency() { return lang === "pl" ? "PLN" : lang === "en" ? "USD" : "UAH"; }
function tickerDate(dateValue) {
  if (!dateValue) return "";
  const raw = String(dateValue).trim();
  // The NBU API commonly returns dates as DD.MM.YYYY; parse that format explicitly.
  const nbuDate = raw.match(/^(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})$/);
  const parsed = nbuDate
    ? new Date(Number(nbuDate[3]), Number(nbuDate[2]) - 1, Number(nbuDate[1]))
    : new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
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
  const tickerSubtitles = {
    uk: { usd: "Долар США", pln: "Злотий", btc: "Біткоїн", xau: "Золото (за тройську унцію)" },
    ru: { usd: "Доллар США", pln: "Злотый", btc: "Биткоин", xau: "Золото (за тройскую унцию)" },
    en: { usd: "US Dollar", pln: "Polish Zloty", btc: "Bitcoin", xau: "Gold (per troy ounce)" },
    pl: { usd: "Dolar amerykański", pln: "Złoty", btc: "Bitcoin", xau: "Złoto (za uncję trojańską)" }
  };
  for (const key of ["usd", "pln", "btc", "xau"]) tickerSetText("subtitle", key, (tickerSubtitles[lang] || tickerSubtitles.uk)[key]);
  tickerSetText("icon", "usd", icons.usd);
  tickerSetText("icon", "pln", icons.pln);


  try {
    const [usdResult, plnResult, btcResult, xauResult] = await Promise.allSettled([
      fetchCachedQuote("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json", FIAT_QUOTE_TTL),
      fetchCachedQuote("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=PLN&json", FIAT_QUOTE_TTL),
      fetchCachedQuote("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah", LIVE_ASSET_QUOTE_TTL),
      fetchCachedQuote("https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd", LIVE_ASSET_QUOTE_TTL)
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

    const rates = base === "UAH"
      ? { usd: usdUah, pln: plnUah, btc: btcUah, xau: Number.isFinite(xauUsd) ? xauUsd * usdUah : NaN }
      : base === "PLN"
        ? { usd: usdUah / plnUah, pln: 1 / plnUah, btc: btcUah / plnUah, xau: Number.isFinite(xauUsd) ? xauUsd * usdUah / plnUah : NaN }
        : { usd: plnUah / usdUah, pln: 1 / usdUah, btc: btcUah / usdUah, xau: Number.isFinite(xauUsd) ? xauUsd : NaN };

    const date = tickerDate(usdRow?.exchangedate || plnRow?.exchangedate);
    const sourceDate = date || (lang === "pl" ? "data NBP" : lang === "en" ? "NBU rate" : "курс НБУ");
    const assetDate = tickerDate(new Date());

    setTickerValue("usd", formatTickerNumber(rates.usd, 2), rates.usd, pairs[base].usd, 2);
    setTickerValue("pln", formatTickerNumber(rates.pln, base === "USD" ? 4 : 2), rates.pln, pairs[base].pln, base === "USD" ? 4 : 2);

    if (Number.isFinite(btcUah) && btcUah > 0) {
      setTickerValue("btc", formatTickerNumber(rates.btc, 0), rates.btc, pairs[base].btc, 0, true);
      tickerSetText("source", "btc", `CoinGecko · ${assetDate}`);
    } else {
      setTickerValue("btc", unavailable(), null);
      tickerSetText("source", "btc", "");
    }

    if (Number.isFinite(rates.xau) && rates.xau > 0) {
      const digits = base === "USD" ? 2 : 0;
      setTickerValue("xau", formatTickerNumber(rates.xau, digits), rates.xau, pairs[base].xau, digits, true);
      tickerSetText("source", "xau", `CoinGecko · ${assetDate}`);
    } else {
      setTickerValue("xau", unavailable(), null);
      tickerSetText("source", "xau", "");
    }

    tickerSetText("source", "usd", `${lang === "pl" ? "NBP" : "НБУ"} · ${sourceDate}`);
    tickerSetText("source", "pln", `${lang === "pl" ? "NBP" : "НБУ"} · ${sourceDate}`);
    if (note) note.textContent = "";
  } catch (error) {
    console.warn("Currency ticker unavailable:", error);
    if (listingRates) {
      const rates = base === "UAH"
        ? { usd: listingRates.usdUah, pln: listingRates.plnUah }
        : base === "PLN"
          ? { usd: listingRates.usdUah / listingRates.plnUah, pln: 1 / listingRates.plnUah }
          : { usd: listingRates.plnUah / listingRates.usdUah, pln: 1 / listingRates.usdUah };
      setTickerValue("usd", formatTickerNumber(rates.usd, 2), rates.usd, pairs[base].usd, 2);
      setTickerValue("pln", formatTickerNumber(rates.pln, base === "USD" ? 4 : 2), rates.pln, pairs[base].pln, base === "USD" ? 4 : 2);
      tickerSetText("source", "usd", `${lang === "pl" ? "NBP" : lang === "en" ? "NBU" : "НБУ"} · ${tickerDate(listingRates.rateDate) || (lang === "pl" ? "ostatni kurs" : lang === "en" ? "last rate" : "останній курс")}`);
      tickerSetText("source", "pln", `${lang === "pl" ? "NBP" : lang === "en" ? "NBU" : "НБУ"} · ${tickerDate(listingRates.rateDate) || (lang === "pl" ? "ostatni kurs" : lang === "en" ? "last rate" : "останній курс")}`);
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
    if (Array.isArray(visibleListings) && visibleListings.length) renderListings(visibleListings);
  }
}

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
function closeVehicleSearchCitySuggestions() {
  if (!vehicleSearchCitySuggestions) return;
  vehicleSearchCitySuggestions.hidden = true;
  vehicleSearchCityInput?.setAttribute("aria-expanded", "false");
}
function renderVehicleSearchCitySuggestions() {
  if (!vehicleSearchCitySuggestions || !vehicleSearchCityInput) return;
  const term = vehicleSearchCityInput.value;
  const queryVariants = getQueryVariants(term);
  const base = activeRegionCode ? citySearchIndex.filter(entry => String(entry.city.region_katottg_code) === String(activeRegionCode)) : citySearchIndex;
  const ranked = term ? base.map(entry => ({ entry, rank: rankCityEntry(entry, queryVariants) }))
    .filter(item => item.rank >= 0)
    .sort((a, b) => a.rank - b.rank || cityName(a.entry.city).localeCompare(cityName(b.entry.city)))
    .slice(0, 12).map(item => item.entry) : [];
  vehicleSearchCitySuggestions.innerHTML = ranked.length
    ? ranked.map(entry => renderCitySuggestionButton(entry, "catalog-city-suggestion")).join("")
    : `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation(term ? "Город не найден" : "Введите название города"))}</div>`;
  vehicleSearchCitySuggestions.hidden = false;
  vehicleSearchCityInput.setAttribute("aria-expanded", "true");
}
function selectVehicleSearchCity(city) {
  selectedCatalogCityId = String(city.id);
  if (vehicleSearchCityInput) vehicleSearchCityInput.value = cityName(city);
  const isCapital = String(city.official_code || "") === "UA80000000000093317" || Number(city.id) === 29707;
  activeRegionCode = isCapital ? "" : String(city.region_katottg_code || "");
  if (vehicleSearchRegionSelect) vehicleSearchRegionSelect.value = activeRegionCode;
  if (catalogCitySearchInput) catalogCitySearchInput.value = cityName(city);
  if (catalogRegionSelect) catalogRegionSelect.value = activeRegionCode;
  closeVehicleSearchCitySuggestions();
}
if (vehicleSearchRegionSelect) {
  vehicleSearchRegionSelect.addEventListener("focus", () => { if (!availableCities.length) loadCities().catch(error => console.error("Не удалось загрузить города:", error)); }, { once: true });
  vehicleSearchRegionSelect.addEventListener("change", () => {
    activeRegionCode = vehicleSearchRegionSelect.value;
    selectedCatalogCityId = "";
    if (vehicleSearchCityInput) vehicleSearchCityInput.value = "";
    if (catalogCitySearchInput) catalogCitySearchInput.value = "";
    if (catalogRegionSelect) catalogRegionSelect.value = activeRegionCode;
    renderVehicleSearchCitySuggestions();
  });
}
if (vehicleSearchCityInput) {
  vehicleSearchCityInput.addEventListener("input", () => {
    selectedCatalogCityId = "";
    if (catalogCitySearchInput) catalogCitySearchInput.value = vehicleSearchCityInput.value;
    renderVehicleSearchCitySuggestions();
  });
  vehicleSearchCityInput.addEventListener("focus", async () => {
    if (!availableCities.length) {
      if (vehicleSearchCitySuggestions) { vehicleSearchCitySuggestions.innerHTML = `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Загрузка городов…"))}</div>`; vehicleSearchCitySuggestions.hidden = false; }
      try { await loadCities(); } catch (error) { console.error("Не удалось загрузить города:", error); }
    }
    renderVehicleSearchCitySuggestions();
  });
  vehicleSearchCityInput.addEventListener("keydown", event => {
    if (event.key === "Escape") closeVehicleSearchCitySuggestions();
    if (event.key === "ArrowDown" && !vehicleSearchCitySuggestions.hidden) {
      const firstOption = vehicleSearchCitySuggestions.querySelector("[data-city-id]");
      if (firstOption) { event.preventDefault(); firstOption.focus(); }
    }
    if (event.key === "Enter" && !vehicleSearchCitySuggestions.hidden) {
      const firstOption = vehicleSearchCitySuggestions.querySelector("[data-city-id]");
      const city = availableCities.find(item => String(item.id) === firstOption?.dataset.cityId);
      if (city) { event.preventDefault(); selectVehicleSearchCity(city); }
    }
  });
}
if (vehicleSearchCitySuggestions) {
  vehicleSearchCitySuggestions.addEventListener("mousedown", event => { if (event.target.closest("[data-city-id]")) event.preventDefault(); });
  vehicleSearchCitySuggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-city-id]");
    if (!option) return;
    const city = availableCities.find(item => String(item.id) === option.dataset.cityId);
    if (city) selectVehicleSearchCity(city);
  });
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
  [[catalogRegionSelect, activeRegionCode], [vehicleSearchRegionSelect, activeRegionCode], [cityRegionSelect, formRegionCode]].forEach(([select, current]) => {
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
  if (vehicleSearchCityInput) { const selectedVehicleCity = availableCities.find(city => String(city.id) === selectedCatalogCityId); if (selectedVehicleCity) vehicleSearchCityInput.value = cityName(selectedVehicleCity); }
}
async function loadCities() {
  if (!db || availableCities.length) return availableCities;
  // Share one in-flight catalog request between all callers; never download the same catalog twice.
  if (citiesLoadPromise) return citiesLoadPromise;
  if (window.hryvniaCitiesLoaded && availableCities.length) return availableCities;
  citiesLoadPromise = (async () => {
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
    return availableCities;
  })();
  try {
    return await citiesLoadPromise;
  } catch (error) {
    citiesLoadPromise = null;
    throw error;
  } finally {
    if (!availableCities.length) citiesLoadPromise = null;
  }
}
if (catalogRegionSelect) {
  catalogRegionSelect.addEventListener("focus", () => { if (!availableCities.length) loadCities().catch(error => console.error("Не удалось загрузить города:", error)); }, { once: true });
  catalogRegionSelect.addEventListener("change", () => {
    activeRegionCode = catalogRegionSelect.value;
    selectedCatalogCityId = "";
    if (catalogCitySearchInput) catalogCitySearchInput.value = "";
    scheduleListingSearch();
  });
}
if (cityRegionSelect) {
  cityRegionSelect.addEventListener("focus", () => { if (!availableCities.length) loadCities().catch(error => console.error("Не удалось загрузить города:", error)); }, { once: true });
  cityRegionSelect.addEventListener("change", () => {
    formRegionCode = cityRegionSelect.value === "__capital__" ? "" : cityRegionSelect.value;
    if (citySelect) citySelect.value = "";
    if (citySearchInput) citySearchInput.value = "";
    renderCitySuggestions();
  });
}
if (catalogCitySearchInput) {
  catalogCitySearchInput.addEventListener("input", () => { selectedCatalogCityId = ""; renderCatalogCitySuggestions(); });
  catalogCitySearchInput.addEventListener("focus", async () => {
    if (!availableCities.length) {
      catalogCitySuggestions && (catalogCitySuggestions.innerHTML = `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Загрузка городов…"))}</div>`);
      catalogCitySuggestions && (catalogCitySuggestions.hidden = false);
      try { await loadCities(); } catch (error) { console.error("Не удалось загрузить города:", error); }
    }
    renderCatalogCitySuggestions();
  });
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
  citySearchInput.addEventListener("focus", async () => {
    if (!availableCities.length) {
      citySuggestions && (citySuggestions.innerHTML = `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Загрузка городов…"))}</div>`);
      citySuggestions && (citySuggestions.hidden = false);
      try { await loadCities(); } catch (error) { console.error("Не удалось загрузить города:", error); }
    }
    renderCitySuggestions();
  });
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
  if (vehicleSearchCityInput && !vehicleSearchCityInput.parentElement.contains(event.target) && !vehicleSearchCitySuggestions?.contains(event.target)) closeVehicleSearchCitySuggestions();
});

let currentCategory = "";
let visibleListings = [];
let isSearching = false;
let pendingListingsReload = false;
let listingSearchTimer = null;
let vehicleClientFilters = null;

// Independent in-memory searches for the vehicle category.
const VEHICLE_SEARCH_FILTER_IDS = [
  "vehicleSearchCity", "vehicleSearchRegion", "vehicleSearchMake", "vehicleSearchModel",
  "vehicleYearFrom", "vehicleYearTo", "vehiclePriceFrom", "vehiclePriceCurrency", "vehiclePriceTo",
  "vehicleMileageFrom", "vehicleMileageTo", "vehicleEngineFrom", "vehicleEngineTo", "vehicleBodyType",
  "vehicleFuel", "vehicleTransmission", "vehicleSearchStatus", "vehiclePowerFrom", "vehiclePowerTo",
  "vehicleDoors", "vehicleDrive", "vehicleColor", "vehicleSellerType", "vehicleSearchOperationalCondition"
];
let vehicleSearchTabs = [];
let activeVehicleSearchTabId = "";
let vehicleSearchTabSequence = 0;
function newVehicleSearchTab() {
  vehicleSearchTabSequence += 1;
  return { id: `vehicle-search-${Date.now()}-${vehicleSearchTabSequence}`, title: "", filters: {}, selectedCityId: "", regionCode: "", advanced: false, listings: null, scrollY: 0 };
}
function ensureVehicleSearchTabs() {
  if (!vehicleSearchTabs.length) {
    const tab = newVehicleSearchTab();
    vehicleSearchTabs = [tab];
    activeVehicleSearchTabId = tab.id;
  }
  return vehicleSearchTabs.find(tab => tab.id === activeVehicleSearchTabId) || vehicleSearchTabs[0];
}
function captureVehicleSearchTab() {
  const tab = ensureVehicleSearchTabs();
  tab.filters = Object.fromEntries(VEHICLE_SEARCH_FILTER_IDS.map(id => {
    const el = document.getElementById(id);
    return [id, el ? el.value : ""];
  }));
  tab.selectedCityId = selectedCatalogCityId;
  tab.regionCode = activeRegionCode;
  tab.advanced = Boolean(document.getElementById("vehicleSearchAdvanced") && !document.getElementById("vehicleSearchAdvanced").classList.contains("hidden"));
  tab.scrollY = window.scrollY;
  if (Array.isArray(visibleListings)) tab.listings = visibleListings.slice();
  return tab;
}
function renderVehicleSearchTabs() {
  const host = document.getElementById("vehicleSearchTabs");
  if (!host) return;
  host.innerHTML = vehicleSearchTabs.map((tab, index) => `<div class="vehicle-search-tab-item${tab.id === activeVehicleSearchTabId ? " is-active" : ""}"><button type="button" class="vehicle-search-tab${tab.id === activeVehicleSearchTabId ? " is-active" : ""}" data-vehicle-tab="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeVehicleSearchTabId ? "true" : "false"}"><span>${escapeHtml(tab.title || `${t("Пошук")} ${index + 1}`)}</span></button><button type="button" class="vehicle-search-tab-close" data-close-vehicle-tab="${escapeHtml(tab.id)}" aria-label="${escapeHtml(t("Закрыть"))}" title="${escapeHtml(t("Закрыть"))}">×</button></div>`).join("") + `<button type="button" class="vehicle-search-tab-add" id="vehicleSearchTabAdd" aria-label="${escapeHtml(t("Новий пошук"))}" title="${escapeHtml(t("Новий пошук"))}">+</button>`;
}
function closeVehicleSearchTab(id) {
  if (isSearching) return;
  const index = vehicleSearchTabs.findIndex(tab => tab.id === id);
  if (index < 0) return;
  const wasActive = vehicleSearchTabs[index].id === activeVehicleSearchTabId;
  if (vehicleSearchTabs.length === 1) {
    const replacement = newVehicleSearchTab();
    vehicleSearchTabs = [replacement];
    activeVehicleSearchTabId = replacement.id;
    restoreVehicleSearchTab(replacement);
    document.getElementById("vehicleSearchReset")?.click();
    replacement.filters = Object.fromEntries(VEHICLE_SEARCH_FILTER_IDS.map(filterId => [filterId, document.getElementById(filterId)?.value ?? ""]));
    replacement.selectedCityId = "";
    replacement.regionCode = "";
    replacement.advanced = false;
    replacement.listings = null;
    renderListings([]);
    renderVehicleSearchTabs();
    openVehicleSearch();
    return;
  }
  vehicleSearchTabs.splice(index, 1);
  if (wasActive) {
    const next = vehicleSearchTabs[Math.min(index, vehicleSearchTabs.length - 1)];
    activeVehicleSearchTabId = next.id;
    restoreVehicleSearchTab(next);
    openVehicleSearch();
  } else {
    renderVehicleSearchTabs();
  }
}
function restoreVehicleSearchTab(tab) {
  if (!tab) return;
  VEHICLE_SEARCH_FILTER_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== "vehicleSearchModel") el.value = tab.filters?.[id] ?? "";
  });
  selectedCatalogCityId = tab.selectedCityId || "";
  activeRegionCode = tab.regionCode || "";
  const make = document.getElementById("vehicleSearchMake");
  const model = document.getElementById("vehicleSearchModel");
  if (make && model) {
    make.value = tab.filters?.vehicleSearchMake || "";
    const makeSlug = make.value;
    const models = vehicleModelsCache.filter(row => !makeSlug || row.make_slug === makeSlug);
    model.innerHTML = `<option value="">${escapeHtml(t("Всі моделі"))}</option>` + models.map(row => `<option value="${escapeHtml(row.model_slug)}">${escapeHtml(row.model_name)}</option>`).join("");
    model.disabled = !makeSlug;
    model.value = tab.filters?.vehicleSearchModel || "";
  }
  const city = availableCities.find(item => String(item.id) === String(selectedCatalogCityId));
  if (vehicleSearchCityInput) vehicleSearchCityInput.value = city ? cityName(city) : (tab.filters?.vehicleSearchCity || "");
  if (vehicleSearchRegionSelect) vehicleSearchRegionSelect.value = tab.filters?.vehicleSearchRegion || tab.regionCode || "";
  setVehicleSearchAdvanced(Boolean(tab.advanced));
  const message = document.getElementById("vehicleSearchMessage");
  if (message) { message.textContent = ""; message.classList.remove("error"); }
  if (Array.isArray(tab.listings)) renderListings(tab.listings);
  else renderListings([]);
  renderVehicleSearchTabs();
  closeVehicleSearch();
  requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, tab.scrollY || 0), behavior: "auto" }));
}
function switchVehicleSearchTab(id) {
  if (isSearching || id === activeVehicleSearchTabId) return;
  captureVehicleSearchTab();
  const tab = vehicleSearchTabs.find(item => item.id === id);
  if (!tab) return;
  activeVehicleSearchTabId = tab.id;
  restoreVehicleSearchTab(tab);
  openVehicleSearch();
}
function addVehicleSearchTab() {
  if (isSearching) return;
  captureVehicleSearchTab();
  const tab = newVehicleSearchTab();
  vehicleSearchTabs.push(tab);
  activeVehicleSearchTabId = tab.id;
  restoreVehicleSearchTab(tab);
  // A new tab starts with clean filters, without changing any existing search.
  document.getElementById("vehicleSearchReset")?.click();
  tab.filters = Object.fromEntries(VEHICLE_SEARCH_FILTER_IDS.map(id => [id, document.getElementById(id)?.value ?? ""]));
  tab.selectedCityId = "";
  tab.regionCode = "";
  tab.advanced = false;
  tab.listings = null;
  tab.scrollY = window.scrollY;
  renderVehicleSearchTabs();
  openVehicleSearch();
}
function scheduleListingSearch(delay = 250) {
  if (listingSearchTimer) clearTimeout(listingSearchTimer);
  listingSearchTimer = setTimeout(() => { listingSearchTimer = null; loadListings(); }, delay);
}

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
      <div class="detail-photo-wrap">
        <img data-gallery-image alt="${escapeHtml(item.title)}" style="display:block;width:100%;height:auto;max-height:55dvh;object-fit:contain;border-radius:10px">
        <span class="photo-watermark detail-photo-watermark" aria-hidden="true"><span>HRYVNIA</span><span>HUB</span></span>
      </div>
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
      ${item.property_details ? `<div class="property-detail-specs">${propertyCardSpecs(item).flat().join("")}</div>` : ""}
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

// Single guarded entry point: edit/create flows must not render a city selector before cities arrive.
async function ensureCitiesLoaded() {
  if (availableCities.length) return availableCities;
  await loadCities();
  return availableCities;
}

// ==== РАСШИРЕННОЕ РЕДАКТИРОВАНИЕ (включая авто-поля) ====
async function editListing(item, labels) {
  await ensureCitiesLoaded();
  if (!db || !currentUser) { alert(labels.denied); return; }
  if (String(currentUser.id) !== String(item.user_id || "")) { alert(labels.denied); return; }

  const L = {
    ru: { title:"Название", category:"Категория", city:"Город", price:"Цена (грн)", description:"Описание", photos:"Фотографии", hot:"Горячее объявление", urgent:"Срочная продажа", save:"Сохранить изменения", cancel:"Отмена", published:"Опубликовано" },
    uk: { title:"Назва", category:"Категорія", city:"Місто", price:"Ціна (грн)", description:"Опис", photos:"Фотографії", hot:"Гаряче оголошення", urgent:"Терміновий продаж", save:"Зберегти зміни", cancel:"Скасувати", published:"Опубліковано" },
    en: { title:"Title", category:"Category", city:"City", price:"Price (UAH)", description:"Description", photos:"Photos", hot:"Hot listing", urgent:"Urgent sale", save:"Save changes", cancel:"Cancel", published:"Published" },
    pl: { title:"Tytuł", category:"Kategoria", city:"Miasto", price:"Cena (UAH)", description:"Opis", photos:"Zdjęcia", hot:"Gorące ogłoszenie", urgent:"Pilna sprzedaż", save:"Zapisz zmiany", cancel:"Anuluj", published:"Opublikowano" }
  }[lang] || { title:"Title", category:"Category", city:"City", price:"Price", description:"Description", photos:"Photos", hot:"Hot", urgent:"Urgent", save:"Save", cancel:"Cancel", published:"Published" };

  const isVehicle = item.category === "Автомобили";

  const selectedCityId = String(item.city_id || item.cities?.id || "");
  const selectedCity = availableCities.find(city => String(city.id) === selectedCityId);
  const initialCityName = selectedCity ? cityName(selectedCity) : String(item.cities?.[`name_${lang}`] || item.cities?.name_uk || item.cities?.name_ru || "");
  const categoryOptions = ["Автомобили","Недвижимость","Готовый бизнес","Инвестиции"]
    .map(cat => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${escapeHtml(translations[cat]?.[lang] || cat)}</option>`)
    .join("");
  const photos = listingPhotos(item);

  const opt = (value, current, key) => {
    const text = translations[key]?.[lang] || translations[key]?.ru || key;
    return `<option value="${escapeHtml(value)}" ${String(current || "") === String(value) ? "selected" : ""}>${escapeHtml(text)}</option>`;
  };
  const optPlain = (value, current, label) =>
    `<option value="${escapeHtml(value)}" ${String(current || "") === String(value) ? "selected" : ""}>${escapeHtml(label)}</option>`;

  const bodyTypes = ["Седан","Хетчбек","Універсал","Позашляховик","Купе","Мінівен","Пікап","Інший"];
  const fuels = ["Бензин","Дизель","Газ/бензин","Електро","Гібрид"];
  const transmissions = ["Механічна","Автоматична","Варіатор","Робот"];
  const drives = ["Передній","Задній","Повний","Повний підключаємий"];
  const colors = ["white","black","gray","silver","red","blue","green","brown","yellow","other"];
  const colorKeys = ["Білий","Чорний","Сірий","Сріблястий","Червоний","Синій","Зелений","Коричневий","Жовтий","Інший"];
  const sellerTypes = [["private","Частное лицо"],["business","Компания / бизнес"]];
  const vehicleTypes = [["new","new"],["used","used"]];
  const operational = [["roadworthy","roadworthy"],["needs_repair","needs_repair"],["not_running","not_running"],["after_accident","after_accident"]];

  const vehicleBlock = isVehicle ? `
    <fieldset class="vehicle-listing-fields">
      <legend>${escapeHtml(t("Характеристики автомобиля"))}</legend>
      <label>${escapeHtml(t("Марка автомобиля"))}
        <select name="vehicle_make_slug" id="editVehicleMake" required>
          <option value="">${escapeHtml(t("Выберите марку"))}</option>
        </select>
      </label>
      <label>${escapeHtml(t("Модель автомобиля"))}
        <select name="vehicle_model_slug" id="editVehicleModel" required>
          <option value="">${escapeHtml(t("Сначала выберите марку"))}</option>
        </select>
      </label>
      <label>${escapeHtml(t("Год выпуска"))}<input name="vehicle_year" type="number" min="1900" max="2100" value="${escapeHtml(String(item.vehicle_year ?? ""))}"></label>
      <label>${escapeHtml(t("Тип кузова"))}<select name="vehicle_body_type"><option value="">${escapeHtml(t("Выберите тип кузова"))}</option>${bodyTypes.map(v => opt(v, item.vehicle_body_type, v)).join("")}</select></label>
      <label>${escapeHtml(t("Топливо"))}<select name="vehicle_fuel_type"><option value="">${escapeHtml(t("Выберите топливо"))}</option>${fuels.map(v => opt(v, item.vehicle_fuel_type, v)).join("")}</select></label>
      <label>${escapeHtml(t("Объём двигателя, л"))}<input name="vehicle_engine_liters" type="number" min="0" max="20" step="0.1" value="${escapeHtml(String(item.vehicle_engine_liters ?? ""))}"></label>
      <label>${escapeHtml(t("Мощность, л.с."))}<input name="vehicle_power_hp" type="number" min="1" max="3000" value="${escapeHtml(String(item.vehicle_power_hp ?? ""))}"></label>
      <label>${escapeHtml(t("Коробка передач"))}<select name="vehicle_transmission"><option value="">${escapeHtml(t("Выберите коробку"))}</option>${transmissions.map(v => opt(v, item.vehicle_transmission, v)).join("")}</select></label>
      <label>${escapeHtml(t("Привод"))}<select name="vehicle_drive"><option value="">${escapeHtml(t("Выберите привод"))}</option>${drives.map(v => opt(v, item.vehicle_drive, v)).join("")}</select></label>
      <label>${escapeHtml(t("Пробег, км"))}<input name="vehicle_mileage_km" type="number" min="0" value="${escapeHtml(String(item.vehicle_mileage_km ?? ""))}"></label>
      <label>${escapeHtml(t("Тип авто"))}<select name="vehicle_condition"><option value="">${escapeHtml(t("Выберите тип"))}</option>${vehicleTypes.map(([v,k]) => opt(v, item.vehicle_condition, k)).join("")}</select></label>
      <label>${escapeHtml(t("Техническое состояние"))}<select name="vehicle_operational_condition"><option value="">${escapeHtml(t("Выберите состояние"))}</option>${operational.map(([v,k]) => opt(v, item.vehicle_operational_condition, k)).join("")}</select></label>
      <label>${escapeHtml(t("Количество дверей"))}<select name="vehicle_doors"><option value="">${escapeHtml(t("Выберите количество"))}</option>${[2,3,4,5].map(n => optPlain(n, item.vehicle_doors, String(n))).join("")}</select></label>
      <label>${escapeHtml(t("Цвет"))}<select name="vehicle_color"><option value="">${escapeHtml(t("Выберите цвет"))}</option>${colors.map((c,i) => `<option value="${c}" ${String(item.vehicle_color || "").toLowerCase() === c ? "selected" : ""}>${escapeHtml(t(colorKeys[i]))}</option>`).join("")}</select></label>
      <label>${escapeHtml(t("Тип продавца"))}<select name="seller_type">${sellerTypes.map(([v,k]) => `<option value="${v}" ${String(item.seller_type || "private") === v ? "selected" : ""}>${escapeHtml(t(k))}</option>`).join("")}</select></label>
    </fieldset>` : "";

  const dialog = document.createElement("dialog");
  dialog.className = "modal-card listing-edit-dialog";
  dialog.innerHTML = `<form class="listing-edit-form"><header class="listing-edit-header"><p class="eyebrow">${escapeHtml(t("Редактирование объявления"))}</p><h2>${escapeHtml(labels.edit)}</h2></header>
    <label>${escapeHtml(L.category)}<select name="category" required>${categoryOptions}</select></label>
    ${isVehicle ? "" : `<label>${escapeHtml(L.title)}<input name="title" required maxlength="180" value="${escapeHtml(item.title || "")}"></label>`}
    ${vehicleBlock}
    <label class="edit-city-field">${escapeHtml(L.city)}
      <input name="city_search" type="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="editCitySuggestions" placeholder="${escapeHtml(cityTranslation("Введите название города"))}" value="${escapeHtml(initialCityName)}" required>
      <input name="city_id" type="hidden" value="${escapeHtml(selectedCityId)}">
      <div class="edit-city-suggestions" id="editCitySuggestions" role="listbox" hidden></div>
    </label>
    <label>${escapeHtml(L.price)}<input name="price" type="number" min="0" step="0.01" required value="${escapeHtml(String(item.price ?? ""))}"></label>
    ${String(item.category || "") === "Недвижимость" ? (() => { const d=item.property_details||{}; const val=(k)=>escapeHtml(String(d[k]??"")); const select=(name,label,opts,key)=>`<label>${escapeHtml(t(label))}<select name="${name}"><option value="">${escapeHtml(t("Не указано"))}</option>${opts.map(v=>`<option value="${escapeHtml(v)}" ${String(d[key]??"")===v?"selected":""}>${escapeHtml(t(v))}</option>`).join("")}</select></label>`; const num=(name,label,key)=>`<label>${escapeHtml(t(label))}<input name="${name}" type="number" min="0" step="0.1" value="${val(key)}"></label>`; return `<fieldset class="edit-property-fields" aria-label="${escapeHtml(t("Характеристики недвижимости"))}"><div class="edit-property-grid">${select("property_rooms","Кількість кімнат",["1","2","3","4","5+"],"rooms")}<label>${escapeHtml(t("Етаж"))}<input name="property_floor" type="number" min="0" step="1" value="${val("floor")}"></label><label>${escapeHtml(t("Етажність будівлі"))}<input name="property_floors_total" type="number" min="1" step="1" value="${val("floors_total")}"></label>${num("property_kitchen_area_m2","Площа кухні, м²","kitchen_area_m2")}${select("property_building_type","Тип будівлі",["Кирпичный","Панельный","Монолитный","Монолитно-кирпичный","Деревянный","Другое"],"building_type")}${select("property_condition","Стан",["Новостройка","Новый ремонт","Жилое состояние","Нужен ремонт","Под ремонт"],"condition")}${select("property_furniture","Меблі",["Есть","Нет","Частично"],"furniture")}${select("property_balcony","Балкон",["Есть","Нет"],"balcony")}${select("property_loggia","Лоджія",["Есть","Нет"],"loggia")}<label>${escapeHtml(t("До метро, м"))}<input name="property_metro_distance_m" type="number" min="0" step="1" value="${val("metro_distance_m")}"></label>${num("property_land_area_sotkas","Площа ділянки, соток","land_area_sotkas")}</div></fieldset>`; })() : ""}
    <label>${escapeHtml(L.description)}<textarea name="description" rows="5" maxlength="10000">${escapeHtml(item.description || "")}</textarea></label>
    <fieldset class="edit-photo-fields">
      <legend>${escapeHtml(L.photos)}</legend>
      <p class="edit-photo-hint">${escapeHtml(photoText("hint"))}</p>
      <input name="edit_photo_input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
      <button class="btn edit-photo-pick" type="button" data-edit-photo-pick>${escapeHtml(photoText("add"))}</button>
      <div class="edit-photo-preview" data-edit-photo-preview></div>
      <p class="form-message" data-edit-photo-message role="status"></p>
    </fieldset>
    <label class="hot-toggle"><input type="checkbox" name="is_hot" ${item.is_hot ? "checked" : ""}> ${escapeHtml(L.hot)}</label>
    <label class="hot-toggle"><input type="checkbox" name="is_urgent" ${item.is_urgent ? "checked" : ""}> ${escapeHtml(L.urgent)}</label>
    <p class="muted">${escapeHtml(L.published)}: ${item.created_at ? escapeHtml(new Date(item.created_at).toLocaleDateString()) : "—"}</p>
    <div class="edit-actions"><button class="btn btn-primary" type="submit">${escapeHtml(L.save)}</button><button class="btn" type="button" data-edit-cancel>${escapeHtml(L.cancel)}</button></div><p class="form-message" role="status"></p></form>`;

  document.body.append(dialog);
  dialog.showModal();

  // Photo manager for editing: keep existing URLs, allow new local files, reorder cover, and remove photos.
  const editPhotoInput = dialog.querySelector('input[name="edit_photo_input"]');
  const editPhotoPreview = dialog.querySelector("[data-edit-photo-preview]");
  const editPhotoMessage = dialog.querySelector("[data-edit-photo-message]");
  const editPhotoPick = dialog.querySelector("[data-edit-photo-pick]");
  let editPhotos = photos.map(url => ({ file: null, previewUrl: url, uploadedUrl: url, existing: true }));
  let editPhotosBusy = false;
  const renderEditPhotos = () => {
    editPhotoPreview.innerHTML = editPhotos.map((photo, index) => `
      <div class="photo-item edit-photo-item">
        <img src="${escapeHtml(photo.previewUrl)}" alt="${escapeHtml(photo.file?.name || `Photo ${index + 1}`)}">
        <span>${index === 0 ? escapeHtml(photoText("main")) : index + 1}</span>
        <div class="photo-actions">
          ${index > 0 ? `<button type="button" class="btn" data-edit-photo-main="${index}">${escapeHtml(photoText("makeMain"))}</button>` : ""}
          <button type="button" class="btn" data-edit-photo-remove="${index}">${escapeHtml(photoText("remove"))}</button>
        </div>
      </div>`).join("");
  };
  editPhotoPick.addEventListener("click", () => { if (!editPhotosBusy) editPhotoInput.click(); });
  editPhotoInput.addEventListener("change", async () => {
    if (editPhotosBusy) return;
    const files = [...editPhotoInput.files];
    editPhotoInput.value = "";
    editPhotoMessage.textContent = "";
    if (files.length + editPhotos.length > MAX_PHOTOS) { editPhotoMessage.textContent = photoText("limit"); return; }
    if (files.some(file => !PHOTO_TYPES[file.type] || !file.size || file.size > MAX_PHOTO_BYTES)) { editPhotoMessage.textContent = photoText("invalid"); return; }
    editPhotosBusy = true;
    editPhotoPick.disabled = true;
    const additions = [];
    try {
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        additions.push({ file, previewUrl, uploadedUrl: "", existing: false });
        await new Promise((resolve, reject) => {
          const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = previewUrl;
        });
      }
      editPhotos.push(...additions);
      renderEditPhotos();
    } catch {
      additions.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
      editPhotoMessage.textContent = photoText("unreadable");
    } finally {
      editPhotosBusy = false;
      editPhotoPick.disabled = false;
    }
  });
  editPhotoPreview.addEventListener("click", event => {
    if (editPhotosBusy) return;
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.editPhotoRemove !== undefined) {
      const [removed] = editPhotos.splice(Number(button.dataset.editPhotoRemove), 1);
      if (removed && !removed.existing && removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    } else if (button.dataset.editPhotoMain !== undefined) {
      editPhotos.unshift(...editPhotos.splice(Number(button.dataset.editPhotoMain), 1));
    }
    editPhotoMessage.textContent = "";
    renderEditPhotos();
  });
  dialog.addEventListener("close", () => editPhotos.forEach(photo => {
    if (!photo.existing && photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
  }), { once: true });
  renderEditPhotos();

  // Reuse the same city index/ranking as the create-listing form, but keep the editor self-contained.
  const editCityInput = dialog.querySelector('input[name="city_search"]');
  const editCityId = dialog.querySelector('input[name="city_id"]');
  const editCitySuggestions = dialog.querySelector("#editCitySuggestions");
  const closeEditCitySuggestions = () => {
    editCitySuggestions.hidden = true;
    editCityInput.setAttribute("aria-expanded", "false");
  };
  const renderEditCitySuggestions = () => {
    const variants = getQueryVariants(editCityInput.value);
    const ranked = citySearchIndex.map(entry => ({ entry, rank: rankCityEntry(entry, variants) }))
      .filter(row => row.rank >= 0)
      .sort((a, b) => a.rank - b.rank || cityName(a.entry.city).localeCompare(cityName(b.entry.city)))
      .slice(0, 12).map(row => row.entry);
    editCitySuggestions.innerHTML = ranked.length
      ? ranked.map(entry => renderCitySuggestionButton(entry, "edit-city-suggestion")).join("")
      : `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Город не найден"))}</div>`;
    editCitySuggestions.hidden = false;
    editCityInput.setAttribute("aria-expanded", "true");
  };
  const chooseEditCity = city => {
    editCityId.value = String(city.id);
    editCityInput.value = cityName(city);
    closeEditCitySuggestions();
  };
  editCityInput.addEventListener("input", () => {
    editCityId.value = ""; // Never silently save the previous city after the user edits the text.
    renderEditCitySuggestions();
  });
  editCityInput.addEventListener("focus", renderEditCitySuggestions);
  editCityInput.addEventListener("keydown", event => {
    if (event.key === "Escape") closeEditCitySuggestions();
    if (event.key === "ArrowDown" && !editCitySuggestions.hidden) {
      const first = editCitySuggestions.querySelector("[data-city-id]");
      if (first) { event.preventDefault(); first.focus(); }
    }
    if (event.key === "Enter" && !editCitySuggestions.hidden) {
      const first = editCitySuggestions.querySelector("[data-city-id]");
      const city = availableCities.find(row => String(row.id) === first?.dataset.cityId);
      if (city) { event.preventDefault(); chooseEditCity(city); }
    }
  });
  editCitySuggestions.addEventListener("mousedown", event => {
    if (event.target.closest("[data-city-id]")) event.preventDefault();
  });
  editCitySuggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-city-id]");
    if (!option) return;
    const city = availableCities.find(row => String(row.id) === option.dataset.cityId);
    if (city) chooseEditCity(city);
  });
  editCitySuggestions.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeEditCitySuggestions(); editCityInput.focus(); }
  });
  dialog.addEventListener("click", event => {
    if (!event.target.closest(".edit-city-field")) closeEditCitySuggestions();
  });

  if (isVehicle) {
    const makeSelect = dialog.querySelector("#editVehicleMake");
    const modelSelect = dialog.querySelector("#editVehicleModel");
    try {
      const catalog = await fetchAllVehicleModels();
      const makes = [...new Map(catalog.map(r => [r.make_slug, r.make_name])).entries()]
        .sort((a, b) => a[1].localeCompare(b[1]));
      makeSelect.innerHTML = `<option value="">${escapeHtml(t("Выберите марку"))}</option>` +
        makes.map(([slug, name]) => `<option value="${escapeHtml(slug)}" ${slug === item.vehicle_make_slug ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
      const fillModels = (makeSlug, selectedModel) => {
        const models = catalog.filter(r => r.make_slug === makeSlug);
        modelSelect.innerHTML = `<option value="">${escapeHtml(t("Выберите модель"))}</option>` +
          [...new Map(models.map(r => [r.model_slug, r.model_name])).entries()]
            .map(([slug, name]) => `<option value="${escapeHtml(slug)}" ${slug === selectedModel ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
        modelSelect.disabled = !makeSlug;
      };
      fillModels(item.vehicle_make_slug || "", item.vehicle_model_slug || "");
      makeSelect.addEventListener("change", () => fillModels(makeSelect.value, ""));
    } catch (err) {
      console.error("Не удалось загрузить каталог автомобилей для редактирования", err);
    }
  }

  dialog.querySelector("[data-edit-cancel]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove(), { once: true });

  dialog.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector(".form-message");
    const price = Number(form.elements.price.value);
    if (!Number.isFinite(price) || price < 0) { message.textContent = labels.failed; return; }
    if (editPhotosBusy) return;
    let urls = editPhotos.map(photo => photo.uploadedUrl).filter(Boolean).slice(0, MAX_PHOTOS);

    const cityIdValue = String(form.elements.city_id.value || "");
    if (!cityIdValue || !availableCities.some(city => String(city.id) === cityIdValue)) {
      message.textContent = t("Выберите город из предложенных вариантов");
      form.elements.city_search.focus();
      return;
    }
    const payload = {
      category: form.elements.category.value,
      city_id: Number(cityIdValue),
      price,
      previous_price: Number(item.price) !== price ? Number(item.price) : (item.previous_price ?? null),
      description: form.elements.description.value.trim(),
      image_urls: urls,
      image_url: urls[0] || null,
      is_hot: form.elements.is_hot.checked,
      is_urgent: Boolean(form.elements.is_urgent?.checked)
    };

    if (String(item.category || "") === "Недвижимость" && form.querySelector(".edit-property-fields")) {
      const n = name => { const v=String(form.elements[name]?.value || "").trim(); return v === "" ? null : Number(v); };
      const v = name => String(form.elements[name]?.value || "") || null;
      payload.property_details = { ...(item.property_details || {}), rooms:v("property_rooms"), floor:n("property_floor"), floors_total:n("property_floors_total"), kitchen_area_m2:n("property_kitchen_area_m2"), building_type:v("property_building_type"), condition:v("property_condition"), furniture:v("property_furniture"), balcony:v("property_balcony"), loggia:v("property_loggia"), metro_distance_m:n("property_metro_distance_m"), land_area_sotkas:n("property_land_area_sotkas") };
    }
    if (isVehicle) {
      const makeSlug = form.elements.vehicle_make_slug.value;
      const modelSlug = form.elements.vehicle_model_slug.value;
      if (!makeSlug || !modelSlug) { message.textContent = t("Выберите марку и модель автомобиля."); return; }
      const catalog = await fetchAllVehicleModels().catch(() => []);
      const makeRow = catalog.find(r => r.make_slug === makeSlug);
      const modelRow = catalog.find(r => r.make_slug === makeSlug && r.model_slug === modelSlug);
      if (!makeRow || !modelRow) { message.textContent = t("Марка или модель не найдена в каталоге. Выберите их заново."); return; }
      payload.title = [makeRow.make_name, modelRow.model_name].filter(Boolean).join(" ");
      Object.assign(payload, {
        vehicle_make_slug: makeSlug,
        vehicle_make_name: makeRow.make_name,
        vehicle_model_slug: modelSlug,
        vehicle_model_name: modelRow.model_name,
        vehicle_year: form.elements.vehicle_year.value ? Number(form.elements.vehicle_year.value) : null,
        vehicle_body_type: form.elements.vehicle_body_type.value || null,
        vehicle_fuel_type: form.elements.vehicle_fuel_type.value || null,
        vehicle_engine_liters: form.elements.vehicle_engine_liters.value ? Number(form.elements.vehicle_engine_liters.value) : null,
        vehicle_power_hp: form.elements.vehicle_power_hp.value ? Number(form.elements.vehicle_power_hp.value) : null,
        vehicle_transmission: form.elements.vehicle_transmission.value || null,
        vehicle_drive: form.elements.vehicle_drive.value || null,
        vehicle_mileage_km: form.elements.vehicle_mileage_km.value ? Number(form.elements.vehicle_mileage_km.value) : null,
        vehicle_condition: form.elements.vehicle_condition.value || null,
        vehicle_operational_condition: form.elements.vehicle_operational_condition.value || null,
        vehicle_doors: form.elements.vehicle_doors.value ? Number(form.elements.vehicle_doors.value) : null,
        vehicle_color: form.elements.vehicle_color.value || null,
        seller_type: form.elements.seller_type.value || "private"
      });
    } else {
      const title = form.elements.title?.value.trim() || "";
      if (!title) { message.textContent = labels.failed; return; }
      payload.title = title;
    }

    button.disabled = true;
    editPhotoPick.disabled = true;
    message.textContent = photoText("saving");
    try {
      urls = await uploadListingPhotos(editPhotos);
      payload.image_urls = urls;
      payload.image_url = urls[0] || null;
      const { data, error } = await db.from("listings")
        .update(payload).eq("id", item.id).eq("user_id", currentUser.id)
        .select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(labels.denied);
      if (Number(item.price) !== price) {
        const { error: historyError } = await db.from("listing_price_history").insert({
          listing_id: item.id, user_id: currentUser.id,
          old_price: Number(item.price), new_price: price,
          changed_at: new Date().toISOString()
        });
        if (historyError) console.warn("Price history not saved:", historyError.message);
      }
      dialog.close();
      await loadListings();
    } catch (error) {
      message.textContent = error?.message || labels.failed;
      button.disabled = false;
      editPhotoPick.disabled = false;
    }
  });
}

async function deleteListing(item, labels) {
  if (!db || !currentUser) { alert(labels.denied); return; }
  if (String(currentUser.id) !== String(item.user_id || "")) { alert(labels.denied); return; }
  const { data, error } = await db.from("listings").delete().eq("id", item.id).eq("user_id", currentUser.id).select("id").maybeSingle();
  if (error || !data) { alert(error?.message ? error.message : labels.failed); return; }
  await loadListings();
}

function renderHotListings(items) {
  const host = document.querySelector(".urgent-deals-grid");
  if (!host) return;
  // Use the same already-filtered listings as the main catalog.
  // Do not issue a second unfiltered Supabase query here.
  items = (items || []).filter(item => item.is_hot || item.is_urgent);
  const langPack = {
    ru: { hot:"Горячее", urgent:"Срочно", empty:"Горячих и срочных объявлений пока нет." },
    uk: { hot:"Гаряче", urgent:"Терміново", empty:"Гарячих і термінових оголошень поки немає." },
    en: { hot:"Hot", urgent:"Urgent", empty:"No hot or urgent listings yet." },
    pl: { hot:"Gorące", urgent:"Pilne", empty:"Brak gorących i pilnych ogłoszeń." }
  };
  const L = langPack[lang] || langPack.ru;
  if (!items.length) { host.innerHTML = `<div class="empty">${escapeHtml(L.empty)}</div>`; return; }
  host.innerHTML = `<div class="hot-listings-row">${items.map(item => {
    const badges = [
      item.is_hot ? `<span class="hot-listing-badge">${escapeHtml(L.hot)}</span>` : "",
      item.is_urgent ? `<span class="urgent-listing-badge">${escapeHtml(L.urgent)}</span>` : ""
    ].join("");
    return `<button type="button" class="hot-listing-card" data-hot-id="${escapeHtml(String(item.id))}">
      <span class="hot-card-media">${listingCover(item)}${item.is_hot ? `<span class="hot-listing-badge" aria-label="${escapeHtml(L.hot)}">${escapeHtml(L.hot)}</span>` : ""}</span>
      <span class="hot-card-badges">${item.is_urgent ? `<span class="urgent-listing-badge">${escapeHtml(L.urgent)}</span>` : ""}</span>
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

function vehicleCardSpecs(item) {
  if (String(item.category || "") !== "Автомобили") return [];
  const specs = [];
  const add = (icon, value, label) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      specs.push(`<span class="vehicle-spec-item" title="${escapeHtml(label)}"><span class="vehicle-spec-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(String(value))}</span></span>`);
    }
  };
  if (item.vehicle_year) add("▦", item.vehicle_year, t("Год"));
  if (item.vehicle_engine_liters != null && item.vehicle_engine_liters !== "") add('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M7 7h8l2 3h3v7h-3l-2 2H8l-2-3H4v-6h3z"/><path d="M9 7V4h4v3M17 10V7h2M9 12h4v4H9z"/></svg>', `${String(item.vehicle_engine_liters).replace(/\.0$/, "")} л`, t("Объём двигателя, л"));
  if (item.vehicle_fuel_type) add("⛽", item.vehicle_fuel_type, t("Топливо"));
  if (item.vehicle_mileage_km != null && item.vehicle_mileage_km !== "") { const mileage = Number(item.vehicle_mileage_km); const mileageText = mileage >= 10000 ? `${Math.round(mileage / 1000).toLocaleString(lang === "en" ? "en-US" : lang === "pl" ? "pl-PL" : lang === "uk" ? "uk-UA" : "ru-RU")} ${lang === "en" ? "k km" : "тис. км"}` : `${mileage.toLocaleString(lang === "en" ? "en-US" : lang === "pl" ? "pl-PL" : lang === "uk" ? "uk-UA" : "ru-RU")} ${lang === "en" ? "km" : "км"}`; add("◉", mileageText, t("Пробег, км")); }
  if (item.vehicle_transmission) add('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M6 4v16M18 4v16M6 8h12M6 16h12"/><circle cx="6" cy="4" r="2"/><circle cx="18" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/></svg>', item.vehicle_transmission, t("Коробка передач"));
  return specs.length ? [specs] : [];
}

function propertyCardSpecs(item) {
  if (String(item.category || "") !== "Недвижимость" || !item.property_details) return [];
  const details = item.property_details;
  const locale = lang === "en" ? "en-US" : lang === "pl" ? "pl-PL" : lang === "uk" ? "uk-UA" : "ru-RU";
  const specs = [];
  const add = (icon, value, label) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      specs.push(`<span class="vehicle-spec-item" title="${escapeHtml(label)}"><span class="vehicle-spec-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(String(value))}</span></span>`);
    }
  };
  if (details.area_m2 != null) add("▱", `${details.area_m2} м²`, ({ru:"Общая площадь",uk:"Загальна площа",en:"Total area",pl:"Powierzchnia"})[lang]);
  if (details.rooms) add("▦", `${details.rooms} ${({ru:"комн.",uk:"кімн.",en:"rooms",pl:"pok."})[lang] || "rooms"}`, ({ru:"Количество комнат",uk:"Кількість кімнат",en:"Rooms",pl:"Liczba pokoi"})[lang]);
  if (details.floor != null && details.floors_total != null) add("⌂", `${details.floor}/${details.floors_total}`, ({ru:"Этаж / этажность",uk:"Поверх / поверховість",en:"Floor / floors",pl:"Piętro / liczba pięter"})[lang]);
  else if (details.floor != null) add("⌂", details.floor, ({ru:"Этаж",uk:"Поверх",en:"Floor",pl:"Piętro"})[lang]);
  if (details.furniture) add("▤", ({ru:{"Есть":"С мебелью","Нет":"Без мебели","Частично":"Частично"},uk:{"Есть":"З меблями","Нет":"Без меблів","Частично":"Частково"},en:{"Есть":"Furnished","Нет":"Unfurnished","Частично":"Partly furnished"},pl:{"Есть":"Umeblowane","Нет":"Bez mebli","Частично":"Częściowo umeblowane"}}[lang] || {})[details.furniture] || details.furniture, ({ru:"Мебель",uk:"Меблі",en:"Furniture",pl:"Meble"})[lang]);
  return specs.length ? [specs] : [];
}

function renderListings(items) {
  visibleListings = items;
  renderHotListings(items.filter(item => item.is_hot || item.is_urgent));
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
    const myListingLabel = ({ uk: "Моє оголошення", ru: "Моё объявление", en: "My listing", pl: "Moje ogłoszenie" })[lang] || "My listing";
    const specs = [...vehicleCardSpecs(item), ...propertyCardSpecs(item)];
    const city = item.cities?.[`name_${lang}`] || item.cities?.name_ru || item.city || "";
    const marketScale = String(item.category || "") === "Автомобили" && Number(item.price) > 0
      ? `<div class="listing-market" aria-label="${escapeHtml(({ru:"Декоративный индикатор цены",uk:"Декоративний індикатор ціни",en:"Decorative price indicator",pl:"Dekoracyjny wskaźnik ceny"})[lang] || "Decorative price indicator")}"><span class="listing-market-bar" aria-hidden="true"></span></div>`
      : "";
    return `
    <article class="card listing-card-horizontal${hasCover ? " has-cover" : " no-cover"}" data-listing-index="${index}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}" style="cursor:pointer">
      <div class="listing-card-media">
        ${cover}
        ${item.is_hot ? `<span class="hot-listing-badge" aria-label="${escapeHtml(({ru:"Горячее",uk:"Гаряче",en:"Hot",pl:"Gorące"})[lang] || "Hot")}">${escapeHtml(({ru:"Горячее",uk:"Гаряче",en:"Hot",pl:"Gorące"})[lang] || "Hot")}</span>` : ""}
      </div>
      <div class="listing-card-content">
        <div class="listing-card-heading">
          <h3>${escapeHtml(item.title || "")}</h3>
          <button class="fav-btn ${fav ? "active" : ""}" data-fav-id="${escapeHtml(String(item.id))}" type="button" aria-pressed="${fav ? "true" : "false"}" aria-label="${fav ? "Убрать из избранного" : "В избранное"}"><span aria-hidden="true">${fav ? "♥" : "♡"}</span></button>
        </div>
        ${specs.map(row => `<div class="listing-card-specs vehicle-card-specs">${row.join("")}</div>`).join("")}
        ${String(item.category || "") === "Автомобили" && item.vehicle_operational_condition ? `<p class="listing-card-condition">${escapeHtml(t(item.vehicle_operational_condition))}</p>` : ""}
        <p class="price"><span class="current-price">${money(item.price, item.currency || "UAH")}</span>${item.previous_price != null && Number(item.previous_price) !== Number(item.price) ? `<span class="old-price">${money(item.previous_price, item.currency || "UAH")}</span>` : ""}</p>
        ${marketScale}
        <div class="listing-card-meta">
          ${city ? `<span class="city">⌖ ${escapeHtml(city)}</span>` : ""}
          ${item.is_urgent ? `<span class="urgent-listing-badge">⏱ ${escapeHtml(({ru:"Срочно",uk:"Терміново",en:"Urgent",pl:"Pilne"})[lang] || "Urgent")}</span>` : ""}
          ${isOwner ? `<span class="owner-listing-badge">✓ ${escapeHtml(myListingLabel)}</span>` : ""}
        </div>
      </div>
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
  if (isSearching) { pendingListingsReload = true; return; }
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
    const color = value("vehicleColor");
    const sellerType = value("vehicleSellerType");
    const operationalConditionEl = document.getElementById("vehicleSearchOperationalCondition");
    const operationalCondition = operationalConditionEl ? String(operationalConditionEl.value || "").trim() : "";
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
    vehicleClientFilters = { make, model, yearFrom, yearTo, priceFrom, priceTo, currency, mileageFrom, mileageTo, engineFrom, engineTo, body, fuel, transmission, status, powerFrom, powerTo, doors, drive, color, sellerType, operationalCondition };
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
    if (operationalCondition) query = query.eq("vehicle_operational_condition", operationalCondition);
  }
  isSearching = true;
  setButtonLoading(searchBtn, true, t("Ищем…"));
  const vehicleApplyButton = currentCategory === "Автомобили" ? document.getElementById("vehicleSearchApply") : null;
  if (vehicleApplyButton) setButtonLoading(vehicleApplyButton, true, t("Ищем автомобили…"));
  try {
    const { data, error } = await query;
    if (error) { if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + error.message)}</div>`; return; }
    let rows = (data || []).slice();
    if (currentCategory === "Недвижимость" && propertySearchClientFilters) {
      const f = propertySearchClientFilters;
      const within = (value, min, max) => {
        if (min === null && max === null) return true;
        const n = Number(value);
        if (!Number.isFinite(n)) return false;
        return (min === null || n >= min) && (max === null || n <= max);
      };
      rows = rows.filter(item =>
        (!f.type || String(item.property_details?.type || item.property_type || "") === f.type) &&
        (f.deal === "Все" || String(item.property_details?.operation || item.property_operation || "") === f.deal) &&
        within(item.price, f.priceFrom, f.priceTo) &&
        within(item.property_details?.area_m2 ?? item.property_area_sqm ?? item.property_area ?? item.property_total_area, f.areaFrom, f.areaTo) &&
        (!f.rooms || String(item.property_details?.rooms ?? "") === f.rooms || (f.rooms === "5+" && Number(item.property_details?.rooms) >= 5)) &&
        within(item.property_details?.floor, f.floorFrom, f.floorTo) &&
        within(item.property_details?.floors_total, f.floorsFrom, f.floorsTo) &&
        within(item.property_details?.kitchen_area_m2, f.kitchenFrom, f.kitchenTo) &&
        (!f.building || item.property_details?.building_type === f.building) &&
        (!f.condition || item.property_details?.condition === f.condition) &&
        (!f.furniture || item.property_details?.furniture === f.furniture) &&
        (!f.balcony || item.property_details?.balcony === f.balcony) &&
        (!f.loggia || item.property_details?.loggia === f.loggia) &&
        within(item.property_details?.metro_distance_m, f.metroFrom, f.metroTo) &&
        within(item.property_details?.land_area_sotkas, f.landFrom, f.landTo)
      );
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
        (!f.operationalCondition || item.vehicle_operational_condition === f.operationalCondition) &&
        (String(item.currency || "UAH").toUpperCase() === f.currency)
      );
    }
    rows.sort((a, b) =>
      Number(Boolean(b.is_urgent || b.is_hot)) - Number(Boolean(a.is_urgent || a.is_hot))
    );
    renderListings(rows);
    if (currentCategory === "Автомобили") {
      const tab = ensureVehicleSearchTabs();
      tab.listings = rows.slice();
      tab.title = [
        document.getElementById("vehicleSearchMake")?.selectedOptions?.[0]?.textContent,
        document.getElementById("vehicleSearchModel")?.selectedOptions?.[0]?.textContent
      ].filter((value, index) => value && value.trim() && !/^(Усі марки|Все марки|All makes|Wszystkie marki|Усі моделі|Все модели|All models|Wszystkie modele)$/i.test(value.trim())).join(" ");
      captureVehicleSearchTab();
      tab.listings = rows.slice();
      renderVehicleSearchTabs();
    }
  } catch (error) {
    if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + (error.message || String(error)))}</div>`;
  } finally {
    isSearching = false;
    setButtonLoading(searchBtn, false);
    if (vehicleApplyButton) setButtonLoading(vehicleApplyButton, false);
    if (pendingListingsReload) {
      pendingListingsReload = false;
      loadListings();
    }
  }
}

// === Справочник марок/моделей ===
const categorySubcategories = {
  "Недвижимость": ["Квартиры", "Дома", "Комнаты", "Коммерческая недвижимость", "Гаражи и парковочные места", "Земельные участки"],
  "Готовый бизнес": ["Куплю готовый бизнес", "Продам готовый бизнес", "Ищу бизнес-партнёра", "Услуги"],
  "Инвестиции": ["Ищу инвестора", "Стану инвестором", "Стартапы"]
};
const categoryMenu = document.getElementById("categoryMenu");
const categoryMenuBackdrop = document.getElementById("categoryMenuBackdrop");
const categoryMenuTitle = document.getElementById("categoryMenuTitle");
function resetCatalogFilters() {
  currentCategory = "";
  selectedSearchCategory = "";
  selectedCatalogCityId = "";
  activeRegionCode = "";
  vehicleClientFilters = null;
  propertySearchClientFilters = null;
  if (searchInput) searchInput.value = "";
  if (catalogCitySearchInput) catalogCitySearchInput.value = "";
  if (catalogRegionSelect) catalogRegionSelect.value = "";
  if (vehicleSearchCityInput) vehicleSearchCityInput.value = "";
  if (vehicleSearchRegionSelect) vehicleSearchRegionSelect.value = "";
  closeVehicleSearchCitySuggestions();
  const categoryLabel = document.getElementById("categorySelectLabel");
  if (categoryLabel) categoryLabel.textContent = t("Все категории");
  document.querySelectorAll(".category").forEach(button => button.classList.remove("active"));
  ["vehicleSearchMake","vehicleSearchModel","vehicleYearFrom","vehicleYearTo","vehiclePriceFrom","vehiclePriceTo","vehicleMileageFrom","vehicleMileageTo","vehicleEngineFrom","vehicleEngineTo","vehicleBodyType","vehicleFuel","vehicleTransmission","vehicleSearchStatus","vehiclePowerFrom","vehiclePowerTo","vehicleDoors","vehicleDrive","vehicleColor","vehicleSellerType","vehicleSearchOperationalCondition"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  const model = document.getElementById("vehicleSearchModel");
  if (model) { model.innerHTML = `<option value="">${escapeHtml(t("Спочатку оберіть марку"))}</option>`; model.disabled = true; }
  const currency = document.getElementById("vehiclePriceCurrency");
  if (currency) currency.value = "UAH";
  const message = document.getElementById("vehicleSearchMessage");
  if (message) { message.textContent = ""; message.classList.remove("error"); }
}

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
// City suggestions are derived directly from citySearchIndex.
let propertySearchClientFilters = null;
function preparePropertySearchMenu() {
  const cityInput = document.getElementById("propertySearchCity");
  const citySuggestions = document.getElementById("propertySearchCitySuggestions");
  const regionSelect = document.getElementById("propertySearchRegion");
  const typeTrigger = document.getElementById("propertyTypeTrigger");
  const typeOptions = document.getElementById("propertyTypeOptions");
  if (!cityInput || cityInput.dataset.bound === "1") return;
  cityInput.dataset.bound = "1";

  const closePropertyTypeOptions = () => {
    if (typeOptions) typeOptions.hidden = true;
    typeTrigger?.setAttribute("aria-expanded", "false");
  };
  typeTrigger?.addEventListener("click", () => {
    if (!typeOptions) return;
    const open = typeOptions.hidden;
    typeOptions.hidden = !open;
    typeTrigger.setAttribute("aria-expanded", String(open));
  });
  typeOptions?.addEventListener("click", event => {
    const option = event.target.closest("[data-property-type]");
    if (!option || !typeTrigger) return;
    typeTrigger.dataset.value = option.dataset.propertyType || "";
    const selectedLabel = typeTrigger.querySelector(".property-type-label");
    if (selectedLabel) selectedLabel.textContent = option.textContent.trim();
    typeOptions.querySelectorAll("[data-property-type]").forEach(item => {
      const selected = item === option;
      item.setAttribute("aria-selected", String(selected));
      item.classList.toggle("is-selected", selected);
    });
    closePropertyTypeOptions();
  });
  typeTrigger?.addEventListener("keydown", event => {
    if (event.key === "Escape") closePropertyTypeOptions();
    if (event.key === "ArrowDown" && typeOptions) {
      event.preventDefault();
      typeOptions.hidden = false;
      typeTrigger.setAttribute("aria-expanded", "true");
      typeOptions.querySelector("[data-property-type]")?.focus();
    }
  });
  typeOptions?.addEventListener("keydown", event => {
    const options = [...typeOptions.querySelectorAll("[data-property-type]")];
    const current = options.indexOf(document.activeElement);
    if (event.key === "Escape") { closePropertyTypeOptions(); typeTrigger?.focus(); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      options[(current + delta + options.length) % options.length]?.focus();
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });
  const renderRegions = () => {
    if (!regionSelect) return;
    const codes = [...new Set(availableCities.map(city => String(city.region_katottg_code || "")).filter(Boolean))].sort();
    regionSelect.innerHTML = `<option value="">${escapeHtml(t("Область"))}</option>` + codes.map(code => `<option value="${escapeHtml(code)}">${escapeHtml(regionNames[code] || code)}</option>`).join("");
    regionSelect.value = activeRegionCode || "";
  };
  const renderSuggestions = () => {
    if (!citySuggestions) return;
    const term = cityInput.value.trim();
    const variants = getQueryVariants(term);
    const base = regionSelect?.value ? citySearchIndex.filter(entry => String(entry.city.region_katottg_code) === regionSelect.value) : citySearchIndex;
    const ranked = term ? base.map(entry => ({entry, rank: rankCityEntry(entry, variants)})).filter(item => item.rank >= 0).sort((a,b) => a.rank-b.rank || cityName(a.entry.city).localeCompare(cityName(b.entry.city))).slice(0,10).map(item => item.entry) : [];
    citySuggestions.innerHTML = ranked.length ? ranked.map(entry => renderCitySuggestionButton(entry, "property-city-suggestion")).join("") : `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation(term ? "Город не найден" : "Введите название города"))}</div>`;
    citySuggestions.hidden = false;
    cityInput.setAttribute("aria-expanded", "true");
  };
  const initCities = async () => {
    if (!availableCities.length) { try { await loadCities(); } catch (error) { console.error("Не удалось загрузить города для поиска недвижимости:", error); } }
    renderRegions();
    if (selectedCatalogCityId) {
      const selected = availableCities.find(city => String(city.id) === selectedCatalogCityId);
      if (selected) cityInput.value = cityName(selected);
    }
  };
  cityInput.addEventListener("focus", async () => { await initCities(); renderSuggestions(); });
  cityInput.addEventListener("input", () => { selectedCatalogCityId = ""; renderSuggestions(); });
  cityInput.addEventListener("keydown", event => {
    if (event.key === "Escape" && citySuggestions) citySuggestions.hidden = true;
    if (event.key === "Enter" && citySuggestions && !citySuggestions.hidden) {
      const first = citySuggestions.querySelector("[data-city-id]");
      const city = availableCities.find(item => String(item.id) === first?.dataset.cityId);
      if (city) { event.preventDefault(); selectCity(city); }
    }
  });
  const selectCity = city => {
    selectedCatalogCityId = String(city.id);
    cityInput.value = cityName(city);
    activeRegionCode = String(city.region_katottg_code || "");
    renderRegions();
    if (regionSelect) regionSelect.value = activeRegionCode;
    if (citySuggestions) citySuggestions.hidden = true;
    cityInput.setAttribute("aria-expanded", "false");
  };
  citySuggestions?.addEventListener("mousedown", event => { if (event.target.closest("[data-city-id]")) event.preventDefault(); });
  citySuggestions?.addEventListener("click", event => {
    const option = event.target.closest("[data-city-id]");
    const city = option && availableCities.find(item => String(item.id) === option.dataset.cityId);
    if (city) selectCity(city);
  });
  regionSelect?.addEventListener("focus", initCities, {once:true});
  regionSelect?.addEventListener("change", () => { activeRegionCode = regionSelect.value; selectedCatalogCityId = ""; cityInput.value = ""; if (citySuggestions) citySuggestions.hidden = true; });
  document.getElementById("propertyMoreToggle")?.addEventListener("click", () => {
    const toggle = document.getElementById("propertyMoreToggle");
    const fields = document.getElementById("propertyMoreFields");
    const open = toggle?.getAttribute("aria-expanded") !== "true";
    toggle?.setAttribute("aria-expanded", String(open));
    if (fields) fields.hidden = !open;
  });
  categoryMenuOptions?.querySelectorAll("[data-property-section]").forEach(button => button.addEventListener("click", () => {
    const section = button.dataset.propertySection;
    const content = section === "location" ? document.getElementById("propertyLocationFields") : section === "category" ? typeTrigger?.closest(".property-search-section")?.querySelector(".property-category-field") : button.closest(".property-search-section")?.querySelector(".real-estate-tabs");
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    if (content) content.hidden = !expanded;
  }));
  document.getElementById("propertyUseMapPoint")?.addEventListener("click", () => {
    const address = document.getElementById("propertySearchAddress");
    address?.focus();
    if (address && !address.value) address.placeholder = t("Введіть адресу або орієнтир");
  });
  document.getElementById("propertySearchApply")?.addEventListener("click", () => {
    const priceFrom = document.getElementById("propertyPriceFrom")?.value.trim() || "";
    const priceTo = document.getElementById("propertyPriceTo")?.value.trim() || "";
    const areaFrom = document.getElementById("propertyAreaFrom")?.value.trim() || "";
    const areaTo = document.getElementById("propertyAreaTo")?.value.trim() || "";
    const fromNumbers = [priceFrom, priceTo, areaFrom, areaTo].map(value => value === "" ? null : Number(value));
    if (fromNumbers.some(value => value !== null && (!Number.isFinite(value) || value < 0)) || (fromNumbers[0] !== null && fromNumbers[1] !== null && fromNumbers[0] > fromNumbers[1]) || (fromNumbers[2] !== null && fromNumbers[3] !== null && fromNumbers[2] > fromNumbers[3])) {
      showAiCategoryPrompt(t("Перевірте діапазони фільтрів."), t("Недвижимость"));
      return;
    }
    currentCategory = "Недвижимость";
    selectedSearchCategory = "Недвижимость";
    const numFilter = id => { const v = document.getElementById(id)?.value.trim() || ""; return v === "" ? null : Number(v); };
    propertySearchClientFilters = {
      type: typeTrigger?.dataset.value || "",
      deal: categoryMenu?.dataset.realEstateDeal || "Все",
      priceFrom: fromNumbers[0], priceTo: fromNumbers[1], areaFrom: fromNumbers[2], areaTo: fromNumbers[3],
      address: document.getElementById("propertySearchAddress")?.value.trim() || "",
      radius: document.getElementById("propertySearchRadius")?.value || "",
      rooms: document.getElementById("propertyFilterRooms")?.value || "",
      floorFrom: numFilter("propertyFilterFloorFrom"), floorTo: numFilter("propertyFilterFloorTo"),
      floorsFrom: numFilter("propertyFilterFloorsFrom"), floorsTo: numFilter("propertyFilterFloorsTo"),
      kitchenFrom: numFilter("propertyFilterKitchenFrom"), kitchenTo: numFilter("propertyFilterKitchenTo"),
      building: document.getElementById("propertyFilterBuilding")?.value || "",
      condition: document.getElementById("propertyFilterCondition")?.value || "",
      furniture: document.getElementById("propertyFilterFurniture")?.value || "",
      balcony: document.getElementById("propertyFilterBalcony")?.value || "",
      loggia: document.getElementById("propertyFilterLoggia")?.value || "",
      metroFrom: numFilter("propertyFilterMetroFrom"), metroTo: numFilter("propertyFilterMetroTo"),
      landFrom: numFilter("propertyFilterLandFrom"), landTo: numFilter("propertyFilterLandTo")
    };
    if (searchInput) searchInput.value = "";
    closeCategoryMenu();
    loadListings();
  });
  initCities();
}

function openCategoryMenu(parentCategory = "") {
  if (!categoryMenu || !categoryMenuOptions) return;

  const cats = [
    ["", "▦", "Все категории"], ["Автомобили", "🚗"], ["Недвижимость", "⌂"], ["Готовый бизнес", "▣"], ["Инвестиции", "▥"]
  ];

  if (parentCategory === "Недвижимость") {
    categoryMenuTitle.textContent = t("Недвижимость");
    const propertyTypes = categorySubcategories[parentCategory] || [];
    categoryMenu.dataset.realEstateDeal = "Все";
    categoryMenuOptions.innerHTML = `
      <div class="property-search-shell">
        <section class="property-search-section" aria-label="${escapeHtml(t("Локація"))}">
          <div class="property-location-grid" id="propertyLocationFields">
            <label class="property-search-field property-city-field"><input id="propertySearchCity" type="text" autocomplete="off" placeholder="${escapeHtml(t("Город"))}" aria-label="${escapeHtml(t("Город"))}" aria-expanded="false" aria-controls="propertySearchCitySuggestions"><div id="propertySearchCitySuggestions" class="property-city-suggestions" role="listbox" hidden></div></label>
            <label class="property-search-field"><select id="propertySearchRegion" aria-label="${escapeHtml(t("Область"))}"><option value="">${escapeHtml(t("Область"))}</option></select><span class="property-field-chevron" aria-hidden="true">⌄</span></label>
            <label class="property-search-field property-address-field"><input id="propertySearchAddress" type="text" placeholder="${escapeHtml(t("Адреса або точка на карті"))}" aria-label="${escapeHtml(t("Адреса або точка на карті"))}"><button type="button" id="propertyUseMapPoint" class="property-map-point" aria-label="${escapeHtml(t("Вказати точку на карті"))}" title="${escapeHtml(t("Вказати точку на карті"))}">⊙</button></label>
            <label class="property-search-field"><select id="propertySearchRadius" aria-label="${escapeHtml(t("Радіус, км"))}"><option value="">${escapeHtml(t("Радіус, км"))}</option><option value="5">5 км</option><option value="10">10 км</option><option value="20">20 км</option><option value="30">30 км</option><option value="50">50 км</option><option value="100">100 км</option></select><span class="property-field-chevron" aria-hidden="true">⌄</span></label>
          </div>
        </section>
        <section class="property-search-section" aria-label="${escapeHtml(t("Категорія нерухомості"))}">
          <div class="property-search-field property-category-field">
            
            <button type="button" id="propertyTypeTrigger" class="property-type-trigger" data-value="" aria-haspopup="listbox" aria-expanded="false" aria-controls="propertyTypeOptions" aria-label="${escapeHtml(t("Категорія нерухомості"))}"><span class="property-type-label">${escapeHtml(t("Оберіть категорію"))}</span><span class="property-field-chevron" aria-hidden="true">⌄</span></button>
            <div id="propertyTypeOptions" class="property-type-options" role="listbox" aria-label="${escapeHtml(t("Категорія нерухомості"))}" hidden>
              ${[``, ...propertyTypes].map(label => { const value = label; const text = label ? t(label) : t("Оберіть категорію"); return `<button type="button" class="property-type-option${!label ? " is-selected" : ""}" role="option" aria-selected="${!label ? "true" : "false"}" data-property-type="${escapeHtml(value)}">${escapeHtml(text)}<span class="property-type-radio" aria-hidden="true"></span></button>`; }).join("")}
            </div>
          </div>
        </section>
        <section class="property-search-section property-deal-section" aria-label="${escapeHtml(t("Тип угоди"))}">
          <div class="real-estate-tabs" role="tablist" aria-label="${escapeHtml(t("Тип угоди"))}">
            ${["Все", "Продажа", "Аренда"].map((label, index) => { const active = (categoryMenu.dataset.realEstateDeal || "Все") === label; return `<button type="button" class="real-estate-tab${active ? " active" : ""}" role="tab" aria-selected="${active ? "true" : "false"}" data-real-estate-deal="${escapeHtml(label)}">${escapeHtml(t(label))}</button>`; }).join("")}
          </div>
        </section>
        <button type="button" id="propertySearchApply" class="property-search-apply">${escapeHtml(t("Розширений пошук"))}<span aria-hidden="true">→</span></button>
        <section class="property-more-section">
          <button type="button" class="property-more-toggle" id="propertyMoreToggle" aria-expanded="false" aria-controls="propertyMoreFields"><span>${escapeHtml(t("Більше фільтрів"))}</span><span class="property-section-chevron" aria-hidden="true">⌄</span></button>
          <div id="propertyMoreFields" class="property-more-fields" hidden>
            <label>${escapeHtml(t("Ціна від"))}<input id="propertyPriceFrom" type="number" min="0" inputmode="numeric" placeholder="0"></label>
            <label>${escapeHtml(t("Ціна до"))}<input id="propertyPriceTo" type="number" min="0" inputmode="numeric" placeholder="${escapeHtml(t("Будь-яка ціна"))}"></label>
            <label>${escapeHtml(t("Площа від, м²"))}<input id="propertyAreaFrom" type="number" min="0" inputmode="decimal" placeholder="0"></label>
            <label>${escapeHtml(t("Площа до, м²"))}<input id="propertyAreaTo" type="number" min="0" inputmode="decimal" placeholder="${escapeHtml(t("Будь-яка"))}"></label>
            <label>${escapeHtml(t("Кількість кімнат"))}<select id="propertyFilterRooms"><option value="">${escapeHtml(t("Будь-яка кількість"))}</option>${["1","2","3","4","5+"].map(v=>`<option value="${v}">${v}</option>`).join("")}</select></label>
            <label>${escapeHtml(t("Тип будівлі"))}<select id="propertyFilterBuilding"><option value="">${escapeHtml(t("Будь-який"))}</option>${["Кирпичный","Панельный","Монолитный","Монолитно-кирпичный","Деревянный","Другое"].map(v=>`<option value="${v}">${escapeHtml(t(v))}</option>`).join("")}</select></label>
            <label>${escapeHtml(t("Етаж від"))}<input id="propertyFilterFloorFrom" type="number" min="0" step="1"></label>
            <label>${escapeHtml(t("Етаж до"))}<input id="propertyFilterFloorTo" type="number" min="0" step="1"></label>
            <label>${escapeHtml(t("Етажність будівлі від"))}<input id="propertyFilterFloorsFrom" type="number" min="1" step="1"></label>
            <label>${escapeHtml(t("Етажність будівлі до"))}<input id="propertyFilterFloorsTo" type="number" min="1" step="1"></label>
            <label>${escapeHtml(t("Площа кухні, м² від"))}<input id="propertyFilterKitchenFrom" type="number" min="0" step="0.1"></label>
            <label>${escapeHtml(t("Площа кухні, м² до"))}<input id="propertyFilterKitchenTo" type="number" min="0" step="0.1"></label>
            <label>${escapeHtml(t("Стан"))}<select id="propertyFilterCondition"><option value="">${escapeHtml(t("Будь-який"))}</option>${["Новостройка","Новый ремонт","Жилое состояние","Нужен ремонт","Под ремонт"].map(v=>`<option value="${v}">${escapeHtml(t(v))}</option>`).join("")}</select></label>
            <label>${escapeHtml(t("Меблі"))}<select id="propertyFilterFurniture"><option value="">${escapeHtml(t("Будь-який"))}</option>${["Есть","Нет","Частично"].map(v=>`<option value="${v}">${escapeHtml(t(v))}</option>`).join("")}</select></label>
            <label>${escapeHtml(t("Балкон"))}<select id="propertyFilterBalcony"><option value="">${escapeHtml(t("Будь-який"))}</option><option value="Есть">${escapeHtml(t("Есть"))}</option><option value="Нет">${escapeHtml(t("Нет"))}</option></select></label>
            <label>${escapeHtml(t("Лоджія"))}<select id="propertyFilterLoggia"><option value="">${escapeHtml(t("Будь-який"))}</option><option value="Есть">${escapeHtml(t("Есть"))}</option><option value="Нет">${escapeHtml(t("Нет"))}</option></select></label>
            <label>${escapeHtml(t("До метро, м від"))}<input id="propertyFilterMetroFrom" type="number" min="0"></label>
            <label>${escapeHtml(t("До метро, м до"))}<input id="propertyFilterMetroTo" type="number" min="0"></label>
            <label>${escapeHtml(t("Площа ділянки, соток від"))}<input id="propertyFilterLandFrom" type="number" min="0" step="0.1"></label>
            <label>${escapeHtml(t("Площа ділянки, соток до"))}<input id="propertyFilterLandTo" type="number" min="0" step="0.1"></label>
          </div>
        </section>
      </div>`;
    preparePropertySearchMenu();
  } else if (parentCategory) {
    delete categoryMenu.dataset.realEstateDeal;
    categoryMenuTitle.textContent = t(parentCategory === "Готовый бизнес" ? "Бизнес и предпринимательство" : parentCategory);
    const options = categorySubcategories[parentCategory] || [];
    categoryMenuOptions.innerHTML = options.map(label => `<button type="button" class="category-menu-option" data-search-category="${escapeHtml(parentCategory)}" data-search-subcategory="${escapeHtml(label)}"><span class="category-menu-icon" aria-hidden="true">•</span><span class="category-menu-option-label">${escapeHtml(t(label))}</span><span aria-hidden="true">›</span></button>`).join("");
  } else {
    delete categoryMenu.dataset.realEstateDeal;
    categoryMenuTitle.textContent = t("Категорії");
    categoryMenuOptions.innerHTML = cats.map(([key, icon, label]) => `<button type="button" class="category-menu-option" data-search-category="${escapeHtml(key)}" ${key ? 'data-open-submenu="1"' : 'data-all-categories="1"'}><span class="category-menu-icon" aria-hidden="true">${icon}</span><span class="category-menu-option-label">${escapeHtml(t(label || (key === "Готовый бизнес" ? "Бизнес и предпринимательство" : key)))}</span><span aria-hidden="true">›</span></button>`).join("");
  }
  categoryMenu.classList.remove("hidden");
  categoryMenuBackdrop?.classList.remove("hidden");
  categorySelectTrigger?.setAttribute("aria-expanded", "true");
}

// Single entry point for category cards and the text category picker.
// Keep state reset, labels, active card and menu selection in one place.
function openCategorySubmenu(category) {
  if (!category) return;

  resetCatalogFilters();
  if (category !== "Автомобили") {
    vehicleSearchTabs = [];
    activeVehicleSearchTabId = "";
    closeVehicleSearch();
  }

  selectedSearchCategory = category;
  currentCategory = category;

  if (categorySelectLabel) {
    categorySelectLabel.textContent = t(
      category === "Готовый бизнес" ? "Бизнес и предпринимательство" : category
    );
  }

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle("active", (button.dataset.category || "") === category);
  });

  if (category === "Автомобили") {
    openVehicleSearch();
    return;
  }

  // Real estate always opens the full tabbed menu, never the old Buy/Rent-only menu.
  openCategoryMenu(category);
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
  if (!menu || menu.dataset.searchUiPrepared === "1") return;
  menu.querySelectorAll("#vehicleOnlyUrgent, #vehicleOnlyHot").forEach(input => input.closest("label")?.remove());
  if (!document.getElementById("vehicleSearchTabs")) {
    const tabs = document.createElement("div");
    tabs.id = "vehicleSearchTabs";
    tabs.className = "vehicle-search-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", t("Вкладки поиска"));
    const heading = menu.querySelector("h2");
    heading?.insertAdjacentElement("afterend", tabs);
    tabs.addEventListener("click", event => {
      const closeButton = event.target.closest("[data-close-vehicle-tab]");
      if (closeButton) { event.preventDefault(); event.stopPropagation(); closeVehicleSearchTab(closeButton.dataset.closeVehicleTab); return; }
      const tabButton = event.target.closest("[data-vehicle-tab]");
      if (tabButton) { switchVehicleSearchTab(tabButton.dataset.vehicleTab); return; }
      if (event.target.closest("#vehicleSearchTabAdd")) addVehicleSearchTab();
    });
  }
  menu.dataset.searchUiPrepared = "1";
  ensureVehicleSearchTabs();
  renderVehicleSearchTabs();
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
  modelSelect.innerHTML = '<option value="">' + t("Усі моделі") + '</option>' + [...new Map(models.map(x => [x.model_slug,x.model_name])).entries()].map(([slug,name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`).join("");
  modelSelect.disabled = !make;
});
const vehicleListingFields = document.getElementById("vehicleListingFields");
const listingCategorySelect = addForm?.querySelector('select[name="category"]');
const vehicleListingMake = document.getElementById("vehicleListingMake");
const vehicleListingModel = document.getElementById("vehicleListingModel");
const vehicleListingMakeSpinner = document.getElementById("vehicleListingMakeSpinner");
const vehicleListingMakeStatus = document.getElementById("vehicleListingMakeStatus");
const listingTitleField = document.getElementById("listingTitleField");
const vehicleListingMore = document.getElementById("vehicleListingMore");
const vehicleMarketPanel = document.getElementById("vehicleMarketPanel");
const vehicleMarketPrice = document.getElementById("vehicleMarketPrice");
const vehicleMarketNote = document.getElementById("vehicleMarketNote");
const vehicleMarketAuthPrompt = document.getElementById("vehicleMarketAuthPrompt");
const vehicleAdvancedFields = document.getElementById("vehicleAdvancedFields");
const listingAdvancedCommonFields = document.getElementById("listingAdvancedCommonFields");
let vehicleMarketRequestId = 0;
function setVehicleAdvancedFields(expanded) {
  if (vehicleAdvancedFields) vehicleAdvancedFields.hidden = !expanded;
  if (listingAdvancedCommonFields) listingAdvancedCommonFields.hidden = !expanded && listingCategorySelect?.value === "Автомобили";
  const steps = vehicleListingFields?.querySelectorAll(".listing-progress-step") || [];
  steps.forEach((step, index) => {
    step.classList.toggle("is-active", expanded ? index === 1 : index === 0);
    step.classList.toggle("is-complete", expanded && index === 0);
  });
  const lines = vehicleListingFields?.querySelectorAll(".listing-progress > i") || [];
  lines.forEach((line, index) => line.classList.toggle("is-complete", expanded && index === 0));
}
const propertyListingFields = document.getElementById("propertyListingFields");
const propertyTypeSelect = document.getElementById("propertyType");
const propertyOperationSelect = document.getElementById("propertyOperation");
const listingCurrencyField = document.getElementById("listingCurrencyField");

function syncPropertyListingFields() {
  if (!propertyListingFields) return;
  const type = propertyTypeSelect?.value || "";
  propertyListingFields.hidden = listingCategorySelect?.value !== "Недвижимость";
  propertyListingFields.disabled = listingCategorySelect?.value !== "Недвижимость";
  propertyListingFields.querySelectorAll("[data-property-for]").forEach(field => {
    const allowedTypes = (field.dataset.propertyFor || "").split(",").map(value => value.trim());
    const visible = !type || allowedTypes.includes(type);
    field.hidden = !visible;
    field.querySelectorAll("input,select").forEach(control => {
      control.disabled = propertyListingFields.disabled || !visible;
    });
  });
  if (listingCurrencyField) listingCurrencyField.hidden = listingCategorySelect?.value !== "Недвижимость";
}

function syncVehicleListingFields() {
  const category = listingCategorySelect?.value || "";
  const isVehicle = category === "Автомобили";
  const isProperty = category === "Недвижимость";
  const hidesManualTitle = isVehicle || isProperty;
  if (vehicleListingFields) vehicleListingFields.hidden = !isVehicle;
  if (vehicleListingMore) vehicleListingMore.hidden = !isVehicle;
  if (vehicleMarketPanel) vehicleMarketPanel.hidden = true;
  if (vehicleAdvancedFields) vehicleAdvancedFields.hidden = true;
  if (listingAdvancedCommonFields) listingAdvancedCommonFields.hidden = isVehicle;
  vehicleListingFields?.querySelectorAll("input,select").forEach(el => { el.disabled = !isVehicle; });
  syncPropertyListingFields();
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
propertyTypeSelect?.addEventListener("change", syncPropertyListingFields);
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

async function estimateVehicleMarketPrice() {
  const requestId = ++vehicleMarketRequestId;
  if (!vehicleMarketPanel || !vehicleMarketPrice || !vehicleMarketNote) return;
  vehicleMarketPanel.hidden = false;
  vehicleMarketPrice.textContent = t("Рассчитываем ориентировочную цену…");
  vehicleMarketNote.textContent = t("Ищем похожие объявления в базе Hryvnia Hub.");
  const make = vehicleListingMake?.value;
  const model = vehicleListingModel?.value;
  const year = Number(addForm?.elements.namedItem("vehicle_year")?.value || 0);
  if (!make || !model || !year) {
    vehicleMarketPrice.textContent = t("Выберите марку, модель и год выпуска");
    vehicleMarketNote.textContent = t("Для предварительной оценки нужны все три параметра.");
    return;
  }
  if (!db) {
    vehicleMarketPrice.textContent = t("Оценка пока недоступна");
    vehicleMarketNote.textContent = t("Не удалось подключиться к базе объявлений.");
    return;
  }
  try {
    const { data, error } = await db.from("listings")
      .select("price, vehicle_year")
      .eq("category", "Автомобили")
      .eq("vehicle_make_slug", make)
      .eq("vehicle_model_slug", model)
      .not("price", "is", null)
      .limit(100);
    if (error) throw error;
    if (requestId !== vehicleMarketRequestId) return;
    const comparable = (data || []).filter(row => Number(row.price) > 0 && (!Number(row.vehicle_year) || Math.abs(Number(row.vehicle_year) - year) <= 3))
      .map(row => Number(row.price)).sort((a, b) => a - b);
    if (!comparable.length) {
      vehicleMarketPrice.textContent = t("Пока недостаточно данных для оценки");
      vehicleMarketNote.textContent = t("В базе пока нет достаточно похожих объявлений. Не будем придумывать цену.");
      return;
    }
    const percentile = (p) => comparable[Math.min(comparable.length - 1, Math.floor((comparable.length - 1) * p))];
    const low = Math.round(percentile(0.25));
    const high = Math.round(percentile(0.75));
    const format = value => new Intl.NumberFormat(lang === "uk" ? "uk-UA" : lang === "pl" ? "pl-PL" : lang === "en" ? "en-GB" : "ru-RU", { maximumFractionDigits: 0 }).format(value);
    vehicleMarketPrice.textContent = `${format(low)} – ${format(high)} грн`;
    const confidence = comparable.length < 3 ? "approximate" : comparable.length < 5 ? "preliminary" : "full";
    const confidenceText = {
      ru: { approximate: "Приблизительный ориентир", preliminary: "Предварительная оценка", full: "Полноценная оценка", low: "Мало данных — ориентир неточный", source: n => `Основано на ${n} похожих объявлениях Hryvnia Hub; это не вся рыночная выборка Украины.` },
      uk: { approximate: "Приблизний орієнтир", preliminary: "Попередня оцінка", full: "Повноцінна оцінка", low: "Мало даних — орієнтир неточний", source: n => `На основі ${n} схожих оголошень Hryvnia Hub; це не вся ринкова вибірка України.` },
      en: { approximate: "Approximate guide", preliminary: "Preliminary estimate", full: "Full estimate", low: "Limited data — this guide is less reliable", source: n => `Based on ${n} similar Hryvnia Hub listings; this is not the entire Ukrainian market.` },
      pl: { approximate: "Orientacyjna wskazówka", preliminary: "Wstępna wycena", full: "Pełna wycena", low: "Mało danych — cena jest mniej wiarygodna", source: n => `Na podstawie ${n} podobnych ogłoszeń Hryvnia Hub; to nie cały rynek Ukrainy.` }
    }[lang] || { approximate: "Approximate guide", preliminary: "Preliminary estimate", full: "Full estimate", low: "Limited data — this guide is less reliable", source: n => `Based on ${n} similar Hryvnia Hub listings; this is not the entire Ukrainian market.` };
    vehicleMarketNote.textContent = `${confidenceText[confidence]}: ${confidenceText.source(comparable.length)}${comparable.length < 3 ? ` ${confidenceText.low}.` : ""}`;
  } catch (error) {
    console.error("Не удалось рассчитать предварительную цену автомобиля", error);
    if (requestId !== vehicleMarketRequestId) return;
    vehicleMarketPrice.textContent = "Оценка временно недоступна";
    vehicleMarketNote.textContent = t("Не удалось получить сопоставимые объявления.");
  }
}
vehicleListingMore?.addEventListener("click", async () => {
  await estimateVehicleMarketPrice();
  if (currentUser) {
    if (vehicleMarketAuthPrompt) vehicleMarketAuthPrompt.hidden = true;
    setVehicleAdvancedFields(true);
  } else {
    if (vehicleMarketAuthPrompt) vehicleMarketAuthPrompt.hidden = false;
  }
});
document.getElementById("vehicleMarketLogin")?.addEventListener("click", () => {
  openAuthModal();
  document.querySelector('[data-auth-tab="login"]')?.click();
});
document.getElementById("vehicleMarketRegister")?.addEventListener("click", () => {
  openAuthModal();
  document.querySelector('[data-auth-tab="register"]')?.click();
});

categorySelectTrigger?.addEventListener("click", () => openCategoryMenu());

function openPropertyListingForm(propertyType = "", operation = "") {
  const categorySelect = addForm?.querySelector('select[name="category"]');
  if (!categorySelect || ![...categorySelect.options].some(option => option.value === "Недвижимость")) return;
  categorySelect.value = "Недвижимость";
  if (propertyTypeSelect) propertyTypeSelect.value = propertyType || "";
  if (propertyOperationSelect) {
    propertyOperationSelect.value = ["Продажа", "Аренда"].includes(operation) ? operation : "";
  }
  syncVehicleListingFields();
  closeCategoryMenu();
  closeAddCategoryMenu();
  addModal?.classList.remove("hidden");
  if (formMessage) formMessage.textContent = "";
}

categoryMenuOptions?.addEventListener("click", event => {
  if (!event.target.closest(".property-category-field")) {
    const typeOptions = document.getElementById("propertyTypeOptions");
    const typeTrigger = document.getElementById("propertyTypeTrigger");
    if (typeOptions) typeOptions.hidden = true;
    typeTrigger?.setAttribute("aria-expanded", "false");
  }
  const dealTab = event.target.closest("[data-real-estate-deal]");
  if (dealTab) {
    categoryMenu.dataset.realEstateDeal = dealTab.dataset.realEstateDeal || "Все";
    categoryMenuOptions.querySelectorAll("[data-real-estate-deal]").forEach(tab => {
      const active = tab === dealTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    return;
  }
  const option = event.target.closest("[data-search-category]"); if (!option) return;
  const category = option.dataset.searchCategory || "";
  if (option.hasAttribute("data-open-submenu")) {
    openCategorySubmenu(category);
    return;
  }
  const subcategory = option.dataset.searchSubcategory;
  if (category === "Недвижимость" && subcategory) {
    openPropertyListingForm(subcategory, categoryMenu.dataset.realEstateDeal || "Все");
    return;
  }
  // A category change starts a fresh catalog query; do not carry stale vehicle or city filters.
  resetCatalogFilters();
  if (category !== "Автомобили") { vehicleSearchTabs = []; activeVehicleSearchTabId = ""; }
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
      openCategorySubmenu(category);
      return;
    }
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active")); button.classList.add("active");
    resetCatalogFilters();
    if (category !== "Автомобили") { vehicleSearchTabs = []; activeVehicleSearchTabId = ""; }
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
  ["vehicleSearchMake","vehicleSearchModel","vehicleYearFrom","vehicleYearTo","vehiclePriceFrom","vehiclePriceTo","vehicleMileageFrom","vehicleMileageTo","vehicleEngineFrom","vehicleEngineTo","vehicleBodyType","vehicleFuel","vehicleTransmission","vehicleSearchStatus","vehiclePowerFrom","vehiclePowerTo","vehicleDoors","vehicleDrive","vehicleColor","vehicleSellerType","vehicleSearchOperationalCondition"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
  const currency = document.getElementById("vehiclePriceCurrency"); if (currency) currency.value = "UAH";
  selectedCatalogCityId = ""; activeRegionCode = "";
  if (vehicleSearchCityInput) vehicleSearchCityInput.value = "";
  if (vehicleSearchRegionSelect) vehicleSearchRegionSelect.value = "";
  if (catalogCitySearchInput) catalogCitySearchInput.value = "";
  if (catalogRegionSelect) catalogRegionSelect.value = "";
  closeVehicleSearchCitySuggestions();
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

// ==== Создание объявления: категория открывается без авторизации и ожидания загрузки городов ====
const openAddBtn = document.getElementById("openAdd");
if (openAddBtn) openAddBtn.addEventListener("click", () => openAddCategoryMenu());
const addCategoryMenu = document.getElementById("addCategoryMenu");
const addCategoryBackdrop = document.getElementById("addCategoryBackdrop");
function closeAddCategoryMenu() {
  addCategoryMenu?.classList.add("hidden");
  addCategoryBackdrop?.classList.add("hidden");
}
function openAddCategoryMenu() {
  if (!addCategoryMenu) { addModal?.classList.remove("hidden"); return; }
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
  if (category === "Недвижимость") {
    closeAddCategoryMenu();
    openCategoryMenu("Недвижимость");
    return;
  }
  const categorySelect = addForm?.querySelector('select[name="category"]');
  if (!categorySelect || ![...categorySelect.options].some(item => item.value === category)) return;
  categorySelect.value = category;
  categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
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
    const description = String(form.get("description") || "").trim();
    const generatedRealEstateTitle = selectedCategory === "Недвижимость"
      ? (description.split(/\r?\n/)[0].trim().slice(0, 100) || (translations["Недвижимость"]?.[lang] || "Недвижимость"))
      : "";
    const payload = {
      category: selectedCategory,
      title: selectedCategory === "Недвижимость" ? generatedRealEstateTitle : String(form.get("title") || "").trim(),
      city_id: Number(form.get("city_id")),
      price: Number(form.get("price")),
      currency: String(form.get("price_currency") || "UAH"),
      description,
      is_hot: false,
      is_urgent: false,
      user_id: currentUser?.id || null
    };
    if (selectedCategory === "Недвижимость") {
      const propertyType = String(form.get("property_type") || "").trim();
      const propertyOperation = String(form.get("property_operation") || "").trim();
      if (!propertyType || !propertyOperation) {
        if (formMessage) formMessage.textContent = "Выберите операцию и тип недвижимости.";
        (!propertyOperation ? propertyOperationSelect : propertyTypeSelect)?.focus();
        return;
      }
      const optionalNumber = name => {
        const value = String(form.get(name) || "").trim();
        return value === "" ? null : Number(value);
      };
      Object.assign(payload, {
        property_details: {
          operation: propertyOperation,
          type: propertyType,
          area_m2: optionalNumber("property_area"),
          rooms: String(form.get("property_rooms") || "") || null,
          floor: optionalNumber("property_floor"),
          floors_total: optionalNumber("property_floors_total"),
          kitchen_area_m2: optionalNumber("property_kitchen_area"),
          building_type: String(form.get("property_building_type") || "") || null,
          condition: String(form.get("property_condition") || "") || null,
          land_area_sotkas: optionalNumber("property_land_area"),
          furniture: String(form.get("property_furniture") || "") || null,
          balcony: String(form.get("property_balcony") || "") || null,
          loggia: String(form.get("property_loggia") || "") || null,
          metro_distance_m: optionalNumber("property_metro_distance"),
          school_distance_m: optionalNumber("property_school_distance"),
          stop_distance_m: optionalNumber("property_stop_distance")
        }
      });
      const typeLabel = translations[propertyType]?.[lang] || propertyType;
      const operationLabel = translations[propertyOperation]?.[lang] || propertyOperation;
      payload.title = `${typeLabel} — ${operationLabel.toLocaleLowerCase(lang === "uk" ? "uk-UA" : lang === "pl" ? "pl-PL" : lang === "en" ? "en-US" : "ru-RU")}`;
    }
    if (selectedCategory === "Автомобили") {
      const makeSlug = String(form.get("vehicle_make_slug") || "").trim();
      const modelSlug = String(form.get("vehicle_model_slug") || "").trim();
      if (!makeSlug || !modelSlug) {
        if (formMessage) formMessage.textContent = "Выберите марку и модель автомобиля.";
        (!makeSlug ? vehicleListingMake : vehicleListingModel)?.focus();
        return;
      }
      let catalog;
      try { catalog = await fetchAllVehicleModels(); }
      catch (error) {
        console.error("Не удалось проверить марку и модель автомобиля", error);
        if (formMessage) formMessage.textContent = "Не удалось проверить каталог автомобилей. Повторите попытку.";
        return;
      }
      const makeRow = catalog.find(row => String(row.make_slug) === makeSlug);
      const modelRow = catalog.find(row => String(row.make_slug) === makeSlug && String(row.model_slug) === modelSlug);
      if (!makeRow || !modelRow) {
        if (formMessage) formMessage.textContent = "Марка или модель не найдена в каталоге. Выберите их заново.";
        if (!makeRow) vehicleListingMake?.focus(); else vehicleListingModel?.focus();
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
        vehicle_operational_condition: form.get("vehicle_operational_condition") || null,
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
    // Validate the listing before asking the visitor to sign in.
    if (!currentUser) {
      pendingListingPublish = true;
      if (formMessage) {
        formMessage.textContent = t("Войдите, чтобы сохранить и опубликовать объявление");
        formMessage.classList.remove("success", "error");
      }
      // Keep the form and selected File objects in memory while auth is open.
      openAuthModal();
      return;
    }
    payload.user_id = currentUser.id;
    const withPhotos = selectedPhotos.length > 0;
    publishing = true;
    const controls = [...addForm.elements].map(control => [control, control.disabled]);
    const publishButton = addForm.querySelector('button[type="submit"]');
    const publishLabel = t("Сохранение и публикация…");
    controls.forEach(([control]) => { if (control !== publishButton) control.disabled = true; });
    setButtonLoading(publishButton, true, publishLabel);
    if (formMessage) formMessage.textContent = withPhotos ? photoText("saving") : publishLabel;
    try {
      if (withPhotos) {
        payload.image_urls = await uploadListingPhotos();
        payload.image_url = payload.image_urls[0];
      }
      const { data: insertedListings, error } = await db.from("listings").insert(payload).select("id");
      if (error) {
        const raw = String(error.message || "");
        if (/row-level security|permission denied|new row violates/i.test(raw)) {
          throw new Error(t("Ошибка") + ": " + raw + " — проверьте права доступа.");
        }
        throw error;
      }
      e.target.reset();
      resetPhotos();
      if (formMessage) formMessage.textContent = "Объявление опубликовано!";
      await loadListings();
      setTimeout(() => addModal?.classList.add("hidden"), 700);
    } catch (error) {
      if (formMessage) {
        const errorText = error?.message || String(error);
        formMessage.textContent = withPhotos
          ? (errorText === photoText("setup") ? errorText : `${photoText("failed")} ${errorText}`)
          : `Ошибка: ${errorText}`;
      }
    } finally {
      publishing = false;
      setButtonLoading(publishButton, false);
      controls.forEach(([control, disabled]) => {
        if (control !== publishButton) control.disabled = disabled;
      });
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
    vehiclePriceFrom: "Ціна від", vehiclePriceTo: "Ціна до",
    vehicleMileageFrom: "Пробіг від, км", vehicleMileageTo: "Пробіг до, км",
    vehicleEngineFrom: "Об’єм двигуна від, л", vehicleEngineTo: "Об’єм двигуна до, л", vehicleBodyType: "Тип кузова",
    vehicleFuel: "Паливо", vehicleTransmission: "Коробка передач", vehicleSearchStatus: "Стан авто",
    vehiclePowerFrom: "Потужність від, к. с.", vehiclePowerTo: "Потужність до, к. с.", vehicleDoors: "Кількість дверей",
    vehicleDrive: "Привід", vehicleColor: "Колір", vehicleSellerType: "Продавець",
    vehicleSearchOperationalCondition: "Технічний стан"
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
  if (model?.options[0]) model.options[0].textContent = t("Спочатку оберіть марку");
  const placeholderOptions = { vehicleBodyType: "Будь-який", vehicleFuel: "Будь-яке", vehicleTransmission: "Будь-яка", vehicleSearchStatus: "Будь-який", vehicleDoors: "Будь-яка", vehicleDrive: "Будь-який", vehicleColor: "Будь-який", vehicleSellerType: "Будь-хто", vehicleSearchOperationalCondition: "Будь-який" };
  Object.entries(placeholderOptions).forEach(([id, key]) => {
    const select = document.getElementById(id);
    if (select?.options[0]) select.options[0].textContent = t(key);
  });
  menu.querySelectorAll("select").forEach(select => {
    [...select.options].forEach((option, idx) => {
      if (idx === 0) return;
      const valueKey = String(option.value || "").trim();
      const raw = option.dataset.i18nOriginal || option.textContent.trim();
      if (!option.dataset.i18nOriginal) option.dataset.i18nOriginal = raw;
      const item = translations[valueKey] || translations[raw];
      if (item && item[lang]) option.textContent = item[lang];
    });
  });
  const currencyLabel = document.getElementById("vehiclePriceCurrency")?.closest("label");
  if (currencyLabel) { const textNode = [...currencyLabel.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()); if (textNode) textNode.textContent = t("Валюта") + " "; }
  const placeholderKeys = {
    vehicleYearFrom: "2010", vehicleYearTo: "2024", vehiclePriceFrom: "0",
    vehiclePriceTo: "Будь-яка ціна", vehicleMileageFrom: "Будь-який", vehicleMileageTo: "Будь-який",
    vehicleEngineFrom: "Будь-який", vehicleEngineTo: "Будь-який", vehiclePowerFrom: "Будь-яка", vehiclePowerTo: "Будь-яка"
  };
  Object.entries(placeholderKeys).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = key === "2010" || key === "2024" || key === "0" ? key : t(key);
  });
  const close = document.getElementById("vehicleSearchClose");
  if (close) close.setAttribute("aria-label", t("Закрыть"));
  const reset = document.getElementById("vehicleSearchReset");
  const apply = document.getElementById("vehicleSearchApply");
  if (reset) reset.textContent = t("Скинути");
  if (apply) apply.textContent = t("Застосувати");
  const toggle = document.getElementById("vehicleSearchToggleAdvanced");
  if (toggle) toggle.textContent = t(document.getElementById("vehicleSearchAdvanced")?.classList.contains("hidden") ? "Розширений пошук" : "Згорнути розширений пошук");
  setVehicleSearchAdvanced(Boolean(document.getElementById("vehicleSearchAdvanced") && !document.getElementById("vehicleSearchAdvanced").classList.contains("hidden")));
}

// Keep the final word of the business-category label smaller in every language.
function fitBusinessCategoryLabel() {
  const selector = '.category-card[data-category="Готовый бизнес"] .category-card-label > span[data-i18n]';
  const target = document.querySelector(selector);
  if (!target) return;

  const text = target.textContent.trim().replace(/\s+/g, " ");
  const splitAt = text.lastIndexOf(" ");
  if (splitAt < 1 || splitAt === text.length - 1) return;

  const prefix = text.slice(0, splitAt);
  const finalWord = text.slice(splitAt + 1);
  const current = target.querySelector(".category-card-long-word");

  if (
    current &&
    target.childNodes.length === 2 &&
    target.childNodes[1] === current &&
    current.textContent === finalWord &&
    target.childNodes[0].textContent === prefix + " "
  ) return;

  const smallWord = document.createElement("span");
  smallWord.className = "category-card-long-word";
  smallWord.textContent = finalWord;
  target.replaceChildren(document.createTextNode(prefix + " "), smallWord);
}

function translatePage(selectedLanguage) {
  lang = selectedLanguage;
  if (typeof loadMarketQuotes === "function") loadMarketQuotes();
  document.documentElement.lang = lang;
  localStorage.setItem("hryvniaHubLanguage", lang);
  updateLangButton();
  updateAuthTranslations();
  document.querySelectorAll("[data-i18n]").forEach(el => translateTextElement(el, el.dataset.i18n));
  fitBusinessCategoryLabel();
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
  translateTextElement(document.getElementById("openAdd"), "+ Добавить объявление");
  translateTextElement(document.getElementById("addCategoryTitle"), "Выберите категорию объявления");
  translateTextElement(document.querySelector(".hero-text"), "We open opportunities for entrepreneurs, business and investment");
  translateTextElement(document.querySelector(".banner-title-accent"), "More than just listings");
  translateTextElement(document.querySelector('.banner-title span[data-i18n="than just listings"]'), "than just listings");
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
    ["Основное", "Детали", "Фото", "Публикация"].forEach((key, index) => {
      const el = addModal.querySelectorAll(".listing-progress-step small")[index];
      if (el) el.textContent = t(key);
    });
    translateTextElement(addModal.querySelector("#vehicleMarketPanel h3"), "Ориентировочная рыночная цена");
    translateTextElement(addModal.querySelector("#vehicleMarketAuthPrompt > p"), "Войдите или зарегистрируйтесь, чтобы получить более точную рыночную оценку и продолжить заполнение объявления.");
    translateTextElement(addModal.querySelector("#vehicleMarketLogin"), "Вход");
    translateTextElement(addModal.querySelector("#vehicleMarketRegister"), "Регистрация");
    ["Ниже рынка", "Рыночная цена", "Выше рынка"].forEach((key, index) => {
      const el = addModal.querySelectorAll(".market-price-scale-labels span")[index];
      if (el) el.textContent = t(key);
    });
    translateTextElement(addModal.querySelector(".eyebrow"), "Новое объявление");
    translateTextElement(addModal.querySelector("h2"), "Добавить объявление");
    const vehicleLegend = addModal.querySelector("#vehicleListingFields legend");
    if (vehicleLegend) vehicleLegend.textContent = t("Характеристики автомобиля");
    const vehicleFieldLabels = {
      "vehicle_make_slug": "Марка автомобиля",
      "vehicle_model_slug": "Модель автомобиля",
      "vehicle_year": "Год выпуска",
      "vehicle_body_type": "Тип кузова",
      "vehicle_fuel_type": "Топливо",
      "vehicle_engine_liters": "Объём двигателя, л",
      "vehicle_power_hp": "Мощность, л.с.",
      "vehicle_transmission": "Коробка передач",
      "vehicle_drive": "Привод",
      "vehicle_mileage_km": "Пробег, км",
      "vehicle_condition": "Тип авто",
      "vehicle_operational_condition": "Техническое состояние",
      "vehicle_doors": "Количество дверей",
      "vehicle_color": "Цвет",
      "seller_type": "Тип продавца"
    };
    Object.entries(vehicleFieldLabels).forEach(([name, key]) => {
      const field = addModal.querySelector(`[name="${name}"]`);
      const label = field?.closest("label");
      if (!label) return;
      const textNode = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = t(key) + " ";
    });
    // Keep the shared fields of the add-listing form in the same translation flow.
    const sharedFieldLabels = [
      ["#citySearchInput", "Город"],
      ["#cityRegionSelect", "Область / регион"],
      ['input[name="price"]', "Цена, грн"],
      ['textarea[name="description"]', "Описание"]
    ];
    sharedFieldLabels.forEach(([selector, key]) => {
      const field = addModal.querySelector(selector);
      const label = field?.closest("label");
      if (!label) return;
      const textNode = [...label.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = t(key) + " ";
    });
    const cityInput = addModal.querySelector("#citySearchInput");
    if (cityInput) cityInput.placeholder = cityTranslation("Введите название города");
    const addDescriptionField = addModal.querySelector('textarea[name="description"]');
    if (addDescriptionField) addDescriptionField.placeholder = t("Коротко опишите предложение");
    const regionSelect = addModal.querySelector("#cityRegionSelect");
    if (regionSelect?.options[0]) regionSelect.options[0].textContent = cityTranslation("Все области");
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

const savedLanguage = localStorage.getItem("hryvniaHubLanguage");
translatePage(savedLanguage || "uk");

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
setInterval(loadMarketQuotes, 15 * 60 * 1000);
loadListings();
initAuth();


// Keep keyboard and modal viewport behavior in one place.
(() => {
  const modal = document.getElementById("messagesModal");
  const bottomNav = document.querySelector(".bottom-nav");
  const viewport = window.visualViewport;
  if (!modal) return;

  const updateVisibleViewport = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const keyboardOpen = Boolean(viewport && viewport.height < window.innerHeight * 0.85);
    bottomNav?.classList.toggle("keyboard-open", keyboardOpen);

    if (isMobile && viewport) {
      modal.style.top = `${Math.round(viewport.offsetTop)}px`;
      modal.style.bottom = "auto";
      modal.style.height = `${Math.round(viewport.height)}px`;
    } else {
      modal.style.removeProperty("top");
      modal.style.removeProperty("bottom");
      modal.style.removeProperty("height");
    }
  };

  viewport?.addEventListener("resize", updateVisibleViewport);
  viewport?.addEventListener("scroll", updateVisibleViewport);
  window.addEventListener("resize", updateVisibleViewport);
  updateVisibleViewport();
})();
