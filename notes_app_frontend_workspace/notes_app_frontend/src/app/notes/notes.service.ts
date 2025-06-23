import { Injectable } from '@angular/core';
import { Note } from './note.model';
import { BehaviorSubject, Observable } from 'rxjs';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class NotesService {
  /**
   * Manages in-memory note storage and provides basic CRUD functionalities.
   */
  private _notes = new BehaviorSubject<Note[]>([]);
  private nextId = 1;

  // PUBLIC_INTERFACE
  get notes$(): Observable<Note[]> {
    /** Returns observable of notes list (sorted by modified desc) */
    return this._notes.asObservable();
  }

  // PUBLIC_INTERFACE
  getSnapshot(): Note[] {
    /** Returns current notes snapshot */
    return this._notes.value;
  }

  // PUBLIC_INTERFACE
  add(note: Pick<Note, 'title' | 'content'>): void {
    /** Adds a new note */
    const now = new Date();
    const newNote: Note = {
      id: this.nextId++,
      title: note.title,
      content: note.content,
      createdAt: now,
      updatedAt: now
    };
    this._notes.next([ newNote, ...this._notes.value ]);
  }

  // PUBLIC_INTERFACE
  update(note: Note): void {
    /** Updates an existing note */
    const updatedNotes = this._notes.value.map(n => 
      n.id === note.id
        ? { ...note, updatedAt: new Date() }
        : n
    );
    this._notes.next(updatedNotes);
  }

  // PUBLIC_INTERFACE
  delete(id: number): void {
    /** Deletes a note by id */
    this._notes.next(this._notes.value.filter(n => n.id !== id));
  }

  // PUBLIC_INTERFACE
  getById(id: number): Note | undefined {
    /** Returns a note by id */
    return this._notes.value.find(n => n.id === id);
  }

  // PUBLIC_INTERFACE
  search(query: string): Note[] {
    /** Searches notes by title or content (case-insensitive) */
    const q = query.toLowerCase();
    return this._notes.value.filter(note =>
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  }

  constructor() {
    // Demo data for illustration
    this._notes.next([
      {
        id: this.nextId++,
        title: 'Welcome to NoteEase',
        content: 'This is your very first note! Create, edit, or search for your notes using the sidebar.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }
}
