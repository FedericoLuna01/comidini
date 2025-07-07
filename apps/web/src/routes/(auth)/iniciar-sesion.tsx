import { LoginForm } from '@repo/ui/components/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/iniciar-sesion')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoginForm callbackURL='/' />
    </div>
  )
}
