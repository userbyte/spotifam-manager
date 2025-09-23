// API Route
// /api/family/payments

import db from "@/app/drivers/db";
import { Family, Member, Payment } from "@/app/models/db";
import { addPayment, getFamily, isAdminCode } from "@/app/utils/db";
import { unixTimestampNow } from "@/app/utils/shared";

// POST /api/family/payment
// add a new payment
export async function POST(request: Request) {
  const body_json = await request.json();

  let full_code: string;
  let family_code: string;
  let passcode: string;
  if (!body_json.full_code) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Client sent a request without a family code",
      }),
      {
        status: 400,
      }
    );
  } else {
    // get full code from req body json
    full_code = body_json.full_code;
    family_code = full_code.split("_")[0];
    passcode = full_code.split("_")[1];
  }

  // check body params
  if (!body_json.payment.member || !body_json.payment.amount) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Client sent an invalid request body",
      }),
      {
        status: 400,
      }
    );
  }

  // check if payment amount is a valid number
  if (Number.isNaN(Number(body_json.payment.amount))) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Payment amount must be a number",
      }),
      {
        status: 500,
      }
    );
  }

  // check if payment has a negative amount (not allowed... !! 😡)
  if (body_json.payment.amount < 0) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Payment amount cannot be a negative number",
      }),
      {
        status: 400,
      }
    );
  }

  // get family
  const family = await getFamily({ full_code: full_code, force_nostrip: true });

  // handle getFamily return
  switch (family) {
    case "DB_ERROR":
      // db is null
      return new Response(
        JSON.stringify({ status: "failed", error: "Database error" }),
        {
          status: 500,
        }
      );
    case null:
      // family data is null
      return new Response(
        JSON.stringify({ status: "failed", error: "Invalid family code" }),
        {
          status: 404,
        }
      );

    default:
      // cast family to a full family object since we used force_nostrip and know its the full data
      const family_: Family = Object(family);

      if (db) {
        // verify admin status, if we're admin the payment is automatically marked as approved later
        let isAdmin;
        switch (await isAdminCode({ full_code: full_code })) {
          case true:
            isAdmin = true;
            break;

          default:
            isAdmin = false;
            break;
        }

        // find the requesting member
        const memberIndex = family_.members.findIndex(
          (member: Member) => member.passcode === passcode
        );
        // get member name
        const requestingMemberName = family_.members[memberIndex].name;

        // if the requesting member is not admin, and they provided a member name which is not their own, return an error because this is not allowed
        // this should be an impossible scenario on the frontend but we gotta have this check for security purposes
        if (!isAdmin && body_json.payment.member != requestingMemberName) {
          return new Response(
            JSON.stringify({
              status: "failed",
              error:
                "Only family administrators are permitted to set payment member attribute to someone other than themselves",
            }),
            {
              status: 403,
            }
          );
        }

        // create a new Payment object
        const newPayment: Payment = {
          id: family_.payments.length + 1,
          timestamp: body_json.payment.timestamp || unixTimestampNow(),
          amount: body_json.payment.amount,
          member: body_json.payment.member,
          approved: isAdmin, // marks as approved if the requesting user is admin
          processed: false,
        };

        // add payment to the database
        await addPayment({ family_code: family_code, payment: newPayment });

        return new Response(
          JSON.stringify({
            status: "success",
            payment: newPayment,
          }),
          {
            status: 200,
          }
        );
      }
  }
}

// PATCH /api/family/payments
// edit an existing payment
export async function PATCH(request: Request) {
  // process request body
  let body_json: { full_code: string; payment: object } | null = null;
  try {
    body_json = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Missing request body",
      }),
      {
        status: 400,
      }
    );
  } finally {
    if (body_json === null) {
      return new Response(
        JSON.stringify({
          status: "failed",
          error: "Missing request body",
        }),
        {
          status: 400,
        }
      );
    }
  }

  let full_code: string;
  // let family_code: string;
  let payment_upd: {
    id?: number;
    timestamp?: number;
    member?: string;
    amount?: number;
    approved?: boolean;
    processed?: boolean;
  };
  if (!body_json.full_code) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Client sent a request without a family code",
      }),
      {
        status: 400,
      }
    );
  } else {
    // get full code from req body json
    full_code = body_json.full_code;
    // family_code = full_code.split("_")[0];
    payment_upd = body_json.payment;
  }

  if ((await isAdminCode({ full_code: full_code })) != true) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Only admins can modify payment records",
      }),
      {
        status: 403,
      }
    );
  }

  if (db) {
    // get family
    const family = await getFamily({ full_code: full_code });
    if (family && family != "DB_ERROR") {
      const updated_family: Family = Object(family);

      // find the payment
      const paymentIndex = updated_family.payments.findIndex(
        (payment_: Payment) => payment_.id === payment_upd.id
      );
      if (paymentIndex === -1) {
        // payment could not be found
        return new Response(
          JSON.stringify({
            status: "failed",
            error: "Invalid payment ID",
          }),
          {
            status: 400,
          }
        );
      }

      // apply modifications to the payment
      for (const [key, value] of Object.entries(payment_upd)) {
        // payment ID cannot be modified
        if (key === "id") {
          continue;
        }
        console.log(
          `updating payment [id=${payment_upd.id} (${key}: ${updated_family.payments[paymentIndex][key]} --> ${value})]...`
        );
        updated_family.payments[paymentIndex][key] = value;
      }

      // mark this payment as processed

      // update family in the database by replacing it with the updated family
      await db
        .collection("family")
        .replaceOne({ family_code: family.family_code }, updated_family);

      return new Response(
        JSON.stringify({
          status: "success",
          payment: updated_family.payments[paymentIndex],
        }),
        {
          status: 200,
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ status: "failed", error: "Unknown error" }),
    {
      status: 500,
    }
  );
}
