import { authClient } from '@repo/auth/client'
import { Button } from '@repo/ui/components/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log("Registering with:", { email, password })
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: "test",
      image: "https://example.com/image.png",
      allowedApps: ["web"]
    });

    if (error) {
      console.error("Registration error:", error);
      return;
    }

    console.log("Registration successful:", data);

  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>
            Register for an account
          </CardTitle>
          <CardDescription>
            Enter your email below to create a new account
          </CardDescription>
          <CardAction>
            <Button variant="link">Sign In</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="name">Nombre</Label>
                </div>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Juan Perez"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className='mt-6 flex flex-col gap-4'>
              <Button type="submit" className="w-full">
                Register
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
