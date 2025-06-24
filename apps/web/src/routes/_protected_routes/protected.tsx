import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected_routes/protected')({
  component: ProtectedPage,
})

function ProtectedPage() {
  return (
    <div className="p-2">
      Protected route
    </div>
  )
}