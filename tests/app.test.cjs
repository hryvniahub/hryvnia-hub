const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(require("node:path").join(__dirname, "../app.js"), "utf8");
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
