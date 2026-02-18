import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { apiHandler, validateBody, ApiError } from "@/lib/api-helpers";

export const POST = apiHandler(async (req) => {
    const data = await validateBody(req, registerSchema);

    /* Honeypot check */
    const body = await req.clone().json();
    if (body.website) throw new ApiError("Bot algılandı", 400);

    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) throw new ApiError("Bu e-posta zaten kayıtlı", 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
        data: {
            name: data.name,
            surname: data.surname,
            email: data.email.toLowerCase().trim(),
            hashedPassword,
        },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
});
