# GitHub Copilot Instructions for UILib

## Project Overview

This is a React-based UI component library designed for professional and power users. The library emphasizes:
- **Low-latency, high-density interfaces** with tight spacing and minimal padding
- **Desktop-first responsive design** inspired by IDE components (e.g., Visual Studio Code)
- **Developer-friendly API** similar to regular HTML components
- **No separate CSS files required** - all styling uses Tailwind CSS v4

## Tech Stack

- **Runtime**: Bun (JavaScript runtime)
- **UI Framework**: React 19
- **Styling**: Tailwind CSS v4 (CSS-in-JS approach using CSS variables)
- **Language**: TypeScript with strict mode enabled
- **Build Tool**: Custom build script using Bun's native bundler

## Project Structure

```
src/
├── components/          # All UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── ThemeProvider.tsx
│   └── ...
├── utils/
│   └── cn.ts           # Class name utility function
├── frontend.tsx        # Main entry point
├── App.tsx             # Demo/showcase application
└── index.css           # CSS variables and base styles
```

## Development Commands

- **Install dependencies**: `bun install`
- **Start dev server**: `bun dev` (hot reload enabled)
- **Build for production**: `bun run build`
- **Run production build**: `bun start`

## Coding Conventions

### Component Structure

All components follow these patterns:

1. **Use `forwardRef` for components that wrap native HTML elements**:
   ```tsx
   export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
     ({ className, ...props }, ref) => (
       <button ref={ref} className={cn("...", className)} {...props} />
     )
   );
   Button.displayName = "Button";
   ```

2. **Export types alongside components**:
   ```tsx
   export type { ButtonProps, ButtonVariant, ButtonSize };
   ```

3. **Use the `cn()` utility for className composition**:
   ```tsx
   import { cn } from "./utils/cn";
   
   className={cn("base-classes", conditionalClasses, className)}
   ```

4. **Define variant styles as const objects**:
   ```tsx
   const variantStyles = {
     primary: "...",
     secondary: "...",
   } as const;
   type ButtonVariant = keyof typeof variantStyles;
   ```

### Styling Guidelines

1. **Use CSS custom properties** defined in `src/index.css` for theming:
   - `var(--accent)` - Primary accent color
   - `var(--control-bg)` - Control background
   - `var(--control-border)` - Control borders
   - `var(--subtle-foreground)` - Subtle text
   - And many more (see `src/index.css`)

2. **Avoid hardcoded colors** - prefer CSS variables or Tailwind's semantic colors

3. **Maintain consistent spacing** - use tight spacing for density:
   - Small components: `px-3 py-1.5`
   - Medium components: `px-4 py-2`
   - Large components: `px-5 py-2.5`

4. **Typography patterns**:
   - Use uppercase with tracking for labels: `uppercase tracking-[0.16em]`
   - Font sizes: `text-[0.72rem]` (small), `text-[0.8rem]` (medium), `text-[0.88rem]` (large)
   - Monospace font is set globally via CSS variable `--font-mono`

5. **Use `rounded-none`** for buttons and inputs (rectangular design aesthetic)

6. **Include focus states** for accessibility:
   ```tsx
   focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2
   ```

### TypeScript Guidelines

1. **Enable strict type checking** - project uses strict mode
2. **Define proper prop types** with `type` (not `interface`)
3. **Use `PropsWithChildren` for components with children**:
   ```tsx
   type MyProps = PropsWithChildren<{ title: string }>;
   ```
4. **Extend native HTML element props**:
   ```tsx
   type ButtonProps = { variant?: ButtonVariant } & ButtonHTMLAttributes<HTMLButtonElement>;
   ```

### State Management

1. **Use React hooks** (`useState`, `useEffect`, `useMemo`, etc.)
2. **Context API** for global state (see `ThemeProvider.tsx`)
3. **Memoize expensive computations** with `useMemo`
4. **Provide fallback values** when context might be undefined

### Accessibility

1. **Include ARIA attributes** where appropriate (`aria-hidden`, `aria-label`, etc.)
2. **Support keyboard navigation** (focus states, keyboard handlers)
3. **Use semantic HTML elements** when possible
4. **Provide proper `displayName`** for all forwardRef components

## Common Patterns

### Creating a New Component

1. Create file in `src/components/ComponentName.tsx`
2. Follow the Button.tsx pattern for structure
3. Export the component and its types
4. Add export to `src/components/index.ts`
5. Use the component in `src/App.tsx` to showcase it

### Theme Integration

The project uses a sophisticated theming system:
- Light and dark modes supported
- Dynamic accent colors with auto-generated hover/active states
- Contrast-safe text colors calculated automatically
- See `ThemeProvider.tsx` for implementation details

### Utility Functions

- **`cn(...classes)`**: Merges class names, filtering out falsy values
  ```tsx
  cn("base", isActive && "active", className)
  ```

## Testing & Validation

While there are no formal tests in this repository, validate changes by:
1. Running `bun dev` and checking the demo app
2. Testing both light and dark themes
3. Verifying responsive behavior
4. Checking keyboard navigation and focus states
5. Running `bun run build` to ensure production build works

## Important Notes

- **Do not add separate CSS files** - all styling should use Tailwind classes or CSS variables
- **Keep component API simple** - similar to native HTML elements
- **Maintain the retro/IDE aesthetic** - sharp corners, tight spacing, monospace fonts
- **Components should be extendable** - always accept `className` prop for customization
- **No runtime CSS-in-JS libraries** - use Tailwind and CSS variables only

## Contributing Guidelines

When adding new components or features:
1. Follow the existing patterns shown in Button, Card, and other components
2. Ensure dark mode works correctly
3. Add proper TypeScript types
4. Keep bundle size small - avoid heavy dependencies
5. Update TODO.md if completing tasks from the list
6. Showcase new components in App.tsx

## Design Philosophy

This UI library targets:
- Professional software tools and dashboards
- Power users who prefer keyboard-driven workflows
- Applications requiring high information density
- Developers who want IDE-like interfaces

Components should feel efficient, predictable, and optimized for daily use by expert users.
