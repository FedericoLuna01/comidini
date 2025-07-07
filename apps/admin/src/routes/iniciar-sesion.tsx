import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'
import { LoginForm } from '@repo/ui/components/login-form'

export const Route = createFileRoute('/iniciar-sesion')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) return

    throw redirect({
      to: '/',
    })

  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoginForm callbackURL='/dashboard' />
    </div>
  )
}
