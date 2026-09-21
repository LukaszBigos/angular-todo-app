import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from './todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  template: `
    <li class="todo-item">
      @if (editingTodoId === todo.id) {
        <div class="todo-edit-row">
          <input
            [value]="editingText"
            (input)="editingTextChange.emit($any($event.target).value)"
            (keydown.enter)="saveEdit.emit({ id: todo.id, text: editingText })"
            class="todo-edit-input"
          />

          <button
            type="button"
            (click)="saveEdit.emit({ id: todo.id, text: editingText })"
            class="todo-button todo-button--save"
          >
            Save
          </button>

          <button type="button" (click)="cancelEdit.emit()" class="todo-button todo-button--muted">
            Cancel
          </button>
        </div>
      } @else {
        <label class="todo-main">
          <input
            type="checkbox"
            class="todo-checkbox"
            [checked]="todo.completed"
            (change)="toggle.emit({ id: todo.id, completed: $any($event.target).checked })"
          />

          <span class="todo-text" [class.is-complete]="todo.completed">
            {{ todo.text }}
          </span>
        </label>

        <div class="todo-actions">
          <button
            type="button"
            (click)="startEdit.emit(todo)"
            class="todo-action todo-action--edit"
          >
            Edit
          </button>

          <button
            type="button"
            (click)="delete.emit(todo.id)"
            class="todo-action todo-action--delete"
          >
            Delete
          </button>
        </div>
      }
    </li>
  `,
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Input() editingTodoId: number | null = null;
  @Input() editingText = '';

  @Output() toggle = new EventEmitter<{ id: number; completed: boolean }>();
  @Output() delete = new EventEmitter<number>();
  @Output() startEdit = new EventEmitter<Todo>();
  @Output() saveEdit = new EventEmitter<{ id: number; text: string }>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() editingTextChange = new EventEmitter<string>();
}
