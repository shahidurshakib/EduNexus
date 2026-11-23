import { Routes, Route } from 'react-router-dom'

import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/public/Landing'
import About from './pages/public/About'
import Vision from './pages/public/Vision'
import Mission from './pages/public/Mission'
import Contact from './pages/public/Contact'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import StartupList from './pages/startups/StartupList'
import StartupDetail from './pages/startups/StartupDetail'
import StartupForm from './pages/startups/StartupForm'

import ResearchList from './pages/research/ResearchList'
import ResearchDetail from './pages/research/ResearchDetail'
import ResearchForm from './pages/research/ResearchForm'

import Mentors from './pages/directory/Mentors'
import Investors from './pages/directory/Investors'
import Members from './pages/directory/Members'

import DashboardHome from './pages/dashboards/DashboardHome'
import Requests from './pages/dashboards/Requests'
import AdminUsers from './pages/admin/AdminUsers'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminFunding from './pages/admin/AdminFunding'
import AdminReports from './pages/admin/AdminReports'
import AdminLogs from './pages/admin/AdminLogs'

import Profile from './pages/misc/Profile'
import Notifications from './pages/misc/Notifications'
import SearchResults from './pages/misc/SearchResults'
import NotFound from './pages/misc/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/vision" element={<Vision />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/startups" element={<StartupList />} />
        <Route path="/startups/:id" element={<StartupDetail />} />
        <Route path="/research" element={<ResearchList />} />
        <Route path="/research/:id" element={<ResearchDetail />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/members" element={<Members />} />
        <Route path="/search" element={<SearchResults />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Authenticated dashboards — role gating happens inside DashboardLayout's nav
          and individual admin-only routes below via ProtectedRoute roles. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/startups" element={<StartupList />} />
          <Route path="/dashboard/startups/new" element={<StartupForm />} />
          <Route path="/dashboard/startups/:id/edit" element={<StartupForm />} />
          <Route path="/dashboard/research" element={<ResearchList />} />
          <Route path="/dashboard/research/new" element={<ResearchForm />} />
          <Route path="/dashboard/research/:id/edit" element={<ResearchForm />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/requests" element={<Requests />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />

          <Route element={<ProtectedRoute roles={['admin', 'platform_founder']} />}>
            <Route path="/dashboard/admin/users" element={<AdminUsers />} />
            <Route path="/dashboard/admin/approvals" element={<AdminApprovals />} />
            <Route path="/dashboard/admin/funding" element={<AdminFunding />} />
            <Route path="/dashboard/admin/reports" element={<AdminReports />} />
            <Route path="/dashboard/admin/logs" element={<AdminLogs />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
