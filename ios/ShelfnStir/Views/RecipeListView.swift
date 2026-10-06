import SwiftUI

struct RecipeListView: View {
  @Environment(AppState.self) private var environmentState

  private var filtered: [RecipeSummary] {
    let appState = environmentState
    guard !appState.recipeSearch.isEmpty else { return appState.recipes }
    let query = appState.recipeSearch.lowercased()
    return appState.recipes.filter { recipe in
      recipe.name.lowercased().contains(query)
        || recipe.type.lowercased().contains(query)
        || recipe.tags.contains { $0.contains(query) }
        || recipe.flavorTags.contains { $0.contains(query) }
        || recipe.effortTags.contains { $0.contains(query) }
        || recipe.required.contains { $0.contains(query) }
    }
  }

  var body: some View {
    // @Bindable lets the search field write straight into shared state, so
    // Home's mood chips can pre-fill it.
    @Bindable var appState = environmentState
    Group {
      if appState.isLoadingRecipes {
        ProgressView("Loading recipes…")
          .tint(.brandTeal)
      } else if let error = appState.loadError {
        ContentUnavailableView("Couldn't load recipes", systemImage: "wifi.slash", description: Text(error))
      } else {
        List(filtered) { recipe in
          NavigationLink(value: recipe.id) {
            RecipeRow(recipe: recipe)
          }
          .listRowBackground(Color.clear)
          .listRowSeparator(.hidden)
          .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(Color.brandPaper)
        .animation(.easeInOut(duration: 0.2), value: filtered.map(\.id))
      }
    }
    .searchable(text: $appState.recipeSearch, prompt: "Search by drink, spirit, or mood")
    .brandHeader("Recipes")
    .navigationDestination(for: String.self) { recipeId in
      RecipeDetailView(recipeId: recipeId)
    }
  }
}

private struct RecipeRow: View {
  let recipe: RecipeSummary

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 6) {
        TagChip(text: recipe.type, tint: .brandOlive)
        TagChip(text: recipe.time, tint: .brandTeal)
      }
      Text(recipe.name)
        .font(.display(20))
        .foregroundStyle(Color.brandInk)
      Text(recipe.summary)
        .font(.subheadline)
        .foregroundStyle(Color.brandMuted)
        .lineLimit(2)
    }
    .padding(14)
    .frame(maxWidth: .infinity, alignment: .leading)
    .cardBackground()
  }
}
