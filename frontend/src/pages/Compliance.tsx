import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, TrendingDown, ArrowRight, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { orgComplianceScore, complianceDeadlines, alerts, i9Records, pafRecords } from '@/lib/mock-data'
import { scoreColor, scoreBarColor, formatDate, priorityColor } from '@/lib/utils'

export default function Compliance() {
  const pendingDeadlines = complianceDeadlines
    .filter(d => d.status !== 'completed')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

  const overdueDeadlines = pendingDeadlines.filter(d => d.daysUntilDue < 0)
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')

  const i9IssueCount = i9Records.filter(r => r.errors.length > 0 || r.status === 'needs_reverification').length
  const pafIncompleteCount = pafRecords.filter(p => !p.auditReady).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Overview</h1>
          <p className="text-muted-foreground text-sm">Last updated {formatDate(orgComplianceScore.lastUpdated)}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/compliance/i9-audit">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" /> Run I-9 Audit
            </Button>
          </Link>
          <Button size="sm" className="gap-2">
            <ArrowRight className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Overall score */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-blue-700 mb-2">Overall Score</p>
            <div className={`text-6xl font-bold mb-2 ${scoreColor(orgComplianceScore.overall)}`}>
              {orgComplianceScore.overall}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              {orgComplianceScore.trendValue}pts vs last month
            </div>
          </CardContent>
        </Card>

        {[
          { label: 'I-9 Compliance', score: orgComplianceScore.i9Score, issues: `${i9IssueCount} issues`, href: '/dashboard/compliance/i9-audit' },
          { label: 'PAF Completeness', score: orgComplianceScore.pafScore, issues: `${pafIncompleteCount} incomplete`, href: '/dashboard/documents/paf' },
          { label: 'Deadline Adherence', score: orgComplianceScore.deadlineScore, issues: `${overdueDeadlines.length} overdue`, href: null },
        ].map(item => (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">{item.label}</p>
                <span className={`text-2xl font-bold ${scoreColor(item.score)}`}>{item.score}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                <div className={`h-full rounded-full ${scoreBarColor(item.score)}`} style={{ width: `${item.score}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.issues}</span>
                {item.href && (
                  <Link to={item.href}>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2">
                      Review <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical issues */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues — Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  {alert.dueDate && <p className="text-xs text-destructive mt-1 font-medium">Due: {formatDate(alert.dueDate)}</p>}
                </div>
                {alert.actionUrl && (
                  <Link to={alert.actionUrl}>
                    <Button variant="destructive" size="sm">Review</Button>
                  </Link>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>All Compliance Deadlines</CardTitle>
          <CardDescription>Sorted by urgency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {pendingDeadlines.map(dl => (
              <div key={dl.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  {dl.daysUntilDue < 0 ? (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  ) : dl.daysUntilDue <= 7 ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/dashboard/employees/${dl.employeeId}`}>
                        <span className="text-sm font-medium hover:text-primary transition-colors">{dl.employeeName}</span>
                      </Link>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">{dl.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{dl.description}</p>
                    {dl.assignedTo && <p className="text-xs text-muted-foreground">Assigned: {dl.assignedTo}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <Badge className={`text-xs ${priorityColor(dl.priority)}`}>
                      {dl.daysUntilDue < 0
                        ? `${Math.abs(dl.daysUntilDue)}d overdue`
                        : dl.daysUntilDue === 0 ? 'Today'
                        : `${dl.daysUntilDue}d left`}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(dl.dueDate)}</p>
                  </div>
                  <Badge className={`text-xs capitalize ${
                    dl.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {dl.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
