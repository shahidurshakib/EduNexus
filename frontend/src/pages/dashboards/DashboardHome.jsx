import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../api/dashboard'
import Loader from '../../components/ui/Loader'
import ErrorBanner from '../../components/ui/ErrorBanner'
import FounderAdminDashboard from './FounderAdminDashboard'
import MentorDashboard from './MentorDashboard'
import InvestorDashboard from './InvestorDashboard'
import MemberDashboard from './MemberDashboard'

export default function DashboardHome() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorBanner message={error} />
  if (!data) return <Loader label="Loading dashboard" />

  if (user.role === 'platform_founder') return <FounderAdminDashboard data={data} isFounder />
  if (user.role === 'admin') return <FounderAdminDashboard data={data} />
  if (user.role === 'mentor') return <MentorDashboard data={data} />
  if (user.role === 'investor') return <InvestorDashboard data={data} />
  return <MemberDashboard data={data} />
}
