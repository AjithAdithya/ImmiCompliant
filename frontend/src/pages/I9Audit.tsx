import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowLeft, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { i9Records, employees } from '@/lib/mock-data'
import { formatDate, expiryLabel } from '@/lib/utils'

export default function I9Audit() {
  const [auditRunning, setAuditRunning] = useState(false)
  const [auditComplete, setAuditComplete] = useState(false)

  const getEmployee = (id: string) => employees.find(e => e.id === id)

  const stats = {
    total: i9Records.length,
    complete: i9Records.filter(r => r.status === 'complete' || r.status === 'reverified').length,
    errors: i9Records.filter(r => r.errors.length > 0).length,
    needsReverification: i9Records.filter(r => r.status === 'needs_reverification').length,
    overallErrorRate: Math.round(i9Records.filter(r => r.errors.length > 0 || r.status === 'needs_reverification').length / i9Records.length * 100),
  }

  function runAudit() {
    setAuditRunning(true)
    setTimeout(() => {
      setAuditRunning(false)
      setAuditComplete(true)
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/compliance">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Compliance
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">I-9 Audit Readiness</h1>
            <p className="text-muted-foreground text-sm">Validate all I-9 forms against M-274 Handbook requirements</p>
          </div>
          <Button onClick={runAudit} disabled={auditRunning} className="gap-2">
            <Play className="h-4 w-4" />
            {auditRunning ? 'Running audit...' : 'Run Mock Audit'}
          </Button>
        </div>
      </div>

      {auditRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-blue-700">
                Running ICE-style audit simulation against {i9Records.length} I-9 records...
              </p>
            </div>
            <Progress className="mt-3" value={65} />
          </CardContent>
        </Card>
      )}

      {auditComplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="font-medium text-orange-800 mb-2">Mock Audit Complete — 3 Issues Found</p>
            <p className="text-sm text-orange-700">
              Your I-9 population has a <strong>{stats.overallErrorRate}% error rate</strong>.
              ICE inspectors typically look for Section 2 completeness, reverification compliance, and document retention.
              Address all issues below before responding to a real audit notice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total I-9s', value: stats.total, icon: Shield, color: 'text-blue-600 bg-blue-50' },
          { label: 'Complete / Reverified', value: stats.complete, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Errors Detected', value: stats.errors, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Reverification Due', value: stats.needsReverification, icon: Clock, color: 'text-orange-600 bg-orange-50' },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* I-9 records table */}
      <Card>
        <CardHeader>
          <CardTitle>I-9 Records</CardTitle>
          <CardDescription>All employee I-9 forms with validation status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {i9Records.map(record => {
              const emp = getEmployee(record.employeeId)
              const hasIssue = record.errors.length > 0 || record.status === 'needs_reverification'
              return (
                <div key={record.id} className={`p-4 ${hasIssue ? 'bg-red-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                        hasIssue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '?'}
                      </div>
                      <div>
                        <Link to={`/dashboard/employees/${record.employeeId}`}>
                          <span className="text-sm font-medium hover:text-primary transition-colors">
                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                          </span>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          S1: {formatDate(record.section1CompletedDate)} · S2: {formatDate(record.section2CompletedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        record.status === 'complete' || record.status === 'reverified'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : record.status === 'errors'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                      }`}>
                        {record.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Reverification: {expiryLabel(record.reverificationDue)}
                      </span>
                    </div>
                  </div>

                  {/* Errors */}
                  {record.errors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {record.errors.map((err, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-red-100 border border-red-200 p-2.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-red-800">{err.field} · <span className="capitalize">{err.severity}</span></p>
                            <p className="text-xs text-red-700">{err.description}</p>
                            {err.correctionRequired && (
                              <p className="text-xs font-medium text-red-800 mt-0.5">⚠ Correction required — cannot white-out</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasIssue && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      No errors detected · Documents: {record.listADocument || `${record.listBDocument}, ${record.listCDocument}`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">I-9 Correction Guidance</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• <strong>Never use white-out</strong>. Draw a single line through the error, write the correct information, and initial and date the correction.</p>
          <p>• <strong>Section 1 errors</strong> (employee's section) must be corrected by the employee. HR cannot correct Section 1.</p>
          <p>• <strong>Reverification (Section 3)</strong> must be done <em>before</em> the employee's work authorization expires — never after.</p>
          <p>• <strong>Document retention</strong>: Keep I-9s for 3 years after hire date, or 1 year after termination — whichever is later.</p>
          <p>• <strong>ICE audit</strong>: You have 3 business days to produce I-9s after receiving a Notice of Inspection (Form I-9 NOI).</p>
        </CardContent>
      </Card>
    </div>
  )
}
