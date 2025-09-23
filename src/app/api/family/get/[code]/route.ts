// API Route
// /api/family/get/[code]

import { getFamily, isAdminCode } from "@/app/utils/db";

// GET /api/family/get/[code]
// gets a family using full code
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  // process params
  const full_code = (await params).code;
  // get family
  const family = await getFamily({ full_code: full_code });

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
      if (!(await isAdminCode({ full_code: full_code }))) {
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
