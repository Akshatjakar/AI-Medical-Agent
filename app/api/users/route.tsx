import { db } from "@/config/db";
import { UsersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const user =await currentUser();

    try {

         //check if User already exists
            const users=await db.select().from(UsersTable)
            //@ts-ignore
            .where(eq(usersTable.email,user?.primaryEmailAddress?.emailAddress))
    //if Not then create New User
    if (users?.length==0){
        const result=await db.insert(UsersTable).values({
             //@ts-ignore
            name:user?.fullName,
            email:user?.primaryEmailAddress?.emailAddress,
            credits:10
            //@ts-ignore
        }).returning({usersTable})
           return NextResponse.json(result[0]?.usersTable);
    }
    return NextResponse.json(users[0]);

    } catch (e) {
        return NextResponse.json(e);
    }

}