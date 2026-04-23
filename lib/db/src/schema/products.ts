import { pgTable, uuid, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  stock: integer("stock").notNull().default(0),
  priceBuy: numeric("price_buy", { precision: 10, scale: 2 }).notNull(),
  priceSell: numeric("price_sell", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof productsTable.$inferSelect;
