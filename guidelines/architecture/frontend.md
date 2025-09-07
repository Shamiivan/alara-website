# Frontend Architecture Guidelines

## Table of Contents
- [Core Principles](#core-principles)
- [File Organization](#file-organization)
- [Layout Architecture](#layout-architecture)
- [Data Flow Patterns](#data-flow-patterns)
- [Component Guidelines](#component-guidelines)
- [Action Handling](#action-handling)
- [Error Handling](#error-handling)
- [Testing Strategy](#testing-strategy)
- [Common Anti-Patterns](#common-anti-patterns)
- [Migration Guide](#migration-guide)

## Core Principles

### 1. Separation of Concerns
**Principle**: Each part of the application should have a single, well-defined responsibility.

**Layout**: Handled by primitives (Page, Card, Section)
**Data**: Managed by custom hooks
**Actions**: Defined in hooks, passed down as props
**UI**: Pure components that receive data and actions

### 2. Composition Over Inheritance
**Principle**: Build complex UIs by combining simple, reusable primitives.

### 3. Consistency Over Creativity
**Principle**: Follow established patterns rather than inventing new approaches for each feature.


---

## File Organization

### Directory Structure

```
src/
├── components/
│   ├── primitives/           # Core building blocks
│   │   ├── layouts/         # Page, Card, Section, AppShell
│   │   └── feedback/        # LoadingState, ErrorDisplay
│   ├── [domain]/            # Business domain components
│   │   ├── [Feature]View.tsx    # Pure UI components
│   │   ├── [Feature]List.tsx    # List components
│   │   ├── [Feature]Form.tsx    # Form components
│   │   └── [Feature]Widget.tsx  # Composed UI pieces
│   └── ui/                  # Third-party UI components (shadcn/ui)
├── hooks/
│   └── use[Domain]Data.ts   # Data fetching and actions
├── types/
│   └── [domain].ts         # TypeScript interfaces
└── app/
    ├── (public)/            # Landing pages (navbar + footer)
    └── app/                 # Authenticated app (sidebar)
```

### Naming Conventions

**✅ DO**
```
useCalendarData.ts          # Data hooks
CalendarView.tsx           # Pure UI components
CreateEventForm.tsx        # Form components
TaskWidget.tsx            # Composed widgets
calendar.ts               # Type definitions
```

**❌ DON'T**
```
calendar-data.ts          # Use camelCase for files
CalendarComponent.tsx     # Too generic
calendar-view.tsx         # Use PascalCase for components
taskWidget.js            # Use TypeScript
```

---

## Layout Architecture

### App Shell Pattern

**✅ DO - Use AppShell for authenticated pages**
```tsx
// src/app/app/layout.tsx
import { AppShell } from "@/components/primitives/layouts";

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

**❌ DON'T - Create custom layout logic**
```tsx
// Don't reinvent responsive sidebar logic
export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="complex-custom-layout">
      {/* Custom sidebar implementation */}
    </div>
  );
}
```

### Page Structure

**✅ DO - Use Page primitive consistently**
```tsx
export default function TasksPage() {
  const tasks = useTasksData();
  
  return (
    <Page 
      title="Tasks" 
      subtitle="Manage your tasks"
      maxWidth="xl"
      actions={<CreateTaskButton />}
    >
      <TasksView {...tasks} />
    </Page>
  );
}
```

**❌ DON'T - Create custom page layouts**
```tsx
export default function TasksPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage your tasks</p>
        </div>
        <CreateTaskButton />
      </div>
      {/* Reinventing page structure */}
    </div>
  );
}
```

### Content Organization

**✅ DO - Use Section and Card primitives**
```tsx
<Page title="Dashboard">
  <Section title="Overview" spacing="lg">
    <div className="grid-responsive">
      <Card variant="elevated">
        <TasksSummary />
      </Card>
      <Card variant="elevated">
        <CalendarSummary />
      </Card>
    </div>
  </Section>
  
  <Section title="Recent Activity">
    <Card>
      <ActivityFeed />
    </Card>
  </Section>
</Page>
```

**❌ DON'T - Create custom spacing and containers**
```tsx
<div className="space-y-8">
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-4">Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <TasksSummary />
      </div>
    </div>
  </div>
</div>
```

---

## Data Flow Patterns

### Custom Hook Structure

**✅ DO - Follow the standard hook pattern**
```tsx
export function useTasksData() {
  // 1. Convex queries/mutations
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  // 2. Local state for actions
  const [isCreating, setIsCreating] = useState(false);
  
  // 3. Action handlers with error handling
  const handleCreate = useCallback(async (data: CreateTaskData) => {
    setIsCreating(true);
    try {
      const result = await createTask(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      toast.success("Task created");
      return true;
    } catch (error) {
      toast.error("Failed to create task");
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [createTask]);
  
  // 4. Derived data
  const todayTasks = tasks?.filter(t => isToday(t.dueDate)) || [];
  
  // 5. Return standardized interface
  return {
    allTasks: tasks || [],
    todayTasks,
    isLoading: tasks === undefined,
    isCreating,
    error: null,
    actions: { handleCreate },
    refetch: () => {}
  };
}
```

**❌ DON'T - Mix concerns or skip error handling**
```tsx
export function useTasksData() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  // Missing error handling, loading states, action organization
  const handleCreate = (data) => {
    createTask(data); // No error handling
  };
  
  return { tasks, handleCreate }; // Inconsistent interface
}
```

### Page-Level Data Coordination

**✅ DO - Fetch data at page level, pass to components**
```tsx
function TasksPage() {
  const {
    allTasks,
    isLoading,
    error,
    actions: { handleCreate, handleUpdate, handleDelete }
  } = useTasksData();

  return (
    <Page title="Tasks">
      <TasksView
        tasks={allTasks}
        isLoading={isLoading}
        error={error}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Page>
  );
}
```

**❌ DON'T - Let components fetch their own data**
```tsx
function TasksPage() {
  return (
    <Page title="Tasks">
      <TasksView /> {/* Component fetches its own data */}
    </Page>
  );
}

function TasksView() {
  const tasks = useTasksData(); // Wrong - data fetching in view
  return <TaskList tasks={tasks} />;
}
```

---

## Component Guidelines

### View Components (Pure UI)

**✅ DO - Create pure components that receive all data as props**
```tsx
interface TasksViewProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onCreate: (data: CreateTaskData) => Promise<boolean>;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function TasksView({
  tasks,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete
}: TasksViewProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <CreateTaskForm onSubmit={onCreate} />
      <TaskList tasks={tasks} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}
```

**❌ DON'T - Mix data fetching with UI logic**
```tsx
export function TasksView() {
  const { tasks, isLoading, createTask } = useTasksData(); // Wrong
  const [showCompleted, setShowCompleted] = useState(false);
  
  const handleCreate = async (data) => {
    const result = await createTask(data); // Wrong - action handling in view
    if (result.success) {
      toast.success("Created"); // Wrong - should be in hook
    }
  };

  return (
    <div>
      {/* Mixed concerns */}
    </div>
  );
}
```

### Form Components

**✅ DO - Handle form state locally, call action on submit**
```tsx
interface CreateTaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<boolean>;
  isLoading?: boolean;
}

export function CreateTaskForm({ onSubmit, isLoading }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const success = await onSubmit({
      title: title.trim(),
      priority
    });

    if (success) {
      // Reset form only on success
      setTitle('');
      setPriority('medium');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          disabled={isLoading}
          required
        />
        
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="btn-base btn-primary px-4 py-2"
        >
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </Card>
  );
}
```

**❌ DON'T - Call mutations directly in forms**
```tsx
export function CreateTaskForm() {
  const createTask = useMutation(api.tasks.create); // Wrong
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({ title }); // Wrong - should go through hook
      toast.success("Created");
    } catch (error) {
      toast.error("Failed"); // Wrong - error handling should be centralized
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Action Handling

### Action Flow Pattern

**✅ DO - Actions flow down from pages through props**
```
Page (coordinates data) 
  ↓ passes actions as props
View Component (receives actions)
  ↓ passes actions to children
Form/List Components (call actions)
```

```tsx
// Page Level
function TasksPage() {
  const { tasks, actions } = useTasksData();
  return <TasksView tasks={tasks} {...actions} />;
}

// View Level  
function TasksView({ tasks, onCreate, onUpdate, onDelete }) {
  return (
    <div>
      <CreateTaskForm onSubmit={onCreate} />
      <TaskList tasks={tasks} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}

// Component Level
function TaskItem({ task, onUpdate, onDelete }) {
  const handleToggle = () => onUpdate(task._id, { completed: !task.completed });
  const handleDelete = () => onDelete(task._id);
  
  return (
    <div>
      <button onClick={handleToggle}>Toggle</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

**❌ DON'T - Call actions directly in leaf components**
```tsx
function TaskItem({ task }) {
  const updateTask = useMutation(api.tasks.update); // Wrong
  
  const handleToggle = async () => {
    await updateTask({ id: task._id, completed: !task.completed }); // Wrong
  };
  
  return <button onClick={handleToggle}>Toggle</button>;
}
```

### Action Return Values

**✅ DO - Actions return success/failure boolean**
```tsx
const handleCreate = useCallback(async (data: CreateTaskData) => {
  try {
    const result = await createTask(data);
    if (!result.success) {
      toast.error(result.error);
      return false; // Clear failure signal
    }
    toast.success("Task created");
    return true; // Clear success signal
  } catch (error) {
    toast.error("Failed to create task");
    return false;
  }
}, [createTask]);

// Usage in component
const handleSubmit = async (data) => {
  const success = await onCreate(data);
  if (success) {
    resetForm(); // Only handle UI concerns
  }
};
```

**❌ DON'T - Let actions throw errors or return undefined**
```tsx
const handleCreate = async (data) => {
  const result = await createTask(data);
  if (!result.success) {
    throw new Error(result.error); // Wrong - forces try/catch everywhere
  }
  return result.data; // Wrong - inconsistent return type
};
```

---

## Error Handling

### Standard Error Components

**✅ DO - Use ErrorDisplay primitive consistently**
```tsx
import { ErrorDisplay } from "@/components/primitives/feedback";

// In view components
if (error) {
  return <ErrorDisplay error={error} retry={refetch} variant="card" />;
}

// In hooks
const handleCreate = async (data) => {
  try {
    const result = await createTask(data);
    if (!result.success) {
      toast.error(result.error); // User feedback
      return false;
    }
    return true;
  } catch (error) {
    toast.error("Something went wrong"); // Generic fallback
    return false;
  }
};
```

**❌ DON'T - Create custom error handling**
```tsx
// Wrong - custom error UI
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded">
      <p className="text-red-700">{error}</p>
      <button onClick={retry} className="text-red-600 underline">
        Try again
      </button>
    </div>
  );
}

// Wrong - inconsistent error handling
const handleCreate = async (data) => {
  const result = await createTask(data);
  if (!result.success) {
    alert(result.error); // Wrong - use toast
    throw new Error(result.error); // Wrong - don't throw
  }
};
```

### Backend Error Handling

**✅ DO - Use Result pattern in Convex actions**
```tsx
export const createTask = action({
  args: { title: v.string() },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.string() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<string>> => {
    try {
      const taskId = await ctx.db.insert("tasks", args);
      return Ok(taskId);
    } catch (error) {
      return Err("Failed to create task");
    }
  }
});
```

**❌ DON'T - Let actions throw to frontend**
```tsx
export const createTask = action({
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", args); // Can throw
    return taskId; // Inconsistent response format
  }
});
```

---

## Testing Strategy

### Hook Testing

**✅ DO - Test data logic separately from UI**
```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useTasksData } from '@/hooks/useTasksData';

test('filters today tasks correctly', async () => {
  const { result } = renderHook(() => useTasksData());
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.todayTasks).toHaveLength(2);
  expect(result.current.allTasks).toHaveLength(5);
});

test('handles create action success', async () => {
  const { result } = renderHook(() => useTasksData());
  
  const success = await result.current.actions.handleCreate({
    title: 'Test task'
  });
  
  expect(success).toBe(true);
});
```

### Component Testing

**✅ DO - Test UI with mock data**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TasksView } from '@/components/tasks/TasksView';

test('displays loading state', () => {
  render(
    <TasksView 
      tasks={[]} 
      isLoading={true} 
      error={null}
      onCreate={jest.fn()}
      onUpdate={jest.fn()}
      onDelete={jest.fn()}
    />
  );
  
  expect(screen.getByTestId('loading-state')).toBeInTheDocument();
});

test('calls onCreate when form submitted', async () => {
  const mockCreate = jest.fn().mockResolvedValue(true);
  
  render(
    <TasksView 
      tasks={[]} 
      isLoading={false} 
      error={null}
      onCreate={mockCreate}
      onUpdate={jest.fn()}
      onDelete={jest.fn()}
    />
  );
  
  fireEvent.click(screen.getByRole('button', { name: /create/i }));
  
  expect(mockCreate).toHaveBeenCalled();
});
```

**❌ DON'T - Test implementation details**
```tsx
test('calls useQuery with correct arguments', () => {
  // Wrong - testing implementation, not behavior
  const spy = jest.spyOn(convex, 'useQuery');
  render(<TasksView />);
  expect(spy).toHaveBeenCalledWith(api.tasks.list);
});
```

---

## Common Anti-Patterns

### 1. Mixed Concerns in Components

**❌ ANTI-PATTERN**
```tsx
function TaskList() {
  // Data fetching
  const tasks = useQuery(api.tasks.list);
  const updateTask = useMutation(api.tasks.update);
  
  // Business logic
  const todayTasks = tasks?.filter(t => isToday(t.dueDate));
  
  // UI state
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Action handling
  const handleUpdate = async (id, data) => {
    try {
      await updateTask({ id, ...data });
      toast.success("Updated");
    } catch (error) {
      toast.error("Failed");
    }
  };
  
  // Layout logic
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Everything mixed together */}
    </div>
  );
}
```

**✅ SOLUTION - Separate concerns**
```tsx
// Hook handles data + actions
function useTasksData() { /* ... */ }

// Component handles UI only
function TaskList({ tasks, onUpdate }) { /* ... */ }

// Page coordinates everything
function TasksPage() {
  const tasksData = useTasksData();
  return (
    <Page title="Tasks">
      <TaskList {...tasksData} />
    </Page>
  );
}
```

### 2. Prop Drilling Actions

**❌ ANTI-PATTERN**
```tsx
function TasksPage() {
  const updateTask = useMutation(api.tasks.update);
  return <TasksSection updateTask={updateTask} />;
}

function TasksSection({ updateTask }) {
  return <TaskList updateTask={updateTask} />;
}

function TaskList({ updateTask }) {
  return tasks.map(task => 
    <TaskItem key={task.id} task={task} updateTask={updateTask} />
  );
}
```

**✅ SOLUTION - Use data hooks**
```tsx
function TasksPage() {
  const tasksData = useTasksData(); // Hook handles all actions
  return <TasksView {...tasksData} />;
}
```

### 3. Inconsistent Loading States

**❌ ANTI-PATTERN**
```tsx
// Different loading UI everywhere
function TaskList() {
  if (isLoading) return <div className="spinner">Loading...</div>;
}

function CalendarView() {
  if (isLoading) return <p>Please wait...</p>;
}

function ProfilePage() {
  if (isLoading) return <div className="animate-pulse">Loading</div>;
}
```

**✅ SOLUTION - Standard loading primitive**
```tsx
import { LoadingState } from "@/components/primitives/feedback";

function TaskList() {
  if (isLoading) return <LoadingState variant="skeleton" />;
}

function CalendarView() {
  if (isLoading) return <LoadingState variant="spinner" />;
}
```

---

## Migration Guide

### Migrating Existing Components

#### Step 1: Extract Data Logic
```tsx
// Before: Mixed component
function TaskPage() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  const handleCreate = async (data) => {
    await createTask(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Tasks</h1>
      <TaskList tasks={tasks} onCreate={handleCreate} />
    </div>
  );
}

// After: Extract to hook
function useTasksData() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  const handleCreate = useCallback(async (data) => {
    try {
      const result = await createTask(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      toast.success("Created");
      return true;
    } catch (error) {
      toast.error("Failed to create");
      return false;
    }
  }, [createTask]);
  
  return {
    tasks: tasks || [],
    isLoading: tasks === undefined,
    actions: { handleCreate }
  };
}
```

#### Step 2: Use Layout Primitives
```tsx
// Before: Custom layout
function TaskPage() {
  const tasksData = useTasksData();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-gray-600">Manage your tasks</p>
      </div>
      <TasksView {...tasksData} />
    </div>
  );
}

// After: Use primitives
function TaskPage() {
  const tasksData = useTasksData();
  
  return (
    <Page title="Tasks" subtitle="Manage your tasks">
      <TasksView {...tasksData} />
    </Page>
  );
}
```

#### Step 3: Separate UI Components
```tsx
// Before: View fetches data
function TasksView() {
  const { tasks, isLoading, handleCreate } = useTasksData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <CreateTaskForm onSubmit={handleCreate} />
      <TaskList tasks={tasks} />
    </div>
  );
}

// After: Pure UI component
function TasksView({ tasks, isLoading, onCreate }) {
  if (isLoading) return <LoadingState />;
  
  return (
    <div className="space-y-6">
      <CreateTaskForm onSubmit={onCreate} />
      <TaskList tasks={tasks} />
    </div>
  );
}
```

### Rollback Strategy

If issues arise during migration:

1. **Keep old components as `.backup` files**
2. **Implement new pattern alongside old code**
3. **Test thoroughly before removing old code**
4. **Have feature flags for switching between implementations**

```tsx
// Gradual migration approach
function TasksPage() {
  const useNewPattern = useFeatureFlag('new-task-pattern');
  
  if (useNewPattern) {
    return <NewTasksView />;
  }
  
  return <OldTasksView />;
}
```

---

## Summary

This architecture prioritizes:

1. **Developer Velocity**: Consistent patterns reduce development time from hours to minutes
2. **Maintainability**: Clear separation makes debugging and updates easier  
3. **Testability**: Separated concerns enable focused unit testing
4. **Consistency**: Users get predictable experiences across all features
5. **Scalability**: Patterns work for simple and complex features alike

Follow these guidelines to build features that are fast to develop, easy to maintain, and provide excellent user experiences.