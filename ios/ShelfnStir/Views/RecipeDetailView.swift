import SwiftUI

struct RecipeDetailView: View {
  let recipeId: String

  @Environment(AppState.self) private var appState
  @State private var recipe: RecipeDetail?
  @State private var loadError: String?

  private var isFavorite: Bool { appState.favoriteIds.contains(recipeId) }

  var body: some View {
    Group {
      if let recipe {
        content(for: recipe)
      } else if let loadError {
        ContentUnavailableView("Couldn't load this recipe", systemImage: "wifi.slash", description: Text(loadError))
      } else {
        ProgressView().tint(.brandTeal)
      }
    }
    .background(Color.brandPaper)
    .navigationTitle(recipe?.name ?? "")
    .navigationBarTitleDisplayMode(.inline)
    .toolbarBackground(Color.brandPaper, for: .navigationBar)
    .toolbarBackground(.visible, for: .navigationBar)
    .sensoryFeedback(.success, trigger: isFavorite)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        if let url = URL(string: "https://decentkiwi.github.io/ShelfnStir/recipes/\(recipeId)/") {
          ShareLink(item: url, subject: Text(recipe?.name ?? "Shelf&Stir recipe")) {
            Image(systemName: "square.and.arrow.up").foregroundStyle(Color.brandMuted)
          }
        }
      }
      ToolbarItem(placement: .topBarTrailing) {
        Button {
          withAnimation(.spring(duration: 0.35, bounce: 0.5)) {
            appState.toggleFavorite(recipeId)
          }
        } label: {
          Image(systemName: isFavorite ? "heart.fill" : "heart")
            .foregroundStyle(isFavorite ? Color.brandOxblood : Color.brandMuted)
            .contentTransition(.symbolEffect(.replace))
        }
      }
    }
    .task {
      do {
        recipe = try await APIClient.shared.fetchRecipe(id: recipeId)
      } catch {
        loadError = error.localizedDescription
      }
    }
  }

  @ViewBuilder
  private func content(for recipe: RecipeDetail) -> some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 10) {
          Eyebrow(text: recipe.type, color: .brandOlive)
          Text(recipe.name)
            .font(.display(32))
            .foregroundStyle(Color.brandInk)
          Text(recipe.summary)
            .font(.body)
            .foregroundStyle(Color.brandMuted)
          HStack(spacing: 8) {
            TagChip(text: recipe.time, tint: .brandTeal)
            TagChip(text: recipe.strength, tint: .brandGold)
          }
          .padding(.top, 2)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()

        VStack(alignment: .leading, spacing: 10) {
          Eyebrow(text: "Ingredients")
          VStack(alignment: .leading, spacing: 10) {
            ForEach(recipe.ingredients, id: \.self) { ingredient in
              HStack(alignment: .top, spacing: 8) {
                Circle().fill(Color.brandOlive).frame(width: 6, height: 6).padding(.top, 7)
                Text(ingredient).foregroundStyle(Color.brandInk)
              }
            }
          }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()

        VStack(alignment: .leading, spacing: 10) {
          Eyebrow(text: "Method")
          VStack(alignment: .leading, spacing: 14) {
            ForEach(Array(recipe.method.enumerated()), id: \.offset) { index, step in
              HStack(alignment: .top, spacing: 10) {
                Text("\(index + 1)")
                  .font(.caption.bold())
                  .foregroundStyle(Color.brandChalk)
                  .frame(width: 20, height: 20)
                  .background(Color.brandOlive, in: Circle())
                Text(step).foregroundStyle(Color.brandInk)
              }
            }
          }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()

        if !recipe.substitutions.isEmpty {
          VStack(alignment: .leading, spacing: 10) {
            Eyebrow(text: "Smart swaps", color: .brandGold)
            VStack(alignment: .leading, spacing: 12) {
              ForEach(recipe.substitutions, id: \.ingredient) { swap in
                VStack(alignment: .leading, spacing: 2) {
                  Text(swap.ingredient.capitalized).font(.subheadline.bold()).foregroundStyle(Color.brandInk)
                  Text(swap.note).font(.subheadline).foregroundStyle(Color.brandMuted)
                }
              }
            }
          }
          .padding(16)
          .frame(maxWidth: .infinity, alignment: .leading)
          .cardBackground(Color.brandGold.opacity(0.1))
        }
      }
      .padding(16)
    }
    .background(Color.brandPaper)
  }
}
