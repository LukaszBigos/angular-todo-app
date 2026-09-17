import { AfterViewChecked, Component, signal, ViewChild } from '@angular/core';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements AfterViewChecked {
  @ViewChild('editInput')
  private editInput?: { nativeElement: HTMLInputElement };

  protected readonly title = signal('angular-todo-app');
  protected readonly newTodo = signal('');
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
      const response = await fetch('http://localhost:3000/api/todos');

      if (!response.ok) {
        throw new Error(`Failed to load todos: ${response.status}`);
      }

      const data = (await response.json()) as Array<{
        id: number;
        text: string;
        completed: number | boolean;
      }>;

      this.todos.set(
        data.map((todo) => ({
          ...todo,
          completed: Boolean(todo.completed),
        })),
      );
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }

  protected async addTodo(): Promise<void> {
    const text = this.newTodo().trim();

    if (!text) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo: ${response.status}`);
      }

      this.newTodo.set('');
      await this.loadTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  protected async toggleTodo(id: number, event: Event): Promise<void> {
    const checkbox = event.target as HTMLInputElement;
    const completed = checkbox.checked;

    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.status}`);
      }

      await this.loadTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }

  protected async deleteTodo(id: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.status}`);
      }

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
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo text: ${response.status}`);
      }

      await this.loadTodos();
    } catch (error) {
      console.error('Failed to update todo text:', error);
    }
  }

  protected startEdit(todo: Todo): void {
    this.editingTodoId.set(todo.id);
    this.editingText.set(todo.text);
  }

  protected async saveEdit(id: number): Promise<void> {
    const text = this.editingText().trim();

    if (!text) {
      return;
    }

    await this.updateTodoText(id, text);
    this.editingTodoId.set(null);
    this.editingText.set('');
  }
}
