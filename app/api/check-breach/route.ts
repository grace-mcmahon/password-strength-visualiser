import { NextRequest, NextResponse } from "next/server";
import { pwnedPassword } from "hibp";
// pwnedPasswrod is the function from the hibp package that does all
// the k-anonymity work internally
//hashing, sending only the prefix, checking the response - so we dont have to write the logic 

export async function POST(request: NextRequest) {
    // Read the password sent from the browser in the request body.
    const { password } = await request.json();

    if (!password) {
        // Basic safety check to see if no password was sent, respond with an error
        // instead of trying (and failing) to check an empty/undefined value.
        return NextResponse.json(
            { error: "No password provided"},
            { status: 400}
        );
    }

    try {
        // pwnedPassword returns a number: how many times this password  has 
        //  appeared in known breaks. 0 means it hasn't been found at all.
        const breachCount = await pwnedPassword(password);

        return NextResponse.json({ breachCount });
      } catch (error) {
      // if the HIBP service itself fails or is unreachable, don't crash 
      // the whole app - response with a clear error instead. 
        return NextResponse.json(
          { error: "Could not check breach status" },
          { status: 500 }
        );
    }
}
    