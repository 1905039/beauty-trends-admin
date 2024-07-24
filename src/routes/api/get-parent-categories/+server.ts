import { db_client } from "$lib/database.server";
import { json } from "@sveltejs/kit";
import type { QueryResult } from 'pg';

export async function POST({request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let result: QueryResult<any> = await db_client.query("select * from __get_category_children($1)", [request_obj.id]);

    if(result.rowCount === null)
    {
        return json(
        {
            success: -1
        });
    }

    return json(
    {
        success: 0,
        categories: result.rows
    });
}