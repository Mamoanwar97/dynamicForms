type QueryResultLike = { rows: unknown[] };
type QueryFn = (text: string, params?: unknown[]) => Promise<QueryResultLike>;
type ClientLike = { query: QueryFn; release(): void };

export class Db {
  private readonly queryFn: QueryFn;
  private readonly connectFn: () => Promise<ClientLike>;

  constructor(queryFn: QueryFn, connectFn: () => Promise<ClientLike>) {
    this.queryFn = queryFn;
    this.connectFn = connectFn;
  }

  async query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]> {
    const result = await this.queryFn(text, params);
    return result.rows as T[];
  }

  async queryOne<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T | undefined> {
    return (await this.query<T>(text, params))[0];
  }

  async withTransaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
    const client = await this.connectFn();
    const tx = new Db(
      (text, params) => client.query(text, params),
      () =>
        Promise.reject(new Error("nested transactions are not supported")),
    );
    try {
      await client.query("BEGIN");
      const result = await fn(tx);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}