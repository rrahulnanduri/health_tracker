import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Neon requires SSL in production, so we force it here
const sql = postgres(DATABASE_URL, { ssl: 'require' });

export default sql;