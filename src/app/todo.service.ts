import { Injectable } from '@angular/core';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly baseUrl = 'http://localhost:3000/api/todos';

  async loadTodos(): Promise<Todo[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to load todos: ${response.status}`);
    }

    const data = (await response.json()) as Array<{
      id: number;
      text: string;
      completed: number | boolean;
    }>;

    return data.map((todo) => ({
      ...todo,
      completed: Boolean(todo.completed),
    }));
  }

  async addTodo(text: string): Promise<Todo> {
    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new Error('Text is required');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmedText }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add todo: ${response.status}`);
    }

    const todo = (await response.json()) as Todo & { completed?: number | boolean };

    return {
      ...todo,
      completed: Boolean(todo.completed),
    };
  }

  async updateTodo(id: number, payload: { text?: string; completed?: boolean }): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.status}`);
    }

    const todo = (await response.json()) as Todo & { completed?: number | boolean };

    return {
      ...todo,
      completed: Boolean(todo.completed),
    };
  }

  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.status}`);
    }
  }
}
