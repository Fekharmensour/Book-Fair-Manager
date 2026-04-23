import { Router, type IRouter } from "express";
import { db, salesTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { CreateSaleBody, ListSalesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sales", async (req, res) => {
  const { userId } = ListSalesQueryParams.parse(req.query);

  const baseQuery = db
    .select({
      id: salesTable.id,
      productId: salesTable.productId,
      productName: productsTable.name,
      userId: salesTable.userId,
      username: usersTable.username,
      quantity: salesTable.quantity,
      unitPrice: salesTable.unitPrice,
      totalPrice: salesTable.totalPrice,
      buyerName: salesTable.buyerName,
      createdAt: salesTable.createdAt,
    })
    .from(salesTable)
    .innerJoin(productsTable, eq(productsTable.id, salesTable.productId))
    .innerJoin(usersTable, eq(usersTable.id, salesTable.userId))
    .orderBy(desc(salesTable.createdAt));

  const rows = userId
    ? await baseQuery.where(eq(salesTable.userId, userId))
    : await baseQuery;

  res.json(
    rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      userId: r.userId,
      username: r.username,
      quantity: r.quantity,
      unitPrice: Number(r.unitPrice),
      totalPrice: Number(r.totalPrice),
      buyerName: r.buyerName,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post("/sales", async (req, res) => {
  const body = CreateSaleBody.parse(req.body);

  const result = await db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, body.productId))
      .limit(1);
    if (!product) {
      return { error: "Product not found", status: 404 as const };
    }
    if (product.stock < body.quantity) {
      return { error: "Insufficient stock", status: 400 as const };
    }
    const [user] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, body.userId))
      .limit(1);
    if (!user) {
      return { error: "User not found", status: 404 as const };
    }

    const unitPrice = Number(product.priceSell);
    const totalPrice = unitPrice * body.quantity;

    const [sale] = await tx
      .insert(salesTable)
      .values({
        productId: body.productId,
        userId: body.userId,
        quantity: body.quantity,
        unitPrice: unitPrice.toString(),
        totalPrice: totalPrice.toString(),
        buyerName: body.buyerName ?? null,
      })
      .returning();

    await tx
      .update(productsTable)
      .set({ stock: sql`${productsTable.stock} - ${body.quantity}` })
      .where(eq(productsTable.id, body.productId));

    return {
      sale: {
        id: sale.id,
        productId: sale.productId,
        productName: product.name,
        userId: sale.userId,
        username: user.username,
        quantity: sale.quantity,
        unitPrice,
        totalPrice,
        buyerName: sale.buyerName,
        createdAt: sale.createdAt.toISOString(),
      },
    };
  });

  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result.sale);
});

export default router;
