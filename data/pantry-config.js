// Hand-authored pantry-matching configuration. Unlike recipes-data.js, this
// is NOT generated from the database -- it's app logic (presets, cost
// heuristics, equivalents), not recipe content, so it's edited directly here.
(function (root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = config;
  } else {
    root.ShelfStirPantryConfig = config;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const starterShelf = ["gin", "bourbon", "blanco tequila", "white rum", "sweet vermouth", "campari", "orange liqueur", "lime juice", "lemon juice", "simple syrup", "angostura bitters", "orange", "soda water", "mint"];
  const presets = {
    starter: starterShelf,
    tequila: ["blanco tequila", "reposado tequila", "mezcal", "lime juice", "grapefruit juice", "orange liqueur", "agave syrup", "campari", "soda water", "grapefruit soda", "salt", "orange"],
    vodka: ["vodka", "lime juice", "lemon juice", "cranberry juice", "orange liqueur", "coffee liqueur", "espresso", "simple syrup", "ginger beer", "soda water"],
    zero: ["lime juice", "lemon juice", "orange juice", "pomegranate juice", "black tea", "ginger", "honey syrup", "mint", "cucumber", "soda water", "sparkling water"],
  };
  const ingredientEquivalents = {
    bourbon: ["whiskey"],
    "rye whiskey": ["whiskey"],
    "soda water": ["sparkling water"],
    "sparkling water": ["soda water"],
    prosecco: ["sparkling wine"],
    "sparkling wine": ["prosecco"],
  };
  const easyGrabIngredients = ["lime juice", "lemon juice", "grapefruit juice", "orange juice", "orange", "lemon", "mint", "cucumber", "ginger", "soda water", "sparkling water", "grapefruit soda", "ginger beer", "pineapple juice", "cranberry juice", "pomegranate juice", "black tea", "espresso", "simple syrup", "agave syrup", "honey syrup", "cream", "egg", "nutmeg", "salt", "cherry"];
  const pantryStaples = ["simple syrup", "agave syrup", "honey syrup", "angostura bitters", "peychauds bitters", "orange bitters", "salt", "egg", "nutmeg", "cherry"];
  const specialtyIngredients = ["green chartreuse", "yellow chartreuse", "maraschino liqueur", "creme de violette", "lillet blanc", "absinthe", "amaro", "orgeat", "raspberry syrup", "orange flower water", "cherry liqueur"];

  return {
    presets,
    ingredientEquivalents,
    easyGrabIngredients,
    pantryStaples,
    specialtyIngredients,
  };
});
