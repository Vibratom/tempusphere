
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
}

export function ChecklistApp() {
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:lists', []);
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState<Record<string, string>>({});

  const addList = () => {
    if (newListName.trim()) {
      const newList: Checklist = {
        id: Date.now().toString(),
        title: newListName.trim(),
        tasks: [],
      };
      setLists([newList, ...lists]);
      setNewListName('');
    }
  };

  const removeList = (listId: string) => {
    setLists(lists.filter((list) => list.id !== listId));
  };

  const addTask = (listId: string) => {
    const taskText = newTaskTexts[listId]?.trim();
    if (taskText) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
      };
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        )
      );
      setNewTaskTexts({ ...newTaskTexts, [listId]: '' });
    }
  };

  const removeTask = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) }
          : list
      )
    );
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : list
      )
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Checklist</h1>
            <p className="text-lg text-muted-foreground mt-2">Organize your tasks and get things done.</p>
        </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a New List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="E.g., Groceries, Work Tasks..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addList()}
            />
            <Button onClick={addList}>
              <Plus className="mr-2 h-4 w-4" /> Add List
            </Button>
          </div>
        </CardContent>
      </Card>

      {lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card key={list.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{list.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeList(list.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskTexts[list.id] || ''}
                    onChange={(e) => setNewTaskTexts({ ...newTaskTexts, [list.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addTask(list.id)}
                  />
                  <Button size="icon" onClick={() => addTask(list.id)}><Plus className="h-4 w-4"/></Button>
                </div>
                <Separator />
                <ScrollArea className="flex-1 h-48 -mr-4">
                    <div className="space-y-3 pr-4">
                    {list.tasks.length > 0 ? list.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(list.id, task.id)}
                                />
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={cn(
                                        "text-sm font-medium leading-none",
                                        task.completed ? "line-through text-muted-foreground" : ""
                                    )}
                                >
                                    {task.text}
                                </label>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(list.id, task.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center pt-4">No tasks yet. Add one above!</p>
                    )}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
            <ListChecks className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">No Lists Yet</h3>
            <p className="text-sm">Create your first list to get started.</p>
        </div>
      )}
    </div>
  );
}
