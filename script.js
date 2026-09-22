const scriptUrl = document.currentScript ? document.currentScript.src : location.href;
const { recipeBlueprints, ingredientGroups } = window.ShelfStirData;
const { presets, ingredientEquivalents, easyGrabIngredients: easyGrabList, pantryStaples: pantryStaplesList, specialtyIngredients: specialtyList } = window.ShelfStirPantryConfig;
const { escapeHtml, scaleIngredient, buildRecipes } = window.ShelfStirHelpers;

const recipes = buildRecipes(recipeBlueprints);
const easyGrabIngredients = new Set(easyGrabList);
const pantryStaples = new Set(pantryStaplesList);
const specialtyIngredients = new Set(specialtyList);

const storageKey = "shelf-and-stir-ingredients";
const favoriteKey = "shelf-and-stir-favorites";
const recentKey = "shelf-and-stir-recent";
const grid = document.querySelector("#recipe-grid");
const count = document.querySelector("#recipe-count");
const search = document.querySelector("#recipe-search");
const searchPanel = document.querySelector(".search-panel");
const clearSearch = document.querySelector("#clear-search");
const filters = [...document.querySelectorAll(".filter")];
const ingredientPicker = document.querySelector("#ingredient-picker");
const selectedCount = document.querySelector("#selected-count");
const matchCount = document.querySelector("#match-count");
const matchResults = document.querySelector("#match-results");
const matchTabs = [...document.querySelectorAll(".match-tab")];
const shelfSteps = [...document.querySelectorAll(".shelf-step")];
const presetButtons = [...document.querySelectorAll("[data-preset]")];
const clearPantry = document.querySelector("#clear-pantry");
const resetShelfButton = document.querySelector("#reset-shelf");
const shoppingInsights = document.querySelector("#shopping-insights");
const startSpiritButtons = [...document.querySelectorAll("[data-start-spirit]")];
const collectionButtons = [...document.querySelectorAll("[data-collection-filter]")];
const dialogFavorite = document.querySelector("#dialog-favorite");
const batchButtons = [...document.querySelectorAll("[data-batch]")];

let activeFilter = "all";
let activeMatchTab = "ready";
let activeIngredientStep = "all";
let currentRecipeId = document.body.dataset.recipeId || "";
let currentBatchSize = 1;
const selectedIngredients = new Set();
const favoriteRecipes = new Set();
const recentRecipes = [];

const apiBase = new URL("api/", scriptUrl).href;
const myRatingsKey = "shelf-and-stir-my-ratings";
const voterKey = "shelf-and-stir-voter";
let currentUser = null;
let authDialog = null;
let authMode = "login";
let shelfSyncTimer = null;
let fallbackVoterToken = "";

function recipePath(id) {
  return `recipes/${id}/`;
}

function loadSavedShelf() {
  selectedIngredients.clear();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    saved.forEach((ingredient) => selectedIngredients.add(ingredient));
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
}

function writeShelfLocal() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...selectedIngredients]));
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
}

function saveShelf() {
  writeShelfLocal();
  scheduleShelfSync();
}

function loadFavorites() {
  try {
    favoriteRecipes.clear();
    JSON.parse(localStorage.getItem(favoriteKey) || "[]").forEach((id) => favoriteRecipes.add(id));
  } catch {
    favoriteRecipes.clear();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(favoriteKey, JSON.stringify([...favoriteRecipes]));
  } catch {
    // Favorites are a local enhancement, not a hard dependency.
  }
}

function loadRecentRecipes() {
  try {
    recentRecipes.length = 0;
    const saved = JSON.parse(localStorage.getItem(recentKey) || "[]");
    saved.forEach((id) => {
      if (id && !recentRecipes.includes(id)) recentRecipes.push(id);
    });
  } catch {
    recentRecipes.length = 0;
  }
}

function saveRecentRecipes() {
  try {
    localStorage.setItem(recentKey, JSON.stringify(recentRecipes.slice(0, 6)));
  } catch {
    // Recent picks are a local enhancement, not a hard dependency.
  }
}

