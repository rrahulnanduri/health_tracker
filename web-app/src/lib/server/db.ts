import postgres from 'postgres';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from '$env/static/private';

const sql = postgres({
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD
});

export default sql;
