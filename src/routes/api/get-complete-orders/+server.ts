import { JWT_KEY } from "$env/static/private";
import { db_client } from "$lib/database.server";
import { error, json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type { QueryResult } from "pg";

export async function GET({cookies}): Promise<Response>
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

    let result: QueryResult<any> = await db_client.query("select __get_complete_orders_admin() as __id");

    return json(
    {
        success: 0,
        complete_orders: result.rows
    });
}