function renderRecipePreview(containerSelector, ids, emptyText) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const uniqueIds = [...new Set(ids)].slice(0, 4);
  const items = uniqueIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter(Boolean);

  if (!items.length) {
    container.innerHTML = `<p class="mini-empty">${escapeHtml(emptyText)}</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (recipe) => `
        <a class="mini-item" href="${recipePath(recipe.id)}">
          <strong>${escapeHtml(recipe.name)}</strong>
          <span>${escapeHtml(recipe.type)} · ${escapeHtml(recipe.time)}</span>
        </a>
      `,
    )
    .join("");
}

function renderSmartLists() {
  renderRecipePreview("#favorite-preview", [...favoriteRecipes], "Save a few favorites to build your regular rotation.");
  renderRecipePreview("#recent-recipes", recentRecipes, "Open a recipe and it will show up here.");
}

function recordRecentRecipe(id) {
  if (!id) return;
  const nextRecent = [id, ...recentRecipes.filter((entry) => entry !== id)].slice(0, 6);
  recentRecipes.splice(0, recentRecipes.length, ...nextRecent);
  saveRecentRecipes();
  renderSmartLists();
}

function toggleFavorite(id) {
  if (favoriteRecipes.has(id)) {
    favoriteRecipes.delete(id);
  } else {
    favoriteRecipes.add(id);
  }
  saveFavorites();
  syncFavorite(id, favoriteRecipes.has(id));
  renderRecipes();
  renderSmartLists();
  updateDialogFavorite();
}

function expandedIngredients() {
  const expanded = new Set(selectedIngredients);
  selectedIngredients.forEach((ingredient) => {
    (ingredientEquivalents[ingredient] || []).forEach((equivalent) => expanded.add(equivalent));
  });
  return expanded;
}

function recipeMatches(recipe, query) {
  const haystack = [recipe.name, recipe.type, recipe.summary, ...recipe.tags, ...recipe.flavorTags, ...recipe.effortTags, ...recipe.ingredients, ...recipe.required]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function visibleRecipes() {
  return recipes.filter((recipe) => {
    const matchesFilter =
      activeFilter === "all" ||
      recipe.tags.includes(activeFilter) ||
      recipe.flavorTags.includes(activeFilter) ||
      recipe.effortTags.includes(activeFilter) ||
      (activeFilter === "favorites" && favoriteRecipes.has(recipe.id));
    return matchesFilter && recipeMatches(recipe, search ? search.value : "");
  });
}

function renderRecipes() {
  if (!grid || !count) return;
  const matches = visibleRecipes();
  count.textContent = `${matches.length} recipe${matches.length === 1 ? "" : "s"}`;

  if (!matches.length) {
    grid.innerHTML = `<p class="empty-state">No recipes match that search.</p>`;
    return;
  }

  grid.innerHTML = matches
    .map(
      (recipe) => `
      <article class="recipe-card">
        <div class="recipe-card-content">
          <div class="tag-row">
            ${displayRecipeTags(recipe)
              .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
              .join("")}
          </div>
          <h3><a href="${recipePath(recipe.id)}">${escapeHtml(recipe.name)}</a></h3>
          <p>${escapeHtml(recipe.summary)}</p>
          <div class="spec">
            <span>${escapeHtml(recipe.type)}</span>
            <span>${escapeHtml(recipe.time)}</span>
            <span>${escapeHtml(recipe.strength)}</span>
          </div>
          <div class="card-actions">
            <a href="${recipePath(recipe.id)}">View recipe</a>
            <button class="favorite-button ${favoriteRecipes.has(recipe.id) ? "saved" : ""}" type="button" data-favorite="${recipe.id}">
              ${favoriteRecipes.has(recipe.id) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function displayRecipeTags(recipe) {
  const spiritTags = ["gin", "vodka", "whiskey", "tequila", "mezcal", "rum", "amaro"];
  const formatTags = ["zero-proof", "tiki", "spritz", "sparkling", "stirred", "shaken"];
  const flavorTags = ["citrus", "bitter", "smoky", "herbal", "creamy", "refreshing", "boozy"];
  const tags = [
    recipe.tags.find((tag) => spiritTags.includes(tag)),
    recipe.tags.find((tag) => formatTags.includes(tag)),
    recipe.flavorTags.find((tag) => flavorTags.includes(tag)) || recipe.tags.find((tag) => flavorTags.includes(tag)),
  ];
  return [...new Set(tags.filter(Boolean))]
    .slice(0, 2)
    .map(formatDisplayTag);
}

function formatDisplayTag(tag) {
  const labels = {
    "zero-proof": "Zero proof",
    spritz: "Spritz",
    sparkling: "Bubbly",
    stirred: "Stirred",
    shaken: "Shaken",
    citrus: "Bright",
    refreshing: "Fresh",
    boozy: "Spirit-forward",
    tiki: "Tiki",
    amaro: "Amaro",
  };
  return labels[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

function recipeMatch(recipe) {
  const availableIngredients = expandedIngredients();
  const missing = recipe.required.filter((ingredient) => !availableIngredients.has(ingredient));
  const shoppingPain = missing.reduce((total, ingredient) => total + ingredientCost(ingredient), 0);
  return {
    ...recipe,
    missing,
    shoppingPain,
    score: recipe.required.length ? (recipe.required.length - missing.length) / recipe.required.length : 0,
  };
}

function pantryMatches() {
  return recipes
    .map(recipeMatch)
    .filter((recipe) => recipe.missing.length <= 2)
    .sort((a, b) => a.missing.length - b.missing.length || a.shoppingPain - b.shoppingPain || b.score - a.score || a.name.localeCompare(b.name));
}

function ingredientCost(ingredient) {
  if (specialtyIngredients.has(ingredient)) return 4;
  if (pantryStaples.has(ingredient)) return 2;
  if (easyGrabIngredients.has(ingredient)) return 1;
  return 3;
}

function ingredientLabel(ingredient) {
  if (specialtyIngredients.has(ingredient)) return "Specialty bottle";
  if (pantryStaples.has(ingredient)) return "Pantry staple";
  if (easyGrabIngredients.has(ingredient)) return "Easy grab";
  return "Bottle";
}

function matchLabel(recipe) {
  if (!recipe.missing.length) return "Ready now";
  if (recipe.missing.every((ingredient) => easyGrabIngredients.has(ingredient))) return "Easy errand";
  if (recipe.missing.some((ingredient) => specialtyIngredients.has(ingredient))) return "Specialty run";
  return "Worth a run";
}

function renderIngredientPicker() {
  if (!ingredientPicker) return;
  const visibleGroups = ingredientGroups.filter((group) => activeIngredientStep === "all" || group.key === activeIngredientStep);
  ingredientPicker.innerHTML = visibleGroups
    .map(
      (group) => `
      <fieldset class="ingredient-group">
        <legend>${escapeHtml(group.title)}</legend>
        <div class="ingredient-options">
          ${group.items
            .map(
              (item) => `
              <label class="ingredient-option">
                <input type="checkbox" value="${escapeHtml(item)}" ${selectedIngredients.has(item) ? "checked" : ""}>
                <span>${escapeHtml(item)}</span>
              </label>
            `,
            )
            .join("")}
        </div>
      </fieldset>
    `,
    )
    .join("");
}

function renderMatches() {
  if (!matchResults || !selectedCount || !matchCount) return;
  const matches = pantryMatches();
  const ready = matches.filter((recipe) => recipe.missing.length === 0);
  const near = matches.filter((recipe) => recipe.missing.length > 0);
  const activeMatches = activeMatchTab === "ready" ? ready : near;

  selectedCount.textContent = `${selectedIngredients.size} selected`;
  matchCount.textContent = `${ready.length} ready / ${near.length} close`;
  matchTabs.forEach((tab) => {
    const isActive = tab.dataset.matchTab === activeMatchTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (!selectedIngredients.size) {
    matchResults.innerHTML = `<p class="empty-state compact">Choose a few bottles and ingredients to see your cocktail options.</p>`;
    if (shoppingInsights) {
      shoppingInsights.innerHTML = `<p>Use a preset or start with one spirit to see high-leverage next buys.</p>`;
    }
    return;
  }

  if (!activeMatches.length) {
    renderShoppingInsights(matches);
    matchResults.innerHTML = `<p class="empty-state compact">${activeMatchTab === "ready" ? "Nothing is fully ready yet. Check the missing 1-2 tab for close calls." : "No near matches yet. Add a spirit, citrus, or sweetener to widen the list."}</p>`;
    return;
  }

  matchResults.innerHTML = activeMatches
    .map(
      (recipe) => `
      <article class="match-card">
        <div>
          <p class="match-kicker">${matchLabel(recipe)}</p>
          <h3>${escapeHtml(recipe.name)}</h3>
          <div class="scan-row">
            <span>${escapeHtml(recipe.type)}</span>
            <span>${escapeHtml(recipe.time)}</span>
            <span>${escapeHtml(recipe.strength)}</span>
          </div>
          <p>${escapeHtml(recipe.summary)}</p>
          ${
            recipe.missing.length
              ? `<div class="missing-chips">${recipe.missing
                  .map((ingredient) => `<span>${escapeHtml(ingredient)} <em>${ingredientLabel(ingredient)}</em></span>`)
                  .join("")}</div>`
              : `<p class="missing-list ready"><strong>You have it all.</strong></p>`
          }
        </div>
        <a href="${recipePath(recipe.id)}">Recipe</a>
      </article>
    `,
    )
    .join("");
  renderShoppingInsights(matches);
}

function renderShoppingInsights(matches = pantryMatches()) {
  if (!shoppingInsights) return;
  if (!selectedIngredients.size) return;
  const unlocks = new Map();
  matches
    .filter((recipe) => recipe.missing.length === 1)
    .forEach((recipe) => {
      const ingredient = recipe.missing[0];
      if (selectedIngredients.has(ingredient)) return;
      if (!unlocks.has(ingredient)) unlocks.set(ingredient, []);
      unlocks.get(ingredient).push(recipe.name);
    });

  const ranked = [...unlocks.entries()]
    .map(([ingredient, names]) => ({ ingredient, names, cost: ingredientCost(ingredient) }))
    .sort((a, b) => b.names.length - a.names.length || a.cost - b.cost || a.ingredient.localeCompare(b.ingredient))
    .slice(0, 3);

  if (!ranked.length) {
    shoppingInsights.innerHTML = `<p>Your current shelf has no single-ingredient unlocks. Add one versatile spirit, citrus, or sweetener to widen the map.</p>`;
    return;
  }

  shoppingInsights.innerHTML = ranked
    .map(
      (item) => `
      <button type="button" data-add-ingredient="${escapeHtml(item.ingredient)}">
        <strong>${escapeHtml(item.ingredient)}</strong>
        <span>${ingredientLabel(item.ingredient)} - unlocks ${item.names.length}</span>
      </button>
    `,
    )
    .join("");
}

function renderPantry() {
  renderIngredientPicker();
  renderMatches();
  shelfSteps.forEach((step) => {
    const isActive = step.dataset.step === activeIngredientStep;
    step.classList.toggle("active", isActive);
    step.setAttribute("aria-selected", String(isActive));
  });
}

function renderDialogIngredients(recipe) {
  const ingredientList = document.querySelector("#dialog-ingredients");
  if (!ingredientList) return;
  ingredientList.innerHTML = recipe.ingredients
    .map((ingredient) => `<li>${escapeHtml(scaleIngredient(ingredient, currentBatchSize))}</li>`)
    .join("");
}

function updateDialogFavorite() {
  if (!dialogFavorite || !currentRecipeId) return;
  const saved = favoriteRecipes.has(currentRecipeId);
  dialogFavorite.textContent = saved ? "Saved favorite" : "Save favorite";
  dialogFavorite.classList.toggle("saved", saved);
}

function updateBatchButtons() {
  batchButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.batch) === currentBatchSize);
  });
}

function initRecipeDetailPage() {
  if (!currentRecipeId) return;
  const recipe = recipes.find((item) => item.id === currentRecipeId);
  if (!recipe) return;
  recordRecentRecipe(currentRecipeId);
  updateDialogFavorite();
  updateBatchButtons();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("active", filter === button));
    renderRecipes();
  });
});

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
  }
});

