import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('folio_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: 401 → clear auth + redirect ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('folio_token');
      localStorage.removeItem('folio_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Books ─────────────────────────────────────────────────────────────────────
export const booksApi = {
  getAll: (params?: { status?: string; genre?: string; sort?: string; search?: string }) =>
    api.get('/books', { params }),
  getOne: (bookId: string) => api.get(`/books/${bookId}`),
  create: (data: object) => api.post('/books', data),
  update: (bookId: string, data: object) => api.put(`/books/${bookId}`, data),
  delete: (bookId: string) => api.delete(`/books/${bookId}`),
  updateProgress: (bookId: string, currentPage: number) =>
    api.put(`/books/${bookId}/progress`, { currentPage }),
  getProgress: (bookId: string) => api.get(`/books/${bookId}/progress`),
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  getAll: (bookId: string) => api.get(`/books/${bookId}/notes`),
  getOne: (noteId: string) => api.get(`/notes/${noteId}`),
  create: (bookId: string, data: object) => api.post(`/books/${bookId}/notes`, data),
  update: (noteId: string, data: object) => api.put(`/notes/${noteId}`, data),
  delete: (noteId: string) => api.delete(`/notes/${noteId}`),
};

// ── Quotes ────────────────────────────────────────────────────────────────────
export const quotesApi = {
  getAll: (bookId: string) => api.get(`/books/${bookId}/quotes`),
  getOne: (quoteId: string) => api.get(`/quotes/${quoteId}`),
  create: (bookId: string, data: object) => api.post(`/books/${bookId}/quotes`, data),
  update: (quoteId: string, data: object) => api.put(`/quotes/${quoteId}`, data),
  delete: (quoteId: string) => api.delete(`/quotes/${quoteId}`),
};

// ── Characters ────────────────────────────────────────────────────────────────
export const charactersApi = {
  getAll: (bookId: string) => api.get(`/books/${bookId}/characters`),
  getOne: (charId: string) => api.get(`/characters/${charId}`),
  create: (bookId: string, data: object) => api.post(`/books/${bookId}/characters`, data),
  update: (charId: string, data: object) => api.put(`/characters/${charId}`, data),
  delete: (charId: string) => api.delete(`/characters/${charId}`),
};

// ── Tags ──────────────────────────────────────────────────────────────────────
export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data: { name: string; color?: string }) => api.post('/tags', data),
  getItems: (tagId: string) => api.get(`/tags/${tagId}/items`),
  delete: (tagId: string) => api.delete(`/tags/${tagId}`),
};

// ── Links ─────────────────────────────────────────────────────────────────────
export const linksApi = {
  create: (data: object) => api.post('/links', data),
  getForItem: (itemId: string) => api.get('/links', { params: { itemId } }),
  delete: (linkId: string) => api.delete(`/links/${linkId}`),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string, bookId?: string) =>
    api.get('/search', { params: { q, ...(bookId && { bookId }) } }),
};
