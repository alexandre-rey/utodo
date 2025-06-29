# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compilation first)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + TypeScript + Vite todo application with the following key architectural components:

### Core Structure
- **State Management**: Simple React state in App.tsx - no external state library
- **Data Persistence**: Browser localStorage via services/save.ts
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables

### Key Components
- `App.tsx` - Main application state and todo CRUD operations
- `AddDialog.tsx` - Modal for creating new todos
- `OpenDialog.tsx` - Modal for viewing/editing/deleting existing todos  
- `DisplayTodos.tsx` - Grid layout for todo cards
- `services/save.ts` - localStorage persistence layer
- `interfaces/todo.interface.ts` - Todo type definition

### Todo Data Model
```typescript
interface Todo {
    id: string;           // UUID generated with crypto.randomUUID()
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;       // "pending" | "inProgress" | "done"
}
```

### Component Architecture
- Components follow a dialog-based UX pattern using shadcn/ui Dialog
- State flows down from App.tsx through props
- All CRUD operations are handled in App.tsx and passed down as callbacks
- No complex state management - straightforward React patterns

### Development Notes
- Uses Vite with SWC for fast builds and hot reload
- Path alias `@/*` maps to `./src/*` 
- shadcn/ui configured with "new-york" style and Lucide icons
- TypeScript strict mode enabled
- Toast notifications via Sonner library