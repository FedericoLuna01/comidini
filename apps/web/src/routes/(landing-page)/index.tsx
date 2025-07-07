import { createFileRoute } from '@tanstack/react-router'
import { Header } from './-components/header'

export const Route = createFileRoute('/(landing-page)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header />
    </>
  )
}
