import SwiftUI

// The landing screen. Mirrors the website's homepage: a "start with what you
// have" hero, then shortcuts into the rest of the app, with sections that
// personalize themselves once the user has a shelf or saved favorites.
struct HomeView: View {
  @Environment(AppState.self) private var appState

  private static let moods: [(label: String, query: String)] = [
    ("Refreshing", "refreshing"), ("Bitter", "bitter"), ("Herbal", "herbal"),
    ("Sparkling", "sparkling"), ("Creamy", "creamy"), ("Smoky", "smoky"),
    ("Easy", "easy"), ("No shaker", "no-shaker"),
  ]

  // A stable pick per calendar day, so "Tonight's pick" doesn't reshuffle
  // every time the screen redraws.
  private var tonightsPick: RecipeSummary? {
    guard !appState.recipes.isEmpty else { return nil }
    let day = Calendar.current.ordinality(of: .day, in: .era, for: .now) ?? 0
    return appState.recipes[day % appState.recipes.count]
  }

  private var readyNow: [RecipeSummary] {
    appState.pantryMatches().filter(\.missing.isEmpty).map(\.recipe)
  }

  private var favorites: [RecipeSummary] {
    appState.recipes.filter { appState.favoriteIds.contains($0.id) }
  }

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 28) {
        hero

        if let pick = tonightsPick {
          VStack(alignment: .leading, spacing: 10) {
            Eyebrow(text: "Tonight's pick", color: .brandOxblood)
            NavigationLink(value: pick.id) {
              FeaturedCard(recipe: pick)
            }
            .buttonStyle(PressableButtonStyle())
          }
        }

        if !readyNow.isEmpty {
          shelf(title: "Ready from your shelf", tint: .brandTeal, recipes: readyNow)
        }

        VStack(alignment: .leading, spacing: 10) {
          Eyebrow(text: "Browse by mood")
          FlowChips(items: Self.moods) { mood in
            withAnimation { appState.showRecipes(matching: mood.query) }
          }
        }

        if !favorites.isEmpty {
          shelf(title: "Your favorites", tint: .brandOxblood, recipes: favorites)
        }
      }
      .padding(16)
    }
    .background(Color.brandPaper)
    .brandHeader("Shelf&Stir")
    .navigationDestination(for: String.self) { recipeId in
      RecipeDetailView(recipeId: recipeId)
    }
  }

  private var hero: some View {
    VStack(alignment: .leading, spacing: 14) {
      Eyebrow(text: "Shelf-first cocktail recipes", color: .brandOlive)
      Text("Start with what you already have")
        .font(.display(32))
        .foregroundStyle(Color.brandInk)
        .fixedSize(horizontal: false, vertical: true)
      Text("Turn your bottles, citrus, and mixers into cocktails you can make now, plus smart one-stop upgrades for what to buy next.")
        .font(.body)
        .foregroundStyle(Color.brandMuted)

      HStack(spacing: 12) {
        Button {
          withAnimation { appState.selectedTab = .pantry }
        } label: {
          Text("Build your shelf")
            .font(.subheadline.weight(.bold))
            .foregroundStyle(Color.brandChalk)
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .background(Color.brandTeal, in: Capsule())
        }
        .buttonStyle(PressableButtonStyle())

        Button {
          withAnimation { appState.showRecipes() }
        } label: {
          Text("Browse recipes")
            .font(.subheadline.weight(.bold))
            .foregroundStyle(Color.brandTeal)
            .padding(.vertical, 12)
        }
      }

      if !appState.recipes.isEmpty {
        HStack(spacing: 18) {
          stat("\(appState.recipes.count)", "recipes")
          stat("1-2", "item gap finder")
          stat("Saved", "home shelf")
        }
        .padding(.top, 4)
      }
    }
    .padding(20)
    .frame(maxWidth: .infinity, alignment: .leading)
    .cardBackground()
  }

  private func stat(_ value: String, _ label: String) -> some View {
    VStack(alignment: .leading, spacing: 1) {
      Text(value).font(.display(18)).foregroundStyle(Color.brandInk)
      Text(label).font(.caption).foregroundStyle(Color.brandMuted)
    }
  }

  private func shelf(title: String, tint: Color, recipes: [RecipeSummary]) -> some View {
    VStack(alignment: .leading, spacing: 10) {
      Eyebrow(text: title, color: tint)
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(recipes) { recipe in
            NavigationLink(value: recipe.id) {
              MiniCard(recipe: recipe)
            }
            .buttonStyle(PressableButtonStyle())
          }
        }
        .padding(.vertical, 2)
      }
      // Let cards scroll edge to edge instead of clipping at the page padding.
      .padding(.horizontal, -16)
      .contentMargins(.horizontal, 16, for: .scrollContent)
    }
  }
}

