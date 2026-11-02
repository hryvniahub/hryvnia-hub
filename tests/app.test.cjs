const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(require("node:path").join(__dirname, "../app.js"), "utf8");
const propertyTemplate = readFileSync(require("node:path").join(__dirname, "../index.html"), "utf8");
function section(start, end) {
  const first = source.indexOf(start);
  const last = source.indexOf(end, first);
  assert.ok(first >= 0 && last > first, `Missing app.js section: ${start}`);
  return source.slice(first, last);
}
const loader = section("async function loadListings(", "// ===");
const submit = section('addForm.addEventListener("submit", async e => {', '\n}\n\nfunction translateTextElement');
const buttonHelper = section("function setButtonLoading(", "const listing =");
const landHelper = section("function propertyLandAreaM2(", "function propertyCardSpecs(");
const noop = () => {};
const tick = () => new Promise(setImmediate);
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function element(value = "") {
  const classes = new Set();
  return {
    value, defaultValue: value, disabled: false, dataset: {}, innerHTML: "Publish", textContent: "",
    classList: {
      add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name)
    },
    setAttribute: noop, removeAttribute: noop, scrollIntoView: noop
  };
}

const districtRows = [
  { id: "coded", property_details: { district_code: "D1", district: "Central" } },
  { id: "coded-renamed", property_details: { district_code: "D1", district: "Renamed" } },
  { id: "code-only", property_details: { district_code: "D1" } },
  { id: "nested", property_details: { district: "CENTRAL" } },
  { id: "top-level", district: "Central" },
  { id: "other-code", property_details: { district_code: "D2", district: "Central" } },
  { id: "other-name", property_details: { district: "Other" } },
  { id: "empty" }
];
async function findDistrict(filters) {
  let results;
  const query = {
    select: () => query, order: () => query, eq: () => query,
    then: (resolve, reject) => Promise.resolve({ data: districtRows }).then(resolve, reject)
  };
  const context = vm.createContext({
    db: { from: () => query }, currentCategory: "Недвижимость",
    isSearching: false, pendingListingsReload: false, selectedCatalogCityId: "", activeRegionCode: "",
    searchInput: null, searchBtn: null, listing: element(), window: {},
    document: { getElementById: () => null }, t: value => value, setButtonLoading: noop,
    escapeHtml: value => value, renderListings: rows => { results = Array.from(rows, row => row.id); },
    ensurePropertySearchTabs: () => ({}), capturePropertySearchTab: noop, renderPropertySearchTabs: noop,
    propertySearchClientFilters: {
      deal: "Все", priceFrom: null, priceTo: null, areaFrom: null, areaTo: null,
      floorFrom: null, floorTo: null, floorsFrom: null, floorsTo: null,
      kitchenFrom: null, kitchenTo: null, metroFrom: null, metroTo: null,
      landFrom: null, landTo: null, district: "", cityDistrictCode: "", ...filters
    }
  });
  vm.runInContext(landHelper + loader, context);
  await context.loadListings();
  assert.ok(results, context.listing.innerHTML);
  return results;
}

for (const [name, filters, expected] of [
  ["no district", {}, districtRows.map(row => row.id)],
  ["code-only selection", { cityDistrictCode: "D1" }, ["coded", "coded-renamed", "code-only"]],
  ["code takes precedence; legacy text fallback", { cityDistrictCode: "D1", district: "Central" },
    ["coded", "coded-renamed", "code-only", "nested", "top-level"]],
  ["text-only selection", { district: "Central" }, ["coded", "nested", "top-level", "other-code"]],
  ["different name excluded", { district: "Other" }, ["other-name"]],
  ["unmatched district", { district: "Missing" }, []]
]) {
  test(`S1: ${name}`, async () => assert.deepEqual(await findDistrict(filters), expected));
}

