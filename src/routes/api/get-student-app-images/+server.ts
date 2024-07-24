import { JWT_KEY, SUPABASE_API_KEY, SUPABASE_URL } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import jwt from "jsonwebtoken";
import supabase_js from "@supabase/supabase-js";

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
    let supabase: supabase_js.SupabaseClient<any, "public", any> = supabase_js.createClient(SUPABASE_URL, SUPABASE_API_KEY);
    let form_data: FormData = new FormData();
    let result: any = await supabase.storage.from("student-apply-image").download(request_obj.id + "-front.webp");

    if(result.error)
    {
        console.error(result.error);

        let error_form_data: FormData = new FormData();
        error_form_data.append("success", "-1");

        return new Response();
    }

    form_data.append("front", result.data);
    result = await supabase.storage.from("student-apply-image").download(request_obj.id + "-back.webp");

    if(result.error)
    {
        console.error(result.error);

        let error_form_data: FormData = new FormData();
        error_form_data.append("success", "-1");

        return new Response();
    }

    form_data.append("back", result.data);
    form_data.append("success", "0");

    return new Response(form_data);
}