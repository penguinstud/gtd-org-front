import React from 'react'
import { Button } from '../atoms/Button'

interface QuickActionButtonProps {
  icon: string
  label: string
  onClick?: () => void
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick }) => (
  <Button onClick={onClick} className="flex flex-col items-center p-4 h-auto">
    <span className="text-2xl mb-2">{icon}</span>
    <span className="text-sm">{label}</span>
  </Button>
)