function publisher(category = "Готовый бизнес") {
  const fields = Object.fromEntries([
    "title", "price", "description", "generic_city_id", "city_id", "vehicle_city_id",
    "vehicle_price", "vehicle_description", "vehicle_make_slug", "vehicle_model_slug",
    "vehicle_price_currency", "vehicle_year", "vehicle_mileage_km", "vehicle_engine_liters",
    "vehicle_power_hp", "vehicle_fuel_type", "vehicle_transmission",
    "property_price", "property_description", "property_type", "property_operation"
  ].map(name => [name, Object.assign(element(), { name })]));
  fields.category = Object.assign(element("Автомобили"), { name: "category" });
  const disabled = Object.assign(element(), { disabled: true });
  const button = element();
  const form = {
    elements: [...Object.values(fields), disabled, button],
    querySelector: selector => selector === 'button[type="submit"]' ? button : null,
    addEventListener: (name, handler) => { assert.equal(name, "submit"); form.submit = handler; },
    reportValidity: () => {
      const name = fields.category.value === "Автомобили" ? "vehicle_price"
        : fields.category.value === "Недвижимость" ? "property_price" : "price";
      return fields[name].value !== "" && Number(fields[name].value) >= 0;
    },
    reset: () => Object.values(fields).forEach(field => { field.value = field.defaultValue; })
  };
  const fill = () => {
    for (const [name, value] of Object.entries({
      category, title: "Test", price: "100", description: "Description",
      generic_city_id: "1", city_id: "1", vehicle_city_id: "1",
      property_price: "100", property_description: "Property", property_type: "Квартиры",
      property_operation: "Продажа", vehicle_price: "100", vehicle_description: "Vehicle",
      vehicle_make_slug: "skoda", vehicle_model_slug: "octavia"
    })) fields[name].value = value;
  };
  fill();
  const inserts = [], logs = [], timers = [], photos = [];
  let refreshes = 0;
  const context = vm.createContext({
    addForm: form, formMessage: element(), publishing: false, validatingPhotos: false,
    db: {
      auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
      from: table => {
        assert.equal(table, "listings");
        return { insert: payload => {
          inserts.push(payload);
          return { select: async () => ({ data: [{ id: 1 }] }) };
        } };
      }
    },
    FormData: class {
      constructor() {
        this.values = new Map(Object.values(fields).filter(field => !field.disabled)
          .map(field => [field.name, field.value]));
      }
      get(name) { return this.values.get(name) ?? null; }
    },
    currentUser: null, pendingListingPublish: false, openAuthModal: noop,
    availableCities: [{ id: 1 }], ensureCitiesLoaded: async () => {},
    loadPropertyGeoCatalogs: async () => {}, DISABLE_PROPERTY_DISTRICTS_FOR_CREATION: false,
    propertyCityDistrictSelect: null, propertyOblastRaionSelect: null,
    propertyListingLocationToggle: null, propertyListingLocationAccordion: null,
    propertyListingLocationFields: null, citySearchInput: null, vehicleListingCitySearchInput: null,
    genericListingCitySearchInput: null, genericListingLocationBlock: null,
    propertyTypeSelect: null, propertyOperationSelect: null, vehicleListingMake: null, vehicleListingModel: null,
    document: { querySelector: () => null }, lang: "uk", translations: {},
    t: value => value, cityTranslation: value => value, photoText: value => value,
    escapeHtml: value => value,
    fetchAllVehicleModels: async () => [{
      make_slug: "skoda", model_slug: "octavia", make_name: "Skoda", model_name: "Octavia"
    }],
    getPhotoBucket: () => photos, uploadListingPhotos: async () => ["mock://photo"],
    resetPhotos: bucket => { bucket.length = 0; }, renderPhotoPreview: noop, updatePhotoFields: noop,
    loadListings: async () => { refreshes++; }, addModal: null,
    setTimeout: (...args) => timers.push(args),
    console: { error: (...args) => logs.push(args) }
  });
  vm.runInContext(buttonHelper + submit, context);
  const send = () => form.submit({ preventDefault: noop, target: form });
  const idle = () => {
    assert.equal(context.publishing, false);
    assert.equal(button.disabled, false);
    assert.equal(disabled.disabled, true);
    assert.ok(Object.values(fields).every(field => !field.disabled));
  };
  return { context, fields, form, inserts, logs, timers, photos, fill, send, idle,
    refreshes: () => refreshes };
}

