import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/ui/form'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { toast } from '@repo/ui/components/ui/sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from '@repo/ui/components/ui/spinner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createProductSchema, SelectProductCategory, type CreateProductSchema } from '@repo/db/src/types/product';
import { useForm } from 'react-hook-form'
import { SelectShop } from '@repo/db/src/types/shop'
import { ProductCategorySelect } from './product-category-select'
import { AlertCircleIcon, Dice3Icon, ImageIcon, UploadIcon, XIcon } from 'lucide-react'
import { useFileUpload } from '../../../../../hooks/use-file-upload'

export const NewProductForm = ({ shop }: { shop: SelectShop | undefined }) => {
  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      sku: "",
      quantity: 0,
      lowStockThreshold: 0,
      images: [],
      isActive: true,
      tags: [],
      sortOrder: 0,
      isFeatured: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (product: CreateProductSchema) => {
      // TODO: Implement product creation
      console.log(product);
    },
  })

  const { data: productCategories, isLoading } = useQuery({
    queryKey: ['productCategories', shop?.id],
    queryFn: async (): Promise<SelectProductCategory[]> => {
      if (!shop?.id) return [];
      const response = await fetch(`http://localhost:3001/api/shops/${shop.id}/category`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  })

  async function onSubmit(values: CreateProductSchema) {
    mutation.mutate(values)

    if (mutation.isError) {
      return toast.error("Error al crear el producto");
    }

    mutation.isSuccess && toast.success("Producto creado exitosamente");
    form.reset();
  }

  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
  const maxFiles = 6

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg",
    maxSize,
    multiple: true,
    maxFiles,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 "
      >
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Pizza Margherita" {...field} disabled={mutation.isPending} />
                </FormControl>
                <FormDescription>
                  El nombre del producto debe tener entre 1 y 100 caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Una deliciosa pizza..." {...field} disabled={mutation.isPending} />
                </FormControl>
                <FormDescription>
                  La descripción debe tener máximo 100 caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  El precio debe ser mayor a 0.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <ProductCategorySelect
                    productCategories={productCategories ?? []}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={mutation.isPending || isLoading}
                    shopId={shop?.id}
                  />
                </FormControl>
                <FormDescription>
                  Selecciona la categoría del producto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input placeholder="PIZZA-001" {...field} disabled={mutation.isPending} />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-[2px] top-[2px] p-1 h-8 w-8"
                      onClick={() => {
                        if (form.watch('name').length === 0) {
                          toast.error("El nombre del producto es requerido para generar el SKU")
                          return
                        }
                        field.onChange(`${form.watch('name').split(" ").join("-")}-${Math.floor(Math.random() * 1000)}`)
                      }}
                      disabled={mutation.isPending}
                    >
                      <Dice3Icon className='size-4' />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  El SKU es un identificador único. Podés generarlo automáticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Cantidad de productos disponibles.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alerta de stock bajo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Recibirás una alerta cuando el stock esté por debajo de este número.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem
                className='flex items-start p-4 border rounded-md'
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <div className='grid gap-2'>
                  <FormLabel>Activo</FormLabel>
                  <FormDescription>
                    Indica si el producto está activo y disponible para la venta.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2 col-start-1">
            {/* Drop area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              data-files={files.length > 0 || undefined}
              className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
            >
              <input
                {...getInputProps()}
                className="sr-only"
                aria-label="Upload image file"
              />
              {files.length > 0 ? (
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-medium">
                      Imágenes subidas ({files.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openFileDialog}
                      disabled={files.length >= maxFiles}
                      type='button'
                    >
                      <UploadIcon
                        className="-ms-0.5 size-3.5 opacity-60"
                        aria-hidden="true"
                      />
                      Seleccionar más
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-accent relative aspect-square rounded-md"
                      >
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="size-full rounded-[inherit] object-cover"
                        />
                        <Button
                          onClick={() => removeFile(file.id)}
                          size="icon"
                          className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                          aria-label="Remove image"
                        >
                          <XIcon className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                  <div
                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <ImageIcon className="size-4 opacity-60" />
                  </div>
                  <p className="mb-1.5 text-sm font-medium">
                    Arrastra y suelta imágenes aquí
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PNG, JPG o WEBP (max. {maxSizeMB}MB)
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={openFileDialog}
                    type='button'
                  >
                    <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                    Seleccionar imágenes
                  </Button>
                </div>
              )}
            </div>

            {errors.length > 0 && (
              <div
                className="text-destructive flex items-center gap-1 text-xs"
                role="alert"
              >
                <AlertCircleIcon className="size-3 shrink-0" />
                <span>{errors[0]}</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="col-span-1 col-start-1"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Spinner />
                Creando producto...
              </>
            ) : (
              "Crear Producto"
            )}
          </Button>
        </div>
      </form>
    </Form >
  )
}
