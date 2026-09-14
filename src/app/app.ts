import { Component, signal } from '@angular/core';

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
export class App {
  protected readonly title = signal('angular-todo-app');
  protected readonly newTodo = signal('');
  protected readonly todos = signal<Todo[]>([]);

  constructor() {
    void this.loadTodos();
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
}
