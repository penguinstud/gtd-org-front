import React, { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { Badge } from '../atoms/Badge'
import { SearchResult } from '../../lib/types'
import { cn } from '../../lib/utils/cn'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => Promise<SearchResult[]>
  onSelect: (result: SearchResult) => void
}

export function SearchModal({ isOpen, onClose, onSearch, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true)
      try {
        const searchResults = await onSearch(query)
        setResults(searchResults)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(searchTimeout)
  }, [query, onSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex])
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return '✅'
      case 'project':
        return '📁'
      case 'note':
        return '📝'
      case 'meeting':
        return '🤝'
      default:
        return '📄'
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return 'primary'
      case 'project':
        return 'secondary'
      case 'note':
        return 'default'
      case 'meeting':
        return 'progress'
      default:
        return 'default'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-0 -m-6">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, projects, notes..."
              className="w-full px-4 py-3 pl-12 text-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-4 top-3.5">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            {loading && (
              <div className="absolute right-4 top-4">
                <LoadingSpinner className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Search Tips */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-4">↑↓ Navigate</span>
            <span className="mr-4">↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query && !loading && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => {
                onSelect(result)
                onClose()
              }}
              className={cn(
                'w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left',
                selectedIndex === index && 'bg-gray-50 dark:bg-gray-800'
              )}
            >
              <span className="text-2xl mt-0.5">{getTypeIcon(result.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                  </h3>
                  <Badge variant={getTypeColor(result.type) as any} size="sm">
                    {result.type}
                  </Badge>
                  <Badge variant={result.context === 'work' ? 'progress' : 'planning'} size="sm">
                    {result.context}
                  </Badge>
                </div>
                {result.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {result.description}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(result.relevance * 100)}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

// Icon components
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}