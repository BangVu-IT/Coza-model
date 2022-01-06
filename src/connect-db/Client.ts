import { Pool } from "pg";

export const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'product',
    password: '0782673677',
    port: 5432,
});