for (const category of ["Автомобили", "Недвижимость", "Готовый бизнес", "Инвестиции"]) {
  test(`P2: successful publication and subsequent submit: ${category}`, async () => {
    const p = publisher(category);
    await p.send();
    assert.equal(p.inserts.length, 1);
    assert.equal(p.inserts[0].category, category);
    assert.equal(p.inserts[0].city_id, 1);
    assert.equal(p.inserts[0].user_id, "owner");
    assert.equal(p.refreshes(), 1);
    assert.equal(p.context.formMessage.textContent, "Объявление опубликовано!");
    assert.equal(p.timers.length, 1);
    p.idle();
    await p.send();
    assert.equal(p.inserts.length, 1);
    p.idle();
  });
}

for (const withPhotos of [false, true]) {
  test(`P2: successful INSERT followed by rejected refresh, photos=${withPhotos}`, async () => {
    const p = publisher();
    if (withPhotos) p.photos.push({});
    const gate = deferred();
    p.context.loadListings = () => gate.promise;
    const first = p.send();
    await tick();
    assert.equal(p.inserts.length, 1);
    assert.equal(p.context.publishing, true);
    assert.ok(p.form.elements.every(field => field.disabled));
    await p.send();
    assert.equal(p.inserts.length, 1);
    gate.resolve(Promise.reject(new Error("refresh failed")));
    await first;
    assert.match(p.context.formMessage.textContent, /^Объявление опубликовано!.*каталог/);
    assert.equal(p.context.formMessage.classList.contains("error"), false);
    assert.equal(p.logs.length, 1);
    assert.match(p.logs[0][0], /catalog refresh failed after publication/);
    assert.equal(p.timers.length, 0);
    assert.equal(p.fields.title.value, "");
    assert.equal(p.photos.length, 0);
    p.idle();
    await p.send();
    assert.equal(p.inserts.length, 1);
    p.idle();
    p.context.loadListings = async () => {};
    p.fill();
    await p.send();
    assert.equal(p.inserts.length, 2);
    p.idle();
  });
}

test("P2: INSERT error preserves input/photos, unlocks form and permits retry", async () => {
  const p = publisher();
  const from = p.context.db.from;
  p.photos.push({});
  p.context.db.from = () => ({ insert: payload => {
    p.inserts.push(payload);
    return { select: async () => ({ error: { message: "insert failed" } }) };
  } });
  await p.send();
  assert.equal(p.inserts.length, 1);
  assert.equal(p.refreshes(), 0);
  assert.equal(p.fields.title.value, "Test");
  assert.equal(p.photos.length, 1);
  assert.equal(p.context.formMessage.classList.contains("error"), true);
  assert.doesNotMatch(p.context.formMessage.textContent, /Объявление опубликовано!/);
  p.idle();
  p.context.db.from = from;
  await p.send();
  assert.equal(p.inserts.length, 2);
  assert.equal(p.inserts[1].image_url, "mock://photo");
  assert.equal(p.refreshes(), 1);
  assert.equal(p.photos.length, 0);
  p.idle();
});

for (const stage of ["auth", "catalog", "photos", "insert"]) {
  test(`P1 retained: double submit during ${stage}`, async () => {
    const p = publisher();
    const gate = deferred();
    if (stage === "auth") p.context.db.auth.getUser = async () => {
      await gate.promise;
      return { data: { user: { id: "owner" } } };
    };
    if (stage === "catalog") p.context.ensureCitiesLoaded = () => gate.promise;
    if (stage === "photos") {
      p.photos.push({});
      p.context.uploadListingPhotos = async () => { await gate.promise; return ["mock://photo"]; };
    }
    if (stage === "insert") p.context.db.from = () => ({ insert: payload => {
      p.inserts.push(payload);
      return { select: async () => { await gate.promise; return { data: [{ id: 1 }] }; } };
    } });
    const first = p.send();
    await tick();
    assert.equal(p.context.publishing, true);
    await p.send();
    gate.resolve();
    await first;
    assert.equal(p.inserts.length, 1);
    p.idle();
  });
}

