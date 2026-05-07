import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Neon (cloud postgres) requires SSL — enforced at driver level regardless of connection string
const sql = postgres(DATABASE_URL, { ssl: 'require' });

export default sql;