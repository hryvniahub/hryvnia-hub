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
  "Все города": { ru: "Все города", uk: "Усі міста", en: "All cities", pl: "Wszystkie miasta" },
  "Все области": { ru: "Все области", uk: "Всі області", en: "All regions", pl: "Wszystkie regiony" },
  "Найти": { ru: "Найти", uk: "Знайти", en: "Search", pl: "Szukaj" },
  "Все": { ru: "Все", uk: "Усі", en: "All", pl: "Wszystkie" },
  "Все объявления": { ru: "Все объявления", uk: "Усі оголошення", en: "All listings", pl: "Wszystkie ogłoszenia" },
  "Автомобили": { ru: "Автомобили", uk: "Автомобілі", en: "Cars", pl: "Samochody" },
  "Недвижимость": { ru: "Недвижимость", uk: "Нерухомість", en: "Real estate", pl: "Nieruchomości" },
  "Готовый бизнес": { ru: "Готовый бизнес", uk: "Готовий бізнес", en: "Ready-made business", pl: "Gotowy biznes" },
  "Инвестиции": { ru: "Инвестиции", uk: "Інвестиції", en: "Investments", pl: "Inwestycje" },
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
  "Объявление": { ru: "Объявление", uk: "Оголошення", en: "Listing", pl: "Ogłoszenie" }
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

