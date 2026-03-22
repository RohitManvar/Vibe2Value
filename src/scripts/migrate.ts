import { migrate } from "../db/migrate.js";
import { closePool } from "../db/connection.js";

migrate()
  .then(() => closePool())
  .catch((err) => {
    console.error("💥 Migration failed:", err);
    process.exit(1);
  });
