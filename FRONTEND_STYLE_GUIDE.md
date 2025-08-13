# Veakaba Pro Frontend Style & Theme Guide

This document defines the **visual style**, **UI component rules**, and **code practices** for the frontend portion of Veakaba Pro.  
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

### **Folder Structure**
```plaintext
src/
  components/
    ui/        # Shared UI elements
      Button.tsx
      Card.tsx
      Badge.tsx
      PremiumTopNav.tsx
      ChartCard.tsx
      Table.tsx
    layout/    # Page wrappers
      PageLayout.tsx
  pages/
    dashboard/
    daily/
    projects/
    tasks/
    inbox/
    settings/
