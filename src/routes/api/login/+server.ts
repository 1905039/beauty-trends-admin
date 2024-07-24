import { json, type RequestEvent } from "@sveltejs/kit";
import { JWT_KEY, PASSWORD } from "$env/static/private";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

export async function POST({request, cookies}: RequestEvent): Promise<Response>
{
    let request_obj: any = await request.json();
    let response: Response = json({success: -1});
    let verifier: string = await argon2.hash(PASSWORD);
    let verified: boolean = await argon2.verify(verifier, request_obj.password);

    if(verified)
    {
        let token: string = jwt.sign({}, JWT_KEY);
        let expire_date: Date = new Date();

        expire_date.setTime(expire_date.getTime() + 1800000);
        cookies.set("jwt", token, {path: "/", httpOnly: true, expires: expire_date});

        response = json({success: 0});
    }

    return response;
}