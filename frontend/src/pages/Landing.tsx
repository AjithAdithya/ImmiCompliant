import { Link } from 'react-router-dom'
import {
  Shield, Globe, AlertTriangle, BarChart3, FileText,
  MessageSquare, CheckCircle, ArrowRight, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Shield,
    title: 'I-9 Audit Readiness',
    desc: 'Automated validation, error detection, and mock audit simulation. Be ready for ICE in minutes.',
  },
  {
    icon: Globe,
    title: 'Visa & Case Tracking',
    desc: 'Track all visa types — H-1B, L-1, TN, OPT, Green Card — with USCIS API integration.',
  },
  {
    icon: AlertTriangle,
    title: 'Proactive Deadline Alerts',
    desc: 'Never miss a deadline. Multi-channel alerts for expirations, LCA posting, and PAF deadlines.',
  },
  {
    icon: FileText,
    title: 'PAF Management',
    desc: 'Public Access File creation, completeness scoring, and one-click audit export.',
  },
  {
    icon: BarChart3,
    title: 'Risk Assessment',
    desc: 'Real-time compliance score with per-employee risk profiles and prioritized remediation.',
  },
  {
    icon: MessageSquare,
    title: 'AI Compliance Assistant',
    desc: 'Ask immigration questions in plain English. Get cited answers powered by LangGraph agents.',
  },
]

const stats = [
  { value: '10×', label: 'ICE audit increase in 2025' },
  { value: '$28K', label: 'Max penalty per violation' },
  { value: '94%', label: 'I-9 error rate at audited SMBs' },
  { value: '<1 day', label: 'PAF production time required' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">ImmiCompliant</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Get Started <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-6">
          <Zap className="h-3 w-3" />
          Powered by LangGraph AI Agents
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Immigration Compliance<br />
          <span className="text-blue-600">Built for SMBs</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Replace spreadsheets and calendar reminders with an intelligent compliance platform.
          Stay audit-ready, track every visa, and get AI-powered guidance — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              View Demo Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">Schedule a Demo</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center text-white">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything you need to stay compliant</h2>
          <p className="text-gray-500">One platform. Zero spreadsheets. Full audit readiness.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 mb-4">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* LangGraph section */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-blue-400 text-sm font-medium mb-3">Powered by LangGraph</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Multi-Agent AI Orchestration
              </h2>
              <p className="text-slate-400 mb-6">
                ImmiCompliant uses LangGraph to coordinate specialized AI agents that work together to analyze your compliance posture, answer questions with citations, and monitor regulatory changes — all with human-in-the-loop oversight for critical decisions.
              </p>
              <ul className="space-y-3">
                {[
                  'Document Analysis Agent — validates I-9s and LCAs',
                  'Q&A Agent — RAG over 8 CFR, INA, USCIS Policy Manual',
                  'Risk Assessment Agent — calculates compliance scores',
                  'Policy Monitoring Agent — tracks USCIS/DOL updates',
                  'Case Tracking Agent — polls USCIS case status API',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 font-mono text-xs text-slate-300 leading-relaxed">
              <div className="text-slate-500 mb-2"># LangGraph compliance graph</div>
              <div className="text-blue-400">builder <span className="text-white">= StateGraph(ComplianceState)</span></div>
              <div className="mt-2 text-green-400">builder.add_node<span className="text-white">("supervisor", supervisor_node)</span></div>
              <div className="text-green-400">builder.add_node<span className="text-white">("qa_agent", qa_node)</span></div>
              <div className="text-green-400">builder.add_node<span className="text-white">("risk_agent", risk_node)</span></div>
              <div className="text-green-400">builder.add_node<span className="text-white">("doc_agent", document_node)</span></div>
              <div className="mt-2 text-yellow-400">builder.add_conditional_edges<span className="text-white">(</span></div>
              <div className="pl-4 text-white">"supervisor", route_to_agent,</div>
              <div className="pl-4 text-white">&#123;"qa_agent", "risk_agent", "doc_agent"&#125;</div>
              <div className="text-white">)</div>
              <div className="mt-2 text-purple-400">graph <span className="text-white">= builder.compile(</span></div>
              <div className="pl-4 text-white">checkpointer=PostgresSaver</div>
              <div className="text-white">)</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get compliant?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Join hundreds of SMBs that trust ImmiCompliant to manage their immigration compliance.
        </p>
        <Link to="/dashboard">
          <Button size="lg" className="gap-2">
            Try the Demo <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>© 2026 ImmiCompliant. Not legal advice.</span>
          <span>Built with LangGraph + Claude</span>
        </div>
      </footer>
    </div>
  )
}
