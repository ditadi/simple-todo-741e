
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoCompletionInput } from '../schema';
import { updateTodoCompletion } from '../handlers/update_todo_completion';
import { eq } from 'drizzle-orm';

describe('updateTodoCompletion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo completion status to true', async () => {
    // Create a todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const input: UpdateTodoCompletionInput = {
      id: todoId,
      completed: true
    };

    const result = await updateTodoCompletion(input);

    // Verify the updated todo
    expect(result.id).toEqual(todoId);
    expect(result.title).toEqual('Test Todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update todo completion status to false', async () => {
    // Create a completed todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        title: 'Completed Todo',
        completed: true
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const input: UpdateTodoCompletionInput = {
      id: todoId,
      completed: false
    };

    const result = await updateTodoCompletion(input);

    // Verify the updated todo
    expect(result.id).toEqual(todoId);
    expect(result.title).toEqual('Completed Todo');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save completion status to database', async () => {
    // Create a todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        title: 'Database Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createdTodo[0].id;

    const input: UpdateTodoCompletionInput = {
      id: todoId,
      completed: true
    };

    await updateTodoCompletion(input);

    // Query database to verify the update was persisted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].title).toEqual('Database Test Todo');
  });

  it('should throw error for non-existent todo', async () => {
    const input: UpdateTodoCompletionInput = {
      id: 999, // Non-existent ID
      completed: true
    };

    await expect(updateTodoCompletion(input)).rejects.toThrow(/todo with id 999 not found/i);
  });
});
