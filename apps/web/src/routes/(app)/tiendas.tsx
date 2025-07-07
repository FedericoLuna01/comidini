import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/tiendas')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/tiendas"!</div>
}
