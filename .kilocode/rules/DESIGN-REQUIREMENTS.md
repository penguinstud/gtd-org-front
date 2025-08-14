# Design Requirements - GTD Org Front

## Overview
This document outlines the design requirements for creating a Monday.com-inspired GTD front-end application. The goal is to combine Monday.com's intuitive visual design with powerful GTD workflow capabilities.

## Monday.com Design Analysis

### Key Visual Elements
- **Bright, Bold Color Scheme**: High contrast colors for different statuses and categories
- **Card-Based Layout**: Everything is organized in visual cards and boards
- **Clean Typography**: Sans-serif fonts with clear hierarchy
- **Generous Whitespace**: Plenty of breathing room between elements
- **Subtle Animations**: Smooth transitions and hover effects
- **Glass Morphism**: Subtle transparency and blur effects

### Core UI Patterns
- **Board View**: Primary interface metaphor - everything as boards
- **Column Structure**: Vertical columns for different statuses/categories
- **Drag & Drop**: Intuitive task movement between columns
- **Color Coding**: Status and priority indication through colors
- **Quick Actions**: Contextual buttons and shortcuts
- **Modal Overlays**: Detail views without navigation

## Design System Specification

### Color Palette

#### Primary Colors
```css
--primary-blue: #0073EA;          /* Main brand, primary actions */
--primary-blue-light: #4A9EFF;    /* Hover states, secondary elements */
--primary-blue-dark: #0056B3;     /* Active states, emphasis */
```

#### Status Colors
```css
--status-todo: #C4C4C4;           /* Light gray - not started */
--status-next: #FF9500;           /* Orange - ready to work on */
--status-waiting: #F0D000;        /* Yellow - blocked/waiting */
--status-done: #00CA72;           /* Green - completed */
--status-someday: #9D9D9D;        /* Medium gray - someday/maybe */
--status-canceled: #E2445C;       /* Red - canceled */
```

#### Priority Colors
```css
--priority-a: #E2445C;            /* High priority - red */
--priority-b: #FF9500;            /* Medium priority - orange */
--priority-c: #0073EA;            /* Low priority - blue */
--priority-none: #676879;         /* No priority - neutral gray */
```

#### Context Colors
```css
--context-work: #0073EA;          /* Work context - blue */
--context-home: #9D4EDD;          /* Home context - purple */
```

#### Background Colors
```css
--bg-primary: #FFFFFF;            /* Main background */
--bg-secondary: #F8F9FB;          /* Secondary background */
--bg-tertiary: #F1F3F5;           /* Tertiary background */
--bg-card: #FFFFFF;               /* Card background */
--bg-hover: #F8F9FB;              /* Hover background */
```

### Typography Scale

#### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px - Captions, labels */
--text-sm: 0.875rem;   /* 14px - Small text, metadata */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Emphasized text */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Medium headings */
--text-3xl: 1.875rem;  /* 30px - Large headings */
--text-4xl: 2.25rem;   /* 36px - Display headings */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Standard elements */
--radius-lg: 0.75rem;   /* 12px - Cards, panels */
--radius-xl: 1rem;      /* 16px - Large panels */
--radius-full: 9999px;  /* Pill shape */
```

### Shadow System
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

## Component Specifications

### Navigation Header
- **Height**: 64px
- **Background**: White with subtle bottom border
- **Logo**: Left-aligned, blue accent
- **Context Switcher**: Center-left, pill-shaped toggle (Work/Home)
- **User Menu**: Right-aligned with avatar
- **Search**: Center-right, expandable search bar

### Sidebar Navigation
- **Width**: 240px (collapsible to 60px)
- **Background**: Light gray (#F8F9FB)
- **Menu Items**: Icon + text, hover states
- **Active State**: Blue accent bar on left
- **Sections**: Dashboards, Boards, Inbox, Reviews, Archive

### Board View (Primary Interface)

#### Board Header
- **Background**: White with bottom border
- **Title**: Large, bold heading
- **Actions**: Right-aligned button group
- **Filters**: Toggle-able filter chips
- **View Switcher**: Board/Timeline/Calendar toggle

#### Column Structure
- **Width**: 280px per column
- **Background**: Light background with rounded corners
- **Header**: Status name + count + add button
- **Scrollable**: Vertical scroll for overflow
- **Drop Zones**: Visual feedback during drag operations

#### Task Cards
- **Dimensions**: Full width, auto height
- **Background**: White with subtle border
- **Border Radius**: 8px
- **Shadow**: Subtle on hover
- **Priority Indicator**: Left colored border (3px)
- **Status Badge**: Top-right corner
- **Metadata**: Bottom area with tags, dates, effort

### Task Card Detailed Layout
```
┌─────────────────────────────────────┐
│ ● Priority  [Status Badge]     │
│                                     │
│ Task Title (Bold, 16px)             │
│ Brief description text...           │
│                                     │
│ 📅 Jan 15  ⏱️ 2h  🏷️ tag1 tag2    │
│                            👤 User  │
└─────────────────────────────────────┘
```

### Modal Design
- **Background**: Semi-transparent overlay (#000 20% opacity)
- **Container**: Center-aligned, white background
- **Width**: 600px max, responsive
- **Border Radius**: 12px
- **Close**: Top-right X button
- **Actions**: Bottom-right button group

### Form Elements

#### Input Fields
- **Height**: 40px
- **Border**: 1px solid light gray, blue on focus
- **Border Radius**: 6px
- **Padding**: 12px
- **Font Size**: 14px

#### Buttons
- **Primary**: Blue background, white text, 40px height
- **Secondary**: White background, blue border and text
- **Danger**: Red background, white text
- **Border Radius**: 6px
- **Padding**: 12px 24px

#### Select Dropdowns
- **Appearance**: Custom styled to match design
- **Options**: Hover states with light background
- **Multi-select**: Chip-style selected items

## Interaction Patterns

### Drag and Drop
- **Visual Feedback**: Card elevation and slight rotation during drag
- **Drop Zones**: Highlighted columns with dashed border
- **Animation**: Smooth movement with easing
- **Snap**: Cards snap to grid positions

### Hover States
- **Cards**: Subtle shadow increase
- **Buttons**: Slight color darkening
- **Icons**: Color transition
- **Links**: Underline appearance

### Loading States
- **Skeleton Loading**: Gray rectangles matching content layout
- **Spinners**: For quick actions
- **Progress Bars**: For longer operations
- **Optimistic Updates**: Immediate feedback, rollback on error

### Animations
- **Duration**: 200-300ms for micro-interactions
- **Easing**: Ease-out for natural feeling
- **Page Transitions**: Slide animations between views
- **Modal**: Fade in overlay, scale up modal

## Responsive Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
```

## Accessibility Requirements

### Color Contrast
- **Text**: Minimum 4.5:1 ratio against background
- **Interactive Elements**: Minimum 3:1 ratio
- **Status Colors**: Include text labels, not color-only indication

### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Focus Indicators**: Visible focus outlines
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+N, etc.)
- **Screen Reader**: Proper ARIA labels and roles

### Motion
- **Reduced Motion**: Respect user preference
- **Essential Animations**: Keep critical feedback
- **Optional Animations**: Disable decorative motion

## Implementation Notes

### CSS Architecture
- **Utility-First**: Tailwind CSS for rapid development
- **Component Classes**: Custom classes for complex components
- **CSS Variables**: For theme customization
- **PostCSS**: For vendor prefixes and optimization

### Performance Considerations
- **Lazy Loading**: Off-screen cards and components
- **Virtual Scrolling**: For large lists
- **Image Optimization**: Responsive images with proper formats
- **Bundle Splitting**: Route-based code splitting

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Progressive Enhancement**: Core functionality without JavaScript
- **Polyfills**: For essential features only

This design system provides a solid foundation for creating a Monday.com-inspired GTD application while maintaining accessibility and performance standards.