if (ingredientPicker) {
  ingredientPicker.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    if (event.target.checked) {
      selectedIngredients.add(event.target.value);
    } else {
      selectedIngredients.delete(event.target.value);
    }
    saveShelf();
    renderMatches();
  });
}

matchTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeMatchTab = tab.dataset.matchTab;
    renderMatches();
  });
});

shelfSteps.forEach((step) => {
  step.addEventListener("click", () => {
    activeIngredientStep = step.dataset.step;
    renderPantry();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedIngredients.clear();
    presets[button.dataset.preset].forEach((ingredient) => selectedIngredients.add(ingredient));
    activeMatchTab = "ready";
    saveShelf();
    renderPantry();
  });
});

startSpiritButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedIngredients.add(button.dataset.startSpirit);
    activeIngredientStep = "produce";
    activeMatchTab = "near";
    saveShelf();
    renderPantry();
  });
});

collectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.collectionFilter;
    filters.forEach((filter) => filter.classList.toggle("active", filter.dataset.filter === activeFilter));
    renderRecipes();
    document.querySelector("#recipe-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (dialogFavorite) {
  dialogFavorite.addEventListener("click", () => {
    if (currentRecipeId) toggleFavorite(currentRecipeId);
  });
}

batchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentBatchSize = Number(button.dataset.batch);
    const recipe = recipes.find((item) => item.id === currentRecipeId);
    if (recipe) renderDialogIngredients(recipe);
    updateBatchButtons();
  });
});

