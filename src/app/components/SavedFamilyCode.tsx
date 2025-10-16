"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/style/module/SavedFamilyCode.module.css";
import { Family } from "../models/db";

export default function SavedFamilyCode() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (localStorage.getItem("code")) {
      fetch(`/api/family/${localStorage.getItem("code")}`, {
        method: "GET",
      }).then((resp) => {
        if (resp.status == 200) {
          setCode(localStorage.getItem("code"));
          resp.json().then((resp_json) => {
            setFamily(resp_json.family);
          });
        }
      });
    }
  }, []);

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
