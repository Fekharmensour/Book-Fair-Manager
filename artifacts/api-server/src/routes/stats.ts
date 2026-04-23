import { Router, type IRouter } from "express";
import { db, salesTable, productsTable, usersTable } from "@workspace/db";
import { eq, sql, desc, lte } from "drizzle-orm";

const router: IRouter = Router();

const LOW_STOCK_THRESHOLD = 5;

router.get("/stats/summary", async (_req, res) => {
  const [totals] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${salesTable.totalPrice}), 0)`,
      totalUnits: sql<string>`COALESCE(SUM(${salesTable.quantity}), 0)`,
      totalSales: sql<string>`COUNT(*)`,
    })
    .from(salesTable);

  const [low] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(productsTable)
    .where(lte(productsTable.stock, LOW_STOCK_THRESHOLD));

  res.json({
    totalRevenue: Number(totals?.totalRevenue ?? 0),
    totalUnits: Number(totals?.totalUnits ?? 0),
    totalSales: Number(totals?.totalSales ?? 0),
    lowStockCount: Number(low?.count ?? 0),
  });
});

router.get("/stats/by-presenter", async (_req, res) => {
  const rows = await db
    .select({
      userId: usersTable.id,
      username: usersTable.username,
      totalRevenue: sql<string>`COALESCE(SUM(${salesTable.totalPrice}), 0)`,
      totalUnits: sql<string>`COALESCE(SUM(${salesTable.quantity}), 0)`,
      totalSales: sql<string>`COUNT(${salesTable.id})`,
    })
    .from(usersTable)
    .leftJoin(salesTable, eq(salesTable.userId, usersTable.id))
    .groupBy(usersTable.id, usersTable.username)
    .orderBy(desc(sql`COALESCE(SUM(${salesTable.totalPrice}), 0)`));

  res.json(
    rows.map((r) => ({
      userId: r.userId,
      username: r.username,
      totalRevenue: Number(r.totalRevenue),
      totalUnits: Number(r.totalUnits),
      totalSales: Number(r.totalSales),
    })),
  );
});

router.get("/stats/top-books", async (_req, res) => {
  const rows = await db
    .select({
      productId: productsTable.id,
      name: productsTable.name,
      coverImage: productsTable.coverImage,
      totalUnits: sql<string>`COALESCE(SUM(${salesTable.quantity}), 0)`,
      totalRevenue: sql<string>`COALESCE(SUM(${salesTable.totalPrice}), 0)`,
    })
    .from(productsTable)
    .leftJoin(salesTable, eq(salesTable.productId, productsTable.id))
    .groupBy(productsTable.id, productsTable.name, productsTable.coverImage)
    .orderBy(desc(sql`COALESCE(SUM(${salesTable.quantity}), 0)`))
    .limit(10);

  res.json(
    rows.map((r) => ({
      productId: r.productId,
      name: r.name,
      coverImage: r.coverImage,
      totalUnits: Number(r.totalUnits),
      totalRevenue: Number(r.totalRevenue),
    })),
  );
});

export default router;