if (shoppingInsights) {
  shoppingInsights.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-ingredient]");
    if (!button) return;
    selectedIngredients.add(button.dataset.addIngredient);
    saveShelf();
    renderPantry();
  });
}

if (search) search.addEventListener("input", renderRecipes);
if (searchPanel) searchPanel.addEventListener("submit", (event) => event.preventDefault());
if (clearSearch) clearSearch.addEventListener("click", () => window.setTimeout(renderRecipes, 0));

const clearSelectedShelf = () => {
  selectedIngredients.clear();
  saveShelf();
  renderPantry();
};

if (clearPantry) {
  clearPantry.addEventListener("click", clearSelectedShelf);
}

if (resetShelfButton) {
  resetShelfButton.addEventListener("click", clearSelectedShelf);
}

// ---------------------------------------------------------------------------
// Optional accounts, ratings, and comments.
// These depend on the Worker API (/api/*), which only exists on the Cloudflare
// deployment. On hosts without it (e.g. GitHub Pages) initAccount() detects
// that and the site stays in its guest-only, localStorage-backed mode.
// ---------------------------------------------------------------------------

async function api(path, options = {}) {
  const headers = options.body ? { "Content-Type": "application/json" } : {};
  const response = await fetch(apiBase + path, { ...options, headers });
  // A host without the Worker answers /api/* with an HTML 404, not JSON.
  if (!(response.headers.get("content-type") || "").includes("application/json")) {
    throw new Error("API unavailable");
  }
  return { ok: response.ok, status: response.status, data: await response.json() };
}

