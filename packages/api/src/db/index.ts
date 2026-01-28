import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';

// Create postgres client
const client = postgres(env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(client, { schema });

export { schema };
