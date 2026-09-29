import Foundation

// `@Observable` (Swift's Observation framework, iOS 17+) makes every stored
// property here trigger a SwiftUI view update when it changes -- no manual
// `@Published` wrappers needed, unlike the older ObservableObject pattern.
// One instance of this is created once in the App and handed to every view
// via `.environment()`, so any screen can read or act on shared state.
@Observable
final class AppState {
  var recipes: [RecipeSummary] = []
  var ingredients: [Ingredient] = []
  var currentUser: User?
  var favoriteIds: Set<String> = []
  var shelfIds: Set<String> = []

  var isLoadingRecipes = false
  var loadError: String?

  private let api = APIClient.shared

  var ingredientGroups: [IngredientGroup] {
    let byCategory = Dictionary(grouping: ingredients.filter(\.isSelectable), by: \.category)
    return PantryConfig.categoryOrder.compactMap { key in
      guard let items = byCategory[key] else { return nil }
      return IngredientGroup(key: key, title: PantryConfig.categoryTitles[key] ?? key, items: items.map(\.id).sorted())
    }
  }

  // Called once when the root view appears.
  func loadInitialData() async {
    isLoadingRecipes = true
    loadError = nil
    do {
      async let recipesTask = api.fetchRecipes()
      async let ingredientsTask = api.fetchIngredients()
      recipes = try await recipesTask
      ingredients = try await ingredientsTask
    } catch {
      loadError = error.localizedDescription
    }
    isLoadingRecipes = false

    await refreshSession()
  }

  func refreshSession() async {
    do {
      currentUser = try await api.me()
      async let favoritesTask = api.fetchFavorites()
      async let shelfTask = api.fetchShelf()
      favoriteIds = Set(try await favoritesTask)
      shelfIds = Set(try await shelfTask)
    } catch {
      // Not signed in -- that's the normal guest state, not an error to surface.
      currentUser = nil
    }
  }

  func signUp(email: String, password: String, displayName: String) async throws {
    currentUser = try await api.signup(email: email, password: password, displayName: displayName)
    await refreshSession()
  }

  func signIn(email: String, password: String) async throws {
    currentUser = try await api.login(email: email, password: password)
    await refreshSession()
  }

  func signOut() async {
    try? await api.logout()
    currentUser = nil
    favoriteIds = []
    shelfIds = []
  }

  func toggleFavorite(_ recipeId: String) {
    let isFavorite = favoriteIds.contains(recipeId)
    if isFavorite {
      favoriteIds.remove(recipeId)
    } else {
      favoriteIds.insert(recipeId)
    }
    guard currentUser != nil else { return }
    Task {
      do {
        if isFavorite {
          try await api.removeFavorite(recipeId: recipeId)
        } else {
          try await api.addFavorite(recipeId: recipeId)
        }
      } catch {
        // Revert on failure so the UI doesn't lie about what's saved.
        if isFavorite { favoriteIds.insert(recipeId) } else { favoriteIds.remove(recipeId) }
      }
    }
  }

  func toggleShelfIngredient(_ ingredientId: String) {
    if shelfIds.contains(ingredientId) {
      shelfIds.remove(ingredientId)
    } else {
      shelfIds.insert(ingredientId)
    }
    syncShelf()
  }

  func applyPreset(_ ids: Set<String>) {
    shelfIds = ids
    syncShelf()
  }

  func clearShelf() {
    shelfIds = []
    syncShelf()
  }

  private func syncShelf() {
    guard currentUser != nil else { return }
    let snapshot = shelfIds
    Task {
      try? await api.putShelf(ingredientIds: Array(snapshot))
    }
  }

  // Ingredients actually "on hand": the shelf plus anything it implies via
  // equivalents (e.g. selecting bourbon also satisfies "whiskey").
  private var expandedShelf: Set<String> {
    var expanded = shelfIds
    for ingredient in shelfIds {
      expanded.formUnion(PantryConfig.ingredientEquivalents[ingredient] ?? [])
    }
    return expanded
  }

  func missingIngredients(for recipe: RecipeSummary) -> [String] {
    let onHand = expandedShelf
    return recipe.required.filter { !onHand.contains($0) }
  }

  struct Match: Identifiable {
    let recipe: RecipeSummary
    let missing: [String]
    var id: String { recipe.id }
  }

  // Recipes you can make now, or are close to (missing at most 2 items),
  // ranked by how little shopping they'd take. Mirrors the website's
  // pantryMatches() in script.js.
  func pantryMatches() -> [Match] {
    recipes
      .map { Match(recipe: $0, missing: missingIngredients(for: $0)) }
      .filter { $0.missing.count <= 2 }
      .sorted { a, b in
        if a.missing.count != b.missing.count { return a.missing.count < b.missing.count }
        let costA = a.missing.reduce(0) { $0 + PantryConfig.cost(of: $1) }
        let costB = b.missing.reduce(0) { $0 + PantryConfig.cost(of: $1) }
        if costA != costB { return costA < costB }
        return a.recipe.name < b.recipe.name
      }
  }
}
