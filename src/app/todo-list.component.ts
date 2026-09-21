import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from './todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  @Input() todos: Todo[] = [];
  @Input() editingTodoId: number | null = null;
  @Input() editingText = '';

  @Output() toggle = new EventEmitter<{ id: number; completed: boolean }>();
  @Output() delete = new EventEmitter<number>();
  @Output() startEdit = new EventEmitter<Todo>();
  @Output() saveEdit = new EventEmitter<{ id: number; text: string }>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() editingTextChange = new EventEmitter<string>();

  protected onToggle(id: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggle.emit({ id, completed: checkbox.checked });
  }

  protected onDelete(id: number): void {
    this.delete.emit(id);
  }

  protected onStartEdit(todo: Todo): void {
    this.startEdit.emit(todo);
  }

  protected onSaveEdit(id: number): void {
    this.saveEdit.emit({ id, text: this.editingText });
  }

  protected onCancelEdit(): void {
    this.cancelEdit.emit();
  }

  protected onInputEdit(value: string): void {
    this.editingTextChange.emit(value);
  }
}
