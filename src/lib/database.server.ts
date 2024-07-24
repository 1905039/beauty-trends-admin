import pkg from 'pg';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } from '$env/static/private';

const {Client} = pkg;

export const db_client = new Client(
    {
        host: DB_HOST,
        database: DB_NAME,
        port: parseInt(DB_PORT),
        user: DB_USERNAME,
        password: DB_PASSWORD
    });

await db_client.connect();