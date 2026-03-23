// ─── Enums ─────────────────────────────────────────────────────────────────

export type VisaType =
  | 'H-1B' | 'H-1B1' | 'L-1A' | 'L-1B'
  | 'O-1A' | 'O-1B' | 'TN' | 'E-1' | 'E-2' | 'E-3'
  | 'OPT' | 'STEM OPT' | 'EAD' | 'Green Card' | 'US Citizen' | 'Other'

export type EmployeeStatus = 'active' | 'expiring_soon' | 'expired' | 'action_required' | 'pending'

export type CaseStatus =
  | 'approved' | 'pending' | 'rfe_received' | 'rfe_responded'
  | 'denied' | 'withdrawn' | 'in_progress' | 'certified'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type DocumentType =
  | 'i9' | 'lca' | 'perm' | 'petition' | 'approval_notice'
  | 'ead' | 'passport' | 'visa_stamp' | 'offer_letter'
  | 'prevailing_wage' | 'pay_stub' | 'paf' | 'other'

export type AlertType = 'deadline' | 'expiration' | 'policy_change' | 'action_required' | 'info'
export type AlertSeverity = 'info' | 'warning' | 'critical'

// ─── Core Models ────────────────────────────────────────────────────────────

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  title: string
  location: string
  startDate: string
  visaType: VisaType
  status: EmployeeStatus
  workAuthorizationExpiry: string | null
  i94Expiry: string | null
  passportExpiry: string | null
  activeCaseId: string | null
  riskLevel: RiskLevel
  complianceScore: number
  notes: string
  attorney: string | null
}

export interface Case {
  id: string
  employeeId: string
  caseNumber: string
  caseType: string
  visaCategory: VisaType
  status: CaseStatus
  filedDate: string
  approvalDate: string | null
  expiryDate: string | null
  serviceCenter: string
  petitionerName: string
  beneficiaryName: string
  lastUpdated: string
  notes: string
  timeline: CaseEvent[]
}

export interface CaseEvent {
  id: string
  date: string
  event: string
  description: string
  type: 'filing' | 'receipt' | 'rfe' | 'approval' | 'denial' | 'update' | 'action'
}

export interface Document {
  id: string
  employeeId: string | null
  caseId: string | null
  name: string
  type: DocumentType
  uploadedAt: string
  uploadedBy: string
  expiryDate: string | null
  fileSize: string
  status: 'valid' | 'expiring' | 'expired' | 'missing' | 'under_review'
  tags: string[]
}

export interface I9Record {
  id: string
  employeeId: string
  section1CompletedDate: string | null
  section2CompletedDate: string | null
  section3CompletedDate: string | null
  listADocument: string | null
  listBDocument: string | null
  listCDocument: string | null
  workAuthorizationExpiry: string | null
  reverificationDue: string | null
  errors: I9Error[]
  status: 'complete' | 'incomplete' | 'errors' | 'needs_reverification' | 'reverified'
  lastReviewed: string | null
}

export interface I9Error {
  field: string
  severity: 'minor' | 'major'
  description: string
  correctionRequired: boolean
}

export interface LCA {
  id: string
  caseNumber: string
  employeeId: string
  socCode: string
  jobTitle: string
  wageLevel: 'I' | 'II' | 'III' | 'IV'
  offeredWage: number
  prevailingWage: number
  workLocation: string
  filedDate: string
  certifiedDate: string | null
  validityStart: string | null
  validityEnd: string | null
  postingStartDate: string | null
  postingEndDate: string | null
  postingCompleted: boolean
  pafComplete: boolean
  status: 'pending' | 'certified' | 'expired' | 'withdrawn'
}

export interface PAFRecord {
  id: string
  lcaId: string
  employeeId: string
  completenessScore: number
  documents: PAFDocument[]
  lastUpdated: string
  auditReady: boolean
}

export interface PAFDocument {
  name: string
  required: boolean
  present: boolean
  fileId: string | null
}

export interface PolicyUpdate {
  id: string
  title: string
  source: 'USCIS' | 'DOL' | 'Federal Register' | 'ICE' | 'DOS'
  publishedDate: string
  summary: string
  fullText: string
  affectedVisaTypes: VisaType[]
  impactLevel: 'low' | 'medium' | 'high'
  actionRequired: boolean
  actionItems: string[]
  affectedEmployeeCount: number
  tags: string[]
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  employeeId: string | null
  employeeName: string | null
  dueDate: string | null
  createdAt: string
  read: boolean
  actionUrl: string | null
}

export interface OrgComplianceScore {
  overall: number
  i9Score: number
  pafScore: number
  deadlineScore: number
  documentScore: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  lastUpdated: string
}

export interface ComplianceDeadline {
  id: string
  employeeId: string
  employeeName: string
  type: string
  description: string
  dueDate: string
  daysUntilDue: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  assignedTo: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: Citation[]
  agentType?: string
}

export interface Citation {
  source: string
  text: string
  url?: string
}