function money(value) {
  const localeMap = { uk: "uk-UA", ru: "ru-RU", en: "en-US", pl: "pl-PL" };
  const isoCurrency = lang === "en" ? "USD" : lang === "pl" ? "PLN" : "UAH";
  try {
    return new Intl.NumberFormat(localeMap[lang] || "uk-UA", {
      style: "currency",
      currency: isoCurrency,
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return new Intl.NumberFormat("uk-UA").format(Number(value || 0)) + " грн";
  }
}

function listingPhotos(item) {
  return [...new Set([item.image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])])]
    .filter(url => typeof url === "string" && /^https?:\/\//i.test(url));
}

function listingCover(item) {
  const url = listingPhotos(item)[0];
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return "";
  return `<img class="listing-photo" tabindex="0" role="button" src="${escapeHtml(url)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
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
    if (currentUser) await syncFavoritesOnLogin();
  } catch (error) {
    console.error("getSession failed:", error);
  }
  db.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user || null;
    updateAccountButton();
    if (event === "PASSWORD_RECOVERY") {
      authRecoveryMode = true;
      openAuthModal();
      return;
    }
    if (event === "SIGNED_IN") {
      if (authModal && !authModal.classList.contains("hidden")) renderAuthModal();
      await syncFavoritesOnLogin();
      renderListings(visibleListings);
    }
    if (event === "SIGNED_OUT") {
      authRecoveryMode = false;
      closeAuthModal();
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

async function uploadListingPhotos() {
  const { error: schemaError } = await db.from("listings").select("image_urls").limit(0);
  if (schemaError) throw new Error(photoText("setup"));
  const bucket = db.storage.from(PHOTO_BUCKET);
  const urls = [];
  for (const photo of selectedPhotos) {
    if (!photo.uploadedUrl) {
      const path = `${crypto.randomUUID()}.${PHOTO_TYPES[photo.file.type]}`;
      const { error } = await bucket.upload(path, photo.file, { contentType: photo.file.type, upsert: false });
      if (error) throw new Error(photoText("failed"));
      photo.uploadedUrl = bucket.getPublicUrl(path).data.publicUrl;
    }
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
  if (!data || !data.length) { favoritesList.innerHTML = `<p class="muted">${escapeHtml(t("В избранном пока ничего нет."))}</p>`; return; }
  favoritesList.innerHTML = data.map(item => `
    <article class="card fav-card" data-fav-open-id="${escapeHtml(String(item.id))}" tabindex="0">
      ${listingCover(item)}
      <h3>${escapeHtml(item.title)}</h3>
      <p class="price">${money(item.price)}</p>
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
}
async function loadConversations() {
  if (!db || !currentUser || !conversationsList) return;
  conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Загрузка…"))}</p>`;
  const { data, error } = await db.from("conversations")
    .select("id, listing_id, buyer_id, seller_id, updated_at, listings(title)")
    .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
    .order("updated_at", { ascending: false });
  if (error) { conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Ошибка") + ": " + error.message)}</p>`; return; }
  if (!data || !data.length) { conversationsList.innerHTML = `<p class="muted">${escapeHtml(t("Сообщений пока нет."))}</p>`; return; }
  conversationsList.innerHTML = data.map(c => `
    <button type="button" class="conversation-item" data-conv-id="${escapeHtml(c.id)}">
      <span class="conv-title">${escapeHtml(c.listings?.title || t("Объявление"))}</span>
      <span class="conv-time">${c.updated_at ? new Date(c.updated_at).toLocaleDateString() : ""}</span>
    </button>
  `).join("");
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
function setTickerValue(key, display, numeric) {
  const el = document.querySelector(`[data-ticker="${key}"]`);
  if (el) el.textContent = display;
  const arrow = document.querySelector(`[data-ticker-arrow="${key}"]`);
  if (!arrow) return;
  arrow.className = "ticker-arrow";
  arrow.textContent = "";
  if (!Number.isFinite(numeric)) return;
  const prev = loadTickerPrev();
  const prevVal = Number(prev[key]);
  if (Number.isFinite(prevVal) && prevVal !== 0) {
    if (numeric > prevVal)       { arrow.textContent = "▲"; arrow.classList.add("up"); }
    else if (numeric < prevVal)  { arrow.textContent = "▼"; arrow.classList.add("down"); }
    else                         { arrow.textContent = "•"; arrow.classList.add("flat"); }
  }
  prev[key] = numeric;
  saveTickerPrev(prev);
}
const tickerLocale = { ru: "ru-RU", uk: "uk-UA", en: "en-US", pl: "pl-PL" };
function formatTickerNumber(value, digits = 2) {
  return new Intl.NumberFormat(tickerLocale[lang] || "uk-UA", {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  }).format(value);
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
async function loadMarketQuotes() {
  const note = document.getElementById("tickerNote");
  const unavailable = () => (translations["Quote unavailable"]?.[lang] || "Unavailable");
  const jobs = [
    ["usd", async () => {
      const data = await fetchJsonWithFallback("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json");
      const row = Array.isArray(data) ? data[0] : null;
      const numeric = Number(row?.rate);
      if (!Number.isFinite(numeric)) throw new Error("USD rate missing");
      return { display: `${formatTickerNumber(numeric)} ₴`, numeric };
    }],
    ["eur", async () => {
      const data = await fetchJsonWithFallback("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&json");
      const row = Array.isArray(data) ? data[0] : null;
      const numeric = Number(row?.rate);
      if (!Number.isFinite(numeric)) throw new Error("EUR rate missing");
      return { display: `${formatTickerNumber(numeric)} ₴`, numeric };
    }],
    ["pln", async () => {
      const data = await fetchJsonWithFallback("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=PLN&json");
      const row = Array.isArray(data) ? data[0] : null;
      const numeric = Number(row?.rate);
      if (!Number.isFinite(numeric)) throw new Error("PLN rate missing");
      return { display: `${formatTickerNumber(numeric)} ₴`, numeric };
    }],
    ["btc", async () => {
      const data = await fetchJsonWithFallback("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah");
      const numeric = Number(data?.bitcoin?.uah);
      if (!Number.isFinite(numeric)) throw new Error("BTC rate missing");
      return { display: `${formatTickerNumber(numeric, 0)} ₴`, numeric };
    }],
    ["sp500", async () => {
      const data = await fetchJsonWithFallback("https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=1d");
      const numeric = Number(data?.chart?.result?.[0]?.meta?.regularMarketPrice);
      if (!Number.isFinite(numeric)) throw new Error("S&P 500 quote missing");
      return { display: formatTickerNumber(numeric), numeric };
    }],
    ["brent", async () => {
      const data = await fetchJsonWithFallback("https://query1.finance.yahoo.com/v8/finance/chart/BZ%3DF?range=1d&interval=1d");
      const numeric = Number(data?.chart?.result?.[0]?.meta?.regularMarketPrice);
      if (!Number.isFinite(numeric)) throw new Error("Brent quote missing");
      return { display: `$${formatTickerNumber(numeric)}`, numeric };
    }]
  ];
  let successes = 0;
  await Promise.all(jobs.map(async ([key, getter]) => {
    try {
      const { display, numeric } = await getter();
      setTickerValue(key, display, numeric);
      successes++;
    } catch (error) {
      console.warn(`Market quote ${key} unavailable:`, error);
      setTickerValue(key, unavailable(), null);
    }
  }));
  if (note) {
    const sourceKey = "Market quotes: NBU, CoinGecko and Yahoo Finance";
    note.textContent = translations[sourceKey]?.[lang] || sourceKey;
    note.title = successes < jobs.length
      ? (lang === "ru" ? "Некоторые источники котировок могут быть временно недоступны."
        : lang === "uk" ? "Деякі джерела котирувань можуть бути тимчасово недоступні."
        : lang === "pl" ? "Niektóre źródła notowań mogą być chwilowo niedostępne."
        : "Some quote sources may be temporarily unavailable.")
      : "";
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
  const regionNameUk = regionNames[String(city.region_katottg_code)] || "";
  const regionToken = normalizeCitySearch(regionNameUk);
  return { city, nameTokens: [...nameTokens], regionToken, regionNameUk };
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
    select.innerHTML = `<option value="">${escapeHtml(allRegionsLabel)}</option>` +
      regionCodes.map(code => `<option value="${escapeHtml(code)}">${escapeHtml(regionNames[code] || "")}</option>`).join("");
    select.value = regionCodes.includes(current) ? current : "";
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
    formRegionCode = cityRegionSelect.value;
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
      <p class="price">${money(item.price)}</p>
      <p class="desc" style="white-space:pre-wrap">${escapeHtml(item.description || "")}</p>
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

function renderListings(items) {
  visibleListings = items;
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
    return `
    <article class="card" data-listing-index="${index}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}" style="cursor:pointer">
      <button class="fav-btn ${fav ? "active" : ""}" data-fav-id="${escapeHtml(String(item.id))}" type="button" aria-pressed="${fav ? "true" : "false"}" aria-label="${fav ? "Убрать из избранного" : "В избранное"}">
        <span aria-hidden="true">${fav ? "♥" : "♡"}</span>
      </button>
      ${listingCover(item)}
      <div class="card-top">
        <span class="badge">${categoryLabel(item)}</span>
        <span class="city">${escapeHtml(item.cities?.[`name_${lang}`] || item.cities?.name_ru || "")}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="price">${money(item.price)}</p>
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
  isSearching = true;
  setButtonLoading(searchBtn, true, "");
  try {
    const { data, error } = await query;
    if (error) { if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + error.message)}</div>`; return; }
    renderListings(data || []);
  } catch (error) {
    if (listing) listing.innerHTML = `<div class="empty">${escapeHtml(t("Ошибка") + ": " + (error.message || String(error)))}</div>`;
  } finally {
    isSearching = false;
    setButtonLoading(searchBtn, false);
  }
}

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.category;
    const listingLabelEl = document.getElementById("listingLabel");
    const latestListingsTitleEl = document.getElementById("latestListingsTitle");
    if (listingLabelEl) listingLabelEl.textContent = t("Листинг");
    if (latestListingsTitleEl) latestListingsTitleEl.textContent = t("Последние объявления");
    loadListings();
  });
});
if (searchBtn) searchBtn.addEventListener("click", loadListings);
if (searchInput) searchInput.addEventListener("keydown", e => { if (e.key === "Enter") loadListings(); });

