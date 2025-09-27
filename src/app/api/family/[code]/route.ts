// API Route
// /api/family/[code]
// Supported methods: GET

import { Family, FamilyStripped } from "@/app/models/db";
import { getFamily, getMe, isAdminCode } from "@/app/utils/db";

// GET /api/family/[code]
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

      // full_code was provided so we can get "me" (the user requesting)
      // sending it with /api/family/get saves us a request on the client
      const me = await getMe({ full_code: code });

      // checks if the requesting user is an admin
      if (!(await isAdminCode({ full_code: code }))) {
        // requesting user is not admin, meaning the family variable is a stripped family
        return new Response(
          JSON.stringify({
            status: "success",
            family: family,
            me: me,
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
            me: me,
            adminview: true,
          }),
          {
            status: 200,
          }
        );
      }
  }
}
