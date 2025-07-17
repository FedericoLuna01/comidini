import { FormControl } from "@repo/ui/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"

export const displayRole: Record<string, string> = {
  user: "Usuario",
  admin: "Administrador",
  shop: "Tienda",
};

export const UserRoleSelect = ({
  onChange,
  value,
  ...props
}: {
  onChange: (value: string) => void;
  value: string;
  [key: string]: any;
}) => {
  return (
    <Select
      onValueChange={onChange}
      defaultValue={value}
      {...props}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona el rol del usuario" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">
          <div className="flex flex-col items-start">
            <span>{displayRole.user}</span>
            <span className="text-xs text-muted-foreground">Acceso básico a la plataforma</span>
          </div>
        </SelectItem>
        <SelectItem value="admin">
          <div className="flex flex-col items-start">
            <span>{displayRole.admin}</span>
            <span className="text-xs text-muted-foreground">Acceso completo al sistema</span>
          </div>
        </SelectItem>
        <SelectItem value="shop">
          <div className="flex flex-col items-start">
            <span>{displayRole.shop}</span>
            <span className="text-xs text-muted-foreground">Gestión de tienda y productos</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
