import { authClient } from '@repo/auth/client';
import { DataTable } from '@repo/ui/components/ui/data-table';
import { Heading, HeadingDescription, HeadingTitle } from '@repo/ui/components/ui/heading';
import { Separator } from '@repo/ui/components/ui/separator';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/dashboard/tiendas/')({
  beforeLoad: async ({ context }) => {
    // TODO: Mover esto a otro lado y user react-query
    const dataUsers = await authClient.admin.listUsers({
      query: {
        limit: 10,
        filterField: "role",
        filterOperator: "eq",
        filterValue: "shop"
      },
    });

    return { dataUsers }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="">
      <Heading>
        <HeadingTitle>
          Tiendas
        </HeadingTitle>
        <HeadingDescription>
          Aquí puedes gestionar las tiendas.
        </HeadingDescription>
        <Separator />
      </Heading>
      {/* <DataTable /> */}
    </div>
  );
}
