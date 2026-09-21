import { AfterViewChecked, Component, inject, signal, ViewChild } from '@angular/core';
import { Todo, TodoService } from './todo.service';
import { TodoFormComponent } from './todo-form.component';
import { TodoListComponent } from './todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoFormComponent, TodoListComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements AfterViewChecked {
  @ViewChild('editInput')
  private editInput?: { nativeElement: HTMLInputElement };

  private readonly todoService = inject(TodoService);

  protected readonly title = signal('angular-todo-app');
  protected readonly todos = signal<Todo[]>([]);
  protected readonly editingTodoId = signal<number | null>(null);
  protected readonly editingText = signal('');
  private lastEditingId: number | null = null;

  constructor() {
    void this.loadTodos();
  }

  ngAfterViewChecked(): void {
    if (
      this.editInput &&
      this.editingTodoId() !== null &&
      this.editingTodoId() !== this.lastEditingId
    ) {
      this.editInput.nativeElement.focus();
      this.editInput.nativeElement.select();
      this.lastEditingId = this.editingTodoId();
    }

    if (this.editingTodoId() === null) {
      this.lastEditingId = null;
    }
  }

  private async loadTodos(): Promise<void> {
    try {
      this.todos.set(await this.todoService.loadTodos());
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }

  protected async addTodo(text: string): Promise<void> {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    try {
      await this.todoService.addTodo(trimmedText);
      await this.loadTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  protected async toggleTodo(id: number, completed: boolean): Promise<void> {
    try {
      await this.todoService.updateTodo(id, { completed });
      await this.loadTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }

  protected async deleteTodo(id: number): Promise<void> {
    try {
      await this.todoService.deleteTodo(id);
      await this.loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }

  protected async updateTodoText(id: number, text: string): Promise<void> {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    try {
      await this.todoService.updateTodo(id, { text: trimmedText });
      await this.loadTodos();
    } catch (error) {
      console.error('Failed to update todo text:', error);
    }
  }

  protected startEdit(todo: Todo): void {
    this.editingTodoId.set(todo.id);
    this.editingText.set(todo.text);
  }

  protected async saveEdit({ id, text }: { id: number; text: string }): Promise<void> {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    await this.updateTodoText(id, trimmedText);
    this.editingTodoId.set(null);
    this.editingText.set('');
  }

  protected cancelEdit(): void {
    this.editingTodoId.set(null);
    this.editingText.set('');
  }

  protected setEditingText(value: string): void {
    this.editingText.set(value);
  }
}