test("P3: property editor fields follow the selected property type", () => {
  const helperSource = section("function syncEditorPropertyFields(", "\nasync function editListing(");
  const syncEditorPropertyFields = vm.runInNewContext(`${helperSource}; syncEditorPropertyFields;`);
  const editSource = section("async function editListing(", "\nasync function deleteListing(");
  assert.equal((editSource.match(/propertyTypeSelect\.addEventListener\("change", updatePropertyFields\)/g) || []).length, 1);

  const types = ["Квартиры", "Дома", "Комнаты", "Коммерческая недвижимость", "Гаражи и парковочные места"];
  const allowedTypes = [...new Set([...propertyTemplate.matchAll(/data-property-for="([^"]+)"/g)]
    .flatMap(([, allowed]) => allowed.split(",")))];
  assert.deepEqual(allowedTypes.sort(), types.slice().sort());

  const fields = [...propertyTemplate.matchAll(/data-property-for="([^"]+)"/g)].map(([, allowed]) => {
    const control = { disabled: false };
    return {
      dataset: { propertyFor: allowed },
      hidden: false,
      controls: [control],
      querySelectorAll: () => [control]
    };
  });
  const propertyFields = { querySelectorAll: () => fields };

  for (const type of types) {
    syncEditorPropertyFields(propertyFields, { value: type });
    for (const field of fields) {
      const applicable = field.dataset.propertyFor.split(",").map(value => value.trim()).includes(type);
      assert.equal(field.hidden, !applicable, `${type}: field visibility`);
      assert.equal(field.controls[0].disabled, !applicable, `${type}: field availability`);
    }
  }
});

test("P1: saving a property preserves disabled fields and nested legacy values", () => {
  const helperSource = section("function mergePropertyValues(", "\nfunction syncEditorPropertyFields(");
  const mergePropertyValues = vm.runInNewContext(`${helperSource}; mergePropertyValues;`);
  const existing = {
    rooms: 3,
    land_area_m2: 800,
    amenities: { refrigerator: true, parking: true },
    accessibility: { elevator: true, elevator_door_width_cm: 90 }
  };
  const updates = {
    rooms: undefined,
    land_area_m2: 900,
    amenities: mergePropertyValues(existing.amenities, { refrigerator: false, parking: undefined }),
    accessibility: mergePropertyValues(existing.accessibility, { elevator: undefined, elevator_door_width_cm: 100 })
  };

  assert.deepEqual(JSON.parse(JSON.stringify(mergePropertyValues(existing, updates))), {
    rooms: 3,
    land_area_m2: 900,
    amenities: { refrigerator: false, parking: true },
    accessibility: { elevator: true, elevator_door_width_cm: 100 }
  });
});

for (const currency of ["UAH", "USD", "PLN"]) {
  test(`V1: creating a vehicle preserves currency and specifications: ${currency}`, async () => {
    const p = publisher("Автомобили");
    const values = {
      vehicle_price_currency: currency, vehicle_price: "12345.67", vehicle_year: "2018",
      vehicle_mileage_km: "0", vehicle_engine_liters: "1.6", vehicle_power_hp: "110",
      vehicle_fuel_type: "Бензин", vehicle_transmission: "Механічна"
    };
    Object.entries(values).forEach(([name, value]) => { p.fields[name].value = value; });
    await p.send();
    const saved = p.inserts[0];
    assert.equal(saved.currency, currency);
    assert.equal(saved.price, 12345.67);
    for (const name of ["vehicle_year", "vehicle_mileage_km", "vehicle_engine_liters", "vehicle_power_hp"]) {
      assert.equal(saved[name], Number(values[name]));
    }
    assert.equal(saved.vehicle_fuel_type, values.vehicle_fuel_type);
    assert.equal(saved.vehicle_transmission, values.vehicle_transmission);
    assert.equal(saved.title, "Skoda Octavia");
    assert.equal(saved.city_id, 1);
    assert.match(propertyTemplate, /name="vehicle_price"[^>]*step="0.01"/);
    assert.match(propertyTemplate, /id="vehiclePriceCurrency"[^<]*>[\s\S]*?<option value="PLN">/);
  });
}

