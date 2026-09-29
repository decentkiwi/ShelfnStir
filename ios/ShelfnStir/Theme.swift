import SwiftUI

// Ports the website's warm, editorial color palette (see styles.css :root)
// so the app feels like the same product, not a generic iOS list app.
// Each color has a dark-mode counterpart since native apps are expected to
// support it, unlike the website (which is light-only).
extension Color {
  static let brandPaper = Color(light: (247, 242, 232), dark: (22, 20, 18))
  static let brandPanel = Color(light: (255, 250, 242), dark: (32, 29, 26))
  static let brandChalk = Color(light: (255, 253, 248), dark: (40, 37, 33))
  static let brandInk = Color(light: (31, 27, 23), dark: (240, 236, 228))
  static let brandMuted = Color(light: (102, 95, 88), dark: (168, 160, 150))
  static let brandLine = Color(light: (216, 208, 195), dark: (58, 53, 47))
  static let brandOxblood = Color(light: (141, 38, 56), dark: (214, 96, 112))
  static let brandOlive = Color(light: (84, 107, 79), dark: (140, 168, 132))
  static let brandTeal = Color(light: (36, 99, 107), dark: (92, 176, 186))
  static let brandGold = Color(light: (189, 132, 49), dark: (216, 164, 88))

  init(light: (Int, Int, Int), dark: (Int, Int, Int)) {
    self.init(uiColor: UIColor(
      light: UIColor(red: CGFloat(light.0) / 255, green: CGFloat(light.1) / 255, blue: CGFloat(light.2) / 255, alpha: 1),
      dark: UIColor(red: CGFloat(dark.0) / 255, green: CGFloat(dark.1) / 255, blue: CGFloat(dark.2) / 255, alpha: 1)
    ))
  }
}

private extension UIColor {
  convenience init(light: UIColor, dark: UIColor) {
    self.init { $0.userInterfaceStyle == .dark ? dark : light }
  }
}

// A serif display face (evokes the website's Georgia headings) without
// bundling a custom font -- system fonts render correctly at every weight
// with zero risk, which matters given how slow this can be to verify visually.
extension Font {
  static func display(_ size: CGFloat, weight: Weight = .bold) -> Font {
    .system(size: size, weight: weight, design: .serif)
  }
}

// Small-caps-style section label, matching the website's ".eyebrow" class.
struct Eyebrow: View {
  let text: String
  var color: Color = .brandMuted

  var body: some View {
    Text(text.uppercased())
      .font(.caption.weight(.heavy))
      .tracking(1.1)
      .foregroundStyle(color)
  }
}

// Pill-shaped tag, matching the website's ".tag" chips.
struct TagChip: View {
  let text: String
  var tint: Color = .brandInk

  var body: some View {
    Text(text)
      .font(.caption2.weight(.heavy))
      .padding(.horizontal, 9)
      .padding(.vertical, 4)
      .background(tint.opacity(0.12), in: Capsule())
      .foregroundStyle(tint)
  }
}

// Wraps content in the panel-colored, rounded, softly-shadowed card used
// throughout the website (recipe cards, match cards, the substitution box).
struct CardBackground: ViewModifier {
  var fill: Color = .brandPanel

  func body(content: Content) -> some View {
    content
      .background(fill, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: 14, style: .continuous)
          .strokeBorder(Color.brandLine, lineWidth: 1)
      )
  }
}

extension View {
  func cardBackground(_ fill: Color = .brandPanel) -> some View {
    modifier(CardBackground(fill: fill))
  }
}

// A subtle tactile press effect for primary buttons, since the default
// iOS button styles feel flat next to the rest of the branded UI.
struct PressableButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .scaleEffect(configuration.isPressed ? 0.97 : 1)
      .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
  }
}
