import SwiftUI

@main
struct ShelfnStirApp: App {
  // Created once for the app's lifetime and shared with every view via
  // `.environment()`, rather than each screen owning its own copy.
  @State private var appState = AppState()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environment(appState)
    }
  }
}
