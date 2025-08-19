"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Plus, Calendar, Clock, Trash2, CheckCircle2, Circle, X } from 'lucide-react';
import { Id } from "../../../convex/_generated/dataModel";
import TaskForm from './TaskForm';

// Define the Task type from Convex
interface ConvexTask {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  due: string;
  timezone: string;
  status?: string;
  source?: string;
  userId?: Id<"users">;
  callId?: Id<"calls">;
  reminderMinutesBefore?: number;
  // Allow for additional properties
  [key: string]: unknown;
}

// Define the Todo type for UI representation
interface Todo {
  _id?: Id<"tasks">;
  _creationTime?: number;
  title: string;
  completed?: boolean;
  due: string;
  timezone: string;
  priority?: 'low' | 'medium' | 'high';
  createdBy?: 'voice' | 'manual';
  status?: string;
}

const TodoApp = () => {
  const tasks = useQuery(api.tasks.get_tasks) || [];
  const currentUser = useQuery(api.user.getCurrentUser);
  // State for potential future voice listening feature will be added here
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("You're doing better than you think.");

  // Convert Convex tasks to Todo format
  const todos: Todo[] = tasks ? tasks.map((task: ConvexTask) => ({
    _id: task._id,
    _creationTime: task._creationTime,
    title: task.title,
    completed: task.status === 'completed',
    due: task.due,
    timezone: task.timezone,
    priority: determinePriority(task.title),
    createdBy: task.source === 'elevenlabs' ? 'voice' : 'manual',
    status: task.status
  })) : [];

  // Function to determine priority based on task title (simple heuristic)
  function determinePriority(title: string): 'low' | 'medium' | 'high' {
    const lowPriorityKeywords = ['later', 'sometime', 'eventually', 'when possible'];
    const highPriorityKeywords = ['urgent', 'important', 'asap', 'immediately', 'critical'];

    const lowerTitle = title.toLowerCase();

    if (highPriorityKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'high';
    } else if (lowPriorityKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  // Mutations
  const updateTask = useMutation(api.tasks.update_task);
  const deleteTask = useMutation(api.tasks.delete_task);


  const toggleTodo = (id: Id<"tasks">, completed: boolean) => {
    updateTask({
      id,
      status: completed ? 'completed' : 'scheduled'
    });

    if (!completed) {
      showEncouragingNotification();
    }
  };

  const removeTodo = (id: Id<"tasks">) => {
    deleteTask({ id });
  };

  // Commented out for future implementation
  /*
  const simulateVoiceListening = () => {
    _setIsListening(true);
    setTimeout(() => {
      _setIsListening(false);
      // Simulate adding a voice-created task
      const now = new Date();
      const dueDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Due in 12 hours

      createTask({
        title: 'Call mom to check in this evening',
        due: dueDate.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled',
        source: 'elevenlabs'
      });

      showEncouragingNotification();
    }, 2000);
  };
  */

  const showEncouragingNotification = () => {
    const encouragements = [
      "You're doing better than you think.",
      "You nailed it—on to the next win?",
      "Small steps lead to big progress!",
      "One task at a time, you're making progress.",
      "Keep going, you're on a roll!"
    ];

    setEncouragementMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alara', {
        body: encouragements[Math.floor(Math.random() * encouragements.length)]
      });
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-voice-listening text-primary-foreground';
      case 'low': return 'bg-voice-active text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTimeAgo = (date: number) => {
    const now = new Date();
    const diff = now.getTime() - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getDueTime = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-conversation">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-md text-accent mt-4">{encouragementMessage}</p>
        </div>

        {/* Stats and Add Task Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          <Button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="flex items-center gap-2"
          >
            {showTaskForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Task
              </>
            )}
          </Button>
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <div className="mb-8">
            <TaskForm
              userId={currentUser?._id}
              onSuccess={() => {
                setShowTaskForm(false);
                showEncouragingNotification();
              }}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        )}


        {/* Todo List */}
        <div className="space-y-4">
          {todos.map(todo => (
            <Card key={todo._id} className={`p-6 shadow-task transition-conversation hover:shadow-conversation ${todo.completed ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => todo._id && toggleTodo(todo._id, !todo.completed)}
                  className="mt-1 transition-smooth hover:scale-110"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>
                    {todo.createdBy === 'voice' && (
                      <Badge variant="outline" className="border-0">
                        <Mic className="w-3 h-3 mr-1" />
                        Voice
                      </Badge>
                    )}
                    {todo.due && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {getDueTime(todo.due)}
                      </Badge>
                    )}
                  </div>

                  <p className={`text-foreground mb-2 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.title}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {todo._creationTime ? getTimeAgo(todo._creationTime) : 'Just now'}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => todo._id && removeTodo(todo._id)}
                  className="text-muted-foreground hover:text-destructive transition-smooth"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {todos.length === 0 && (
            <Card className="p-12 text-center shadow-task">
              <div className="text-muted-foreground">
                <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Ready to listen</p>
                <p className="text-sm">Start a conversation or add your first task</p>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Rediscover focus through dialogue. Master yourself, master your time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;