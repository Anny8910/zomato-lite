import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

function loadEnvKey(key) {
  const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const match = envFile.match(new RegExp(`^${key}="?([^"\n]+)"?`, "m"));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1];
}

const sql = neon(process.env.DATABASE_URL ?? loadEnvKey("DATABASE_URL"));

console.log("Applying schema and seed...");

await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants`;
const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews`;

console.log("\n--- restaurants ---");
console.table(restaurants);

console.log("\n--- reviews ---");
console.table(
  reviews.map((r) => ({
    id: r.id,
    restaurant_id: r.restaurant_id,
    rating: r.rating,
    comment: r.comment,
    created_at: new Date(r.created_at).toLocaleString("en-GB"),
  }))
);

console.log("\nDone.");