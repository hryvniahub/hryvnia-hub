// Hryvnia Hub MVP
// Вставим реальные значения Supabase перед публикацией.
// ВАЖНО: используем только публичный anon/publishable key, не service_role.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

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
  updateCities(data || []);
}

function updateCities(items) {
  const selected = cityFilter.value;
  const cities = [...new Set(items.map(x => x.city).filter(Boolean))].sort();
  cityFilter.innerHTML = `<option value="">Все города</option>` +
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
