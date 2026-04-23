import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    coverImage: p.coverImage,
    stock: p.stock,
    priceBuy: Number(p.priceBuy),
    priceSell: Number(p.priceSell),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (_req, res) => {
  const rows = await db.select().from(productsTable).orderBy(productsTable.name);
  res.json(rows.map(serialize));
});

router.post("/products", async (req, res) => {
  const body = CreateProductBody.parse(req.body);
  const [created] = await db
    .insert(productsTable)
    .values({
      name: body.name,
      description: body.description ?? null,
      coverImage: body.coverImage ?? null,
      stock: body.stock,
      priceBuy: body.priceBuy.toString(),
      priceSell: body.priceSell.toString(),
    })
    .returning();
  res.json(serialize(created));
});

router.patch("/products/:id", async (req, res) => {
  const { id } = UpdateProductParams.parse(req.params);
  const body = UpdateProductBody.parse(req.body);
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
  if (body.stock !== undefined) updates.stock = body.stock;
  if (body.priceBuy !== undefined) updates.priceBuy = body.priceBuy.toString();
  if (body.priceSell !== undefined) updates.priceSell = body.priceSell.toString();

  const [updated] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(updated));
});

router.delete("/products/:id", async (req, res) => {
  const { id } = DeleteProductParams.parse(req.params);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ ok: true });
});

export default router;
