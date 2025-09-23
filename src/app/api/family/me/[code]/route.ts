// API Route
// /api/family/me/[code]

import { Family, FamilyStripped, Member } from "@/app/models/db";
import { getFamily } from "@/app/utils/db";

// GET /api/family/me/[code]
// gets your data using a full code
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  // process params
  const code = (await params).code;
  if (!code) {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Client sent a request without a full code",
      }),
      {
        status: 400,
      }
    );
  }
  // we need to know if this is a full code or just the family code
  let isFullCode: boolean = false;
  if (code.includes("_")) {
    isFullCode = true;
  }
  let family: Family | FamilyStripped | "DB_ERROR" | null;
  // let family_code: string;
  let passcode: string;
  // get family
  if (isFullCode) {
    family = await getFamily({ full_code: code, force_nostrip: true });
    // family_code = full_code.split("_")[0];
    passcode = code.split("_")[1];
  } else {
    return new Response(
      JSON.stringify({
        status: "failed",
        error: "Client sent a request without a full code",
      }),
      {
        status: 400,
      }
    );
  }

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
