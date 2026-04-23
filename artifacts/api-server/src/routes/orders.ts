import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res) => {
  const rows = await db
    .select({
      id: ordersTable.id,
      productId: ordersTable.productId,
      productName: productsTable.name,
      coverImage: productsTable.coverImage,
      customerName: ordersTable.customerName,
      phone: ordersTable.phone,
      quantity: ordersTable.quantity,
      unitPrice: ordersTable.unitPrice,
      totalPrice: ordersTable.totalPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .innerJoin(productsTable, eq(productsTable.id, ordersTable.productId))
    .orderBy(desc(ordersTable.createdAt));

  res.json(
    rows.map((r) => ({
      ...r,
      unitPrice: Number(r.unitPrice),
      totalPrice: Number(r.totalPrice),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post("/orders", async (req, res) => {
  const body = CreateOrderBody.parse(req.body);
  const customerName = body.customerName.trim();
  const phone = body.phone.trim();
  if (!customerName || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }

  const result = await db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, body.productId))
      .limit(1);
    if (!product) return { error: "Product not found", status: 404 as const };
    if (product.stock < body.quantity)
      return { error: "Insufficient stock", status: 400 as const };

    const unitPrice = Number(product.priceSell);
    const totalPrice = unitPrice * body.quantity;

    const [order] = await tx
      .insert(ordersTable)
      .values({
        productId: body.productId,
        customerName,
        phone,
        quantity: body.quantity,
        unitPrice: unitPrice.toString(),
        totalPrice: totalPrice.toString(),
      })
      .returning();

    await tx
      .update(productsTable)
      .set({ stock: sql`${productsTable.stock} - ${body.quantity}` })
      .where(eq(productsTable.id, body.productId));

    return {
      order: {
        id: order.id,
        productId: order.productId,
        productName: product.name,
        coverImage: product.coverImage,
        customerName: order.customerName,
        phone: order.phone,
        quantity: order.quantity,
        unitPrice,
        totalPrice,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      },
    };
  });

  if ("error" in result) {
    res.status(result.status ?? 400).json({ error: result.error });
    return;
  }
  res.json(result.order);
});

router.patch("/orders/:id", async (req, res) => {
  const body = UpdateOrderBody.parse(req.body);
  const [updated] = await db
    .update(ordersTable)
    .set({ status: body.status })
    .where(eq(ordersTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, updated.productId))
    .limit(1);
  res.json({
    id: updated.id,
    productId: updated.productId,
    productName: product?.name ?? "",
    coverImage: product?.coverImage ?? null,
    customerName: updated.customerName,
    phone: updated.phone,
    quantity: updated.quantity,
    unitPrice: Number(updated.unitPrice),
    totalPrice: Number(updated.totalPrice),
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/orders/:id", async (req, res) => {
  await db.delete(ordersTable).where(eq(ordersTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
