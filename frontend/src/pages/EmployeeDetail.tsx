import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Building, Calendar, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { employees, cases, documents, i9Records, complianceDeadlines } from '@/lib/mock-data'
import { statusColor, statusLabel, riskBadgeColor, formatDate, expiryLabel, scoreColor, caseStatusColor, caseStatusLabel, priorityColor } from '@/lib/utils'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const employee = employees.find(e => e.id === id)

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Employee not found.</p>
        <Link to="/dashboard/employees"><Button variant="outline">Back to Employees</Button></Link>
      </div>
    )
  }

  const empCases = cases.filter(c => c.employeeId === employee.id)
  const empDocs = documents.filter(d => d.employeeId === employee.id)
  const empI9 = i9Records.find(r => r.employeeId === employee.id)
  const empDeadlines = complianceDeadlines.filter(d => d.employeeId === employee.id)

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link to="/dashboard/employees">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back to Employees
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
              <p className="text-muted-foreground">{employee.title} · {employee.department}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={`text-xs ${statusColor(employee.status)}`}>{statusLabel(employee.status)}</Badge>
                <Badge className={`text-xs capitalize ${riskBadgeColor(employee.riskLevel)}`}>{employee.riskLevel} risk</Badge>
                <Badge variant="outline" className="text-xs">{employee.visaType}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${scoreColor(employee.complianceScore)}`}>{employee.complianceScore}</div>
            <div className="text-xs text-muted-foreground">Compliance Score</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(employee.status === 'action_required' || employee.status === 'expired' || employee.riskLevel === 'critical') && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive font-medium text-sm mb-1">
            <AlertTriangle className="h-4 w-4" />
            Immediate Action Required
          </div>
          <p className="text-sm text-destructive/80">{employee.notes}</p>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail, label: 'Email', value: employee.email },
          { icon: MapPin, label: 'Location', value: employee.location },
          { icon: Building, label: 'Attorney', value: employee.attorney || 'In-house' },
          { icon: Calendar, label: 'Start Date', value: formatDate(employee.startDate) },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-start gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Immigration status */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className={`border-2 ${employee.workAuthorizationExpiry && new Date(employee.workAuthorizationExpiry) < new Date() ? 'border-destructive' : 'border-transparent'}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Work Authorization Expires</p>
            <p className={`text-lg font-semibold ${employee.workAuthorizationExpiry && new Date(employee.workAuthorizationExpiry) < new Date() ? 'text-destructive' : ''}`}>
              {expiryLabel(employee.workAuthorizationExpiry)}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(employee.workAuthorizationExpiry)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">I-94 Expiry</p>
            <p className="text-lg font-semibold">{expiryLabel(employee.i94Expiry)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(employee.i94Expiry)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Passport Expiry</p>
            <p className="text-lg font-semibold">{expiryLabel(employee.passportExpiry)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(employee.passportExpiry)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">Cases ({empCases.length})</TabsTrigger>
          <TabsTrigger value="i9">I-9 Record</TabsTrigger>
          <TabsTrigger value="documents">Documents ({empDocs.length})</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>

        {/* Cases tab */}
        <TabsContent value="cases" className="space-y-3">
          {empCases.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No cases on file.</CardContent></Card>
          ) : empCases.map(c => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{c.caseType}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.caseNumber}</p>
                  </div>
                  <Badge className={`text-xs ${caseStatusColor(c.status)}`}>{caseStatusLabel(c.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Filed</p><p className="font-medium">{formatDate(c.filedDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Approved</p><p className="font-medium">{formatDate(c.approvalDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Expires</p><p className="font-medium">{expiryLabel(c.expiryDate)}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">{c.notes}</p>
                {/* Timeline */}
                <div className="space-y-2 pt-2 border-t">
                  {c.timeline.map(event => (
                    <div key={event.id} className="flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        event.type === 'approval' ? 'bg-green-500' :
                        event.type === 'denial' ? 'bg-red-500' :
                        event.type === 'rfe' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-xs font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* I-9 tab */}
        <TabsContent value="i9">
          {!empI9 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="font-medium">No I-9 on file</p>
                <p className="text-sm text-muted-foreground">An I-9 must be completed on the first day of employment.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>I-9 Employment Eligibility Verification</CardTitle>
                  <Badge className={`text-xs ${
                    empI9.status === 'complete' || empI9.status === 'reverified' ? 'bg-green-100 text-green-800 border-green-200' :
                    empI9.status === 'errors' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-orange-100 text-orange-800 border-orange-200'
                  }`}>
                    {empI9.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Section 1 Completed</p>
                    <p className="font-medium">{formatDate(empI9.section1CompletedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Section 2 Completed</p>
                    <p className="font-medium">{formatDate(empI9.section2CompletedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reverification Due</p>
                    <p className="font-medium">{expiryLabel(empI9.reverificationDue)}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-medium mb-2">Documents Presented</p>
                  {empI9.listADocument && <p className="text-xs text-muted-foreground">List A: {empI9.listADocument}</p>}
                  {empI9.listBDocument && <p className="text-xs text-muted-foreground">List B: {empI9.listBDocument}</p>}
                  {empI9.listCDocument && <p className="text-xs text-muted-foreground">List C: {empI9.listCDocument}</p>}
                </div>

                {empI9.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> {empI9.errors.length} Error{empI9.errors.length > 1 ? 's' : ''} Detected
                    </p>
                    {empI9.errors.map((err, i) => (
                      <div key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <p className="text-xs font-medium">{err.field} · <span className="capitalize">{err.severity}</span></p>
                        <p className="text-xs text-muted-foreground mt-0.5">{err.description}</p>
                        {err.correctionRequired && (
                          <Badge className="mt-1 text-xs bg-destructive/10 text-destructive border-destructive/20">Correction Required</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {empI9.errors.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    No errors detected in I-9 review
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents" className="space-y-3">
          {empDocs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No documents on file.</CardContent></Card>
          ) : empDocs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)} · {doc.fileSize}</p>
              </div>
              {doc.expiryDate && (
                <span className="text-xs text-muted-foreground">{expiryLabel(doc.expiryDate)}</span>
              )}
              <Badge className={`text-xs ${
                doc.status === 'valid' ? 'bg-green-100 text-green-800 border-green-200' :
                doc.status === 'expiring' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                doc.status === 'expired' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                {doc.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </TabsContent>

        {/* Deadlines tab */}
        <TabsContent value="deadlines" className="space-y-3">
          {empDeadlines.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No deadlines tracked for this employee.</CardContent></Card>
          ) : empDeadlines.map(dl => (
            <div key={dl.id} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm font-medium">{dl.type}</p>
                <p className="text-xs text-muted-foreground">{dl.description}</p>
              </div>
              <div className="text-right">
                <Badge className={`text-xs ${priorityColor(dl.priority)}`}>
                  {dl.daysUntilDue < 0 ? `${Math.abs(dl.daysUntilDue)}d overdue` :
                   dl.daysUntilDue === 0 ? 'Today' : `${dl.daysUntilDue}d`}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(dl.dueDate)}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
