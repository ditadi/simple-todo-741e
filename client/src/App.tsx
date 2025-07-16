
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
// Using type-only import for better TypeScript compliance
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  // Explicit typing with Todo interface
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // useCallback to memoize function used in useEffect
  const loadTodos = useCallback(async () => {
    try {
      // NOTE: Backend handlers are currently stubs that return placeholder data
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsLoading(true);
    try {
      const input: CreateTodoInput = { title: newTodoTitle.trim() };
      // NOTE: Backend handler is a stub - returns placeholder data
      const newTodo = await trpc.createTodo.mutate(input);
      
      // For stub implementation, we'll generate a realistic ID and use current timestamp
      const todoWithRealId = {
        ...newTodo,
        id: Date.now(), // Generate unique ID for stub
        created_at: new Date()
      };
      
      setTodos((prev: Todo[]) => [...prev, todoWithRealId]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      // NOTE: Backend handler is a stub - returns placeholder data
      await trpc.updateTodoCompletion.mutate({
        id: todo.id,
        completed: !todo.completed
      });
      
      // Update local state to reflect the change
      setTodos((prev: Todo[]) => 
        prev.map((t: Todo) => 
          t.id === todo.id 
            ? { ...t, completed: !t.completed }
            : t
        )
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      // NOTE: Backend handler is a stub - returns void
      await trpc.deleteTodo.mutate({ id: todoId });
      
      // Remove from local state
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">📝 Todo App</h1>
        <p className="text-center text-gray-600">
          Stay organized and get things done!
        </p>
      </div>

      {/* Create Todo Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Todo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTodo} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTodoTitle(e.target.value)
              }
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading || !newTodoTitle.trim()}>
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {completedCount} of {totalCount} completed
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No todos yet. Add one above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo: Todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    todo.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleComplete(todo)}
                    className="flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      todo.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {todo.created_at.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {todo.completed && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about stub implementation */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Backend handlers are currently stub implementations. 
          Todos are stored in memory and will reset on page refresh.
        </p>
      </div>
    </div>
  );
}

export default App;
