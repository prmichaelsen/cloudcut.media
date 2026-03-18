import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'
import { AuthForm } from '../components/AuthForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && user) {
    navigate({ to: '/editor' })
    return null
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <AuthForm onSuccess={() => navigate({ to: '/editor' })} />
    </div>
  )
}
