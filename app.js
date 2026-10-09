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
const citySearchInput = document.getElementById("citySearchInput");
const citySuggestions = document.getElementById("citySuggestions");
const citySelect = document.getElementById("citySelect");
let availableCities = [];
const addModal = document.getElementById("addModal");
const formMessage = document.getElementById("formMessage");

// Фотографии для всех категорий объявлений.
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

function photoText(key) {
  return (photoTranslations[lang] || photoTranslations.ru)[key];
}

function renderPhotoPreview() {
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
  photoFields.disabled = publishing || validatingPhotos;
  document.getElementById("photoLabel").textContent = photoText("label");
  document.getElementById("photoPickerButton").textContent = photoText("add");
  document.getElementById("photoHint").textContent = photoText("hint");
  renderPhotoPreview();
}

function resetPhotos() {
  selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
  selectedPhotos = [];
  photoInput.value = "";
  photoMessage.textContent = "";
  updatePhotoFields();
}

document.getElementById("photoPickerButton").addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", async () => {
  if (publishing || validatingPhotos) return;
  const files = [...photoInput.files];
  photoInput.value = "";
  photoMessage.textContent = "";
  if (files.length + selectedPhotos.length > MAX_PHOTOS) {
    photoMessage.textContent = photoText("limit");
    return;
  }
  if (files.some(file => !PHOTO_TYPES[file.type] || !file.size || file.size > MAX_PHOTO_BYTES)) {
    photoMessage.textContent = photoText("invalid");
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
    photoMessage.textContent = photoText("unreadable");
  } finally {
    validatingPhotos = false;
    updatePhotoFields();
  }
});

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
  photoMessage.textContent = "";
  renderPhotoPreview();
});

async function uploadListingPhotos() {
  // Verify the schema before uploading, so a missing migration leaves no orphaned files.
  const { error: schemaError } = await db.from("listings").select("image_urls").limit(0);
  if (schemaError) throw new Error(photoText("setup"));
  const bucket = db.storage.from(PHOTO_BUCKET);
  const urls = [];
  for (const photo of selectedPhotos) {
    // Keep successful uploads for a retry after a network/insert failure.
    if (!photo.uploadedUrl) {
      // A previous request may have reached Storage even if its response was lost.
      const path = `${crypto.randomUUID()}.${PHOTO_TYPES[photo.file.type]}`;
      const { error } = await bucket.upload(path, photo.file, { contentType: photo.file.type, upsert: false });
      if (error) throw new Error(photoText("failed"));
      photo.uploadedUrl = bucket.getPublicUrl(path).data.publicUrl;
    }
    urls.push(photo.uploadedUrl);
  }
  return urls;
}

function listingCover(item) {
  const url = listingPhotos(item)[0];
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return "";
  return `<img class="listing-photo" tabindex="0" role="button" src="${escapeHtml(url)}" alt="${escapeHtml(item.title)}" loading="lazy">`;
}

let currentCategory = "";

