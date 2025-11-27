import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: "../../../../.env" });

export interface R2Config {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucketName: string;
	publicUrl: string;
}

export const r2Config: R2Config = {
	accountId: process.env.R2_ACCOUNT_ID || "",
	accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
	secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	bucketName: process.env.R2_BUCKET_NAME || "",
	publicUrl: process.env.R2_PUBLIC_URL || "",
};

export const r2Client = new S3Client({
	region: "auto",
	endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: r2Config.accessKeyId,
		secretAccessKey: r2Config.secretAccessKey,
	},
});

export const validateR2Config = (): boolean => {
	const isValid = !!(
		r2Config.accountId &&
		r2Config.accessKeyId &&
		r2Config.secretAccessKey &&
		r2Config.bucketName &&
		r2Config.publicUrl
	);

	if (!isValid) {
		console.warn(
			"R2 configuration is incomplete. Please check your environment variables:",
		);
		console.warn("- R2_ACCOUNT_ID:", r2Config.accountId ? "✓" : "✗");
		console.warn("- R2_ACCESS_KEY_ID:", r2Config.accessKeyId ? "✓" : "✗");
		console.warn(
			"- R2_SECRET_ACCESS_KEY:",
			r2Config.secretAccessKey ? "✓" : "✗",
		);
		console.warn("- R2_BUCKET_NAME:", r2Config.bucketName ? "✓" : "✗");
		console.warn("- R2_PUBLIC_URL:", r2Config.publicUrl ? "✓" : "✗");
	} else {
		console.log("R2 configuration is valid ✓");
	}

	return isValid;
};
