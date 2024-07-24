import { JWT_KEY } from '$env/static/private';
import { db_client } from '$lib/database.server.js';
import { error, json } from '@sveltejs/kit';
import jwt from "jsonwebtoken";
import type { QueryResult } from 'pg';

export async function POST({request, cookies}): Promise<Response>
{
    let token: string | undefined = cookies.get("jwt");

    if(token === undefined)
    {
        return error(401);
    }

    try
    {
        jwt.verify(token, JWT_KEY);
    }
    catch(err)
    {
        return error(401);
    }

    let expire_date: Date = new Date();

    expire_date.setTime(expire_date.getTime() + 1800000);
    cookies.set("jwt", token, {path: "/", httpOnly: true, expires: expire_date});
    
    let request_obj: any = await request.json();
    let result: QueryResult<any> = await db_client.query("select * from __get_order_data_sm_admin($1)", [request_obj.id]);

    return json(
    {
        success: 0,
        data: result.rows[0]
    });
}