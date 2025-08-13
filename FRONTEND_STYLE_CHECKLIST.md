
---

## **FRONTEND_STYLE_CHECKLIST.md**
```markdown
# Veakaba Pro Frontend Style Checklist

Use this checklist to verify that the frontend follows the **Veakaba Pro** style guide and remains visually consistent, maintainable, and easy to extend.

---

## 1. Visual Theme
- [ ] **Primary color** is `#0073ea` and applied consistently.
- [ ] **Header background** is `#323338`.
- [ ] **Workspace background** is `#f6f7fb`.
- [ ] **Status colors** are used correctly:  
  - Green = Success  
  - Yellow = In Progress  
  - Red = Blocked  
  - Purple = Planning
- [ ] Typography matches spec (system fonts, 14px base size, clean hierarchy).
- [ ] Card style is consistent (white, rounded, shadow, hover elevation).
- [ ] Badge style is consistent (pill shape, correct colors, readable text).
- [ ] Navigation matches **PremiumTopNav** design.

---

## 2. Component Architecture
- [ ] All **shared UI components** are inside `src/components/ui/`.
- [ ] Components are **reusable** (no page-specific logic baked in).
- [ ] Props are clearly named and typed (TypeScript preferred).
- [ ] No duplication of styles across components.
- [ ] Layout components (e.g., `PageLayout`) are used for all pages.

---

## 3. CSS & Styling Strategy
- [ ] Tailwind CSS utilities are used consistently.
- [ ] No unnecessary inline styles.
- [ ] Hover, focus, and active states are clearly defined for all interactive elements.
- [ ] Consistent spacing scale (`space-x-4`, `space-y-6`, `p-4`, `p-6`).
- [ ] Custom CSS (if used) is scoped to components.

---

## 4. Layout Rules
- [ ] All pages use `PageLayout` with:
  - Navigation at top
  - Content width max: `max-w-7xl mx-auto p-6`
- [ ] Responsive grid layouts are used where needed.
- [ ] Charts and KPI sections are always in card containers.

---

## 5. Responsiveness & Accessibility
- [ ] Fully functional from desktop down to mobile view.
- [ ] Navigation collapses gracefully on smaller screens.
- [ ] Buttons and touch targets are at least 44px tall.
- [ ] Color contrast meets WCAG AA standards.
- [ ] All interactive elements are keyboard-navigable.

---

## 6. Maintainability & Scalability
- [ ] Repeated patterns are extracted into shared components.
- [ ] Code is modular with minimal dependencies between unrelated files.
- [ ] Adding a new feature does not require editing multiple unrelated components.
- [ ] Components and pages are typed with TypeScript.

---

## 7. Page-Specific Checks

### Dashboard
- [ ] KPI cards appear at the top.
- [ ] Charts are inside `ChartCard` components.
- [ ] Active tasks are displayed in a consistent card format.

### Daily View
- [ ] Time slots run from 9 AM to 9 PM.
- [ ] Meetings and tasks are grouped by time slot.
- [ ] Styling matches Dashboard cards.

### Projects
- [ ] Tasks are grouped by project.
- [ ] Overdue tasks appear at the top and are red-highlighted.
- [ ] Filter bar allows time range selection (day, month, year).

### Inbox
- [ ] Tasks come from `inbox.org`.
- [ ] Each task includes:
  - Project dropdown
  - Org file dropdown
  - Due date picker
  - Apply Changes button
  - Mark Done / Archive buttons
- [ ] Apply Changes updates only that specific task.

---

✅ **If all boxes are checked, the frontend meets the Veakaba Pro style and quality requirements.**
