// Parked with Jugnu (platform/docs/move-to-event-model.md): reading and writing flagged chats.
/** Keeps a flagged chat with Jugnu; returns its id. */
export async function saveJugnuFlag(
  db: Db,
  accountId: string,
  flag: { note: string; lessonId: string | null; body: unknown },
): Promise<string> {
  const [row] = await db
    .insert(jugnuFlags)
    .values({ accountId, note: flag.note, lessonId: flag.lessonId, body: flag.body })
    .returning({ id: jugnuFlags.id });
  if (row === undefined) throw new Error("jugnu_flags: the insert returned nothing");
  return row.id;
}

/** Flagged chats, newest first: who, when, the note. */
export async function jugnuFlagList(
  db: Db,
  limit: number,
): Promise<{ id: string; createdAt: Date; name: string; note: string; lessonId: string | null }[]> {
  return db
    .select({
      id: jugnuFlags.id,
      createdAt: jugnuFlags.createdAt,
      name: accounts.name,
      note: jugnuFlags.note,
      lessonId: jugnuFlags.lessonId,
    })
    .from(jugnuFlags)
    .innerJoin(accounts, eq(accounts.id, jugnuFlags.accountId))
    .orderBy(desc(jugnuFlags.createdAt))
    .limit(limit);
}

/** One flagged chat, whole; undefined if there is none with that id. */
export async function jugnuFlag(db: Db, id: string): Promise<unknown> {
  const [row] = await db
    .select({ body: jugnuFlags.body })
    .from(jugnuFlags)
    .where(eq(jugnuFlags.id, id));
  return row?.body;
}
