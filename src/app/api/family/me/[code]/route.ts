// API Route
// /api/family/me/[code]

import { Family, Member } from "@/app/models/db";
import { getFamily } from "@/app/utils/db";

// GET /api/family/me/[code]
// gets your data using a full code
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  // process params
  const full_code = (await params).code;
  // let family_code: string;
  let passcode: string;
  if (!full_code) {
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
    // family_code = full_code.split("_")[0];
    passcode = full_code.split("_")[1];
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

      // find the member
      const memberIndex = family_.members.findIndex(
        (member: Member) => member.passcode === passcode
      );
      const member = family_.members[memberIndex];

      // return the member
      return new Response(
        JSON.stringify({
          status: "success",
          member: member,
        }),
        {
          status: 200,
        }
      );
  }
}
