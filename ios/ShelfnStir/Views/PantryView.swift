import SwiftUI

struct PantryView: View {
  @Environment(AppState.self) private var appState

  private var ready: [AppState.Match] { appState.pantryMatches().filter(\.missing.isEmpty) }
  private var close: [AppState.Match] { appState.pantryMatches().filter { !$0.missing.isEmpty } }

  var body: some View {
    ScrollViewReader { proxy in
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 10) {
          Eyebrow(text: "Bottle math", color: .brandOlive)
          Text("What can I make?")
            .font(.display(26))
            .foregroundStyle(Color.brandInk)

          ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
              presetButton("Starter shelf", key: "starter")
              presetButton("Tequila night", key: "tequila")
              presetButton("Vodka only", key: "vodka")
              presetButton("Zero-proof", key: "zero")
              Button("Clear all") { withAnimation { appState.clearShelf() } }
                .buttonStyle(PressableButtonStyle())
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Color.brandInk)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(Color.brandChalk, in: Capsule())
                .overlay(Capsule().strokeBorder(Color.brandLine))
            }
            .padding(.vertical, 2)
          }
        }

        summaryCard(proxy: proxy)

        ForEach(appState.ingredientGroups) { group in
          VStack(alignment: .leading, spacing: 10) {
            Eyebrow(text: group.title)
            VStack(spacing: 0) {
              ForEach(Array(group.items.enumerated()), id: \.element) { index, ingredient in
                if index > 0 {
                  Divider().overlay(Color.brandLine)
                }
                IngredientRow(ingredient: ingredient, isOn: appState.shelfIds.contains(ingredient)) {
                  withAnimation(.easeOut(duration: 0.15)) {
                    appState.toggleShelfIngredient(ingredient)
                  }
                }
              }
            }
          }
          .padding(16)
          .frame(maxWidth: .infinity, alignment: .leading)
          .cardBackground()
        }

        VStack(alignment: .leading, spacing: 20) {
          if !ready.isEmpty {
            matchSection(title: "Ready now", tint: .brandTeal, matches: ready)
          }
          if !close.isEmpty {
            matchSection(title: "Worth a run (missing 1-2)", tint: .brandGold, matches: close)
          }
        }
        .id("results")
      }
      .padding(16)
    }
    .sensoryFeedback(.selection, trigger: appState.shelfIds)
    .background(Color.brandPaper)
    .brandHeader("Pantry")
    .navigationDestination(for: String.self) { recipeId in
      RecipeDetailView(recipeId: recipeId)
    }
    }
  }

  // Sits right under the presets so the effect of every tap is visible
  // without scrolling past the whole ingredient list to find the results.
  @ViewBuilder
  private func summaryCard(proxy: ScrollViewProxy) -> some View {
    if appState.shelfIds.isEmpty {
      HStack(spacing: 10) {
        Image(systemName: "hand.tap").foregroundStyle(Color.brandOlive)
        Text("Tap the bottles you own, or pick a preset, and we'll show what you can make.")
          .font(.subheadline)
          .foregroundStyle(Color.brandMuted)
      }
      .padding(14)
      .frame(maxWidth: .infinity, alignment: .leading)
      .cardBackground()
    } else {
      Button {
        withAnimation(.easeInOut(duration: 0.4)) { proxy.scrollTo("results", anchor: .top) }
      } label: {
        HStack(spacing: 12) {
          VStack(alignment: .leading, spacing: 4) {
            Text("\(ready.count) ready now")
              .font(.display(18))
              .foregroundStyle(Color.brandInk)
            Text("\(close.count) more worth a run · \(appState.shelfIds.count) on your shelf")
              .font(.footnote)
              .foregroundStyle(Color.brandMuted)
          }
          Spacer()
          Image(systemName: "arrow.down.circle.fill")
            .font(.title2)
            .foregroundStyle(Color.brandTeal)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
      }
      .buttonStyle(PressableButtonStyle())
    }
  }

  private func matchSection(title: String, tint: Color, matches: [AppState.Match]) -> some View {
    VStack(alignment: .leading, spacing: 10) {
      Eyebrow(text: title, color: tint)
      VStack(spacing: 10) {
        ForEach(matches) { match in
          NavigationLink(value: match.recipe.id) {
            MatchRow(match: match, tint: tint)
          }
          .buttonStyle(.plain)
        }
      }
    }
  }

  private func presetButton(_ title: String, key: String) -> some View {
    Button(title) {
      withAnimation { appState.applyPreset(PantryConfig.presets[key] ?? []) }
    }
    .buttonStyle(PressableButtonStyle())
    .font(.subheadline.weight(.bold))
    .foregroundStyle(Color.brandChalk)
    .padding(.horizontal, 14)
    .padding(.vertical, 9)
    .background(Color.brandTeal, in: Capsule())
  }
}

private struct IngredientRow: View {
  let ingredient: String
  let isOn: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack {
        Text(ingredient.capitalized).foregroundStyle(Color.brandInk)
        Spacer()
        Image(systemName: isOn ? "checkmark.circle.fill" : "circle")
          .foregroundStyle(isOn ? Color.brandTeal : Color.brandLine)
          .contentTransition(.symbolEffect(.replace))
      }
      .padding(.vertical, 8)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
  }
}

private struct MatchRow: View {
  let match: AppState.Match
  let tint: Color

  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      VStack(alignment: .leading, spacing: 6) {
        Text(match.recipe.name)
          .font(.display(17))
          .foregroundStyle(Color.brandInk)
        if match.missing.isEmpty {
          Text("You have it all").font(.caption.weight(.bold)).foregroundStyle(tint)
        } else {
          HStack(spacing: 6) {
            ForEach(match.missing, id: \.self) { ingredient in
              TagChip(text: ingredient, tint: tint)
            }
          }
        }
      }
      Spacer()
      Image(systemName: "chevron.right").font(.caption).foregroundStyle(Color.brandMuted)
    }
    .padding(14)
    .cardBackground()
  }
}
