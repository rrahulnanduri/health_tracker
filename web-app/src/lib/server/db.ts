import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Neon requires SSL in production, so we force it here
// Neon connection
const sql = postgres(DATABASE_URL);

export default sql;