function money(value) {
  return new Intl.NumberFormat("uk-UA").format(Number(value || 0)) + " грн";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

let visibleListings = [];

function listingPhotos(item) {
  return [...new Set([item.image_url, ...(Array.isArray(item.image_urls) ? item.image_urls : [])])]
    .filter(url => typeof url === "string" && /^https?:\/\//i.test(url));
}

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
    ${galleryOnly ? "" : `<span class="badge">${escapeHtml(translations[item.category]?.[lang] || item.category)}</span>
      <p class="city">${escapeHtml(item.cities?.[`name_${lang}`] || item.cities?.name_ru || item.city || "")}</p>
      <p class="price">${money(item.price)}</p>
      <p class="desc" style="white-space:pre-wrap">${escapeHtml(item.description || "")}</p>`}`;
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
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(event.key === "ArrowLeft" ? -1 : 1);
    }
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

listing.addEventListener("click", event => {
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

function renderListings(items) {
  visibleListings = items;
  resultCount.textContent =
  lang === "uk"
    ? `${items.length} оголошень`
    : lang === "en"
    ? `${items.length} listings`
    : lang === "pl"
    ? `${items.length} ogłoszeń`
    : `${items.length} объявлений`;

  if (!items.length) {
    listing.innerHTML = `<div class="empty">Объявлений пока нет. Добавьте первое!</div>`;
    return;
  }

  listing.innerHTML = items.map((item, index) => `
    <article class="card" data-listing-index="${index}" tabindex="0" role="button" aria-label="${escapeHtml(item.title)}" style="cursor:pointer">
      ${listingCover(item)}
      <div class="card-top">
        <span class="badge">${escapeHtml(translations[item.category]?.[lang] || item.category)}</span>
        <span class="city">${escapeHtml(
  item.cities?.[`name_${lang}`] || item.cities?.name_ru || "")}</span>
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

  let query = db.from("listings").select("*, cities(name_ru, name_uk, name_en, name_pl)").order("created_at", {ascending:false});

  if (currentCategory) query = query.eq("category", currentCategory);
  if (cityFilter.value) query = query.eq("city_id", cityFilter.value);

  const term = searchInput.value.trim();
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

  const { data, error } = await query;

  if (error) {
    listing.innerHTML = `<div class="empty">Не удалось загрузить объявления: ${escapeHtml(error.message)}</div>`;
    return;
  }

  renderListings(data || []);
  if (!window.hryvniaCitiesLoaded) {
  const allCities = [];
  const pageSize = 1000;
  let from = 0;
  let cityError = null;

  while (true) {
    const { data, error } = await db
      .from("cities")
      .select("id, name_ru, name_uk, name_en, name_pl")
      .order("id")
      .range(from, from + pageSize - 1);

    if (error) {
      cityError = error;
      break;
    }

    allCities.push(...(data || []));

    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  if (cityError) {
    console.error("Не удалось загрузить города:", cityError);
  } else {
    updateCities(allCities);
    window.hryvniaCitiesLoaded = true;
    console.log("Загружено городов:", allCities.length);
  }
  }
}

function cityTranslation(key) {
  return translations[key]?.[lang] || translations[key]?.ru || key;
}

function cityName(city) {
  return String(
    city[`name_${lang}`] || city.name_ru || city.name_uk || city.name_en || city.name_pl || ""
  ).trim();
}

function closeCitySuggestions() {
  citySuggestions.hidden = true;
  citySearchInput.setAttribute("aria-expanded", "false");
}

function renderCitySuggestions() {
  const term = citySearchInput.value.trim().toLocaleLowerCase();
  const matches = availableCities
    .filter(city => cityName(city).toLocaleLowerCase().includes(term))
    .slice(0, 12);

  citySuggestions.innerHTML = matches.length
    ? matches.map(city => `<button type="button" class="city-suggestion" role="option" data-city-id="${escapeHtml(city.id)}">${escapeHtml(cityName(city))}</button>`).join("")
    : `<div class="city-suggestion-empty" role="status">${escapeHtml(cityTranslation("Город не найден"))}</div>`;
  citySuggestions.hidden = false;
  citySearchInput.setAttribute("aria-expanded", "true");
}

function selectCity(city) {
  citySelect.value = String(city.id);
  citySearchInput.value = cityName(city);
  closeCitySuggestions();
  formMessage.textContent = "";
}

function updateCitySearchLanguage() {
  citySearchInput.placeholder = cityTranslation("Введите название города");
  const selectedCity = availableCities.find(
    city => String(city.id) === citySelect.value
  );
  if (selectedCity) citySearchInput.value = cityName(selectedCity);
  if (document.activeElement === citySearchInput && !citySuggestions.hidden) {
    renderCitySuggestions();
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
  availableCities = items || [];

  cityFilter.innerHTML = `<option value="">${cityTranslations[lang]}</option>` +
    availableCities.map(city => `<option value="${escapeHtml(city.id)}">
      ${escapeHtml(city[`name_${lang}`] || city.name_ru)}
    </option>`).join("");
  cityFilter.value = selected;

  updateCitySearchLanguage();
  if (document.activeElement === citySearchInput) renderCitySuggestions();
}

citySearchInput.addEventListener("input", () => {
  citySelect.value = "";
  renderCitySuggestions();
});
citySearchInput.addEventListener("focus", renderCitySuggestions);
citySearchInput.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCitySuggestions();
  if (event.key === "ArrowDown" && !citySuggestions.hidden) {
    const firstOption = citySuggestions.querySelector("[data-city-id]");
    if (firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
  }
});
citySuggestions.addEventListener("mousedown", event => {
  if (event.target.closest("[data-city-id]")) event.preventDefault();
});
citySuggestions.addEventListener("click", event => {
  const option = event.target.closest("[data-city-id]");
  if (!option) return;
  const city = availableCities.find(
    item => String(item.id) === option.dataset.cityId
  );
  if (city) selectCity(city);
});
document.addEventListener("click", event => {
  if (!citySearchInput.parentElement.contains(event.target)) {
    closeCitySuggestions();
  }
});

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
  if (publishing || validatingPhotos) return;
  formMessage.textContent = "";

  if (!db) {
    formMessage.textContent = "Сначала подключим Supabase — сейчас работает демо-режим.";
    return;
  }

  const form = new FormData(e.target);
  const cityId = form.get("city_id");
  if (!cityId || !availableCities.some(city => String(city.id) === cityId)) {
    formMessage.textContent = cityTranslation("Выберите город из списка");
    citySearchInput.focus();
    return;
  }
  const payload = {
    category: form.get("category"),
    title: form.get("title"),
    city_id: Number(form.get("city_id")),
    price: Number(form.get("price")),
    description: form.get("description") || ""
  };

  const withPhotos = selectedPhotos.length > 0;
  publishing = true;
  const controls = [...addForm.elements].map(control => [control, control.disabled]);
  controls.forEach(([control]) => { control.disabled = true; });
  if (withPhotos) formMessage.textContent = photoText("saving");
  try {
    if (withPhotos) {
      payload.image_urls = await uploadListingPhotos();
      payload.image_url = payload.image_urls[0];
    }
    const { error } = await db.from("listings").insert(payload);
    if (error) throw error;
    e.target.reset();
    resetPhotos();
    formMessage.textContent = "Объявление опубликовано!";
    await loadListings();
    setTimeout(() => addModal.classList.add("hidden"), 700);
  } catch (error) {
    formMessage.textContent = withPhotos
      ? (error.message === photoText("setup") ? error.message : photoText("failed"))
      : `Ошибка: ${error.message}`;
  } finally {
    publishing = false;
    controls.forEach(([control, disabled]) => { control.disabled = disabled; });
    updatePhotoFields();
  }
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
  },
  "Днепр": {
  ru: "Днепр",
  uk: "Дніпро",
  en: "Dnipro",
  pl: "Dniepr"
},
"Сумы": {
  ru: "Сумы",
  uk: "Суми",
  en: "Sumy",
  pl: "Sumy"
},
"Славянск": {
  ru: "Славянск",
  uk: "Слов'янськ",
  en: "Sloviansk",
  pl: "Słowiańsk"
},
    "Новое объявление": {
        ru: "Новое объявление",
        uk: "Нове оголошення",
        en: "New listing",
        pl: "Nowe ogłoszenie"
    },

    "Добавить объявление": {
        ru: "Добавить объявление",
        uk: "Додати оголошення",
        en: "Add listing",
        pl: "Dodaj ogłoszenie"
    },

    "Категория": {
        ru: "Категория",
        uk: "Категорія",
        en: "Category",
        pl: "Kategoria"
    },

    "Название": {
        ru: "Название",
        uk: "Назва",
        en: "Title",
        pl: "Nazwa"
    },

    "Город": {
        ru: "Город",
        uk: "Місто",
        en: "City",
        pl: "Miasto"
    },

    "Введите название города": {
        ru: "Введите название города",
        uk: "Введіть назву міста",
        en: "Type a city name",
        pl: "Wpisz nazwę miasta"
    },

    "Город не найден": {
        ru: "Город не найден",
        uk: "Місто не знайдено",
        en: "No city found",
        pl: "Nie znaleziono miasta"
    },

    "Выберите город из списка": {
        ru: "Выберите город из списка",
        uk: "Виберіть місто зі списку",
        en: "Select a city from the list",
        pl: "Wybierz miasto z listy"
    },

    "Цена, грн": {
        ru: "Цена, грн",
        uk: "Ціна, грн",
        en: "Price, UAH",
        pl: "Cena, UAH"
    },

    "Описание": {
        ru: "Описание",
        uk: "Опис",
        en: "Description",
        pl: "Opis"
    },

    "Опубликовать": {
        ru: "Опубликовать",
        uk: "Опублікувати",
        en: "Publish",
        pl: "Opublikuj"
    },

    "Например: Skoda Octavia 1.6": {
        ru: "Например: Skoda Octavia 1.6",
        uk: "Наприклад: Skoda Octavia 1.6",
        en: "Example: Skoda Octavia 1.6",
        pl: "Na przykład: Skoda Octavia 1.6"
    },

    "Коротко опишите предложение": {
        ru: "Коротко опишите предложение",
        uk: "Коротко опишіть пропозицію",
        en: "Briefly describe the offer",
        pl: "Krótko opisz ofertę"
    },
  "Листинг": {
    ru: "Листинг",
    uk: "ЛІСТИНГ",
    en: "LISTINGS",
    pl: "LISTINGS"
},

"Последние объявления": {
    ru: "Последние объявления",
    uk: "Останні оголошення",
    en: "Latest listings",
    pl: "Najnowsze ogłoszenia"
}
};
// ===============================
// Текущий язык
// ===============================
let lang =
  localStorage.getItem("hryvniaHubLanguage") || "uk";


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
  updatePhotoFields();

  document.documentElement.lang = lang;

  localStorage.setItem(
    "hryvniaHubLanguage",
    lang
  );
  translateTextElement(
  document.querySelector(".section-head .eyebrow"),
  "Листинг"
);

