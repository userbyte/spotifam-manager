// API Route:
// /api/jobs/payments
// Supported methods: GET

import db from "@/app/drivers/db";
import { Family, Member, Payment } from "@/app/models/db";
import { WithId, Document } from "mongodb";

// GET /api/jobs/payments
export async function GET(req: Request) {
  // job to process payments
  // triggered remotely once a day

  // the JOB_SECRET env var must be passed as a security measure, we dont want this job getting run all willy nilly!
  if (req.headers.get("psst") != process.env.JOB_SECRET) {
    return new Response(JSON.stringify({ status: "failed", error: "No." }), {
      status: 401,
    });
  }
  console.log('❰❰ running "payments" job... ❱❱');

  // do job
  if (db) {
    // get family collection
    const coll = db.collection("family");

    console.log(`${await coll.countDocuments()} families to process`);

    // iterate through families
    const cursor = coll.find();
    let family: WithId<Document> | null;
    while ((family = await cursor.next())) {
      console.log(
        `processing payments for family "${family.name}" (${family.family_code})...`
      );

      const updated_family: Family = Object(family);

      // iterate through payments
      family.payments.forEach((payment: Payment) => {
        // check if the payment has been approved and whether or not its been processed already
        if (payment.approved && payment.processed === false) {
          // find the member
          const memberIndex = updated_family.members.findIndex(
            (member: Member) => member.name === payment.member
          );
          // adjust the members balance
          updated_family.members[memberIndex].balance -= payment.amount;

          // find the payment
          const paymentIndex = updated_family.payments.findIndex(
            (payment_: Payment) => payment_.id === payment.id
          );
          // mark this payment as processed
          updated_family.payments[paymentIndex].processed = true;
        } else {
          console.log(
            `payment ID ${payment.id} is unverified, or has already been processed, skipping...`
          );
        }
      });

      // update family in the database by replacing it with the updated family
      await coll.replaceOne(
        { family_code: family.family_code },
        updated_family
      );
    }
  } else {
    console.error("payments job failed to run: database is null");
    return new Response(
      JSON.stringify({ status: "failed", error: "Database error" }),
      {
        status: 500,
      }
    );
  }

  console.log('❰❰ "payments" job complete! ❱❱');
  return new Response(JSON.stringify({ status: "success" }), {
    status: 200,
  });
}
