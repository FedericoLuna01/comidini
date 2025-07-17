import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingDescription, HeadingSeparator, HeadingTitle } from '@repo/ui/components/ui/heading'
import { z } from "zod/v4"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/ui/form"
import { Input } from "@repo/ui/components/ui/input"
import { Button } from "@repo/ui/components/ui/button"
import { Switch } from "@repo/ui/components/ui/switch"
import { ClockIcon } from "lucide-react"
import { useMutation, useQuery } from '@tanstack/react-query'
import { getShopHours, updateShopHours } from '../../../../api/shop'
import { useEffect } from 'react'
import { toast } from '@repo/ui/components/ui/sonner'

export const Route = createFileRoute('/_dashboard-layout/dashboard/horarios/')({
  component: RouteComponent,
})

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const businessHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean(),
})

function RouteComponent() {

  const { data, isLoading } = useQuery({
    queryFn: getShopHours,
    queryKey: ['shopHours'],
  })

  const form = useForm({
    resolver: zodResolver(z.object({
      businessHours: z.array(businessHoursSchema)
    })),
    defaultValues: {
      businessHours: data
    }
  })

  useEffect(() => {
    if (data) {
      form.reset({
        businessHours: data
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof businessHoursSchema>[]) => updateShopHours(data),
    onSuccess: () => {
      return toast.success("Horarios actualizados exitosamente")
    }
  })

  const onSubmit = async (data: { businessHours: Array<z.infer<typeof businessHoursSchema>> }) => {
    mutation.mutate(data.businessHours)

  }

  return (
    <div className="space-y-6">
      <Heading>
        <HeadingTitle>
          Horarios
        </HeadingTitle>
        <HeadingDescription>
          Administra los horarios de tu tienda
        </HeadingDescription>
        <HeadingSeparator />
      </Heading>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Horarios de Negocio
              </CardTitle>
              <CardDescription>
                Configura los horarios de apertura y cierre para cada día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <p className="w-28 font-medium">{day}</p>
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.isClosed`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={!field.value}
                              onCheckedChange={(checked) => field.onChange(!checked)}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">{field.value ? "Cerrado" : "Abierto"}</FormLabel>
                        </FormItem>
                      )}
                    />
                    {!form.watch(`businessHours.${index}.isClosed`) && (
                      <>
                        <FormField
                          control={form.control}
                          name={`businessHours.${index}.openTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" className="w-32" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <span className="text-sm text-gray-500">a</span>

                        <FormField
                          control={form.control}
                          name={`businessHours.${index}.closeTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" className="w-32" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || mutation.isPending}
            >
              {mutation.isPending ? "Guardando..." : "Guardar Horarios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
