import SwiftUI

struct RootView: View {
  // Reads the AppState instance placed into the environment by the App
  // struct (`.environment(appState)`). Any descendant view can do the same
  // to read or mutate shared state -- no passing it down through every
  // initializer by hand.
  @Environment(AppState.self) private var appState

  init() {
    let appearance = UITabBarAppearance()
    appearance.configureWithOpaqueBackground()
    appearance.backgroundColor = UIColor(Color.brandChalk)
    UITabBar.appearance().standardAppearance = appearance
    UITabBar.appearance().scrollEdgeAppearance = appearance

    let navAppearance = UINavigationBarAppearance()
    navAppearance.configureWithOpaqueBackground()
    navAppearance.backgroundColor = UIColor(Color.brandPaper)
    navAppearance.titleTextAttributes = [.foregroundColor: UIColor(Color.brandInk)]
    navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor(Color.brandInk)]
    UINavigationBar.appearance().standardAppearance = navAppearance
    UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
  }

  var body: some View {
    TabView {
      NavigationStack {
        RecipeListView()
      }
      .tabItem { Label("Recipes", systemImage: "text.book.closed") }

      NavigationStack {
        PantryView()
      }
      .tabItem { Label("Pantry", systemImage: "cabinet") }

      NavigationStack {
        AccountView()
      }
      .tabItem { Label("Account", systemImage: "person.circle") }
    }
    .tint(.brandTeal)
    .task {
      await appState.loadInitialData()
    }
  }
}
