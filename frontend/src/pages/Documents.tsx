import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Upload, Filter, FileText, Download, Folder } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { documents, employees } from '@/lib/mock-data'
import { expiryLabel } from '@/lib/utils'
import type { DocumentType } from '@/lib/types'

const docTypeLabels: Record<DocumentType, string> = {
  i9: 'I-9 Form',
  lca: 'LCA (ETA-9035)',
  perm: 'PERM (ETA-9089)',
  petition: 'Petition',
  approval_notice: 'Approval Notice (I-797)',
  ead: 'EAD Card',
  passport: 'Passport',
  visa_stamp: 'Visa Stamp',
  offer_letter: 'Offer Letter',
  prevailing_wage: 'Prevailing Wage',
  pay_stub: 'Pay Stub',
  paf: 'Public Access File',
  other: 'Other',
}

const statusColors: Record<string, string> = {
  valid: 'bg-green-100 text-green-800 border-green-200',
  expiring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  missing: 'bg-gray-100 text-gray-700 border-gray-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function Documents() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const getEmployee = (id: string | null) => id ? employees.find(e => e.id === id) : null

  const filtered = documents.filter(doc => {
    const emp = getEmployee(doc.employeeId)
    const matchSearch = !search ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()))
    const matchType = filterType === 'all' || doc.type === filterType
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const stats = {
    total: documents.length,
    valid: documents.filter(d => d.status === 'valid').length,
    expiring: documents.filter(d => d.status === 'expiring').length,
    expired: documents.filter(d => d.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <p className="text-muted-foreground text-sm">{documents.length} documents · {stats.expired} expired</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/documents/paf">
            <Button variant="outline" size="sm" className="gap-2">
              <Folder className="h-4 w-4" /> PAF Management
            </Button>
          </Link>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Valid', value: stats.valid, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Expiring', value: stats.expiring, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'Expired', value: stats.expired, color: 'bg-red-50 text-red-700 border-red-200' },
        ].map(item => (
          <div key={item.label} className={`rounded-lg border p-3 ${item.color}`}>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-3.5 w-3.5 mr-1 opacity-50" />
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(Object.entries(docTypeLabels) as [DocumentType, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
        </CardContent>
      </Card>

      {/* Documents table */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map(doc => {
              const emp = getEmployee(doc.employeeId)
              return (
                <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    doc.status === 'valid' ? 'bg-green-50' :
                    doc.status === 'expired' ? 'bg-red-50' :
                    doc.status === 'expiring' ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}>
                    <FileText className={`h-5 w-5 ${
                      doc.status === 'valid' ? 'text-green-600' :
                      doc.status === 'expired' ? 'text-red-500' :
                      doc.status === 'expiring' ? 'text-yellow-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{docTypeLabels[doc.type]}</span>
                      {emp && (
                        <>
                          <span className="text-muted-foreground text-xs">·</span>
                          <Link to={`/dashboard/employees/${emp.id}`}>
                            <span className="text-xs text-primary hover:underline">
                              {emp.firstName} {emp.lastName}
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    {doc.expiryDate ? (
                      <p className="text-xs font-medium">{expiryLabel(doc.expiryDate)}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No expiry</p>
                    )}
                    <p className="text-xs text-muted-foreground">{doc.fileSize}</p>
                  </div>
                  <Badge className={`text-xs shrink-0 ${statusColors[doc.status]}`}>
                    {doc.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    {doc.tags.includes('urgent') && (
                      <Badge className="text-xs bg-red-100 text-red-800 border-red-200">Urgent</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">No documents match your filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
