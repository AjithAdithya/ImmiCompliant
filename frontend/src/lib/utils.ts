import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO, isValid } from 'date-fns'
import type { EmployeeStatus, RiskLevel, CaseStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return null
    return differenceInDays(date, new Date())
  } catch {
    return null
  }
}

export function expiryLabel(dateStr: string | null | undefined): string {
  const days = daysUntil(dateStr)
  if (days === null) return '—'
  if (days < 0) return `Expired ${Math.abs(days)}d ago`
  if (days === 0) return 'Expires today'
  if (days <= 30) return `${days}d left`
  if (days <= 90) return `${days}d left`
  return formatDate(dateStr)
}

export function statusColor(status: EmployeeStatus): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'expired': return 'bg-red-100 text-red-800 border-red-200'
    case 'action_required': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case 'active': return 'Active'
    case 'expiring_soon': return 'Expiring Soon'
    case 'expired': return 'Expired'
    case 'action_required': return 'Action Required'
    case 'pending': return 'Pending'
    default: return status
  }
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'text-green-600'
    case 'medium': return 'text-yellow-600'
    case 'high': return 'text-orange-600'
    case 'critical': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

export function riskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function caseStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200'
    case 'certified': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'rfe_received': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'rfe_responded': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'denied': return 'bg-red-100 text-red-800 border-red-200'
    case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function caseStatusLabel(status: CaseStatus): string {
  switch (status) {
    case 'approved': return 'Approved'
    case 'certified': return 'Certified'
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'rfe_received': return 'RFE Received'
    case 'rfe_responded': return 'RFE Responded'
    case 'denied': return 'Denied'
    case 'withdrawn': return 'Withdrawn'
    default: return status
  }
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

export function scoreBarColor(score: number): string {
  if (score >= 90) return 'bg-green-500'
  if (score >= 75) return 'bg-yellow-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

export function formatFileSize(bytes: string): string {
  return bytes // Already formatted in mock data
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
