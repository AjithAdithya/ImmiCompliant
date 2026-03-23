import { Link } from 'react-router-dom'
import {
  Users, Briefcase, Shield, AlertTriangle, TrendingDown,
  TrendingUp, ArrowRight, Clock, ChevronRight,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  dashboardStats, orgComplianceScore, alerts, complianceDeadlines,
  complianceScoreHistory, visaDistribution,
} from '@/lib/mock-data'
import { formatDate, statusColor, statusLabel, scoreColor, scoreBarColor, priorityColor } from '@/lib/utils'
import { employees } from '@/lib/mock-data'

const StatCard = ({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string; value: number | string; subtitle?: string
  icon: React.ElementType; color: string; href: string
}) => (
  <Link to={href}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  </Link>
)

export default function Dashboard() {
  const unreadCritical = alerts.filter(a => !a.read && a.severity === 'critical')
  const upcomingDeadlines = complianceDeadlines
    .filter(d => d.status !== 'completed' && d.daysUntilDue <= 30 && d.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground text-sm">TechCorp Inc. · Last updated {formatDate('2026-03-23')}</p>
        </div>
        <Link to="/dashboard/assistant">
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            AI Compliance Check
          </Button>
        </Link>
      </div>

      {/* Critical alerts */}
      {unreadCritical.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" />
            {unreadCritical.length} Critical Alert{unreadCritical.length > 1 ? 's' : ''} Require Immediate Action
          </div>
          {unreadCritical.map(alert => (
            <div key={alert.id} className="flex items-start justify-between gap-4">
              <p className="text-sm text-destructive/80">{alert.description}</p>
              {alert.actionUrl && (
                <Link to={alert.actionUrl}>
                  <Button variant="destructive" size="sm" className="shrink-0">
                    Review <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees" value={dashboardStats.totalEmployees}
          subtitle="On immigration status" icon={Users}
          color="bg-blue-500" href="/dashboard/employees"
        />
        <StatCard
          title="Open Cases" value={dashboardStats.openCases}
          subtitle="Active petitions" icon={Briefcase}
          color="bg-indigo-500" href="/dashboard/cases"
        />
        <StatCard
          title="Action Required" value={dashboardStats.actionRequired}
          subtitle="Immediate attention needed" icon={AlertTriangle}
          color="bg-red-500" href="/dashboard/employees"
        />
        <StatCard
          title="Expiring Soon" value={dashboardStats.expiringSoon}
          subtitle="Within 90 days" icon={Clock}
          color="bg-orange-500" href="/dashboard/employees"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compliance score trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Compliance Score Trend</CardTitle>
                <CardDescription>6-month history by category</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-destructive">
                <TrendingDown className="h-4 w-4" />
                {orgComplianceScore.trendValue}pts this month
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={complianceScoreHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} name="Overall" />
                <Line type="monotone" dataKey="i9" stroke="#ef4444" strokeWidth={1.5} dot={false} name="I-9" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="paf" stroke="#10b981" strokeWidth={1.5} dot={false} name="PAF" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visa distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Visa Distribution</CardTitle>
            <CardDescription>{dashboardStats.totalEmployees} employees</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={visaDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                  {visaDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} employees`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {visaDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compliance score breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Compliance Score</CardTitle>
              <span className={`text-3xl font-bold ${scoreColor(orgComplianceScore.overall)}`}>
                {orgComplianceScore.overall}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'I-9 Compliance', score: orgComplianceScore.i9Score },
              { label: 'PAF Completeness', score: orgComplianceScore.pafScore },
              { label: 'Deadline Adherence', score: orgComplianceScore.deadlineScore },
              { label: 'Document Currency', score: orgComplianceScore.documentScore },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium ${scoreColor(item.score)}`}>{item.score}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scoreBarColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
            <Link to="/dashboard/compliance">
              <Button variant="outline" className="w-full mt-2 gap-2" size="sm">
                View Full Risk Report <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Link to="/dashboard/compliance">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <CardDescription>Next 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                No critical deadlines in the next 30 days
              </div>
            ) : (
              upcomingDeadlines.map(dl => (
                <Link key={dl.id} to={`/dashboard/employees/${dl.employeeId}`}>
                  <div className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{dl.employeeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{dl.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`text-xs ${priorityColor(dl.priority)}`}>
                        {dl.daysUntilDue === 0 ? 'Today' : `${dl.daysUntilDue}d`}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent employees at risk */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employees Requiring Attention</CardTitle>
            <Link to="/dashboard/employees">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                All employees <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {employees
              .filter(e => e.status !== 'active' || e.riskLevel !== 'low')
              .sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 }
                return order[a.riskLevel] - order[b.riskLevel]
              })
              .slice(0, 5)
              .map(emp => (
                <Link key={emp.id} to={`/dashboard/employees/${emp.id}`}>
                  <div className="flex items-center gap-4 py-3 hover:bg-muted/30 px-2 rounded transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.title} · {emp.department}</p>
                    </div>
                    <Badge className={`text-xs ${statusColor(emp.status)}`}>
                      {statusLabel(emp.status)}
                    </Badge>
                    <Badge className={`text-xs capitalize ${
                      emp.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                      emp.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      emp.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      {emp.riskLevel} risk
                    </Badge>
                    <span className="text-xs text-muted-foreground">{emp.visaType}</span>
                  </div>
                </Link>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
