
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a todo', async () => {
    // Create a test todo first
    const result = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = result[0];

    // Delete the todo
    const deleteInput: DeleteTodoInput = {
      id: createdTodo.id
    };

    await deleteTodo(deleteInput);

    // Verify the todo is deleted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should not affect other todos when deleting', async () => {
    // Create multiple test todos
    const result1 = await db.insert(todosTable)
      .values({
        title: 'Todo 1',
        completed: false
      })
      .returning()
      .execute();

    const result2 = await db.insert(todosTable)
      .values({
        title: 'Todo 2',
        completed: true
      })
      .returning()
      .execute();

    const todo1 = result1[0];
    const todo2 = result2[0];

    // Delete only the first todo
    const deleteInput: DeleteTodoInput = {
      id: todo1.id
    };

    await deleteTodo(deleteInput);

    // Verify only the first todo is deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(1);
    expect(remainingTodos[0].id).toEqual(todo2.id);
    expect(remainingTodos[0].title).toEqual('Todo 2');
  });

  it('should handle deleting non-existent todo gracefully', async () => {
    const deleteInput: DeleteTodoInput = {
      id: 999 // Non-existent ID
    };

    // Should not throw an error
    await expect(deleteTodo(deleteInput)).resolves.toBeUndefined();

    // Verify no todos exist
    const todos = await db.select()
      .from(todosTable)
      .execute();

    expect(todos).toHaveLength(0);
  });
});
