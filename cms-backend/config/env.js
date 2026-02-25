import { config } from "dotenv";

const envPath = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envPath });

const {
	PORT,
	NODE_ENV,
	DB_URI,
	JWT_SECRET,
	JWT_EXPIRES_IN,
	JWT_EXPIRE,
	JWT_COOKIE_NAME,
	ALLOWED_ORIGINS,
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
} = process.env;

// Normalize JWT expiry env var: prefer JWT_EXPIRES_IN but fall back to JWT_EXPIRE
const JWT_EXPIRES = JWT_EXPIRES_IN || JWT_EXPIRE;

export {
	PORT,
	NODE_ENV,
	DB_URI,
	JWT_SECRET,
	JWT_EXPIRES as JWT_EXPIRE,
	JWT_COOKIE_NAME,
	ALLOWED_ORIGINS,
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
};
