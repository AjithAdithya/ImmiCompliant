import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { sampleChatMessages } from '@/lib/mock-data'
import type { ChatMessage } from '@/lib/types'
import { format } from 'date-fns'

const SUGGESTED_QUESTIONS = [
  'Can Andrei Popescu keep working while his MTR is pending?',
  'What documents are required in a PAF for H-1B workers?',
  'When must we reverify an OPT employee\'s I-9?',
  'What triggers an H-1B amendment vs. a new petition?',
  'How long must we retain I-9 forms after termination?',
  'What is the 10-day LCA posting requirement?',
]

const agentLabels: Record<string, string> = {
  supervisor: 'Supervisor Agent',
  qa_agent: 'Q&A Agent',
  risk_agent: 'Risk Assessment Agent',
  document_agent: 'Document Analysis Agent',
  policy_agent: 'Policy Monitoring Agent',
  case_agent: 'Case Tracking Agent',
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const lines = message.content.split('\n')

  return (
    <div className={`flex gap-3 message-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-slate-100'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-blue-600" />}
      </div>

      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Agent label */}
        {!isUser && message.agentType && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {agentLabels[message.agentType] || message.agentType}
          </span>
        )}

        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        }`}>
          {lines.map((line, i) => {
            // Bold text between **
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // List items
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
            }
            if (line.trim() === '') return <div key={i} className="h-2" />
            return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
          })}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((cite, i) => (
              <div key={i} className="flex items-center gap-1 rounded-md border bg-background px-2 py-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{cite.source}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Bot className="h-4 w-4 text-blue-600" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 flex items-center gap-1.5">
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
        <div className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  )
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function sendMessage(text?: string) {
    const content = text || input.trim()
    if (!content) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const responseMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: generateMockResponse(content),
        timestamp: new Date().toISOString(),
        agentType: selectAgent(content),
        citations: generateCitations(content),
      }
      setMessages(prev => [...prev, responseMsg])
    }, 1500 + Math.random() * 1000)
  }

  function selectAgent(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('i-9') || lower.includes('i9') || lower.includes('document')) return 'document_agent'
    if (lower.includes('risk') || lower.includes('score') || lower.includes('audit')) return 'risk_agent'
    if (lower.includes('case') || lower.includes('uscis') || lower.includes('status')) return 'case_agent'
    if (lower.includes('policy') || lower.includes('update') || lower.includes('bulletin')) return 'policy_agent'
    return 'qa_agent'
  }

  function generateCitations(text: string): ChatMessage['citations'] {
    const lower = text.toLowerCase()
    const citations = []
    if (lower.includes('h-1b') || lower.includes('h1b')) citations.push({ source: '8 CFR § 214.2(h)', text: 'H-1B nonimmigrant alien requirements' })
    if (lower.includes('i-9') || lower.includes('i9')) citations.push({ source: 'INA § 274A', text: 'Unlawful employment of aliens' }, { source: 'USCIS M-274 Handbook', text: 'I-9 Employer Handbook' })
    if (lower.includes('lca') || lower.includes('paf')) citations.push({ source: '20 CFR § 655.760', text: 'LCA public access file requirements' })
    if (lower.includes('opt') || lower.includes('stem')) citations.push({ source: '8 CFR § 214.2(f)', text: 'F-1 student nonimmigrant requirements' })
    return citations.length > 0 ? citations : [{ source: 'USCIS Policy Manual', text: 'General immigration policy guidance' }]
  }

  function generateMockResponse(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('paf') || lower.includes('public access')) {
      return `**Public Access File (PAF) Requirements for H-1B Workers**\n\nUnder 20 CFR § 655.760, you must maintain a PAF for each H-1B worker with all of the following:\n\n- **Certified LCA** (Form ETA-9035/9035E) with wage information\n- **Prevailing wage documentation** (DOL Online Wage Library or independent survey)\n- **Actual wage documentation** (offer letter, pay structure)\n- **Notice documentation** (proof of 10-day posting or union representative notification)\n- **Benefits documentation** (evidence that H-1B workers receive same benefits as US workers)\n- For **H-1B dependent employers**: secondary displacement attestations\n\nThe PAF must be made available within **1 business day** of a request from the public or DOL investigator.\n\n⚠ **Note**: This is informational guidance, not legal advice. Consult qualified immigration counsel for specific situations.`
    }
    if (lower.includes('reverif') || lower.includes('section 3')) {
      return `**I-9 Reverification Requirements**\n\nYou must complete I-9 reverification **before** an employee's work authorization expires — never after.\n\n**Process**:\n1. Complete **Supplement B** (formerly Section 3) — do NOT create a new I-9 for existing employees (unless hired before November 6, 1986)\n2. Employee presents a List A or List C document showing continued work authorization\n3. Record the document title, number, and new expiration date\n4. Sign and date Supplement B\n\n**Key Rules**:\n- You may request new documents up to **120 days before** expiration\n- You CANNOT require specific document types (employee chooses from List A/C)\n- Reverification is NOT required for U.S. citizens or permanent residents\n- OPT/STEM OPT and EAD cards always require reverification before expiry\n\n⚠ This is informational guidance, not legal advice.`
    }
    if (lower.includes('amendment') || lower.includes('new petition')) {
      return `**H-1B Amendment vs. New Petition**\n\nAn H-1B **amendment** is required when there is a "material change" in the terms and conditions of employment. A new petition is required for cap-subject situations.\n\n**Amendment Required When**:\n- Employee moves to a new work location **outside the commuting area** of the approved LCA location\n- Job title or duties change materially\n- Salary decreases below the LCA wage\n- Change from full-time to part-time (or vice versa)\n\n**No Amendment Needed When**:\n- Promotion with same duties at same location\n- Cost-of-living raise\n- Temporary short-term assignment (under USCIS guidance)\n\n**Important Post-*Simeio* Rule**: Under *Matter of Simeio Solutions*, a new LCA (and I-129 amendment) must be filed **before** the employee begins work at the new location.\n\nConsult your immigration attorney before any job change for H-1B employees. ⚠ Not legal advice.`
    }
    return `Thank you for your question. Based on applicable immigration regulations, here is guidance on your question:\n\n**"${text}"**\n\nThis falls under the jurisdiction of USCIS and/or DOL regulations. The key regulatory framework includes:\n\n- **INA § 214** (Admission of nonimmigrant aliens)\n- **8 CFR § 214.2** (Specific nonimmigrant categories)\n- **USCIS Policy Manual** (Volume 2 — Nonimmigrants)\n\nFor a specific analysis of your situation, I recommend:\n1. Reviewing the relevant USCIS policy manual chapter\n2. Consulting with your immigration attorney (${['Cohen & Associates', 'Fragomen LLP', 'Berry Appleman & Leiden'][Math.floor(Math.random() * 3)]})\n3. Checking the USCIS online case status for any pending petitions\n\n⚠ **Disclaimer**: This is informational guidance generated by an AI system, not legal advice. Always consult qualified immigration counsel for decisions affecting employee work authorization.`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Compliance Assistant</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by LangGraph multi-agent system · Claude API
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            All agents online
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 mb-4">
        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-700">
          AI-generated responses are for informational guidance only and do not constitute legal advice.
          Always consult qualified immigration counsel for decisions affecting employee work authorization.
        </p>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Suggested questions */}
      {messages.length <= 3 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs rounded-full border bg-background px-3 py-1.5 hover:bg-muted transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Ask any immigration compliance question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isTyping}
          className="flex-1"
        />
        <Button onClick={() => sendMessage()} disabled={isTyping || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Agent status badges */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(agentLabels).map(([key, label]) => (
          <Badge key={key} variant="outline" className="text-xs text-muted-foreground">
            {label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
