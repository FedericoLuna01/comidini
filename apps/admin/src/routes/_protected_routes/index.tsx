import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected_routes/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h3>Inicio</h3>
    </div>
  )
}