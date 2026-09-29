import Foundation

// Matches the JSON from GET /api/recipes. `Identifiable` (via `id`) is what
// lets SwiftUI use a recipe directly as a List row or a NavigationLink
// destination without extra bookkeeping.
struct RecipeSummary: Codable, Identifiable, Hashable {
  let id: String
  let name: String
  let type: String
  let summary: String
  let time: String
  let strength: String
  let image: String
  let tags: [String]
  let flavorTags: [String]
  let effortTags: [String]
  let required: [String]
}

// Matches GET /api/recipes/:id -- the summary fields plus ingredients,
// method, and substitutions.
struct RecipeDetail: Codable, Identifiable, Hashable {
  let id: String
  let name: String
  let type: String
  let summary: String
  let time: String
  let strength: String
  let image: String
  let tags: [String]
  let flavorTags: [String]
  let effortTags: [String]
  let required: [String]
  let ingredients: [String]
  let method: [String]
  let substitutions: [Substitution]
}

struct Substitution: Codable, Hashable {
  let ingredient: String
  let note: String
}
