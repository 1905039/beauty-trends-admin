import { db_client } from '$lib/database.server';
import { json } from '@sveltejs/kit';
import type { QueryResult } from 'pg';

export async function POST({request}): Promise<Response>
{
    let request_obj: any = await request.json();
    let result: QueryResult<any> = await db_client.query("select __id from __get_product_images($1)", [request_obj.id]);

    if(result.rowCount === null || result.rowCount <= 0)
    {
        return json(
        {
            success: -1
        });    
    }

    return json(
    {
        success: 0,
        images: result.rows
    });
}