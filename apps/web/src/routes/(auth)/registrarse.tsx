import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { GoogleIcon } from "@repo/ui/components/icons/index";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@repo/ui/components/ui/alert";
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
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircleIcon, Eye, EyeOff, Loader2 } from "lucide-react";
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
			.min(8, {
				message: "La contraseña debe tener al menos 8 caracteres",
			})
			.max(128, {
				message: "La contraseña no puede tener más de 128 caracteres",
			})
			.regex(/[A-Z]/, {
				message: "La contraseña debe contener al menos una letra mayúscula",
			})
			.regex(/[a-z]/, {
				message: "La contraseña debe contener al menos una letra minúscula",
			})
			.regex(/[0-9]/, {
				message: "La contraseña debe contener al menos un número",
			})
			.regex(/[^A-Za-z0-9]/, {
				message: "La contraseña debe contener al menos un carácter especial",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

const REGISTER_ERROR_MESSAGES: Record<
	string,
	{ title: string; description: string }
> = {
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
		title: "Cuenta existente",
		description: "Ya existe una cuenta con este correo electrónico.",
	},
	TOO_MANY_REQUESTS: {
		title: "Demasiados intentos",
		description:
			"Has realizado demasiados intentos. Por favor, espera un momento antes de intentar de nuevo.",
	},
	FAILED_TO_CREATE_USER: {
		title: "Error al crear cuenta",
		description: "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
	},
	PASSWORD_TOO_SHORT: {
		title: "Contraseña muy corta",
		description: "La contraseña debe tener al menos 7 caracteres.",
	},
	PASSWORD_TOO_LONG: {
		title: "Contraseña muy larga",
		description: "La contraseña no puede tener más de 100 caracteres.",
	},
	INVALID_EMAIL: {
		title: "Email inválido",
		description: "El correo electrónico ingresado no es válido.",
	},
};

const DEFAULT_REGISTER_ERROR = {
	title: "Error al registrarse",
	description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
};

function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<{
		title: string;
		description: string;
	} | null>(null);

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

	const registerMutation = useMutation({
		mutationFn: async (values: z.infer<typeof formSchema>) => {
			const { name, email, password } = values;
			const { data, error: signUpError } = await authClient.signUp.email({
				email,
				password,
				name,
				image: "",
			});

			if (signUpError) {
				const code = signUpError.code;
				const mapped = code ? REGISTER_ERROR_MESSAGES[code] : undefined;
				setError(mapped ?? DEFAULT_REGISTER_ERROR);

				if (code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
					form.setError("email", {
						type: "manual",
						message: "Ya existe una cuenta con este correo electrónico",
					});
				}
				return;
			}

			toast.success("Registro exitoso. Por favor, inicia sesión.");
			console.log("Registration successful:", data);
		},
	});

	const handleSubmit = (values: z.infer<typeof formSchema>) => {
		setError(null);
		registerMutation.mutate(values);
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
											<Input
												placeholder="Juan Perez"
												disabled={registerMutation.isPending}
												{...field}
											/>
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
												disabled={registerMutation.isPending}
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
													disabled={registerMutation.isPending}
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowPassword(!showPassword)}
													disabled={registerMutation.isPending}
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
													disabled={registerMutation.isPending}
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
													disabled={registerMutation.isPending}
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
								{error && (
									<Alert variant="destructive">
										<AlertCircleIcon />
										<AlertTitle>{error.title}</AlertTitle>
										<AlertDescription>
											<p>{error.description}</p>
										</AlertDescription>
									</Alert>
								)}
								<Button
									type="submit"
									className="w-full"
									disabled={registerMutation.isPending}
								>
									{registerMutation.isPending && (
										<Loader2 className="h-4 w-4 animate-spin" />
									)}
									Registrarse
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleLoginWithGoogle}
									disabled={registerMutation.isPending}
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
