import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client.js";
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
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { GoogleIcon } from "./icons/index.js";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.js";

const LOGIN_ERROR_MESSAGES: Record<
	string,
	{ title: string; description: string }
> = {
	INVALID_EMAIL_OR_PASSWORD: {
		title: "Credenciales incorrectas",
		description: "El correo electrónico o la contraseña son incorrectos.",
	},
	BANNED_USER: {
		title: "Cuenta suspendida",
		description:
			"Tu cuenta ha sido suspendida. Si crees que esto es un error, por favor contacta al soporte.",
	},
	EMAIL_NOT_VERIFIED: {
		title: "Email no verificado",
		description:
			"Tu correo electrónico no ha sido verificado. Revisa tu bandeja de entrada.",
	},
	TOO_MANY_REQUESTS: {
		title: "Demasiados intentos",
		description:
			"Has realizado demasiados intentos. Por favor, espera un momento antes de intentar de nuevo.",
	},
	CREDENTIAL_ACCOUNT_NOT_FOUND: {
		title: "Cuenta no encontrada",
		description:
			"No se encontró una cuenta con credenciales. Intenta iniciar sesión con Google.",
	},
	SOCIAL_ACCOUNT_ALREADY_LINKED: {
		title: "Cuenta ya vinculada",
		description: "Esta cuenta social ya está vinculada a otro usuario.",
	},
	SESSION_EXPIRED: {
		title: "Sesión expirada",
		description: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
	},
};

const DEFAULT_LOGIN_ERROR = {
	title: "Error al iniciar sesión",
	description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
};

const formSchema = z.object({
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
		}),
});

export const LoginForm = ({ callbackURL }: { callbackURL: string }) => {
	const [error, setError] = useState<{
		title: string;
		description: string;
	} | null>(null);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleLoginWithGoogle = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL,
		});
	};

	const loginMutation = useMutation({
		mutationFn: async (values: z.infer<typeof formSchema>) => {
			const { email, password } = values;
			await authClient.signIn.email(
				{
					email,
					password,
					callbackURL,
				},
				{
					onSuccess(context) {
						console.log("Login successful:", context);
					},
					onError(context) {
						const code = context.error.code;
						const errorInfo = LOGIN_ERROR_MESSAGES[code] ?? DEFAULT_LOGIN_ERROR;
						setError(errorInfo);

						if (code === "INVALID_EMAIL_OR_PASSWORD") {
							form.setError("email", {
								type: "manual",
								message: "Correo electrónico o contraseña incorrectos.",
							});
						}
					},
				},
			);
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		setError(null);
		loginMutation.mutate(values);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Iniciar sesión en tu cuenta</CardTitle>
				<CardDescription>
					Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.
				</CardDescription>
				<CardAction>
					<Button variant="link" asChild>
						<a href="/registrarse">Registrarse</a>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder="juan@gmail.com"
											disabled={loginMutation.isPending}
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
									<div className="flex items-center justify-between">
										<FormLabel>Contraseña</FormLabel>
										<Button
											variant="link"
											asChild
											className="p-0 h-auto text-xs"
										>
											<a href="/olvide-contrasena">¿Olvidaste tu contraseña?</a>
										</Button>
									</div>
									<FormControl>
										<Input
											type="password"
											placeholder="********"
											disabled={loginMutation.isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="text-right"></div>
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
							disabled={loginMutation.isPending}
						>
							{loginMutation.isPending && (
								<Loader2 className="h-4 w-4 animate-spin" />
							)}
							Iniciar sesión
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handleLoginWithGoogle}
							disabled={loginMutation.isPending}
						>
							<GoogleIcon />
							Ingresar con Google
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