const editSource = section("async function editListing(", "\nasync function deleteListing(");
const editSubmit = editSource.slice(editSource.indexOf('dialog.querySelector("form").addEventListener("submit"'),
  editSource.lastIndexOf('\n\n  if (isVehicle) {'));
const editPhotosSource = editSource.slice(editSource.indexOf('  const editPhotoInput ='),
  editSource.indexOf('  // Reuse the same city index'));

function interactive(value = "") {
  const el = element(value);
  el.listeners = {};
  el.addEventListener = (name, handler) => { el.listeners[name] = handler; };
  el.focus = noop;
  return el;
}

function editor(overrides = {}, category = "Автомобили") {
  const item = {
    id: 8, user_id: "owner", category, title: "Skoda Octavia",
    price: 12000.50, currency: "USD", city_id: 1,
    vehicle_make_slug: "skoda", vehicle_make_name: "Skoda",
    vehicle_model_slug: "octavia", vehicle_model_name: "Octavia",
    vehicle_equipment: { legacy_feature: true }, ...overrides
  };
  const values = {
    category, price: String(item.price), price_currency: item.currency, title: item.title,
    city_id: "1", city_search: "City", description: "Updated",
    vehicle_make_slug: item.vehicle_make_slug, vehicle_model_slug: item.vehicle_model_slug,
    vehicle_year: "2018", vehicle_body_type: "Универсал", vehicle_fuel_type: "Бензин",
    vehicle_engine_liters: "1.6", vehicle_power_hp: "110", vehicle_transmission: "Механічна",
    vehicle_drive: "Передній", vehicle_mileage_km: "0", vehicle_condition: "used",
    vehicle_operational_condition: "roadworthy", vehicle_doors: "5", vehicle_color: "black",
    seller_type: "private"
  };
  const fields = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, interactive(value)]));
  fields.is_hot = { ...interactive(), checked: false };
  fields.is_urgent = { ...interactive(), checked: true };
  const button = interactive(), message = interactive(), photoMessage = interactive();
  const picker = interactive(), input = interactive(), preview = interactive();
  const form = interactive();
  form.elements = Object.assign([...Object.values(fields), button, picker, input], fields);
  form.reportValidity = () => true;
  form.querySelector = selector => selector === 'button[type="submit"]' ? button
    : selector === "[data-edit-message]" ? message : null;
  const dialog = interactive();
  dialog.open = true;
  dialog.close = () => { dialog.open = false; dialog.listeners.close?.(); };
  dialog.querySelector = selector => ({
    form, 'input[name="edit_photo_input"]': input,
    "[data-edit-photo-preview]": preview, "[data-edit-photo-message]": photoMessage,
    "[data-edit-photo-pick]": picker
  })[selector] || null;
  const updates = [], filters = [], logs = [], uploads = [];
  const context = vm.createContext({
    dialog, item, labels: { denied: "denied", failed: "failed" }, isVehicle: category === "Автомобили",
    photos: ["https://example.test/one.jpg", "https://example.test/two.jpg"],
    MAX_PHOTOS: 10, PHOTO_TYPES: { "image/jpeg": "jpg" }, MAX_PHOTO_BYTES: 10485760,
    currentUser: { id: "owner" }, availableCities: [{ id: 1 }, { id: 2 }],
    escapeHtml: value => value, t: value => value, photoText: value => value,
    URL: { revokeObjectURL: noop },
    fetchAllVehicleModels: async () => [{
      make_slug: "skoda", make_name: "Skoda", model_slug: "superb", model_name: "Superb"
    }],
    uploadListingPhotos: async photos => {
      uploads.push(Array.from(photos, photo => photo.uploadedUrl));
      return Array.from(photos, photo => photo.uploadedUrl);
    },
    loadListings: async () => {},
    db: { from: table => {
      assert.equal(table, "listings");
      const query = {
        update: payload => { updates.push(payload); return query; },
        eq: (name, value) => { filters.push([name, value]); return query; },
        select: () => query, maybeSingle: async () => ({ data: { id: item.id } })
      };
      return query;
    } },
    console: { error: (...args) => logs.push(args), warn: (...args) => logs.push(args) }
  });
  vm.runInContext(editPhotosSource + editSubmit, context);
  const send = () => form.listeners.submit({ preventDefault: noop, currentTarget: form });
  const photoAction = data => preview.listeners.click({ target: { closest: () => ({ dataset: data }) } });
  return { context, item, fields, form, button, message, photoMessage, picker, dialog, updates, filters,
    logs, uploads, send, photoAction };
}

