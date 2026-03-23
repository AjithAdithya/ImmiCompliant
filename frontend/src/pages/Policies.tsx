import { useState } from 'react'
import { AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { policyUpdates } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

const sourceColors: Record<string, string> = {
  USCIS: 'bg-blue-100 text-blue-800 border-blue-200',
  DOL: 'bg-green-100 text-green-800 border-green-200',
  ICE: 'bg-red-100 text-red-800 border-red-200',
  DOS: 'bg-purple-100 text-purple-800 border-purple-200',
  'Federal Register': 'bg-gray-100 text-gray-800 border-gray-200',
}

const impactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Policies() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterImpact, setFilterImpact] = useState('all')

  const filtered = policyUpdates.filter(p =>
    filterImpact === 'all' || p.impactLevel === filterImpact
  ).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())

  const actionRequired = policyUpdates.filter(p => p.actionRequired)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policy & Regulatory Updates</h1>
          <p className="text-muted-foreground text-sm">Monitored sources: USCIS · DOL · ICE · DOS · Federal Register</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" /> Configure Alerts
        </Button>
      </div>

      {/* Action required banner */}
      {actionRequired.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="font-medium text-orange-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            {actionRequired.length} Updates Require Action
          </p>
          <ul className="space-y-1">
            {actionRequired.map(p => (
              <li key={p.id} className="text-sm text-orange-700">
                • <span className="font-medium">{p.title}</span> — {p.affectedEmployeeCount} employee{p.affectedEmployeeCount !== 1 ? 's' : ''} affected
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map(level => (
          <button
            key={level}
            onClick={() => setFilterImpact(level)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors border capitalize ${
              filterImpact === level
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            {level === 'all' ? 'All Updates' : `${level} Impact`}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} updates</span>
      </div>

      {/* Policy cards */}
      <div className="space-y-4">
        {filtered.map(policy => {
          const isExpanded = expanded === policy.id
          return (
            <Card key={policy.id} className={`${policy.impactLevel === 'high' ? 'border-red-200' : ''}`}>
              <CardContent className="p-0">
                <button
                  onClick={() => setExpanded(isExpanded ? null : policy.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`text-xs ${sourceColors[policy.source] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {policy.source}
                        </Badge>
                        <Badge className={`text-xs ${impactColors[policy.impactLevel]}`}>
                          {policy.impactLevel} impact
                        </Badge>
                        {policy.actionRequired && (
                          <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                            Action Required
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(policy.publishedDate)}</span>
                      </div>
                      <p className="text-sm font-semibold">{policy.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{policy.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {policy.affectedEmployeeCount} employee{policy.affectedEmployeeCount !== 1 ? 's' : ''}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">{policy.summary}</p>

                    {/* Affected visa types */}
                    <div>
                      <p className="text-xs font-medium mb-1.5">Affected Visa Types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {policy.affectedVisaTypes.map(v => (
                          <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action items */}
                    {policy.actionItems.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1.5">
                          {policy.actionRequired ? '⚠ Required Action Items' : 'Recommended Actions'}
                        </p>
                        <ul className="space-y-1">
                          {policy.actionItems.map((item, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${policy.actionRequired ? 'bg-orange-500' : 'bg-blue-400'}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2 text-xs">
                        <ExternalLink className="h-3 w-3" /> View Source
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Mark Reviewed
                      </Button>
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
