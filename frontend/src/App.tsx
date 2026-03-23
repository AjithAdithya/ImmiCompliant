import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Employees from '@/pages/Employees'
import EmployeeDetail from '@/pages/EmployeeDetail'
import Cases from '@/pages/Cases'
import Compliance from '@/pages/Compliance'
import I9Audit from '@/pages/I9Audit'
import Documents from '@/pages/Documents'
import PAF from '@/pages/PAF'
import Policies from '@/pages/Policies'
import Reports from '@/pages/Reports'
import Assistant from '@/pages/Assistant'

// Simple mock auth — replace with real auth context
const isAuthenticated = true

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="cases" element={<Cases />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="compliance/i9-audit" element={<I9Audit />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/paf" element={<PAF />} />
          <Route path="policies" element={<Policies />} />
          <Route path="reports" element={<Reports />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
