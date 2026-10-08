import SwiftUI

struct AccountView: View {
  @Environment(AppState.self) private var appState
  @State private var showingDeleteAccount = false

  var body: some View {
    ScrollView {
      VStack(spacing: 0) {
        Group {
          if let user = appState.currentUser {
            signedInView(user: user)
          } else {
            AuthForm()
          }
        }
        .padding(16)

        LegalLinks()
          .padding(.horizontal, 16)
          .padding(.bottom, 24)
      }
    }
    .background(Color.brandPaper)
    .brandHeader("Account")
    .sheet(isPresented: $showingDeleteAccount) {
      DeleteAccountSheet()
    }
  }

  private func signedInView(user: User) -> some View {
    VStack(alignment: .leading, spacing: 20) {
      HStack(spacing: 14) {
        Text(initials(for: user.displayName))
          .font(.display(18))
          .foregroundStyle(Color.brandChalk)
          .frame(width: 52, height: 52)
          .background(Color.brandOlive, in: Circle())
        VStack(alignment: .leading, spacing: 2) {
          Text(user.displayName).font(.display(18)).foregroundStyle(Color.brandInk)
          Text(user.email).font(.subheadline).foregroundStyle(Color.brandMuted)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .cardBackground()

      VStack(alignment: .leading, spacing: 10) {
        Eyebrow(text: "Favorites")
        let favorites = appState.recipes.filter { appState.favoriteIds.contains($0.id) }
        if favorites.isEmpty {
          Text("Save a few recipes to build your rotation.")
            .foregroundStyle(Color.brandMuted)
        } else {
          VStack(spacing: 0) {
            ForEach(Array(favorites.enumerated()), id: \.element.id) { index, recipe in
              if index > 0 { Divider().overlay(Color.brandLine) }
              NavigationLink(value: recipe.id) {
                HStack {
                  Text(recipe.name).foregroundStyle(Color.brandInk)
                  Spacer()
                  Image(systemName: "chevron.right").font(.caption).foregroundStyle(Color.brandMuted)
                }
                .padding(.vertical, 8)
                .contentShape(Rectangle())
              }
              .buttonStyle(.plain)
            }
          }
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .cardBackground()

      Button(role: .destructive) {
        Task { await appState.signOut() }
      } label: {
        Text("Sign out")
          .font(.subheadline.weight(.bold))
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
      }
      .buttonStyle(PressableButtonStyle())
      .foregroundStyle(Color.brandOxblood)
      .background(Color.brandOxblood.opacity(0.1), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

      Button("Delete account") {
        showingDeleteAccount = true
      }
      .font(.footnote)
      .foregroundStyle(Color.brandMuted)
      .frame(maxWidth: .infinity)
    }
    .navigationDestination(for: String.self) { recipeId in
      RecipeDetailView(recipeId: recipeId)
    }
  }

  private func initials(for name: String) -> String {
    let parts = name.split(separator: " ")
    let letters = parts.prefix(2).compactMap(\.first)
    return String(letters).uppercased()
  }
}

// Required by App Store Review Guideline 5.1.1(v). Asks for the password
// again so a momentarily-unlocked phone can't be used to destroy the
// account by accident, and confirms destructively before submitting.
private struct DeleteAccountSheet: View {
  @Environment(AppState.self) private var appState
  @Environment(\.dismiss) private var dismiss

  @State private var password = ""
  @State private var errorMessage: String?
  @State private var isSubmitting = false
  @State private var showingConfirmation = false

  var body: some View {
    NavigationStack {
      VStack(alignment: .leading, spacing: 16) {
        Text("This permanently deletes your account, favorites, pantry shelf, and comments. This can't be undone.")
          .font(.subheadline)
          .foregroundStyle(Color.brandMuted)

        BrandField(placeholder: "Confirm your password", text: $password, isSecure: true)
          .textContentType(.password)

        if let errorMessage {
          Text(errorMessage).foregroundStyle(Color.brandOxblood).font(.footnote)
        }

        Button(role: .destructive) {
          showingConfirmation = true
        } label: {
          HStack {
            Spacer()
            if isSubmitting {
              ProgressView().tint(Color.brandChalk)
            } else {
              Text("Delete my account").font(.subheadline.weight(.bold))
            }
            Spacer()
          }
          .padding(.vertical, 12)
        }
        .buttonStyle(PressableButtonStyle())
        .foregroundStyle(Color.brandChalk)
        .background(Color.brandOxblood, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .disabled(isSubmitting || password.isEmpty)
        .opacity(isSubmitting || password.isEmpty ? 0.5 : 1)

        Spacer()
      }
      .padding(16)
      .background(Color.brandPaper)
      .navigationTitle("Delete account")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Cancel") { dismiss() }
        }
      }
      .confirmationDialog(
        "Permanently delete your account?",
        isPresented: $showingConfirmation,
        titleVisibility: .visible
      ) {
        Button("Delete account", role: .destructive) { submit() }
        Button("Cancel", role: .cancel) {}
      } message: {
        Text("This can't be undone.")
      }
    }
  }

  private func submit() {
    errorMessage = nil
    isSubmitting = true
    Task {
      do {
        try await appState.deleteAccount(password: password)
        dismiss()
      } catch {
        errorMessage = error.localizedDescription
      }
      isSubmitting = false
    }
  }
}

private struct BrandField: View {
  let placeholder: String
  @Binding var text: String
  var isSecure = false

  var body: some View {
    Group {
      if isSecure {
        SecureField(placeholder, text: $text)
      } else {
        TextField(placeholder, text: $text)
      }
    }
    .padding(.horizontal, 12)
    .frame(height: 46)
    .background(Color.brandChalk, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Color.brandLine))
  }
}

private struct AuthForm: View {
  @Environment(AppState.self) private var appState

  @State private var mode: Mode = .login
  @State private var email = ""
  @State private var password = ""
  @State private var displayName = ""
  @State private var agreed = false
  @State private var errorMessage: String?
  @State private var isSubmitting = false

  private enum Mode { case login, signup }

  private var canSubmit: Bool {
    !(isSubmitting || email.isEmpty || password.isEmpty || (mode == .signup && (displayName.isEmpty || !agreed)))
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("Accounts are optional. Sign in to sync your favorites and pantry shelf across devices.")
        .font(.subheadline)
        .foregroundStyle(Color.brandMuted)

      Picker("Mode", selection: $mode.animation(.easeInOut(duration: 0.15))) {
        Text("Sign in").tag(Mode.login)
        Text("Create account").tag(Mode.signup)
      }
      .pickerStyle(.segmented)
      .tint(Color.brandTeal)

      if mode == .signup {
        BrandField(placeholder: "Display name", text: $displayName)
          .textContentType(.nickname)
      }
      BrandField(placeholder: "Email", text: $email)
        .textContentType(.emailAddress)
        .keyboardType(.emailAddress)
        .textInputAutocapitalization(.never)
        .autocorrectionDisabled()
      BrandField(placeholder: "Password", text: $password, isSecure: true)
        .textContentType(mode == .signup ? .newPassword : .password)

      if mode == .signup {
        Text("Use at least 8 characters.")
          .font(.caption)
          .foregroundStyle(Color.brandMuted)
        Toggle(isOn: $agreed) {
          Text("I'm of legal drinking age (and at least 18), and I agree to the [Terms of Use](\(SiteLinks.terms)) and [Privacy Policy](\(SiteLinks.privacy)).")
            .font(.footnote)
            .foregroundStyle(Color.brandMuted)
        }
        .tint(Color.brandTeal)
      }

      if let errorMessage {
        Text(errorMessage).foregroundStyle(Color.brandOxblood).font(.footnote)
      }

      Button {
        submit()
      } label: {
        HStack {
          Spacer()
          if isSubmitting {
            ProgressView().tint(Color.brandChalk)
          } else {
            Text(mode == .signup ? "Create account" : "Sign in").font(.subheadline.weight(.bold))
          }
          Spacer()
        }
        .padding(.vertical, 12)
      }
      .buttonStyle(PressableButtonStyle())
      .foregroundStyle(Color.brandChalk)
      .background(Color.brandInk, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
      .disabled(!canSubmit)
      .opacity(canSubmit ? 1 : 0.5)
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .cardBackground()
  }

  private func submit() {
    errorMessage = nil
    isSubmitting = true
    Task {
      do {
        if mode == .signup {
          try await appState.signUp(email: email, password: password, displayName: displayName)
        } else {
          try await appState.signIn(email: email, password: password)
        }
      } catch {
        errorMessage = error.localizedDescription
      }
      isSubmitting = false
    }
  }
}

enum SiteLinks {
  static let privacy = "https://decentkiwi.github.io/ShelfnStir/privacy.html"
  static let terms = "https://decentkiwi.github.io/ShelfnStir/terms.html"
  static let responsibleDrinking = "https://decentkiwi.github.io/ShelfnStir/responsible-drinking.html"
}

// App Store Review expects an in-app privacy policy link; Terms and
// responsible-drinking guidance sit next to it.
private struct LegalLinks: View {
  var body: some View {
    VStack(spacing: 8) {
      HStack(spacing: 18) {
        Link("Privacy Policy", destination: URL(string: SiteLinks.privacy)!)
        Link("Terms of Use", destination: URL(string: SiteLinks.terms)!)
        Link("Drink responsibly", destination: URL(string: SiteLinks.responsibleDrinking)!)
      }
      .font(.footnote.weight(.semibold))
      .tint(Color.brandTeal)
      Text("For adults of legal drinking age.")
        .font(.caption)
        .foregroundStyle(Color.brandMuted)
    }
    .frame(maxWidth: .infinity)
  }
}