const selectableIngredients = new Set(ingredientGroups.flatMap((group) => group.items));

function refreshAfterAccountChange() {
  renderRecipes();
  renderSmartLists();
  renderPantry();
  updateDialogFavorite();
}

function syncFavorite(id, saved) {
  if (!currentUser) return;
  api(`favorites/${encodeURIComponent(id)}`, { method: saved ? "PUT" : "DELETE" }).catch(() => {});
}

function scheduleShelfSync() {
  if (!currentUser) return;
  clearTimeout(shelfSyncTimer);
  shelfSyncTimer = setTimeout(() => {
    api("shelf", { method: "PUT", body: JSON.stringify({ ingredientIds: [...selectedIngredients] }) }).catch(() => {});
  }, 600);
}

// Returning session: the server is the source of truth.
async function pullServerState() {
  const [favorites, shelf] = await Promise.all([api("favorites"), api("shelf")]);
  if (favorites.ok) {
    favoriteRecipes.clear();
    favorites.data.recipeIds.forEach((id) => favoriteRecipes.add(id));
    saveFavorites();
  }
  if (shelf.ok) {
    selectedIngredients.clear();
    shelf.data.ingredientIds.forEach((id) => selectedIngredients.add(id));
    writeShelfLocal();
  }
  refreshAfterAccountChange();
}

