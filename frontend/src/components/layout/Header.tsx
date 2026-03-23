import { Bell, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { alerts } from '@/lib/mock-data'

const unreadCount = alerts.filter(a => !a.read).length

export default function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees, cases, documents..."
          className="pl-8 bg-muted/50"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Last synced */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Synced 2m ago
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground border-0"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground cursor-pointer">
          AJ
        </div>
      </div>
    </header>
  )
}