for (const currency of ["UAH", "USD", "PLN"]) {
  test(`V1/V2: edit preserves currency, zero mileage, legacy fields and photos: ${currency}`, async () => {
    const e = editor({ currency });
    e.context.fetchAllVehicleModels = async () => { throw new Error("catalog unavailable"); };
    await e.send();
    const saved = e.updates[0];
    assert.equal(saved.currency, currency);
    assert.equal(saved.price, 12000.50);
    assert.equal(saved.vehicle_mileage_km, 0);
    assert.equal(saved.vehicle_engine_liters, 1.6);
    assert.equal(saved.vehicle_power_hp, 110);
    assert.equal(saved.vehicle_year, 2018);
    assert.equal(saved.vehicle_body_type, "Универсал");
    assert.equal(saved.vehicle_equipment.legacy_feature, true);
    assert.equal(saved.title, e.item.title);
    assert.equal(Object.hasOwn(saved, "city_id"), false);
    assert.deepEqual(e.filters, [["id", 8], ["user_id", "owner"]]);
    assert.equal(saved.image_url, "https://example.test/one.jpg");
    assert.deepEqual(Array.from(saved.image_urls), ["https://example.test/one.jpg", "https://example.test/two.jpg"]);
    assert.equal(e.dialog.open, false);
  });
}

test("V2: saved values missing from a current select catalog are preserved without duplicates", () => {
  const context = vm.createContext({ document: { createElement: () => ({}) } });
  vm.runInContext(section("function preserveVehicleSelectValue(", "\nasync function editListing("), context);
  const select = { options: [{ value: "" }, { value: "Універсал" }], append(option) { this.options.push(option); } };
  context.preserveVehicleSelectValue(select, "Универсал");
  assert.equal(select.value, "Универсал");
  assert.equal(select.options[2].textContent, "Универсал");
  context.preserveVehicleSelectValue(select, "Универсал");
  assert.equal(select.options.length, 3);
  context.preserveVehicleSelectValue(select, null);
  assert.equal(select.options.length, 3);
});

test("V1: currency changes clear incomparable previous prices", async () => {
  const e = editor({ previous_price: 13000 });
  e.fields.price_currency.value = "PLN";
  e.fields.price.value = "50000";
  await e.send();
  assert.equal(e.updates.length, 1);
  assert.equal(e.updates[0].currency, "PLN");
  assert.equal(e.updates[0].price, 50000);
  assert.equal(e.updates[0].previous_price, null);
});

for (const stage of ["catalog", "photos", "update"]) {
  test(`V3: edit is single-flight and blocks photo mutations during ${stage}`, async () => {
    const e = editor();
    const gate = deferred();
    if (stage === "catalog") {
      e.fields.vehicle_model_slug.value = "superb";
      const fetch = e.context.fetchAllVehicleModels;
      e.context.fetchAllVehicleModels = async () => { await gate.promise; return fetch(); };
    } else if (stage === "photos") {
      const upload = e.context.uploadListingPhotos;
      e.context.uploadListingPhotos = async photos => { await gate.promise; return upload(photos); };
    } else {
      e.context.db.from = () => {
        const query = {
          update: payload => { e.updates.push(payload); return query; }, eq: () => query,
          select: () => query, maybeSingle: async () => { await gate.promise; return { data: { id: 8 } }; }
        };
        return query;
      };
    }
    const first = e.send();
    await tick();
    assert.equal(e.button.disabled, true);
    assert.equal(e.picker.disabled, true);
    assert.ok(e.form.elements.every(field => field.disabled));
    await e.send();
    e.photoAction({ editPhotoRemove: "0" });
    e.photoAction({ editPhotoMain: "1" });
    gate.resolve();
    await first;
    assert.equal(e.updates.length, 1);
    assert.equal(e.updates[0].image_url, "https://example.test/one.jpg");
    assert.equal(e.updates[0].image_urls.length, 2);
    assert.ok(e.form.elements.every(field => !field.disabled));
  });
}

