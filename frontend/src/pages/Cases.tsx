import { useState } from 'react'
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cases, employees } from '@/lib/mock-data'
import { caseStatusColor, caseStatusLabel, formatDate, expiryLabel } from '@/lib/utils'

export default function Cases() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedCase, setExpandedCase] = useState<string | null>(null)

  const getEmployee = (id: string) => employees.find(e => e.id === id)

  const filtered = cases.filter(c => {
    const emp = getEmployee(c.employeeId)
    const matchSearch = !search ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.caseType.toLowerCase().includes(search.toLowerCase()) ||
      (emp && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusCounts = {
    all: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    in_progress: cases.filter(c => c.status === 'in_progress').length,
    rfe_received: cases.filter(c => c.status === 'rfe_received').length,
    approved: cases.filter(c => c.status === 'approved' || c.status === 'certified').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cases</h1>
          <p className="text-muted-foreground text-sm">{cases.length} total cases · {statusCounts.pending + statusCounts.in_progress} active</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Case</Button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
          { key: 'rfe_received', label: 'RFE', count: statusCounts.rfe_received },
          { key: 'approved', label: 'Approved', count: statusCounts.approved },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
              filterStatus === item.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            {item.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${
              filterStatus === item.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cases by number, type, or employee..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>

      {/* Cases list */}
      <div className="space-y-3">
        {filtered.map(c => {
          const emp = getEmployee(c.employeeId)
          const isExpanded = expandedCase === c.id
          return (
            <Card key={c.id} className={`transition-shadow hover:shadow-md ${c.status === 'rfe_received' ? 'border-orange-200' : ''}`}>
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                        {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</span>
                          <Badge variant="outline" className="text-xs">{c.visaCategory}</Badge>
                          <Badge className={`text-xs ${caseStatusColor(c.status)}`}>{caseStatusLabel(c.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{c.caseType}</p>
                        <p className="text-xs font-mono text-muted-foreground">{c.caseNumber} · {c.serviceCenter}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Filed {formatDate(c.filedDate)}</p>
                        {c.expiryDate && <p className="text-xs font-medium">{expiryLabel(c.expiryDate)}</p>}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-xs text-muted-foreground">Filed Date</p><p className="font-medium">{formatDate(c.filedDate)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Approval Date</p><p className="font-medium">{formatDate(c.approvalDate)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Expiry</p><p className="font-medium">{expiryLabel(c.expiryDate)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Last Updated</p><p className="font-medium">{formatDate(c.lastUpdated)}</p></div>
                    </div>
                    {c.notes && <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">{c.notes}</p>}

                    {/* Timeline */}
                    <div>
                      <p className="text-xs font-medium mb-3">Case Timeline</p>
                      <div className="space-y-3">
                        {c.timeline.map((event, i) => (
                          <div key={event.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                                event.type === 'approval' ? 'bg-green-500' :
                                event.type === 'denial' ? 'bg-red-500' :
                                event.type === 'rfe' ? 'bg-orange-500' :
                                event.type === 'filing' ? 'bg-blue-500' : 'bg-muted-foreground'
                              }`} />
                              {i < c.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                            </div>
                            <div className="pb-3">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{event.event}</p>
                                <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/dashboard/employees/${c.employeeId}`}>
                        <Button variant="outline" size="sm">View Employee</Button>
                      </Link>
                      <Button variant="outline" size="sm">Check USCIS Status</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
