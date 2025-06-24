import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected_routes/usuarios/nuevo-usuario',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nuevo Usuario</h1>
      <p className="mb-4">
        Aquí puedes crear un nuevo usuario. Completa el formulario a continuación.
      </p>
      {/* Aquí iría el formulario para crear un nuevo usuario */}
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="username">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            className="border rounded w-full py-2 px-3"
            placeholder="Ingrese el nombre de usuario"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            className="border rounded w-full py-2 px-3"
            placeholder="Ingrese el correo electrónico"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Crear Usuario
        </button>
      </form>
    </div>
  )
}
