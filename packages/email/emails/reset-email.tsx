import { Button, Container, Html, Tailwind } from "@react-email/components";
// biome-ignore lint/style/useImportType: <>
import React from "react";

interface ResetEmailProps {
	url: string;
}

export const ResetEmail: React.FC<ResetEmailProps> = ({ url }) => {
	return (
		<Html>
			<Tailwind>
				<Container className="max-w-md p-6 bg-white rounded-lg shadow-md flex items-center justify-center">
					<Button href={url} className="px-4 py-2 bg-cyan-400 rounded-md">
						Restablecer contraseña
					</Button>
				</Container>
			</Tailwind>
		</Html>
	);
};

export default ResetEmail;
