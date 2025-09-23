"use client";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { Family, Member } from "../models/db";
import styles from "@/app/style/module/AddMemberModal.module.css";
import { sleep } from "../utils/shared";

export default function AddMemberModal({
  setFamily,
  isAdmin,
  setDisplayAddMemberModal,
}: {
  setFamily: React.Dispatch<React.SetStateAction<Family>>;
  me: Member;
  isAdmin: boolean;
  setDisplayAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const full_code = searchParams.get("code");

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // return empty if not admin
  if (!isAdmin) {
    return <></>;
  }

  async function submitAddMember() {
    // check input refs
    if (!nameInputRef.current) {
      console.error("submitAddMember(): one or more input refs are null");
      return;
    }

    // validate inputs
    if (nameInputRef.current.value === "") {
      toast.error("Member name cannot be empty");
      const initialColor = nameInputRef.current.style.backgroundColor;
      nameInputRef.current.style.backgroundColor = "#992a2a";
      sleep(700).then(() => {
        if (nameInputRef.current)
          nameInputRef.current.style.backgroundColor = initialColor;
      });
      return;
    }

    const newMember = {
      name: nameInputRef.current.value,
    };

    // add to db
    const resp = await fetch("/api/family/members", {
      method: "POST",
      body: JSON.stringify({
        full_code: full_code,
        member: newMember,
      }),
    });
    const resp_json = await resp.json();
    if (resp_json.status === "success") {
      toast.success("Member added");

      // update local family data to reflect change
      setFamily((prevFamily) => {
        const updated_members = [...prevFamily.members, resp_json.member];

        return {
          ...prevFamily,
          members: updated_members,
        };
      });

      // close modal
      setDisplayAddMemberModal((cur) => !cur);
    } else {
      console.error(resp_json.error);
      if (resp.status === 403) {
        toast.error("Only family admins can add new members");
      } else {
        toast.error("Error adding member");
      }
    }
  }

  return (
    <div
      className={styles.main}
      onClick={() => {
        setDisplayAddMemberModal((cur) => !cur);
      }}
    >
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <label>Name</label>
        <input type="text" ref={nameInputRef} />
        <span>
          <button className="add_button" onClick={submitAddMember}>
            Add <FontAwesomeIcon icon={faAdd} />
          </button>
          <button
            className="close_button"
            onClick={() => {
              setDisplayAddMemberModal((cur) => !cur);
            }}
          >
            Cancel
          </button>
        </span>
      </div>
    </div>
  );
}
