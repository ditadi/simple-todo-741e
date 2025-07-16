
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    
    expect(result).toEqual([]);
  });

  it('should return all todos from database', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        { title: 'First todo', completed: false },
        { title: 'Second todo', completed: true },
        { title: 'Third todo', completed: false }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('First todo');
    expect(result[0].completed).toEqual(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    expect(result[1].title).toEqual('Second todo');
    expect(result[1].completed).toEqual(true);
    
    expect(result[2].title).toEqual('Third todo');
    expect(result[2].completed).toEqual(false);
  });

  it('should return todos in database order', async () => {
    // Create todos in specific order
    const todo1 = await db.insert(todosTable)
      .values({ title: 'Todo 1', completed: false })
      .returning()
      .execute();
    
    const todo2 = await db.insert(todosTable)
      .values({ title: 'Todo 2', completed: true })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual(todo1[0].id);
    expect(result[1].id).toEqual(todo2[0].id);
  });
});