translateTextElement(
  document.querySelector(".section-head h2"),
  "Последние объявления"
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
  updateCitySearchLanguage();

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
  const listingLabel =
    document.getElementById("listingLabel");

  if (listingLabel) {
    const item =
      translations["Листинг"];

    if (item && item[lang]) {
      listingLabel.textContent =
        item[lang];
    }
  }

  const latestListingsTitle =
    document.getElementById("latestListingsTitle");

  if (latestListingsTitle) {
    const item =
      translations["Последние объявления"];

    if (item && item[lang]) {
      latestListingsTitle.textContent =
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
    },

"Листинг": {
  ru: "Листинг",
  uk: "Оголошення",
  en: "LISTINGS",
  pl: "OGŁOSZENЯ"
},

"Последние объявления": {
  ru: "Последние объявления",
  uk: "Останні оголошення",
  en: "Latest listings",
  pl: "Najnowsze ogłoszenia"
},

"Объявлений пока нет. Добавьте первое!": {
  ru: "Объявлений пока нет. Добавьте первое!",
  uk: "Оголошень поки немає. Додайте перше!",
  en: "No listings yet. Add the first one!",
  pl: "Nie ma jeszcze ogłoszeń. Dodaj pierwsze!"
},

"Загрузка объявлений…": {
  ru: "Загрузка объявлений…",
  uk: "Завантаження оголошень…",
  en: "Loading listings…",
  pl: "Ładowanie ogłoszeń…"
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
// Модальное окно добавления
// --------------------------------

const modal = document.getElementById("addModal");

if (modal) {
    const modalEyebrow = modal.querySelector(".eyebrow");
    if (modalEyebrow) {
        translateTextElement(
            modalEyebrow,
            "Новое объявление"
        );
    }

    const modalTitle = modal.querySelector("h2");
    if (modalTitle) {
        translateTextElement(
            modalTitle,
            "Добавить объявление"
        );
    }

    const labels = modal.querySelectorAll("label");

    const labelKeys = [
        "Категория",
        "Название",
        "Город",
        "Цена, грн",
        "Описание"
    ];

    labels.forEach((label, index) => {
        const key = labelKeys[index];

        if (!key) return;

        const item = translations[key];

        if (!item || !item[lang]) return;

        const textNode = [...label.childNodes].find(
            node =>
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim()
        );

        if (textNode) {
            textNode.textContent = item[lang] + "\n";
        }
    });

    const categorySelect =
        modal.querySelector('select[name="category"]');

    if (categorySelect) {
        const categoryKeys = [
            "Автомобили",
            "Недвижимость",
            "Готовый бизнес",
            "Инвестиции"
        ];

        [...categorySelect.options].forEach(
            (option, index) => {
                const key = categoryKeys[index];
                const item = translations[key];

                if (item && item[lang]) {
                    option.textContent = item[lang];
                }
            }
        );
    }

    const titleInput =
        modal.querySelector('input[name="title"]');

    if (titleInput) {
        titleInput.placeholder =
            translations[
                "Например: Skoda Octavia 1.6"
            ][lang];
    }

    const descriptionInput =
        modal.querySelector(
            'textarea[name="description"]'
        );

    if (descriptionInput) {
        descriptionInput.placeholder =
            translations[
                "Коротко опишите предложение"
            ][lang];
    }

    const publishButton =
        modal.querySelector('button[type="submit"]');

    if (publishButton) {
        translateTextElement(
            publishButton,
            "Опубликовать"
        );
    }
  loadListings();
            }  
  // Языковой переключатель
  // --------------------------------
  // Языковой переключатель
  // --------------------------------
  const languageSwitcher =
    document.getElementById(
      "languageSwitcher"
    );

  if (languageSwitcher) {
    if (languageSwitcher.options[0]) {
      languageSwitcher.options[0].textContent =
        "🇷🇺 Русский";
    }

    if (languageSwitcher.options[1]) {
      languageSwitcher.options[1].textContent =
        "🇺🇦 Українська";
    }

    if (languageSwitcher.options[2]) {
      languageSwitcher.options[2].textContent =
        "🇬🇧 English";
    }

    if (languageSwitcher.options[3]) {
      languageSwitcher.options[3].textContent =
        "🇵🇱 Polski";
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