// Moment of sign-in/sign-up: fold whatever the visitor built as a guest into
// their account (union), so nothing they saved before signing in is lost.
async function mergeLocalIntoServer() {
  const [favorites, shelf] = await Promise.all([api("favorites"), api("shelf")]);

  if (favorites.ok) {
    const onServer = new Set(favorites.data.recipeIds);
    const missing = [...favoriteRecipes].filter((id) => !onServer.has(id));
    await Promise.all(missing.map((id) => api(`favorites/${encodeURIComponent(id)}`, { method: "PUT" }).catch(() => {})));
    onServer.forEach((id) => favoriteRecipes.add(id));
    saveFavorites();
  }

  if (shelf.ok) {
    const merged = new Set([...shelf.data.ingredientIds, ...selectedIngredients].filter((id) => selectableIngredients.has(id)));
    const changed = merged.size !== shelf.data.ingredientIds.length;
    selectedIngredients.clear();
    merged.forEach((id) => selectedIngredients.add(id));
    writeShelfLocal();
    if (changed) {
      await api("shelf", { method: "PUT", body: JSON.stringify({ ingredientIds: [...merged] }) }).catch(() => {});
    }
  }
}

function renderAccountControls() {
  const nav = document.querySelector(".site-header nav");
  if (!nav) return;
  let control = nav.querySelector(".account-control");
  if (!control) {
    control = document.createElement("span");
    control.className = "account-control";
    nav.append(control);
  }
  control.innerHTML = currentUser
    ? `<span class="account-name">${escapeHtml(currentUser.displayName)}</span><button type="button" data-account-action="logout">Sign out</button>`
    : `<button type="button" data-account-action="login">Sign in</button>`;
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  authDialog.querySelector("#auth-title").textContent = signup ? "Create an account" : "Sign in";
  authDialog.querySelector(".auth-submit").textContent = signup ? "Create account" : "Sign in";
  authDialog.querySelector(".auth-switch").textContent = signup ? "I already have an account" : "Create an account";
  authDialog.querySelector(".auth-name-field").hidden = !signup;
  authDialog.querySelector('input[name="password"]').autocomplete = signup ? "new-password" : "current-password";
  authDialog.querySelector(".auth-error").textContent = "";
}

