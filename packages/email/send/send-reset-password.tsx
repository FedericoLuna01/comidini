// biome-ignore lint/correctness/noUnusedImports: <>
import React from "react";
import ResetEmail from "../emails/reset-email";
import { resend } from "../index";

interface SendResetPasswordParams {
	email: string;
	url: string;
}

export async function sendResetPassword({
	email,
	url,
}: SendResetPasswordParams) {
	await resend.emails.send({
		from: "Acme <onboarding@resend.dev>",
		to: email,
		subject: "Restablecer contraseña",
		react: <ResetEmail url={url} />,
	});
}
