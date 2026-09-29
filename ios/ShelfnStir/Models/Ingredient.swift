import Foundation

// Matches GET /api/ingredients.
struct Ingredient: Codable, Identifiable, Hashable {
  let id: String
  let category: String
  let isSelectable: Bool
}

struct IngredientGroup: Identifiable {
  let key: String
  let title: String
  let items: [String]
  var id: String { key }
}

// App config, not content -- ported from the website's data/pantry-config.js
// by hand. This rarely changes, so keeping one hardcoded copy per client
// (rather than serving it from the API) is a deliberate choice, same as the
// website.
enum PantryConfig {
  static let categoryTitles: [String: String] = [
    "spirits": "Spirits",
    "liqueurs": "Liqueurs & Aperitifs",
    "produce": "Citrus & Produce",
    "mixers": "Mixers & Bubbles",
    "pantry": "Sweeteners, Bitters & Pantry",
  ]

  static let categoryOrder = ["spirits", "liqueurs", "produce", "mixers", "pantry"]

  static let presets: [String: Set<String>] = [
    "starter": ["gin", "bourbon", "blanco tequila", "white rum", "sweet vermouth", "campari", "orange liqueur", "lime juice", "lemon juice", "simple syrup", "angostura bitters", "orange", "soda water", "mint"],
    "tequila": ["blanco tequila", "reposado tequila", "mezcal", "lime juice", "grapefruit juice", "orange liqueur", "agave syrup", "campari", "soda water", "grapefruit soda", "salt", "orange"],
    "vodka": ["vodka", "lime juice", "lemon juice", "cranberry juice", "orange liqueur", "coffee liqueur", "espresso", "simple syrup", "ginger beer", "soda water"],
    "zero": ["lime juice", "lemon juice", "orange juice", "pomegranate juice", "black tea", "ginger", "honey syrup", "mint", "cucumber", "soda water", "sparkling water"],
  ]

  static let ingredientEquivalents: [String: [String]] = [
    "bourbon": ["whiskey"],
    "rye whiskey": ["whiskey"],
    "soda water": ["sparkling water"],
    "sparkling water": ["soda water"],
    "prosecco": ["sparkling wine"],
    "sparkling wine": ["prosecco"],
  ]

  static let easyGrabIngredients: Set<String> = ["lime juice", "lemon juice", "grapefruit juice", "orange juice", "orange", "lemon", "mint", "cucumber", "ginger", "soda water", "sparkling water", "grapefruit soda", "ginger beer", "pineapple juice", "cranberry juice", "pomegranate juice", "black tea", "espresso", "simple syrup", "agave syrup", "honey syrup", "cream", "egg", "nutmeg", "salt", "cherry"]

  static let pantryStaples: Set<String> = ["simple syrup", "agave syrup", "honey syrup", "angostura bitters", "peychauds bitters", "orange bitters", "salt", "egg", "nutmeg", "cherry"]

  static let specialtyIngredients: Set<String> = ["green chartreuse", "yellow chartreuse", "maraschino liqueur", "creme de violette", "lillet blanc", "absinthe", "amaro", "orgeat", "raspberry syrup", "orange flower water", "cherry liqueur"]

  static func cost(of ingredient: String) -> Int {
    if specialtyIngredients.contains(ingredient) { return 4 }
    if pantryStaples.contains(ingredient) { return 2 }
    if easyGrabIngredients.contains(ingredient) { return 1 }
    return 3
  }
}
