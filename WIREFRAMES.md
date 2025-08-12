# Wireframes & Mockups - GTD Org Front

## Overview

This document contains ASCII wireframes and design mockups for the GTD Org Front application, showing the Monday.com-inspired interface for GTD workflows.

## Main Application Layout

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────┐ GTD Org Front    🔄 Work|Home    🔍 Search...           👤 User ▼    │ 64px
├─┴─────┴─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ │                                                                  │
│ │📊 Dash  │ │  Board: My Current Projects                     📋 ⌚ 📅 🗂️      │
│ │📋 Boards│ │  ┌─────────────┬─────────────┬─────────────┬─────────────┐      │
│ │📥 Inbox │ │  │ TODO (12)   │ NEXT (8)    │ WAITING (3) │ DONE (24)   │      │
│ │🔄 Review│ │  │    [+]      │    [+]      │    [+]      │    [+]      │      │
│ │📂 Archive│ │  ├─────────────┼─────────────┼─────────────┼─────────────┤      │
│ │          │ │  │┌───────────┐│┌───────────┐│┌───────────┐│┌───────────┐│      │
│ │🏠 Home:  │ │  ││●Website   ││││●Email     ││││●Meeting   ││││✓Budget    ││      │
│ │📊 Dash   │ │  ││ Redesign  ││││ Client    ││││ with Boss ││││ Planning  ││      │
│ │💰 Budget │ │  ││📅 Jan 15  ││││📅 Today   ││││⏰ 2pm     ││││✅ Done    ││      │
│ │📔 Journal│ │  ││⏱️ 8h │ A  ││││⏱️ 1h │ B ││││👤 John    ││││🏷️ finance ││      │
│ │💪 Health │ │  │└───────────┘││└───────────┘││└───────────┘││└───────────┘│      │
│ │📚 Learn  │ │  │┌───────────┐││┌───────────┐││┌───────────┐││┌───────────┐│      │
│ │          │ │  ││●API Tests ││││●Review    ││││●Call      ││││✓Groceries ││      │
│ │          │ │  ││ Setup     ││││ Documents ││││ Vendor    ││││ Shopping  ││      │
│ │          │ │  ││🏷️ dev     ││││🏷️ admin   ││││🏷️ urgent  ││││✅ Done    ││      │
│ │          │ │  │└───────────┘││└───────────┘││└───────────┘││└───────────┘│      │
│ └─────────┘ │  └─────────────┴─────────────┴─────────────┴─────────────┘      │
│   240px     │                                                                  │
└─────────────┴──────────────────────────────────────────────────────────────────┘
```

### Task Card Detailed View
```
┌─────────────────────────────────────────────────────────┐
│ ● Website Redesign Project                    [Priority] │ ← Colored left border (red/orange/blue)
│   Update company website with new branding              │
│                                                         │
│ 📋 Project: Marketing Q1          🏷️ design web urgent │
│ 📅 Due: Jan 15, 2024             ⏱️ Estimated: 8 hours │
│ 👤 Assigned: John Doe            📍 Context: Work       │
│                                                         │
│ ┌─ Subtasks ────────────────────────────────────────────┐│
│ │ ✓ Gather requirements          📅 Completed Jan 10   ││
│ │ ○ Create wireframes           📅 Due Jan 12          ││  
│ │ ○ Design mockups              📅 Due Jan 14          ││
│ │ ○ Implement frontend          📅 Due Jan 15          ││
│ └───────────────────────────────────────────────────────┘│
│                                                         │
│ 💬 Comments (3)    📎 Files (2)    🔗 Links (1)        │
│                                         [Edit] [Delete] │
└─────────────────────────────────────────────────────────┘
```

## Context Switching Interface

### Context Toggle (Header)
```
┌─────────────────────────────────────┐
│ Current Context:                    │
│ ┌─────────┬─────────┐               │
│ │  WORK   │  HOME   │  ← Toggle     │
│ │ ●●●●●●● │ ○○○○○○○ │               │
│ └─────────┴─────────┘               │
│ 📊 12 active tasks                  │
│ 📅 3 due today                      │
└─────────────────────────────────────┘
```

## Dashboard Views

### Work Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Work Dashboard - January 12, 2024                                   🔄 Refresh │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─ Quick Stats ──────────────────────────────────────────────────────────────┐  │
│ │ 📋 Total Tasks: 24    🎯 Next Actions: 8    ⏰ Due Today: 3    ✅ Done: 67% │  │
│ └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│ ┌─ Today's Priority ─────────────┐ ┌─ This Week ─────────────────────────────┐ │
│ │ ●●● HIGH PRIORITY              │ │ ┌─ Mon ──┬─ Tue ──┬─ Wed ──┬─ Thu ──┐   │ │
│ │                                │ │ │ ●●●     │ ●●○     │ ●○○     │ ○○○     │   │ │
│ │ ○ Email client presentation    │ │ │ 3 tasks │ 2 tasks │ 1 task  │ 0 tasks │   │ │
│ │ ○ Review quarterly reports     │ │ └─────────┴─────────┴─────────┴─────────┘   │ │
│ │ ○ Team standup meeting        │ │                                           │ │
│ └────────────────────────────────┘ └───────────────────────────────────────────┘ │
│                                                                                 │
│ ┌─ Recent Activity ──────────────────────────────────────────────────────────┐  │
│ │ 🕐 10:30 AM - Completed "Budget review" in Finance                         │  │
│ │ 🕐 09:15 AM - Added "Client call prep" to Next Actions                    │  │
│ │ 🕐 08:45 AM - Moved "Website mockups" to In Progress                      │  │
│ └────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Home Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Home Dashboard - January 12, 2024                                   🔄 Refresh │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─ Quick Stats ──────────────────────────────────────────────────────────────┐  │
│ │ 📋 Tasks: 18    💰 Budget: $1,234    📔 Journal: 12 days    💪 Health: 8/10 │  │
│ └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│ ┌─ Today's Focus ────────────────┐ ┌─ Budget Summary ────────────────────────┐ │
│ │ 🏃 Exercise - Morning run      │ │ 💰 This Month: $2,456.78               │ │
│ │ 🛒 Groceries - Whole Foods     │ │ 📊 Budget: $3,000.00                   │ │  
│ │ 📚 Learn - React course ch.5   │ │ 🎯 Remaining: $543.22                  │ │
│ │ 📝 Journal - Reflection        │ │                                         │ │
│ └────────────────────────────────┘ │ Top Categories:                         │ │
│                                    │ 🍕 Dining: $456.78                     │ │
│ ┌─ Health Tracking ──────────────┐ │ 🛒 Groceries: $234.56                  │ │
│ │ 💪 Exercise: 4/7 days this week│ │ ⛽ Transport: $123.45                  │ │
│ │ 🥗 Meals logged: 3 today       │ └─────────────────────────────────────────┘ │
│ │ 😴 Sleep: 7.5h average         │                                           │ │
│ │ 📖 Learning: 2h this week      │ ┌─ Journal Mood Tracker ─────────────────┐ │
│ └────────────────────────────────┘ │ This Week: 😊😊😐😊😔😊😊             │ │
│                                    │ Average: 😊 (Good week!)              │ │
│                                    └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (< 768px)

### Mobile Navigation
```
┌─────────────────────┐
│ GTD Org             │ 
│ 🔄 Work    🔍      │
├─────────────────────┤
│                     │
│ ┌─ TODO (12) ──────┐│
│ │┌─────────────────┐││
│ ││●Website Redesign│││ ← Swipeable cards
│ ││📅 Jan 15 ⏱️ 8h  │││
│ ││🏷️ design urgent │││
│ │└─────────────────┘││
│ │┌─────────────────┐││
│ ││●API Tests Setup │││
│ ││🏷️ dev           │││
│ │└─────────────────┘││
│ └───────────────────┘│
│                     │
├─────────────────────┤
│ 📊 🏠 📥 🔄 📂     │ ← Bottom navigation
└─────────────────────┘
```

## Modals and Overlays

### Task Creation Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Create New Task                                             ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Title *                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Enter task title...                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Description                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Add description (optional)...                               │ │
│ │                                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Quick Settings ──────────────────────────────────────────────┐│
│ │ Priority:   🔴 High  🟡 Medium  🔵 Low  ⚪ None              ││
│ │ Status:     TODO ▼                                           ││  
│ │ Project:    Select project... ▼                              ││
│ │ Due Date:   📅 Select date...                                ││
│ │ Effort:     ⏱️ Estimate hours...                             ││
│ │ Tags:       🏷️ Add tags...                                   ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─ Advanced Options ────────────────────────────────────────────┐│
│ │ ○ Scheduled for specific date                                ││
│ │ ○ Add to daily review                                        ││
│ │ ○ Set as recurring task                                      ││
│ │ ○ Add dependencies                                           ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                           [Cancel]  [Create] │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Capture Modal (Cmd+K style)
```
┌─────────────────────────────────────────────────────────────────┐
│ Quick Capture                                               ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💡 What's on your mind?                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Quick Actions:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📋 Add Task       💰 Log Expense     📔 Journal Entry       │ │
│ │ 📞 Meeting Note   🏃 Health Activity  📚 Learning Goal      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Recent Captures:                                               │
│ • 🕐 10:30 - "Call dentist for appointment"                    │
│ • 🕐 09:15 - "Research vacation destinations"                  │
│ • 🕐 08:45 - "Buy birthday gift for mom"                      │
│                                                                 │
│                                    [Capture to Inbox] │
└─────────────────────────────────────────────────────────────────┘
```

## Drag and Drop Visual Feedback

### During Drag Operation
```
┌─ TODO ────────┬─ NEXT ────────┬─ WAITING ─────┬─ DONE ────────┐
│               │               │               │               │
│ ┌───────────┐ │ ┌───────────┐ │               │               │
│ │ Normal    │ │ │ Normal    │ │  ╔═══════════╗ │               │
│ │ Task      │ │ │ Task      │ │  ║ Drop Zone ║ │               │
│ └───────────┘ │ └───────────┘ │  ║  Active   ║ │               │
│               │               │  ╚═══════════╝ │               │
│  ┌─────────────┐              │               │               │
│  │ ●Dragging   │ ← Elevated   │               │               │
│  │  Task       │   with shadow│               │               │
│  │  shadow     │              │               │               │
│  └─────────────┘              │               │               │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

