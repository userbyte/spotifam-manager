// API Route
// /api/family/get/[code]

import { Family, FamilyStripped } from "@/app/models/db";
import { getFamily, isAdminCode } from "@/app/utils/db";

// GET /api/family/get/[code]
// gets a family using full code or family code
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
        error: "Client sent a request without a code",
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
  // get family
  if (isFullCode) {
    family = await getFamily({ full_code: code });
  } else {
    family = await getFamily({ family_code: code });
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
      // checks if the requesting user is an admin
      if (!isFullCode) {
        // a full code was not provided, so we cant determine if the user is admin or not
        return new Response(
          JSON.stringify({
            status: "success",
            family: family,
            adminview: false,
          }),
          {
            status: 200,
          }
        );
      }
      if (!(await isAdminCode({ full_code: code }))) {
        // requesting user is not admin, meaning the family variable is a stripped family
        return new Response(
          JSON.stringify({
            status: "success",
            family: family,
            adminview: false,
          }),
          {
            status: 200,
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            status: "success",
            family: family,
            adminview: true,
          }),
          {
            status: 200,
          }
        );
      }
  }
}
