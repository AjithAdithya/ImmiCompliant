import { Download, TrendingDown, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { complianceScoreHistory, visaDistribution, employees, cases, orgComplianceScore } from '@/lib/mock-data'

const headcountByDeptData = [
  { dept: 'Engineering', count: 4 },
  { dept: 'Product', count: 1 },
  { dept: 'Finance', count: 1 },
  { dept: 'HR', count: 1 },
  { dept: 'Design', count: 1 },
  { dept: 'Operations', count: 1 },
  { dept: 'Sales', count: 1 },
]

const caseVolumeData = [
  { month: 'Oct', filed: 1, approved: 2 },
  { month: 'Nov', filed: 0, approved: 1 },
  { month: 'Dec', filed: 2, approved: 1 },
  { month: 'Jan', filed: 1, approved: 2 },
  { month: 'Feb', filed: 2, approved: 0 },
  { month: 'Mar', filed: 2, approved: 1 },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm">Organization-wide compliance metrics</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export PDF Report
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Compliance', value: `${orgComplianceScore.overall}/100`, change: `-${orgComplianceScore.trendValue}`, up: false },
          { label: 'Active Foreign Nationals', value: employees.filter(e => e.status === 'active').length.toString(), change: '+1', up: true },
          { label: 'Open Cases', value: cases.filter(c => !['approved', 'certified', 'denied'].includes(c.status)).length.toString(), change: '+2', up: false },
          { label: 'PAF Audit Ready', value: '67%', change: '-13%', up: false },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change} this month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="compliance">
        <TabsList className="mb-4">
          <TabsTrigger value="compliance">Compliance Trends</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="cases">Case Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score History</CardTitle>
                <CardDescription>6-month rolling trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={complianceScoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} name="Overall" />
                    <Line type="monotone" dataKey="i9" stroke="#ef4444" strokeWidth={2} name="I-9" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="paf" stroke="#10b981" strokeWidth={2} name="PAF" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="deadlines" stroke="#f59e0b" strokeWidth={2} name="Deadlines" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Current month by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'I-9', score: orgComplianceScore.i9Score },
                    { name: 'PAF', score: orgComplianceScore.pafScore },
                    { name: 'Deadlines', score: orgComplianceScore.deadlineScore },
                    { name: 'Documents', score: orgComplianceScore.documentScore },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {[orgComplianceScore.i9Score, orgComplianceScore.pafScore, orgComplianceScore.deadlineScore, orgComplianceScore.documentScore].map((score, i) => (
                        <Cell key={i} fill={score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : score >= 60 ? '#f97316' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="headcount" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visa Type Distribution</CardTitle>
                <CardDescription>{employees.length} total foreign nationals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={visaDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {visaDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Headcount by Department</CardTitle>
                <CardDescription>Immigration-status employees per department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={headcountByDeptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Case Volume</CardTitle>
              <CardDescription>Cases filed and approved per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={caseVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="filed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Cases Filed" />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Cases Approved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
