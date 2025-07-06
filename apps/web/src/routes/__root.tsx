import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from "@repo/ui/components/ui/button"
import { authClient } from '@repo/auth/client';

export const Route = createRootRoute({
  component: () => {
    const navigate = useNavigate()
    return (
      <>
        <div className="p-2 flex gap-2 items-center">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
          <Link to="/login" className="[&.active]:font-bold">
            Login
          </Link>
          <Link to="/register" className="[&.active]:font-bold">
            Register
          </Link>
          <Link to="/protected" className="[&.active]:font-bold">
            Protected
          </Link>
          <Button
            variant="link"
            className='text-red-700 hover:text-red-600'
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: '/login',
                      replace: true,
                    })
                  },
                }
              });
            }}
          >
            Sign Out
          </Button>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
      </>
    )
  },
})