test("V3: edit photo cover/removal, new uploads, empty gallery and failed-save retry", async () => {
  const e = editor();
  e.photoAction({ editPhotoMain: "1" });
  e.photoAction({ editPhotoRemove: "1" });
  vm.runInContext('editPhotos.push({ file: { name: "new.jpg" }, previewUrl: "blob:new" });', e.context);
  e.context.uploadListingPhotos = async photos => Array.from(photos, photo => photo.uploadedUrl || "https://example.test/new.jpg");
  e.context.db.from = () => {
    const query = {
      update: payload => { e.updates.push(payload); return query; }, eq: () => query, select: () => query,
      maybeSingle: async () => ({ error: { message: "update failed" } })
    };
    return query;
  };
  await e.send();
  assert.equal(e.dialog.open, true);
  assert.equal(e.message.textContent, "update failed");
  assert.ok(e.form.elements.every(field => !field.disabled));
  assert.equal(e.updates[0].image_url, "https://example.test/two.jpg");
  assert.deepEqual(Array.from(e.updates[0].image_urls), ["https://example.test/two.jpg", "https://example.test/new.jpg"]);
  e.photoAction({ editPhotoRemove: "1" });
  e.photoAction({ editPhotoRemove: "0" });
  e.context.uploadListingPhotos = () => { throw new Error("empty gallery should not need Storage"); };
  e.context.db.from = () => {
    const query = {
      update: payload => { e.updates.push(payload); return query; }, eq: () => query, select: () => query,
      maybeSingle: async () => ({ data: { id: 8 } })
    };
    return query;
  };
  await e.send();
  assert.equal(e.updates.length, 2);
  assert.equal(e.updates[1].image_url, null);
  assert.equal(e.updates[1].image_urls.length, 0);
  assert.equal(e.dialog.open, false);
});

for (const invalid of ["", " ", "-1", "NaN", "Infinity"]) {
  test(`V3: invalid edit price rejected: ${JSON.stringify(invalid)}`, async () => {
    const e = editor();
    e.fields.price.value = invalid;
    await e.send();
    assert.equal(e.updates.length, 0);
    assert.equal(e.message.textContent, "failed");
  });
}

test("V3: unauthorized or no-longer-owned edits cannot report success", async () => {
  const e = editor();
  e.context.currentUser = { id: "other" };
  await e.send();
  assert.equal(e.updates.length, 0);
  assert.equal(e.message.textContent, "denied");
  e.context.currentUser = { id: "owner" };
  e.context.db.from = () => {
    const query = { update: () => query, eq: () => query, select: () => query, maybeSingle: async () => ({ data: null }) };
    return query;
  };
  await e.send();
  assert.equal(e.message.textContent, "denied");
  assert.equal(e.dialog.open, true);
});

async function findVehicles(rows, values = {}) {
  let results, closed = false;
  const controls = Object.fromEntries(Object.entries(values).map(([id, value]) => [id, interactive(value)]));
  controls.vehicleSearchMessage = interactive();
  const predicates = [];
  const query = {
    select: () => query, order: () => query,
    eq: (key, value) => { predicates.push(row => row[key] === value); return query; },
    gte: (key, value) => { predicates.push(row => row[key] != null && Number(row[key]) >= value); return query; },
    lte: (key, value) => { predicates.push(row => row[key] != null && Number(row[key]) <= value); return query; },
    in: (key, values) => { predicates.push(row => values.includes(row[key])); return query; },
    or: filter => {
      assert.equal(filter, "currency.eq.UAH,currency.is.null,currency.eq.");
      predicates.push(row => !row.currency || row.currency === "UAH");
      return query;
    },
    then: (resolve, reject) => Promise.resolve({ data: rows.filter(row => predicates.every(test => test(row))) }).then(resolve, reject)
  };
  const context = vm.createContext({
    db: { from: () => query }, currentCategory: "Автомобили", isSearching: false,
    pendingListingsReload: false, selectedCatalogCityId: "", activeRegionCode: "", searchInput: null,
    listing: interactive(), searchBtn: null, document: { getElementById: id => controls[id] || null },
    t: value => value, escapeHtml: value => value, setButtonLoading: noop,
    renderListings: rows => { results = Array.from(rows, row => row.id); },
    vehicleClientFilters: null, closeVehicleSearch: () => { closed = true; },
    ensureVehicleSearchTabs: () => ({}), captureVehicleSearchTab: noop, renderVehicleSearchTabs: noop
  });
  vm.runInContext(loader, context);
  await context.loadListings();
  return { results, closed, message: controls.vehicleSearchMessage.textContent, context };
}

