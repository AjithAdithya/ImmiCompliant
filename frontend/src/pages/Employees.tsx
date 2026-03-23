import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, ChevronRight, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { employees } from '@/lib/mock-data'
import { statusColor, statusLabel, riskBadgeColor, expiryLabel, getInitials, scoreColor } from '@/lib/utils'
import type { VisaType } from '@/lib/types'

const visaTypes: VisaType[] = ['H-1B', 'L-1A', 'L-1B', 'O-1A', 'TN', 'OPT', 'STEM OPT', 'EAD', 'Green Card', 'E-3']

export default function Employees() {
  const [search, setSearch] = useState('')
  const [filterVisa, setFilterVisa] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')

  const filtered = employees.filter(emp => {
    const matchSearch =
      !search ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
    const matchVisa = filterVisa === 'all' || emp.visaType === filterVisa
    const matchStatus = filterStatus === 'all' || emp.status === filterStatus
    const matchRisk = filterRisk === 'all' || emp.riskLevel === filterRisk
    return matchSearch && matchVisa && matchStatus && matchRisk
  })

  const counts = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    expiring: employees.filter(e => e.status === 'expiring_soon').length,
    action: employees.filter(e => e.status === 'action_required' || e.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm">{employees.length} employees on immigration status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Active', value: counts.active, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Expiring Soon', value: counts.expiring, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'Action Required', value: counts.action, color: 'bg-red-50 text-red-700 border-red-200' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setFilterStatus(
              item.label === 'Total' ? 'all' :
              item.label === 'Active' ? 'active' :
              item.label === 'Expiring Soon' ? 'expiring_soon' : 'action_required'
            )}
            className={`rounded-lg border p-3 text-left hover:shadow-sm transition-shadow ${item.color}`}
          >
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs font-medium">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterVisa} onValueChange={setFilterVisa}>
            <SelectTrigger className="w-36">
              <Filter className="h-3.5 w-3.5 mr-1 opacity-50" />
              <SelectValue placeholder="Visa type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visa Types</SelectItem>
              {visaTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="action_required">Action Required</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          {(search || filterVisa !== 'all' || filterStatus !== 'all' || filterRisk !== 'all') && (
            <Button
              variant="ghost" size="sm"
              onClick={() => { setSearch(''); setFilterVisa('all'); setFilterStatus('all'); setFilterRisk('all') }}
            >
              Clear filters
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
        </CardContent>
      </Card>

      {/* Employee table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Visa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Work Auth Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Department</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{emp.visaType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${statusColor(emp.status)}`}>
                        {statusLabel(emp.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {expiryLabel(emp.workAuthorizationExpiry)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs capitalize ${riskBadgeColor(emp.riskLevel)}`}>
                        {emp.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${scoreColor(emp.complianceScore)}`}>
                        {emp.complianceScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/employees/${emp.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No employees match your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
