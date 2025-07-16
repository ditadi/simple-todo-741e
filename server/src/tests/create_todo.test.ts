
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Test Todo Item'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Todo Item');
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Test Todo Item');
    expect(todos[0].completed).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different todo titles', async () => {
    const shortTitle = { title: 'Buy milk' };
    const longTitle = { title: 'Complete the quarterly report and submit it to the management team for review' };

    const result1 = await createTodo(shortTitle);
    const result2 = await createTodo(longTitle);

    expect(result1.title).toEqual('Buy milk');
    expect(result2.title).toEqual('Complete the quarterly report and submit it to the management team for review');
    expect(result1.id).not.toEqual(result2.id);
  });
});
