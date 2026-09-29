import Foundation

enum APIError: Error, LocalizedError {
  case server(String)
  case unauthorized
  case unexpected

  var errorDescription: String? {
    switch self {
    case .server(let message): return message
    case .unauthorized: return "Sign in to do that."
    case .unexpected: return "Something went wrong. Please try again."
    }
  }
}

// A thin wrapper around URLSession. `URLSession.shared` uses the shared
// HTTPCookieStorage automatically, so once /api/auth/login sets our session
// cookie, every later request sends it back -- no manual cookie handling
// needed, the same way a browser behaves.
final class APIClient {
  static let shared = APIClient()

  // Points at `wrangler dev` for now. Change this once the API has a real
  // deployed URL.
  var baseURL = URL(string: "http://localhost:8787/api/")!

  private let session = URLSession.shared
  private let decoder: JSONDecoder = {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    return decoder
  }()

  private func request(_ path: String, method: String = "GET", body: Encodable? = nil) async throws -> Data {
    var request = URLRequest(url: baseURL.appendingPathComponent(path))
    request.httpMethod = method
    if let body {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try JSONEncoder().encode(AnyEncodable(body))
    }

    let (data, response) = try await session.data(for: request)
    guard let http = response as? HTTPURLResponse else { throw APIError.unexpected }

    if http.statusCode == 401 { throw APIError.unauthorized }
    if !(200...299).contains(http.statusCode) {
      let message = (try? decoder.decode(APIErrorBody.self, from: data))?.error
      throw APIError.server(message ?? "Request failed (\(http.statusCode)).")
    }
    return data
  }

  private func get<T: Decodable>(_ path: String) async throws -> T {
    try decoder.decode(T.self, from: try await request(path))
  }

  // MARK: Recipes & ingredients

  func fetchRecipes() async throws -> [RecipeSummary] {
    let wrapper: RecipesResponse = try await get("recipes")
    return wrapper.recipes
  }

  func fetchRecipe(id: String) async throws -> RecipeDetail {
    try await get("recipes/\(id)")
  }

  func fetchIngredients() async throws -> [Ingredient] {
    let wrapper: IngredientsResponse = try await get("ingredients")
    return wrapper.ingredients
  }

  // MARK: Auth

  func me() async throws -> User {
    try await get("me")
  }

  func signup(email: String, password: String, displayName: String) async throws -> User {
    let data = try await request("auth/signup", method: "POST", body: SignupBody(email: email, password: password, displayName: displayName))
    return try decoder.decode(User.self, from: data)
  }

  func login(email: String, password: String) async throws -> User {
    let data = try await request("auth/login", method: "POST", body: LoginBody(email: email, password: password))
    return try decoder.decode(User.self, from: data)
  }

  func logout() async throws {
    _ = try await request("auth/logout", method: "POST")
  }

  // MARK: Favorites & shelf

  func fetchFavorites() async throws -> [String] {
    let wrapper: RecipeIdsResponse = try await get("favorites")
    return wrapper.recipeIds
  }

  func addFavorite(recipeId: String) async throws {
    _ = try await request("favorites/\(recipeId)", method: "PUT")
  }

  func removeFavorite(recipeId: String) async throws {
    _ = try await request("favorites/\(recipeId)", method: "DELETE")
  }

  func fetchShelf() async throws -> [String] {
    let wrapper: IngredientIdsResponse = try await get("shelf")
    return wrapper.ingredientIds
  }

  func putShelf(ingredientIds: [String]) async throws {
    _ = try await request("shelf", method: "PUT", body: ShelfBody(ingredientIds: ingredientIds))
  }
}

// MARK: - Request/response wire types

private struct SignupBody: Encodable { let email: String; let password: String; let displayName: String }
private struct LoginBody: Encodable { let email: String; let password: String }
private struct ShelfBody: Encodable { let ingredientIds: [String] }
private struct RecipesResponse: Decodable { let recipes: [RecipeSummary] }
private struct IngredientsResponse: Decodable { let ingredients: [Ingredient] }
private struct RecipeIdsResponse: Decodable { let recipeIds: [String] }
private struct IngredientIdsResponse: Decodable { let ingredientIds: [String] }

// JSONEncoder.encode needs a concrete Encodable type; this lets `request`
// accept any Encodable body without every call site boxing it manually.
private struct AnyEncodable: Encodable {
  private let encodeFn: (Encoder) throws -> Void
  init(_ wrapped: Encodable) { encodeFn = wrapped.encode }
  func encode(to encoder: Encoder) throws { try encodeFn(encoder) }
}