private struct FeaturedCard: View {
  let recipe: RecipeSummary

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 6) {
        TagChip(text: recipe.type, tint: .brandOlive)
        TagChip(text: recipe.time, tint: .brandTeal)
        TagChip(text: recipe.strength, tint: .brandGold)
      }
      Text(recipe.name)
        .font(.display(26))
        .foregroundStyle(Color.brandInk)
      Text(recipe.summary)
        .font(.subheadline)
        .foregroundStyle(Color.brandMuted)
        .multilineTextAlignment(.leading)
      HStack(spacing: 4) {
        Text("See the recipe").font(.subheadline.weight(.bold))
        Image(systemName: "arrow.right").font(.caption.weight(.bold))
      }
      .foregroundStyle(Color.brandTeal)
    }
    .padding(18)
    .frame(maxWidth: .infinity, alignment: .leading)
    .cardBackground()
  }
}

private struct MiniCard: View {
  let recipe: RecipeSummary

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      TagChip(text: recipe.type, tint: .brandOlive)
      Text(recipe.name)
        .font(.display(18))
        .foregroundStyle(Color.brandInk)
        .multilineTextAlignment(.leading)
        .lineLimit(2)
      Spacer(minLength: 0)
      Text(recipe.time)
        .font(.caption.weight(.semibold))
        .foregroundStyle(Color.brandMuted)
    }
    .padding(14)
    .frame(width: 170, height: 130, alignment: .leading)
    .cardBackground()
  }
}

// Wrapping row of tappable pills (SwiftUI has no built-in flow layout).
private struct FlowChips: View {
  let items: [(label: String, query: String)]
  let action: ((label: String, query: String)) -> Void

  var body: some View {
    FlowLayout(spacing: 8) {
      ForEach(items, id: \.query) { item in
        Button {
          action(item)
        } label: {
          Text(item.label)
            .font(.subheadline.weight(.bold))
            .foregroundStyle(Color.brandInk)
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(Color.brandChalk, in: Capsule())
            .overlay(Capsule().strokeBorder(Color.brandLine))
        }
        .buttonStyle(PressableButtonStyle())
      }
    }
  }
}

private struct FlowLayout: Layout {
  var spacing: CGFloat = 8

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    layout(in: proposal.width ?? .infinity, subviews: subviews).size
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    let result = layout(in: bounds.width, subviews: subviews)
    for (index, origin) in result.origins.enumerated() {
      subviews[index].place(at: CGPoint(x: bounds.minX + origin.x, y: bounds.minY + origin.y), proposal: .unspecified)
    }
  }

  private func layout(in width: CGFloat, subviews: Subviews) -> (size: CGSize, origins: [CGPoint]) {
    var origins: [CGPoint] = []
    var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0, maxX: CGFloat = 0
    for subview in subviews {
      let size = subview.sizeThatFits(.unspecified)
      if x > 0, x + size.width > width {
        x = 0
        y += rowHeight + spacing
        rowHeight = 0
      }
      origins.append(CGPoint(x: x, y: y))
      x += size.width + spacing
      rowHeight = max(rowHeight, size.height)
      maxX = max(maxX, x - spacing)
    }
    return (CGSize(width: maxX, height: y + rowHeight), origins)
  }
}
