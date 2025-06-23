import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, SlicePipe, DatePipe } from '@angular/common';

import { NotesService } from './notes.service';
import { Note } from './note.model';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-notes',
  standalone: true,
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    SlicePipe,
    DatePipe
  ],
  providers: [NotesService]
})
export class NotesComponent {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  selectedNote: Note | null = null;
  isCreatingNew: boolean = false;
  editMode: boolean = false;
  searchQuery: string = '';

  // Form state
  formTitle: string = '';
  formContent: string = '';

  constructor(notesService: NotesService) {
    notesService.notes$.subscribe(notes => {
      this.notes = notes;
      this.applySearch();
    });
    this.notesService = notesService;
  }

  private notesService: NotesService;

  // PUBLIC_INTERFACE
  selectNote(note: Note) {
    /** Select a note for viewing/editing */
    this.selectedNote = note;
    this.editMode = false;
    this.isCreatingNew = false;
    this.formTitle = note.title;
    this.formContent = note.content;
  }

  // PUBLIC_INTERFACE
  newNote() {
    /** Prepare the UI for a new note */
    this.selectedNote = null;
    this.isCreatingNew = true;
    this.editMode = true;
    this.formTitle = '';
    this.formContent = '';
  }

  // PUBLIC_INTERFACE
  startEdit() {
    /** Start editing the selected note */
    this.editMode = true;
  }

  // PUBLIC_INTERFACE
  cancelEdit() {
    /** Cancels editing/new note mode */
    if (this.selectedNote) {
      this.editMode = false;
      this.formTitle = this.selectedNote.title;
      this.formContent = this.selectedNote.content;
    } else {
      this.isCreatingNew = false;
      this.editMode = false;
      this.formTitle = '';
      this.formContent = '';
    }
  }

  // PUBLIC_INTERFACE
  saveNote() {
    /** Validate and save the note (create or update) */
    const title = this.formTitle.trim();
    if (!title) return;
    if (this.isCreatingNew) {
      this.notesService.add({
        title,
        content: this.formContent.trim()
      });
      const latest = this.notesService.getSnapshot()[0];
      this.selectNote(latest);
      this.isCreatingNew = false;
      this.editMode = false;
    } else if (this.selectedNote) {
      this.notesService.update({
        ...this.selectedNote,
        title,
        content: this.formContent.trim()
      });
      // Refresh selection with updated
      const updated = this.notesService.getById(this.selectedNote.id);
      if (updated) this.selectNote(updated);
      this.editMode = false;
    }
  }

  // PUBLIC_INTERFACE
  deleteNote(note: Note) {
    /** Delete a note, and reset selection if necessary */
    if (this.confirmDelete()) {
      this.notesService.delete(note.id);
      if (this.selectedNote?.id === note.id) {
        this.selectedNote = null;
        this.editMode = false;
        this.isCreatingNew = false;
      }
      this.applySearch();
    }
  }

  private confirmDelete(): boolean {
    // Use global confirm dialog if available, always allow in SSR/Node without window
    return typeof globalThis !== "undefined" && typeof globalThis.confirm === "function"
      ? globalThis.confirm("Delete this note?")
      : true;
  }

  // PUBLIC_INTERFACE
  onSearch(query: string) {
    /** Handle searching notes */
    this.searchQuery = query;
    this.applySearch();
  }

  applySearch() {
    /** Apply live search filter */
    if (!this.searchQuery) {
      this.filteredNotes = this.notes;
    } else {
      this.filteredNotes = this.notesService.search(this.searchQuery);
    }
    // Auto re-select if selected note was deleted during search.
    if (this.selectedNote && !this.filteredNotes.find(n => n.id === this.selectedNote!.id)) {
      this.selectedNote = null;
      this.isCreatingNew = false;
    }
  }
}
