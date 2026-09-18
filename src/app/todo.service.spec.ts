import { describe, expect, it, vi } from 'vitest';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  it('should load todos from the API', async () => {
    const service = new TodoService();
    const mockTodos = [{ id: 1, text: 'Test todo', completed: false }];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockTodos,
    } as Response);

    const result = await service.loadTodos();

    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3000/api/todos');
    expect(result).toEqual(mockTodos);
  });
});
