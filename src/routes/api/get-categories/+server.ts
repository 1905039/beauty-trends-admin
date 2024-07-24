import { db_client } from "$lib/database.server";
import { json } from "@sveltejs/kit";
import type { QueryResult } from 'pg';

export async function GET(): Promise<Response>
{
    let result: QueryResult<any> = await db_client.query("select * from __get_categories()");

    return json(
    {
        success: 0,
        categories: result.rows
    });
}