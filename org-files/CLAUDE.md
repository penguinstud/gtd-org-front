# Org Files Directory

## Overview
The org-files directory contains all user data in org-mode format. This is where tasks, projects, and other productivity data are stored. The directory structure enforces context separation between work and personal (home) tasks, ensuring data isolation and privacy.

## Directory Structure
```
org-files/
├── work/               → Work-related org files
│   └── inbox.org       → Work task inbox
└── home/               → Personal/home org files
    ├── inbox.org       → Personal task inbox
    └── test-scheduled.org → Example scheduled tasks
```

## Org-Mode File Format

### Standard Task Structure
```org
* TODO Task Title
  SCHEDULED: <2025-01-15 Wed>
  DEADLINE: <2025-01-20 Mon>
  :PROPERTIES:
  :ID: unique-task-id
  :CREATED: [2025-01-10 10:30]
  :CONTEXT: work
  :END:
  
  Task description and notes go here.
  
** TODO Subtask 1
** DONE Subtask 2
   CLOSED: [2025-01-12 15:45]
```

### Supported Keywords
- **TODO States**: TODO, NEXT, WAITING, SOMEDAY
- **Done States**: DONE, CANCELED
- **Priorities**: [#A] (high), [#B] (medium), [#C] (low)

### Special Properties
```org
:PROPERTIES:
:ID: unique-identifier
:CREATED: [timestamp]
:CONTEXT: work|home
:PROJECT: project-name
:TAGS: tag1 tag2 tag3
:EFFORT: 2h
:END:
```

## File Types

### Inbox Files (`inbox.org`)
- **Purpose**: Capture point for new tasks
- **Processing**: Tasks are refiled to appropriate project files
- **Structure**: Flat list of tasks without hierarchy
```org
* TODO Review pull request
* TODO Schedule dentist appointment
* TODO Prepare quarterly report
```

### Project Files
- **Purpose**: Organized tasks by project
- **Structure**: Hierarchical with project as top level
- **Naming**: `project-name.org`
```org
* Project Alpha
** TODO Design phase
*** TODO Create wireframes
*** TODO Review with stakeholders
** TODO Implementation
*** TODO Backend API
*** TODO Frontend UI
```

### Scheduled Files
- **Purpose**: Time-based task organization
- **Features**: SCHEDULED and DEADLINE dates
- **Usage**: Daily planning views
```org
* TODO Morning standup
  SCHEDULED: <2025-01-15 Wed 09:00>
  
* TODO Submit report
  DEADLINE: <2025-01-15 Wed 17:00>
```

## Context Separation

### Work Context (`/work/`)
- Professional tasks and projects
- Meeting notes and agendas
- Work-related deadlines
- Team collaboration items

### Home Context (`/home/`)
- Personal tasks and goals
- Family and household items
- Personal projects
- Health and wellness tasks

## Data Security

### Access Control
- Files are only accessible through validated API endpoints
- Path traversal protection prevents unauthorized access
- Context isolation enforced at multiple levels

### File Permissions
```bash
# Container file permissions
drwxr-xr-x  org-files/
drwxr-xr-x  org-files/work/
-rw-r--r--  org-files/work/inbox.org
drwxr-xr-x  org-files/home/
-rw-r--r--  org-files/home/inbox.org
```

## Best Practices

### Task Organization
1. **Capture First**: Add all tasks to inbox
2. **Process Regularly**: Refile from inbox daily
3. **One Task Per Entry**: Keep tasks atomic
4. **Use Properties**: Add metadata for better filtering
5. **Archive Completed**: Move done tasks to archive

### File Naming
```
project-name.org        # Projects
2025-01-meeting.org    # Meeting notes
archive-2025.org       # Yearly archives
```

### Task Templates
```org
* TODO Task Template
  :PROPERTIES:
  :CREATED: [2025-01-15]
  :CONTEXT: work
  :END:
  
  - [ ] Checklist item 1
  - [ ] Checklist item 2
  
  Notes:
  - Important point 1
  - Important point 2
```

## Integration with Application

### File Watching
The application monitors org files for changes:
- Real-time updates when files change
- Automatic re-parsing of modified files
- Store synchronization with file system

### Parsing Process
1. File change detected by watcher
2. Content read through secure API
3. Org parser extracts tasks and metadata
4. Store updated with new data
5. UI reflects changes immediately

## Common Patterns

### GTD Workflow
```org
* Inbox
** TODO Process email
** TODO Call client

* Projects
** Project A
*** NEXT Define requirements
*** TODO Implementation

* Someday/Maybe
** SOMEDAY Learn new language
** SOMEDAY Travel to Japan
```

### Time Blocking
```org
* 2025-01-15 Wednesday
** 09:00-10:00 Team meeting
** 10:00-12:00 Deep work - Project A
** 14:00-15:00 Code review
```

### Task Dependencies
```org
* TODO Parent task
** TODO Step 1 (must complete first)
** WAITING Step 2 (blocked by Step 1)
** TODO Step 3 (can do in parallel)
```

## Troubleshooting

### Common Issues
1. **Tasks not appearing**: Check file permissions and format
2. **Context mismatch**: Ensure CONTEXT property matches directory
3. **Parse errors**: Validate org-mode syntax
4. **Sync delays**: Check file watcher status

### Validation Checklist
- [ ] Valid org-mode syntax
- [ ] Correct file location (work/home)
- [ ] Proper file permissions
- [ ] No special characters in filenames
- [ ] Tasks have required properties

## Future Enhancements
- Org-mode templates for common tasks
- Automatic archiving of old tasks
- Tag-based file organization
- Project file generation
- Backup and restore functionality

## Related Modules
- **API**: [`src/pages/api/files/`](../src/pages/api/CLAUDE.md) - File operations
- **Parser**: [`src/lib/utils/orgParser.ts`](../src/lib/utils/CLAUDE.md) - Parsing logic
- **Security**: [`src/lib/security/`](../src/lib/security/CLAUDE.md) - Access control
- **Stores**: [`src/lib/stores/`](../src/lib/stores/CLAUDE.md) - Data management