// This file has all the functions that talk to the backend server.
// Every function does a fetch() call and returns the JSON response.

const BASE_URL = "http://localhost:3000/api/v1";

// Get the saved login token from the browser's storage.
function getToken() {
  return localStorage.getItem("token");
}

// A helper that does the actual fetch call.
// It automatically adds the auth token and turns the body into JSON.
async function request(path, method = "GET", body) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ===== Auth =====

export function registerUser(name, email, password) {
  return request("/auth/register", "POST", { name, email, password });
}

export function loginUser(email, password) {
  return request("/auth/login", "POST", { email, password });
}

export function getCurrentUser() {
  return request("/auth/me", "GET");
}

// ===== Books =====

export function getBooks() {
  return request("/books", "GET");
}

export function getBook(bookId) {
  return request("/books/" + bookId, "GET");
}

export function createBook(book) {
  return request("/books", "POST", book);
}

export function deleteBook(bookId) {
  return request("/books/" + bookId, "DELETE");
}

// ===== Quotes =====

export function getQuotes(bookId) {
  return request("/books/" + bookId + "/quotes", "GET");
}

export function createQuote(bookId, quote) {
  return request("/books/" + bookId + "/quotes", "POST", quote);
}

export function deleteQuote(quoteId) {
  return request("/quotes/" + quoteId, "DELETE");
}

// ===== Characters =====

export function getCharacters(bookId) {
  return request("/books/" + bookId + "/characters", "GET");
}

export function createCharacter(bookId, character) {
  return request("/books/" + bookId + "/characters", "POST", character);
}

export function deleteCharacter(characterId) {
  return request("/characters/" + characterId, "DELETE");
}
