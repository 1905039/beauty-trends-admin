import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function DELETE({request, cookies}: RequestEvent): Promise<Response>
{
    cookies.delete("jwt", {path: "/"});

    return json({success: true});
}