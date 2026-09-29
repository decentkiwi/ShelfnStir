import Foundation

// Matches GET /api/me, and the signup/login responses.
struct User: Codable, Equatable {
  let id: Int
  let email: String
  let displayName: String
}

struct APIErrorBody: Codable {
  let error: String
}
