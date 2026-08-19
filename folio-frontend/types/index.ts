// All TypeScript interfaces matching the API spec exactly.
// Field names mirror the response envelopes in folio-api-endpoints.md.

export interface User {
  _id: string;
  name: string;
  email: string;
  booksCount?: number;
  createdAt: string;
}

export interface Book {
  _id: string;
  user?: string;
  title: string;
  author?: string;
  genre?: string;
  coverImage?: string;
  totalPages?: number;
  currentPage: number;
  status: 'to-read' | 'reading' | 'completed';
  completionPercent?: number;
  notesCount?: number;
  quotesCount?: number;
  charactersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  _id: string;
  book?: string | { _id: string; title: string };
  user?: string;
  topic: string;
  content: string;
  tags: string[] | Tag[];
  createdAt: string;
  updatedAt?: string;
}

export interface Quote {
  _id: string;
  book?: string | { _id: string; title: string };
  user?: string;
  text: string;
  page?: number;
  chapter?: string;
  reaction?: string;
  tags?: string[] | Tag[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Relationship {
  character: string;
  description: string;
}

export interface Character {
  _id: string;
  book?: string;
  user?: string;
  name: string;
  role?: string;
  traits: string[];
  relationships: Relationship[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  _id: string;
  user?: string;
  name: string;
  color: string;
  usageCount?: number;
}

export interface LinkItem {
  type: 'note' | 'quote';
  id: string;
  book: string | null;
  topic?: string; // for notes
  text?: string;  // for quotes
}

export interface Link {
  _id: string;
  user?: string;
  source?: LinkItem;
  target: LinkItem;
  note?: string;
  createdAt?: string;
}

export interface Progress {
  book?: string;
  currentPage: number;
  totalPages?: number;
  completionPercent: number;
  avgPagesPerDay?: number | null;
  estimatedFinishDate?: string | null;
  updatedAt?: string;
}

export interface SearchResults {
  notes: Array<{ _id: string; topic: string; book: { _id: string; title: string } }>;
  quotes: Array<{ _id: string; text: string; book: { _id: string; title: string } }>;
  characters: Array<{ _id: string; name: string; role?: string; book: { _id: string; title: string } }>;
}

export interface TagItems {
  notes: Array<{ _id: string; topic: string; book: string }>;
  quotes: Array<{ _id: string; text: string; book: string }>;
}
