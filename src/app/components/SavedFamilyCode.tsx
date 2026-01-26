"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/style/module/SavedFamilyCode.module.css";
import { Family } from "../models/db";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

function Loading() {
  return <></>;
  // return (
  //   <div className={styles.main}>
  //     <p>Loading...</p>
  //   </div>
  // );
}

function ComponentError({ err }: { err: Error }) {
  console.error(`Failed to load saved family code: ${err.message}`);
  return <></>;
}

export default function SavedFamilyCode() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [family, setFamily] = useState<Family | null>(null);

  // get data
  const familyResult = useQuery({
    queryKey: ["familyData"],
    queryFn: async () => {
      if (localStorage.getItem("code")) {
        const response = await fetch(
          `/api/family/${localStorage.getItem("code")}`,
          {
            method: "GET",
          }
        );
        return await response.json();
      } else {
        // no saved family code, skip query
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (familyResult.data) {
      if (localStorage.getItem("code") && familyResult.data.family) {
        // set family state
        setFamily(familyResult.data.family);
        // set code state
        setCode(localStorage.getItem("code"));
      }
    }
  }, [code, familyResult.data]);

  // handle data from queries
  if (familyResult.data) {
    if (familyResult.data.status != "success") {
      console.error("error getting family data");
      familyResult.error = new Error(`Invalid family code: ${code}`);
    }
  }

  if (familyResult.isPending) return <Loading />;

  if (familyResult.error) {
    toast.error("Failed to load saved family code");
    return <ComponentError err={familyResult.error} />;
  }

  // useEffect(() => {
  //   if (localStorage.getItem("code")) {
  //     fetch(`/api/family/${localStorage.getItem("code")}`, {
  //       method: "GET",
  //     }).then((resp) => {
  //       if (resp.status == 200) {
  //         setCode(localStorage.getItem("code"));
  //         resp.json().then((resp_json) => {
  //           setFamily(resp_json.family);
  //         });
  //       }
  //     });
  //   }
  // }, []);

  function handleClick() {
    if (code) router.replace(`/family?code=${code}`);
  }

  return (
    <>
      {code ? (
        <div className={styles.main}>
          <h2>Saved family code found!</h2>
          <p>{code}</p>
          {family ? (
            <p>
              <b>Family name:</b> <br />
              {family.name}
            </p>
          ) : (
            <></>
          )}
          <button onClick={handleClick}>Overview page</button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
