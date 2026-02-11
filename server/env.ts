import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (one level up from /server)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Fallback to default dotenv resolution (process.cwd())
dotenv.config();