const vehicleRows = [
  { id: "legacy", category: "Автомобили", currency: null, vehicle_power_hp: null, vehicle_body_type: "Универсал" },
  { id: "empty", category: "Автомобили", currency: "", vehicle_power_hp: "", vehicle_body_type: "Універсал" },
  { id: "zero", category: "Автомобили", currency: "UAH", vehicle_power_hp: 0, vehicle_body_type: "Универсал" },
  { id: "valid", category: "Автомобили", currency: "UAH", vehicle_power_hp: 110, vehicle_body_type: "Універсал" },
  { id: "invalid", category: "Автомобили", currency: "UAH", vehicle_power_hp: "bad", vehicle_body_type: "Седан" },
  { id: "pln", category: "Автомобили", currency: "PLN", vehicle_power_hp: 110 }
];
for (const [name, values, expected] of [
  ["legacy UAH without ranges", {}, ["legacy", "empty", "zero", "valid", "invalid"]],
  ["unknown power must not match upper bound", { vehiclePowerTo: "100" }, ["zero"]],
  ["zero is a real numeric value", { vehiclePowerFrom: "0", vehiclePowerTo: "0" }, ["zero"]],
  ["valid power range", { vehiclePowerFrom: "100", vehiclePowerTo: "120" }, ["valid"]],
  ["PLN listings are searchable", { vehiclePriceCurrency: "PLN" }, ["pln"]],
  ["legacy and current body type spellings", { vehicleBodyType: "Універсал" }, ["legacy", "empty", "zero", "valid"]]
]) {
  test(`V4: ${name}`, async () => {
    const result = await findVehicles(vehicleRows, values);
    assert.deepEqual(result.results, expected);
    assert.equal(result.closed, true);
  });
}
for (const values of [
  { vehiclePowerFrom: "-1" }, { vehiclePowerTo: "NaN" },
  { vehicleYearFrom: "2020", vehicleYearTo: "2010" }
]) {
  test(`V4: invalid search stays open: ${JSON.stringify(values)}`, async () => {
    const result = await findVehicles(vehicleRows, values);
    assert.equal(result.results, undefined);
    assert.equal(result.closed, false);
    assert.ok(result.message);
    assert.equal(result.context.isSearching, false);
  });
}

test("V5: reopening vehicle search preserves filters; changing category still resets", () => {
  const opening = section("function openCategorySubmenu(", "\nfunction setVehicleSearchAdvanced(");
  let resets = 0, opens = 0;
  const context = vm.createContext({
    currentCategory: "Автомобили", vehicleSearchTabs: [{ id: "saved" }], activeVehicleSearchTabId: "saved",
    resetCatalogFilters: () => { resets++; }, categorySelectLabel: null, t: value => value,
    document: { querySelectorAll: () => [] }, openVehicleSearch: () => { opens++; },
    closeVehicleSearch: noop, openCategoryMenu: noop
  });
  vm.runInContext(opening, context);
  context.openCategorySubmenu("Автомобили");
  assert.equal(resets, 0);
  assert.equal(opens, 1);
  context.openCategorySubmenu("Недвижимость");
  assert.equal(resets, 1);
  assert.equal(context.vehicleSearchTabs.length, 0);
  context.openCategorySubmenu("Автомобили");
  assert.equal(resets, 2);
});