function ensureAuthDialog() {
  if (authDialog) return authDialog;
  authDialog = document.createElement("dialog");
  authDialog.className = "auth-dialog";
  authDialog.setAttribute("aria-labelledby", "auth-title");
  authDialog.innerHTML = `
    <form class="auth-form" novalidate>
      <button type="button" class="auth-close" aria-label="Close">x</button>
      <h2 id="auth-title">Sign in</h2>
      <p class="auth-note">Accounts are optional. Sign in to sync your favorites and shelf across devices and to leave comments.</p>
      <label class="auth-name-field" hidden>Display name
        <input name="displayName" maxlength="40" autocomplete="nickname">
      </label>
      <label>Email
        <input name="email" type="email" autocomplete="email" autofocus>
      </label>
      <label>Password
        <input name="password" type="password" minlength="8" autocomplete="current-password">
      </label>
      <p class="auth-error" role="alert"></p>
      <button type="submit" class="auth-submit">Sign in</button>
      <button type="button" class="auth-switch">Create an account</button>
    </form>
  `;
  document.body.append(authDialog);

  authDialog.addEventListener("click", (event) => {
    if (event.target === authDialog) authDialog.close();
  });
  authDialog.querySelector(".auth-close").addEventListener("click", () => authDialog.close());
  authDialog.querySelector(".auth-switch").addEventListener("click", () => setAuthMode(authMode === "login" ? "signup" : "login"));
  authDialog.querySelector(".auth-form").addEventListener("submit", submitAuth);
  return authDialog;
}

function openAuthDialog(mode) {
  ensureAuthDialog();
  setAuthMode(mode);
  authDialog.showModal();
}

async function submitAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  const errorEl = form.querySelector(".auth-error");
  const submit = form.querySelector(".auth-submit");
  const signup = authMode === "signup";

  const payload = { email: fields.get("email"), password: fields.get("password") };
  if (signup) payload.displayName = fields.get("displayName");

  errorEl.textContent = "";
  submit.disabled = true;
  try {
    const result = await api(signup ? "auth/signup" : "auth/login", { method: "POST", body: JSON.stringify(payload) });
    if (!result.ok) {
      errorEl.textContent = result.data.error || "Something went wrong. Please try again.";
      return;
    }
    currentUser = result.data;
    form.reset();
    authDialog.close();
    renderAccountControls();
    await mergeLocalIntoServer().catch(() => {});
    refreshAfterAccountChange();
    renderCommentForm();
  } catch {
    errorEl.textContent = "Could not reach the server. Please try again.";
  } finally {
    submit.disabled = false;
  }
}

async function signOut() {
  try {
    await api("auth/logout", { method: "POST" });
  } catch {
    return;
  }
  currentUser = null;
  // The next person on a shared browser shouldn't inherit this account's data.
  favoriteRecipes.clear();
  selectedIngredients.clear();
  saveFavorites();
  writeShelfLocal();
  renderAccountControls();
  refreshAfterAccountChange();
  renderCommentForm();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-account-action]");
  if (!action) return;
  if (action.dataset.accountAction === "login") openAuthDialog("login");
  if (action.dataset.accountAction === "logout") signOut();
});

function randomToken() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getVoterToken() {
  try {
    const existing = localStorage.getItem(voterKey);
    if (existing) return existing;
    const created = randomToken();
    localStorage.setItem(voterKey, created);
    return created;
  } catch {
    fallbackVoterToken = fallbackVoterToken || randomToken();
    return fallbackVoterToken;
  }
}

function loadMyRatings() {
  try {
    return JSON.parse(localStorage.getItem(myRatingsKey) || "{}");
  } catch {
    return {};
  }
}

function saveMyRating(recipeId, rating) {
  try {
    localStorage.setItem(myRatingsKey, JSON.stringify({ ...loadMyRatings(), [recipeId]: rating }));
  } catch {
    // Remembering your own rating is a convenience, not a requirement.
  }
}

function ratingSummaryText({ average, count }) {
  if (!count) return "No ratings yet. Be the first to rate this drink.";
  return `${average.toFixed(1)} out of 5 from ${count} rating${count === 1 ? "" : "s"}`;
}

function renderMyRating() {
  const mine = loadMyRatings()[currentRecipeId] || 0;
  document.querySelectorAll("[data-rating]").forEach((star) => {
    const value = Number(star.dataset.rating);
    star.classList.toggle("active", value <= mine);
    star.setAttribute("aria-pressed", String(value === mine));
  });
}

async function refreshRatingSummary() {
  const summary = document.querySelector("#rating-summary");
  try {
    const result = await api(`recipes/${encodeURIComponent(currentRecipeId)}/ratings`);
    if (result.ok && summary) summary.textContent = ratingSummaryText(result.data);
  } catch {
    // Keep whatever summary is already on the page.
  }
}

