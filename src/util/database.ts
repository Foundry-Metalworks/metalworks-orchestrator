import * as dotenv from "dotenv";
import { Client } from "pg";
dotenv.config();

const { NODE_ENV, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } =
  process.env;
const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}${
  ENDPOINT_ID ? `?options=project%3D${ENDPOINT_ID}` : ""
}`;

export const connect = async () => {
  const client = new Client({
    connectionString: URL,
    ssl: NODE_ENV != "development",
  });
  await client.connect();
  return client;
};

export const dbWrapper = async <T>(
  func: (client: Client) => Promise<T>
): Promise<T> => {
  const client = await connect();
  try {
    const result = await func(client);
    await client.end();
    return result;
  } catch (e) {
    await client.end();
    throw e;
  }
};
