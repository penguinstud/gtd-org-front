import { cn, getStatusStyles, getPriorityStyles, getContextStyles } from '../cn'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'false-class', true && 'true-class')
    expect(result).toBe('base-class true-class')
  })

  it('should deduplicate Tailwind classes', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500'])
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })
})

describe('getStatusStyles', () => {
  it('should return success styles for success status', () => {
    expect(getStatusStyles('success')).toBe('bg-status-success text-white')
    expect(getStatusStyles('done')).toBe('bg-status-success text-white')
  })

  it('should return progress styles for progress status', () => {
    expect(getStatusStyles('progress')).toBe('bg-status-progress text-gray-800')
    expect(getStatusStyles('waiting')).toBe('bg-status-progress text-gray-800')
  })

  it('should return next styles for next status', () => {
    expect(getStatusStyles('next')).toBe('bg-status-next text-white')
  })

  it('should return blocked styles for blocked status', () => {
    expect(getStatusStyles('blocked')).toBe('bg-status-blocked text-white')
    expect(getStatusStyles('canceled')).toBe('bg-status-blocked text-white')
  })

  it('should return planning styles for planning status', () => {
    expect(getStatusStyles('planning')).toBe('bg-status-planning text-white')
    expect(getStatusStyles('someday')).toBe('bg-status-planning text-white')
  })

  it('should return default styles for unknown status', () => {
    expect(getStatusStyles('unknown')).toBe('bg-gray-200 text-gray-700')
    expect(getStatusStyles('todo')).toBe('bg-gray-200 text-gray-700')
  })
})

describe('getPriorityStyles', () => {
  it('should return high priority styles for A priority', () => {
    expect(getPriorityStyles('A')).toBe('border-l-priority-high')
    expect(getPriorityStyles('high')).toBe('border-l-priority-high')
  })

  it('should return medium priority styles for B priority', () => {
    expect(getPriorityStyles('B')).toBe('border-l-priority-medium')
    expect(getPriorityStyles('medium')).toBe('border-l-priority-medium')
  })

  it('should return low priority styles for C priority', () => {
    expect(getPriorityStyles('C')).toBe('border-l-priority-low')
    expect(getPriorityStyles('low')).toBe('border-l-priority-low')
  })

  it('should return default styles for null or unknown priority', () => {
    expect(getPriorityStyles(null)).toBe('border-l-gray-300')
    expect(getPriorityStyles('unknown')).toBe('border-l-gray-300')
  })
})

describe('getContextStyles', () => {
  it('should return work context styles', () => {
    expect(getContextStyles('work')).toBe('bg-context-work text-white')
  })

  it('should return home context styles', () => {
    expect(getContextStyles('home')).toBe('bg-context-home text-white')
  })

  it('should return default styles for unknown context', () => {
    expect(getContextStyles('unknown')).toBe('bg-gray-500 text-white')
  })
})