async function submitRating(value) {
  const status = document.querySelector("#rating-status");
  try {
    const result = await api(`recipes/${encodeURIComponent(currentRecipeId)}/ratings`, {
      method: "POST",
      body: JSON.stringify({ rating: value, voterToken: getVoterToken() }),
    });
    if (!result.ok) {
      status.textContent = result.data.error || "Could not save your rating.";
      return;
    }
    saveMyRating(currentRecipeId, value);
    renderMyRating();
    status.textContent = "Thanks for rating!";
    await refreshRatingSummary();
  } catch {
    status.textContent = "Could not reach the server. Please try again.";
  }
}

document.addEventListener("click", (event) => {
  const star = event.target.closest("[data-rating]");
  if (star && currentRecipeId) submitRating(Number(star.dataset.rating));
});

function commentHtml(comment) {
  const date = new Date(comment.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  return `
    <li class="comment">
      <div class="comment-meta">
        <strong>${escapeHtml(comment.displayName)}</strong>
        <time datetime="${escapeHtml(comment.createdAt)}">${escapeHtml(date)}</time>
      </div>
      <p>${escapeHtml(comment.body)}</p>
    </li>
  `;
}

function renderCommentForm() {
  const slot = document.querySelector("#comment-form-slot");
  if (!slot) return;
  if (!currentUser) {
    slot.innerHTML = `<p class="comment-signin"><button type="button" data-account-action="login">Sign in</button> to leave a comment.</p>`;
    return;
  }
  slot.innerHTML = `
    <form class="comment-form">
      <label for="comment-body">Comment as ${escapeHtml(currentUser.displayName)}</label>
      <textarea id="comment-body" name="body" rows="3" maxlength="2000"></textarea>
      <p class="comment-error" role="alert"></p>
      <button type="submit">Post comment</button>
    </form>
  `;
}

async function refreshComments() {
  const list = document.querySelector("#comment-list");
  if (!list) return;
  try {
    const result = await api(`recipes/${encodeURIComponent(currentRecipeId)}/comments`);
    if (!result.ok) return;
    list.innerHTML = result.data.comments.length
      ? result.data.comments.map(commentHtml).join("")
      : `<li class="comment-empty">No comments yet.</li>`;
  } catch {
    // Leave the list as it is.
  }
}

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!form.matches || !form.matches(".comment-form")) return;
  event.preventDefault();
  const errorEl = form.querySelector(".comment-error");
  const textarea = form.querySelector("textarea");
  const submit = form.querySelector('button[type="submit"]');

  errorEl.textContent = "";
  submit.disabled = true;
  try {
    const result = await api(`recipes/${encodeURIComponent(currentRecipeId)}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: textarea.value }),
    });
    if (result.status === 401) {
      currentUser = null;
      renderAccountControls();
      renderCommentForm();
      return;
    }
    if (!result.ok) {
      errorEl.textContent = result.data.error || "Could not post your comment.";
      return;
    }
    textarea.value = "";
    await refreshComments();
  } catch {
    errorEl.textContent = "Could not reach the server. Please try again.";
  } finally {
    submit.disabled = false;
  }
});

function initCommunity() {
  const community = document.querySelector("#community");
  if (!community || !currentRecipeId) return;
  community.hidden = false;
  document.querySelector("#rating-input").hidden = false;
  document.querySelector("#comments").hidden = false;
  renderMyRating();
  refreshRatingSummary();
  renderCommentForm();
  refreshComments();
}

async function initAccount() {
  try {
    const me = await api("me");
    currentUser = me.ok ? me.data : null;
  } catch {
    return;
  }
  renderAccountControls();
  if (currentUser) await pullServerState().catch(() => {});
  initCommunity();
}

loadSavedShelf();
loadFavorites();
loadRecentRecipes();
renderRecipes();
renderSmartLists();
renderPantry();
initRecipeDetailPage();
initAccount();
