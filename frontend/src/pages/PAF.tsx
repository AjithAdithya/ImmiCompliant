import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Download, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { pafRecords, lcas, employees } from '@/lib/mock-data'
import { formatDate, scoreColor, scoreBarColor } from '@/lib/utils'

export default function PAF() {
  const getEmployee = (id: string) => employees.find(e => e.id === id)
  const getLCA = (id: string) => lcas.find(l => l.id === id)

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/documents">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Documents
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Public Access File (PAF) Management</h1>
            <p className="text-muted-foreground text-sm">Per-LCA compliance · Must be available within 1 business day of request</p>
          </div>
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New PAF</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-muted/30">
          <p className="text-2xl font-bold">{pafRecords.length}</p>
          <p className="text-sm text-muted-foreground">Total PAFs</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-700">{pafRecords.filter(p => p.auditReady).length}</p>
          <p className="text-sm text-green-600">Audit Ready</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-2xl font-bold text-red-700">{pafRecords.filter(p => !p.auditReady).length}</p>
          <p className="text-sm text-red-600">Incomplete — Action Required</p>
        </div>
      </div>

      {/* PAF records */}
      <div className="space-y-4">
        {pafRecords.map(paf => {
          const emp = getEmployee(paf.employeeId)
          const lca = getLCA(paf.lcaId)
          const presentCount = paf.documents.filter(d => d.present).length
          const requiredCount = paf.documents.filter(d => d.required).length

          return (
            <Card key={paf.id} className={!paf.auditReady ? 'border-orange-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'} — PAF
                    </CardTitle>
                    <CardDescription>
                      LCA: {lca?.caseNumber || paf.lcaId} · {lca?.jobTitle} · {lca?.workLocation}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {paf.auditReady ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Audit Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Incomplete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Completeness bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Completeness</span>
                    <span className={`font-semibold ${scoreColor(paf.completenessScore)}`}>
                      {paf.completenessScore}% ({presentCount}/{requiredCount} required docs)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreBarColor(paf.completenessScore)}`}
                      style={{ width: `${paf.completenessScore}%` }}
                    />
                  </div>
                </div>

                {/* Document checklist */}
                <div className="grid sm:grid-cols-2 gap-2">
                  {paf.documents.map((doc, i) => (
                    <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                      doc.required && !doc.present
                        ? 'border-red-200 bg-red-50'
                        : doc.present
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}>
                      {doc.present ? (
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className={`h-4 w-4 shrink-0 mt-0.5 ${doc.required ? 'text-red-500' : 'text-gray-400'}`} />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${
                          doc.required && !doc.present ? 'text-red-700' :
                          doc.present ? 'text-green-700' : 'text-gray-500'
                        }`}>{doc.name}</p>
                        {doc.required && !doc.present && (
                          <p className="text-xs text-red-600">Required — Missing</p>
                        )}
                        {!doc.required && <p className="text-xs text-gray-500">Optional</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* LCA details */}
                {lca && (
                  <div className="rounded-lg bg-muted/40 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">SOC Code</p>
                      <p className="font-medium">{lca.socCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Wage Level</p>
                      <p className="font-medium">Level {lca.wageLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Offered / Prevailing</p>
                      <p className="font-medium">${lca.offeredWage.toLocaleString()} / ${lca.prevailingWage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posting Completed</p>
                      <p className={`font-medium ${lca.postingCompleted ? 'text-green-600' : 'text-red-600'}`}>
                        {lca.postingCompleted ? `Yes (${formatDate(lca.postingStartDate)} – ${formatDate(lca.postingEndDate)})` : 'No'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3.5 w-3.5" /> Export PAF for Audit
                  </Button>
                  {!paf.auditReady && (
                    <Button size="sm" className="gap-2">
                      Complete PAF <AlertTriangle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Last updated {formatDate(paf.lastUpdated)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
