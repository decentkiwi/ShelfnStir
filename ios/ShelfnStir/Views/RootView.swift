import SwiftUI

struct RootView: View {
  // Reads the AppState instance placed into the environment by the App
  // struct (`.environment(appState)`). Any descendant view can do the same
  // to read or mutate shared state -- no passing it down through every
  // initializer by hand.
  @Environment(AppState.self) private var environmentState

  init() {
    let appearance = UITabBarAppearance()
    appearance.configureWithOpaqueBackground()
    appearance.backgroundColor = UIColor(Color.brandChalk)
    UITabBar.appearance().standardAppearance = appearance
    UITabBar.appearance().scrollEdgeAppearance = appearance

  }

  var body: some View {
    @Bindable var appState = environmentState
    TabView(selection: $appState.selectedTab) {
      NavigationStack {
        HomeView()
      }
      .tabItem { Label("Home", systemImage: "house") }
      .tag(AppTab.home)

      NavigationStack {
        RecipeListView()
      }
      .tabItem { Label("Recipes", systemImage: "text.book.closed") }
      .tag(AppTab.recipes)

      NavigationStack {
        PantryView()
      }
      .tabItem { Label("Pantry", systemImage: "cabinet") }
      .tag(AppTab.pantry)

      NavigationStack {
        AccountView()
      }
      .tabItem { Label("Account", systemImage: "person.circle") }
      .tag(AppTab.account)
    }
    .tint(.brandTeal)
    .task {
      await appState.loadInitialData()
    }
  }
}
