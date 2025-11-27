import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { GoogleIcon } from "@repo/ui/components/icons/index";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "@repo/ui/components/ui/sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const Route = createFileRoute("/(auth)/registrarse")({
	component: RegisterPage,
});

const formSchema = z
	.object({
		name: z.string().min(2, {
			message: "El nombre debe tener al menos 2 caracteres",
		}),
		email: z.string().email({
			message: "No es un correo electrónico válido",
		}),
		password: z
			.string()
			.min(6, {
				message: "La contraseña debe tener al menos 6 caracteres",
			})
			.max(100, {
				message: "La contraseña no puede tener más de 100 caracteres",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleLoginWithGoogle = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "http://localhost:5174/",
		});
	};

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		const { name, email, password } = values;
		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name,
			image: "",
		});

		if (error && error.code === "USER_ALREADY_EXISTS") {
			form.setError("email", {
				type: "manual",
				message: "Ya existe una cuenta con este correo electrónico",
			});
			return;
		}

		if (error) {
			toast.error("Error al registrarse. Por favor, inténtalo de nuevo.");
			console.error("Registration error:", error);
			return;
		}

		toast.success("Registro exitoso. Por favor, inicia sesión.");
		console.log("Registration successful:", data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Registrarse</CardTitle>
					<CardDescription>
						Ingresa tus datos para crear una cuenta
					</CardDescription>
					<CardAction>
						<Button variant="link" asChild>
							<Link to="/iniciar-sesion">Iniciar sesión</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre</FormLabel>
										<FormControl>
											<Input placeholder="Juan Perez" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="juan@gmail.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contraseña</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Repetir contraseña</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showConfirmPassword ? "text" : "password"}
													placeholder="••••••••"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
												>
													{showConfirmPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="mt-6 flex flex-col gap-4">
								<Button type="submit" className="w-full">
									Registrarse
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleLoginWithGoogle}
								>
									<GoogleIcon />
									Ingresar con Google
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
