import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, DeleteUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    username: u.username,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", async (_req, res) => {
  const rows = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(rows.map(serialize));
});

router.post("/users", async (req, res) => {
  const body = CreateUserBody.parse(req.body);
  const username = body.username.trim();
  if (!username) {
    res.status(400).json({ error: "Username required" });
    return;
  }
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Username already exists" });
    return;
  }
  const [created] = await db
    .insert(usersTable)
    .values({ username, isAdmin: body.isAdmin ?? false })
    .returning();
  res.json(serialize(created));
});

router.delete("/users/:id", async (req, res) => {
  const { id } = DeleteUserParams.parse(req.params);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

export default router;
