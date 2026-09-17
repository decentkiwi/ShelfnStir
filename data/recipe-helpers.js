(function (root, factory) {
  const helpers = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = helpers;
  } else {
    root.ShelfStirHelpers = helpers;
  }
})(typeof self !== "undefined" ? self : this, function () {
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function amountToNumber(amount) {
    return amount.split(" ").reduce((total, part) => {
      if (part.includes("/")) {
        const [top, bottom] = part.split("/").map(Number);
        return total + top / bottom;
      }
      return total + Number(part);
    }, 0);
  }

  function formatAmount(value) {
    const rounded = Math.round(value * 4) / 4;
    const whole = Math.floor(rounded);
    const fraction = rounded - whole;
    const fractionText = {
      0.25: "1/4",
      0.5: "1/2",
      0.75: "3/4",
    }[fraction];
    if (!fractionText) return String(rounded);
    return whole ? `${whole} ${fractionText}` : fractionText;
  }

  function scaleIngredient(ingredient, batchSize) {
    if (batchSize === 1) return ingredient;
    return ingredient.replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(\s+)/, (match, amount, space) => {
      return `${formatAmount(amountToNumber(amount) * batchSize)}${space}`;
    });
  }

  function recipeFlavorTags(recipe) {
    const flavors = new Set();
    const text = [recipe.type, recipe.strength, recipe.summary, ...recipe.tags, ...recipe.required].join(" ").toLowerCase();
    if (/citrus|lime|lemon|grapefruit|fresh|bright|snappy|zesty|cool|garden/.test(text)) flavors.add("refreshing");
    if (/bitter|campari|aperol|amaro|negroni|americano/.test(text)) flavors.add("bitter");
    if (/spirit-forward|potent|boozy|martini|old fashioned|sazerac|manhattan|vesper/.test(text)) flavors.add("boozy");
    if (/smoky|mezcal|scotch/.test(text)) flavors.add("smoky");
    if (/herbal|mint|chartreuse|vermouth/.test(text)) flavors.add("herbal");
    if (/creamy|coconut|cream|velvety|silky|cloudlike/.test(text)) flavors.add("creamy");
    if (/sparkling|spritz|soda|highball|bubbles/.test(text)) flavors.add("sparkling");
    return [...flavors];
  }

  function recipeEffortTags(recipe) {
    const tags = new Set();
    const requiredCount = recipe.required.length;
    const minutes = Number.parseInt(recipe.time, 10);
    if (requiredCount <= 4 && minutes <= 6) tags.add("easy");
    if (!recipe.tags.includes("shaken") && !recipe.summary.toLowerCase().includes("shake")) tags.add("no-shaker");
    if (requiredCount >= 6 || minutes >= 8) tags.add("project");
    if (recipe.ingredients.length <= 3) tags.add("three-ingredient");
    return [...tags];
  }

  const substitutionRules = {
    "simple syrup": "Use honey syrup or agave syrup, but start slightly lighter because they read sweeter.",
    "agave syrup": "Use simple syrup in the same amount if the drink does not need extra agave flavor.",
    "honey syrup": "Use simple syrup for a cleaner drink or agave syrup for a softer roundness.",
    bourbon: "Rye whiskey works when you want a drier and spicier version.",
    "rye whiskey": "Bourbon works when you want a rounder and sweeter version.",
    "soda water": "Sparkling water works as a direct swap.",
    "sparkling water": "Soda water works as a direct swap.",
    prosecco: "Any dry sparkling wine works.",
    "sparkling wine": "Prosecco works if it is dry and cold.",
    "orange liqueur": "Orange curacao works in tiki drinks. Triple sec works in most citrus sours.",
    "lime juice": "Use lemon only in flexible sours. Keep lime for Margaritas, Daiquiris, Mojitos, and tiki drinks.",
    "lemon juice": "Use lime for a sharper version in many sours, but expect the drink to taste brighter.",
    "white rum": "Lightly aged rum works if it is not too sweet or dark.",
    "dark rum": "Aged rum works when you want a lighter version.",
  };

  function recipeSubstitutions(recipe) {
    return recipe.required
      .filter((ingredient) => substitutionRules[ingredient])
      .map((ingredient) => ({ ingredient, note: substitutionRules[ingredient] }));
  }

  function buildRecipes(recipeBlueprints) {
    const recipes = recipeBlueprints.map(([id, name, type, tags, time, strength, image, summary, ingredients, required, method]) => ({
      id,
      name,
      type,
      tags,
      time,
      strength,
      image,
      summary,
      ingredients,
      required,
      method,
    }));
    recipes.forEach((recipe) => {
      recipe.flavorTags = recipeFlavorTags(recipe);
      recipe.effortTags = recipeEffortTags(recipe);
      recipe.substitutions = recipeSubstitutions(recipe);
    });
    return recipes;
  }

  return {
    escapeHtml,
    amountToNumber,
    formatAmount,
    scaleIngredient,
    recipeFlavorTags,
    recipeEffortTags,
    recipeSubstitutions,
    buildRecipes,
  };
});
