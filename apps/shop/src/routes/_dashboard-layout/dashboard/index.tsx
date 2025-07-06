import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/dashboard/')({
  component: RouteComponent,
  errorComponent: () => <div>Error loading dashboard</div>,
})

function RouteComponent() {
  // const { data, error, isPending } = useQuery({
  //   queryKey: ['dashboard'],
  //   queryFn: async () => {
  //     const response = await fetch('http://localhost:3001/api/shops/status', {
  //       credentials: 'include',
  //     })
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch dashboard data')
  //     }
  //     return response.json()
  //   },
  // })

  return (
    <div>
      Dashboard
    </div>
  )
}
