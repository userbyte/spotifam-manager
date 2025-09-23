// API Route:
// /api/family
// Supported methods: POST, PATCH, DELETE

import db from "@/app/drivers/db";
import { Family, Member } from "@/app/models/db";
import { generateRandomString } from "@/app/utils/shared";

// POST /api/family
// creates a new family
export async function POST(request: Request) {
  try {
    const body_json = await request.json();
    // validate the request body
    if (
      !body_json.name ||
      !body_json.plan_start ||
      !body_json.price ||
      !body_json.members
    ) {
      throw new Error("Invalid request");
    }

    // initial family values
    const family_initial: {
      name: string;
      plan_start: number;
      price: number;
      members: Array<string>;
    } = {
      name: body_json.name,
      plan_start: body_json.plan_start,
      price: body_json.price,
      members: body_json.members,
    };

    console.log("creating family:", body_json.name);

    // full family object to be put in the database
    const name: string = family_initial.name;
    const family_code: string = generateRandomString({ length: 6 });
    const plan_start: number = Number(family_initial.plan_start);
    const price: number = Number(family_initial.price);
    const members: Array<Member> = [];
    family_initial.members.forEach((member) => {
      // first member will always be the family administrator
      let admin: boolean;
      if (members.length === 0) admin = true;
      else admin = false;

      members.push({
        name: member,
        balance: 0,
        passcode: generateRandomString({ length: 4 }),
        admin: admin,
      });
    });
    // get next renewal date
    const prevDate = new Date(plan_start * 1000);
    prevDate.setMonth(prevDate.getMonth() + 1);
    const next_renewal = prevDate.getTime() / 1000;

    // map the new values to a Family object
    const family_generated: Family = {
      name: name,
      family_code: family_code,
      plan_start: plan_start,
      next_renewal: next_renewal,
      price: price,
      members: members,
      payments: [],
      charges: [],
    };

    // insert new family into the database
    if (db) {
      const coll = db.collection("family");
      coll.insertOne(family_generated);
    } else {
      return new Response(
        JSON.stringify({ status: "failed", error: "Database error" }),
        {
          status: 500,
        }
      );
    }

    // return new family
    return new Response(
      JSON.stringify({ status: "success", family: family_generated }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({ status: "failed", error: String(err) }),
      {
        status: 400,
      }
    );
  }
}

// PATCH /api/family
// edits a family
export async function PATCH(request: Request) {
  console.log(request);
  return new Response(JSON.stringify({}), {
    status: 200,
  });
}

// DELETE /api/family
// deletes a family
export async function DELETE(request: Request) {
  console.log(request);
  return new Response(JSON.stringify({}), {
    status: 200,
  });
}
