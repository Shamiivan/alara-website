# Frontend Architecture Guidelines

## Table of Contents
- [Core Principles](#core-principles)
- [Component Responsibility Boundaries](#component-responsibility-boundaries)
- [Data Hook Rules](#data-hook-rules)
- [Component Guidelines](#component-guidelines)
- [File Organization](#file-organization)
- [Action Handling Patterns](#action-handling-patterns)
- [Error Handling](#error-handling)
- [Common Anti-Patterns](#common-anti-patterns)

## Core Principles

### 1. Clear Separation of Concerns
**Each component type has ONE responsibility:**
- **Pages**: Data coordination only
- **Data Hooks**: Business data + actions only  
- **View Components**: UI state + layout + presentation only
- **Primitives**: Reusable layout + feedback components

### 2. Consistent Patterns Over Custom Solutions
Follow established patterns rather than inventing new approaches for each feature.

### 3. Velocity Through Constraints
Architectural boundaries enable faster development by reducing decisions and preventing common mistakes.

---

## Component Responsibility Boundaries

### Pages: Data Coordinators
**✅ DO - Pages coordinate data, nothing else**
```tsx
export default function TasksPage() {
  const tasksData = useTasksData();  // Get business data
  
  return (
    <Page title="Tasks" subtitle="Manage your tasks">
      <TasksView {...tasksData} />  {/* Pass to view */}
    </Page>
  );
}
```

**❌ DON'T - UI state or effects in pages**
```tsx
export default function TasksPage() {
  const [mounted, setMounted] = useState(false);  // ❌ UI state
  const [isMobile, setIsMobile] = useState(false); // ❌ UI state
  
  useEffect(() => {  // ❌ UI effects
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
  }, []);
  
  const tasksData = useTasksData();
  
  return (
    <Page title="Tasks">
      <TasksView mounted={mounted} isMobile={isMobile} {...tasksData} />
    </Page>
  );
}
```

### View Components: UI Managers
**✅ DO - Handle UI state, layout, and presentation**
```tsx
interface TasksViewProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onCreate: (data: CreateTaskData) => Promise<boolean>;
}

export function TasksView({ tasks, isLoading, error, onCreate }: TasksViewProps) {
  // ✅ UI state management
  const [mounted, setMounted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // ✅ UI effects
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // ✅ UI presentation logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  
  // ✅ UI data filtering
  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(t => !t.completed);
  
  if (!mounted || isLoading) return <LoadingState />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className={cn("space-y-6", isMobile && "mobile-layout")}>
      <h1>{getGreeting()}</h1>
      <CreateTaskForm onSubmit={onCreate} />
      <TaskList tasks={filteredTasks} />
    </div>
  );
}
```

**❌ DON'T - Business data fetching in views**
```tsx
export function TasksView() {
  // ❌ Business data fetching in view
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  // ❌ Business action handling in view
  const handleCreate = async (data) => {
    try {
      await createTask(data);
      toast.success("Created");
    } catch (error) {
      toast.error("Failed");
    }
  };
  
  return <div>...</div>;
}
```

---

## Data Hook Rules

### What Belongs in Data Hooks
**✅ ONLY business concerns:**
```tsx
export function useTasksData() {
  // ✅ Backend queries/mutations
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  // ✅ Action loading states
  const [isCreating, setIsCreating] = useState(false);
  
  // ✅ Business logic derivations
  const todayTasks = useMemo(() => 
    tasks?.filter(t => isToday(t.dueDate)) || [], 
    [tasks]
  );
  
  // ✅ Business action handlers
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
  
  // ✅ Standardized return interface
  return {
    tasks: tasks || [],
    todayTasks,
    isLoading: tasks === undefined,
    isCreating,
    error: null,
    actions: { handleCreate }
  };
}
```

### What NEVER Belongs in Data Hooks
**❌ UI concerns:**
```tsx
export function useDashboardData() {
  const stats = useQuery(api.dashboard.getStats);
  
  // ❌ UI state
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // ❌ UI effects
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // ❌ UI presentation logic
  const greeting = mounted ? "Good morning" : "Loading...";
  
  // ❌ Static UI data
  const features = [
    { icon: "Check", text: "Some feature" }
  ];
  
  return { stats, mounted, isMobile, greeting, features };
}
```

---

## Component Guidelines

### Static Data Location
**✅ DO - Static data as constants in components**
```tsx
const FEATURES = [
  { iconName: "Check", text: "Toggle the sidebar", color: "#10b981" },
  { iconName: "Zap", text: "Navigate easily", color: "#3b82f6" }
] as const;

export function FeaturesList() {
  return (
    <div>
      {FEATURES.map(feature => (
        <FeatureItem key={feature.text} {...feature} />
      ))}
    </div>
  );
}
```

**❌ DON'T - Static data in hooks**
```tsx
export function useDashboardData() {
  // ❌ Static data doesn't belong in hooks
  const features = [
    { iconName: "Check", text: "Toggle the sidebar" }
  ];
  
  return { features };
}
```

### Component Interfaces
**✅ DO - Clear, business-focused prop interfaces**
```tsx
interface TasksViewProps {
  // Business data
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Business actions
  onCreate: (data: CreateTaskData) => Promise<boolean>;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}
```

**❌ DON'T - Mixed UI/business props**
```tsx
interface DashboardViewProps {
  // ❌ Mixed concerns
  mounted: boolean;     // UI state
  greeting: string;     // UI presentation
  isMobile: boolean;    // UI state
  features: Feature[];  // Static data
  stats: UserStats;     // Business data
}
```

---

## File Organization

### Directory Structure
```
src/
├── hooks/
│   └── use[Domain]Data.ts     # Business data hooks only
├── components/
│   ├── primitives/
│   │   ├── layouts/           # Page, Card, Section, AppShell
│   │   └── feedback/          # LoadingState, ErrorDisplay
│   ├── [domain]/
│   │   ├── [Feature]View.tsx  # UI state + layout
│   │   ├── [Feature]List.tsx  # Pure UI components
│   │   └── [Feature]Form.tsx  # Form components
│   └── ui/                    # Third-party UI (shadcn/ui)
└── app/
    ├── (public)/              # Landing pages
    └── app/                   # Authenticated app
```

### Naming Conventions
**✅ DO:**
```
useTasksData.ts           # Business data hooks
TasksView.tsx            # UI management components
CreateTaskForm.tsx       # Specific UI components
TasksList.tsx            # Pure UI lists
```

**❌ DON'T:**
```
useDashboardUI.ts        # UI concerns in hooks
dashboard-component.tsx  # kebab-case for components
TasksContainer.tsx       # Generic naming
```

---

## Action Handling Patterns

### Action Flow
```
Page (coordinates) 
  ↓ passes business actions
View (UI management)
  ↓ passes actions to children  
Components (call actions)
```

**✅ DO - Actions flow down as props**
```tsx
// Page
function TasksPage() {
  const { tasks, actions } = useTasksData();
  return <TasksView tasks={tasks} {...actions} />;
}

// View
function TasksView({ tasks, onCreate, onUpdate }) {
  return (
    <div>
      <CreateTaskForm onSubmit={onCreate} />
      <TaskList tasks={tasks} onUpdate={onUpdate} />
    </div>
  );
}

// Component
function TaskItem({ task, onUpdate }) {
  const handleToggle = () => onUpdate(task._id, { completed: !task.completed });
  return <button onClick={handleToggle}>Toggle</button>;
}
```

### Action Return Values
**✅ DO - Actions return success/failure**
```tsx
const handleCreate = async (data) => {
  const success = await onCreate(data);
  if (success) {
    resetForm();  // Only handle UI concerns on success
  }
  // Error handling already done in hook
};
```

**❌ DON'T - Actions throw errors**
```tsx
const handleCreate = async (data) => {
  try {
    await onCreate(data);  // ❌ Forces try/catch everywhere
    resetForm();
  } catch (error) {
    toast.error(error.message);  // ❌ Inconsistent error handling
  }
};
```

---

## Error Handling

### Standard Error Components
**✅ DO - Use primitives consistently**
```tsx
import { ErrorDisplay, LoadingState } from "@/components/primitives/feedback";

function TasksView({ tasks, isLoading, error }) {
  if (isLoading) return <LoadingState variant="skeleton" />;
  if (error) return <ErrorDisplay error={error} retry={refetch} />;
  
  return <div>...</div>;
}
```

### Backend Error Pattern
**✅ DO - Result pattern in actions**
```tsx
export const createTask = action({
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

---

## Common Anti-Patterns

### 1. Mixed UI/Business in Data Hooks
**❌ PROBLEM:**
```tsx
function useDashboardData() {
  const stats = useQuery(api.dashboard.getStats);
  const [mounted, setMounted] = useState(false);  // ❌ UI state
  const [isMobile, setIsMobile] = useState(false); // ❌ UI state
  
  useEffect(() => {  // ❌ UI effects
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  const greeting = "Good morning";  // ❌ UI presentation
  
  return { stats, mounted, isMobile, greeting };
}
```

**✅ SOLUTION:**
```tsx
// Business hook
function useDashboardData() {
  const stats = useQuery(api.dashboard.getStats);
  return {
    stats: stats || null,
    isLoading: stats === undefined,
    error: null
  };
}

// UI in view component
function DashboardView({ stats, isLoading, error }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const greeting = getTimeBasedGreeting();
  
  if (!mounted || isLoading) return <LoadingState />;
  
  return <div>{greeting}</div>;
}
```

### 2. UI State in Pages
**❌ PROBLEM:**
```tsx
function DashboardPage() {
  const [mounted, setMounted] = useState(false);  // ❌ UI state in page
  const dashboardData = useDashboardData();
  
  return (
    <Page>
      <DashboardView mounted={mounted} {...dashboardData} />
    </Page>
  );
}
```

**✅ SOLUTION:**
```tsx
function DashboardPage() {
  const dashboardData = useDashboardData();  // Only business coordination
  
  return (
    <Page title="Dashboard">
      <DashboardView {...dashboardData} />  {/* UI state handled in view */}
    </Page>
  );
}
```

### 3. Business Data Fetching in Views
**❌ PROBLEM:**
```tsx
function TasksView() {
  const tasks = useQuery(api.tasks.list);  // ❌ Business data in view
  const [showCompleted, setShowCompleted] = useState(false);
  
  return <div>...</div>;
}
```

**✅ SOLUTION:**
```tsx
function TasksView({ tasks, isLoading, error }) {  // ✅ Receive business data
  const [showCompleted, setShowCompleted] = useState(false);  // ✅ UI state only
  
  return <div>...</div>;
}
```

---

## Summary

### Key Architectural Rules
1. **Data Hooks**: Business data + actions ONLY
2. **View Components**: UI state + layout + presentation ONLY  
3. **Pages**: Data coordination ONLY
4. **Static Data**: Component constants, not in hooks
5. **Actions**: Return boolean success/failure, never throw

### Benefits
- **Testability**: Separate concerns enable focused testing
- **Reusability**: Business hooks work with different UIs
- **Consistency**: Predictable patterns across features
- **Velocity**: Clear boundaries reduce development time
- **Maintainability**: Easy to debug and modify

Follow these guidelines to build features consistently and quickly while maintaining code quality.