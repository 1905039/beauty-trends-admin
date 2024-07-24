import { SUPABASE_API_KEY, SUPABASE_URL } from "$env/static/private";
import { db_client } from "$lib/database.server";
import { createClient } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "$env/static/private";
import type { QueryResult } from "pg";
import sharp from "sharp";

export async function POST({request, cookies}: RequestEvent): Promise<Response>
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

    let request_form: FormData = await request.formData();
    let request_obj_str: string | undefined = request_form.get("data")?.toString();

    if(request_obj_str === undefined)
    {
        return json(
        {
            success: -2
        });
    }

    let request_obj: any = JSON.parse(request_obj_str);
    let count_str: string | undefined = request_form.get("count")?.toString();

    if(count_str === undefined)
    {
        return json(
        {
            success: -2
        });
    }

    let count: number = parseInt(count_str);
    let files: Blob[] = new Array(count);

    for(let i: number = 0; i < count; ++i)
    {
        let array_buffer: ArrayBuffer = await (request_form.get("file-" + i)?.slice() as Blob).arrayBuffer();
        files[i] = new Blob([array_buffer]);
    }

    await db_client.query("select __edit_product($1, $2, $3, $4, $5, $6, $7)", [request_obj.id, request_obj.title, request_obj.price, request_obj.discount, request_obj.weight, request_obj.type_id, request_obj.description]);
    const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

    let result: QueryResult<any> = await db_client.query("select __id from __delete_images($1)", [request_obj.id]);
    let delete_paths: string[] = []

    if(result.rowCount !== null)
    {
        for(let i: number = 0; i < result.rowCount; ++i)
        {
            delete_paths.push(request_obj.id + "-" + result.rows[i].__id + ".webp");
        }
    }

    await supabase.storage.from("products-image").remove(delete_paths);

    for(let i: number = 0; i < count; ++i)
    {
        let result: QueryResult<any> = await db_client.query("select __get_new_image_id($1) as __id", [request_obj.id]);

        if(result.rowCount === null || result.rowCount !== 1)
        {
            continue;
        }

        let image_id: number = result.rows[0].__id;
        let temp_file: Blob = new Blob([(await sharp(await files[i].arrayBuffer()).resize(222, 222, {fit: "fill"}).webp().toBuffer()).buffer],
        {
            type: "image/webp"
        });

        await supabase.storage.from("products-image").upload(request_obj.id + "-" + image_id + ".webp", temp_file);
    }

    return json(
    {
        success: 0
    });
}