const openAddBtn = document.getElementById("openAdd");
if (openAddBtn) openAddBtn.addEventListener("click", () => addModal?.classList.remove("hidden"));
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
    const payload = {
      category: form.get("category"),
      title: form.get("title"),
      city_id: Number(form.get("city_id")),
      price: Number(form.get("price")),
      description: form.get("description") || "",
      user_id: currentUser?.id || null
    };
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
      const { error } = await db.from("listings").insert(payload);
      if (error) throw error;
      e.target.reset();
      resetPhotos();
      if (formMessage) formMessage.textContent = "Объявление опубликовано!";
      await loadListings();
      setTimeout(() => addModal?.classList.add("hidden"), 700);
    } catch (error) {
      if (formMessage) formMessage.textContent = withPhotos
        ? (error.message === photoText("setup") ? error.message : photoText("failed"))
        : `Ошибка: ${error.message}`;
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
function translatePage(selectedLanguage) {
  lang = selectedLanguage;
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
  translateTextElement(document.getElementById("openAdd"), "+ Добавить объявление");
  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) {
    const title = translations["Найди выгодное"];
    const deal = translations["предложение"];
    if (title && deal) heroTitle.innerHTML = `${title[lang]}<br>${deal[lang]}`;
  }
  translateTextElement(document.querySelector(".hero-text"), "Автомобили, недвижимость и готовый бизнес — в одном месте.");
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
    const labels = addModal.querySelectorAll("label");
    const labelKeys = ["Категория", "Название", "Город", "Цена, грн", "Описание"];
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
      const categoryKeys = ["Автомобили", "Недвижимость", "Готовый бизнес", "Инвестиции"];
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

// === КОНЕЦ ФАЙЛА ===
