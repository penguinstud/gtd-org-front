# GTD Org Front Frontend Style & Theme Guide

This document defines the **visual style**, **UI component rules**, and **code practices** for the frontend portion of GTD Org Front.  
All pages and components must follow these guidelines to ensure a **consistent premium look** and **maintainable codebase**.

---

## 1. Visual Theme

### **Color Palette**
| Purpose             | Color       | Hex       |
|---------------------|-------------|-----------|
| Primary             | Blue        | `#0073ea` |
| Header Background   | Dark Gray   | `#323338` |
| Workspace BG        | Light Gray  | `#f6f7fb` |
| Success (Green)     | Green       | `#00c853` |
| In Progress (Yellow)| Yellow      | `#ffeb3b` |
| Blocked (Red)       | Red         | `#e53935` |
| Planning (Purple)   | Purple      | `#8e24aa` |

---

### **Typography**
- **Font:** System fonts (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, sans-serif)
- **Base size:** 14px
- **Headings:** Clear hierarchy (`text-xl`, `text-2xl` for page titles)
- **Weights:** Use `font-semibold` or `font-bold` for emphasis

---

### **Card Design**
- White background
- Rounded corners (`rounded-lg`)
- Drop shadow (`shadow` or `shadow-lg`)
- Hover elevation (`hover:shadow-xl`)
- Internal padding (`p-4` or `p-6`)

---

### **Badges**
- Pill-shaped (`rounded-full`)
- Background matches status color
- Text color is a readable contrasting tone
- Consistent height and padding (`px-3 py-1 text-xs`)

---

### **Navigation**
- **PremiumTopNav** style:
  - Dark background (`#323338`)
  - Glassmorphic feel with transparency if possible
  - Dropdown menus for main sections (e.g., Dashboard → Main, Projects)
  - Active tab highlighted in primary blue
  - Responsive collapse for mobile

---

## 2. Component Architecture

### **Folder Structure (Atomic Design Pattern)**

**Note:** We've adopted the Atomic Design methodology for better scalability and maintainability. This approach provides clearer component hierarchy and better reusability than the original flat structure.

```plaintext
src/
  components/
    atoms/        # Basic building blocks (Button, Badge, Input)
      Badge.tsx
      Button.tsx
      index.ts
    molecules/    # Simple component groups (Card, KpiCard)
      Card.tsx
      KpiCard.tsx
      index.ts
    organisms/    # Complex components (Navigation, Dashboard)
      Dashboard.tsx
      EnhancedNavigation.tsx
      PremiumTopNav.tsx
      index.ts
    templates/    # Page layouts (PageLayout, SidebarLayout)
      PageLayout.tsx
      index.ts
  pages/        # Next.js route pages
    dashboard/
    daily/
    projects/
    tasks/
    inbox/
    settings/