## Responsive Breakpoints

### Tablet Layout (768px - 1199px)
```
┌─ ☰ ────────────────────────────────────────────────────────┐
│ GTD Org Front    🔄 Work|Home    🔍 Search...    👤 User   │
├─────────────────────────────────────────────────────────────┤
│                                                            │
│ My Current Projects                     📋 ⌚ 📅          │
│ ┌────────────────┬────────────────┬────────────────────────┐│
│ │ TODO (12)      │ NEXT (8)       │ WAITING (3) + DONE    ││ ← Stacked columns
│ │ ┌────────────┐ │ ┌────────────┐ │ ┌──────────────────────┐││
│ │ │●Website    │ │ │●Email      │ │ │●Meeting  ✓Budget     │││ ← Condensed cards
│ │ │ Redesign   │ │ │ Client     │ │ │ Boss     Planning    │││
│ │ │📅Jan 15 ⏱8h│ │ │📅Today ⏱1h│ │ │⏰2pm     ✅Done      │││
│ │ └────────────┘ │ └────────────┘ │ └──────────────────────┘││
│ └────────────────┴────────────────┴────────────────────────┘│
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

## Accessibility Features

### High Contrast Mode
```
┌─────────────────────────────────────────────────────────────────┐
│ ████ High Contrast Mode Enabled ████                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ████ TODO (12) ████        ████ NEXT (8) ████                 │
│ ┌─────────────────────┐    ┌─────────────────────┐             │
│ │████ URGENT TASK ████│    │████ Email Client ████│             │
│ │                     │    │                     │             │
│ │ Due: TODAY          │    │ Priority: HIGH      │             │
│ │ [ACTION REQUIRED]   │    │ [READY TO START]    │             │
│ └─────────────────────┘    └─────────────────────┘             │
│                                                                 │
│ Focus: TAB to navigate • ENTER to select • ESC to cancel       │
└─────────────────────────────────────────────────────────────────┘
```

### Screen Reader Structure
```
Region: Main Navigation
  - Button: Dashboard (current page)
  - Button: Boards  
  - Button: Inbox (3 new items)
  - Button: Reviews

Region: Content Area
  Heading Level 1: Work Dashboard
  Heading Level 2: Quick Stats
    List: 4 items
      - Total Tasks: 24
      - Next Actions: 8  
      - Due Today: 3
      - Completion: 67%
      
  Heading Level 2: Today's Priority
    List: 3 items
      - Link: Email client presentation (urgent)
      - Link: Review quarterly reports  
      - Link: Team standup meeting
```

This wireframe document provides a comprehensive visual guide for implementing the Monday.com-inspired GTD interface with accessibility and responsive design considerations.