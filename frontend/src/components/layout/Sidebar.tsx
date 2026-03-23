import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Briefcase, Shield, FileText,
  Globe, BarChart3, MessageSquare, Settings, ChevronRight,
  AlertTriangle, BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { alerts } from '@/lib/mock-data'
import { ScrollArea } from '@/components/ui/scroll-area'

const unreadCritical = alerts.filter(a => !a.read && a.severity === 'critical').length

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Cases', href: '/dashboard/cases', icon: Briefcase },
  {
    label: 'Compliance', href: '/dashboard/compliance', icon: Shield,
    badge: unreadCritical > 0 ? unreadCritical : undefined,
    children: [
      { label: 'Overview', href: '/dashboard/compliance' },
      { label: 'I-9 Audit', href: '/dashboard/compliance/i9-audit' },
    ],
  },
  {
    label: 'Documents', href: '/dashboard/documents', icon: FileText,
    children: [
      { label: 'Document Vault', href: '/dashboard/documents' },
      { label: 'PAF Management', href: '/dashboard/documents/paf' },
    ],
  },
  { label: 'Policy Updates', href: '/dashboard/policies', icon: BookOpen },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'AI Assistant', href: '/dashboard/assistant', icon: MessageSquare },
]

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive = location.pathname === item.href ||
    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <NavLink
        to={item.href}
        end={item.href === '/dashboard'}
        className={({ isActive: navActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            navActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )
        }
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronRight className={cn('h-3 w-3 transition-transform', isActive && 'rotate-90')} />
        )}
      </NavLink>

      {hasChildren && isActive && (
        <div className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
          {item.children!.map(child => (
            <NavLink
              key={child.href}
              to={child.href}
              end
              className={({ isActive: childActive }) =>
                cn(
                  'block rounded-md px-2 py-1.5 text-xs transition-colors',
                  childActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Globe className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-bold">ImmiCompliant</span>
          <p className="text-[10px] text-muted-foreground">Immigration Compliance</p>
        </div>
      </div>

      {/* Critical alert banner */}
      {unreadCritical > 0 && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <span className="text-xs font-medium text-destructive">
            {unreadCritical} critical alert{unreadCritical > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map(item => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t p-3 space-y-1">
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            TC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">TechCorp Inc.</p>
            <p className="text-[10px] text-muted-foreground truncate">hr@techcorp.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
