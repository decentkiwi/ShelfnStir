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

function saveShelf() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...selectedIngredients]));
  } catch {
    // The matcher still works when browser storage is unavailable.
  }
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

loadSavedShelf();
loadFavorites();
loadRecentRecipes();
renderRecipes();
renderSmartLists();
renderPantry();
initRecipeDetailPage();
