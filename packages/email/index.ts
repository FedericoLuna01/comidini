import dotenv from "dotenv";
import { Resend } from "resend";

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: "../../.env" });

export const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: (null as unknown as Resend);
