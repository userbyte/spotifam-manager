"use client";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Family, Member } from "../models/db";
import styles from "@/app/style/module/EditMemberModal.module.css";

export default function EditMemberModal({
  setFamily,
  isAdmin,
  targetMember,
  setDisplayEditMemberModal,
}: {
  setFamily: React.Dispatch<React.SetStateAction<Family>>;
  me: Member;
  isAdmin: boolean;
  targetMember: Member | null;
  setDisplayEditMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const full_code = searchParams.get("code");

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const balanceInputRef = useRef<HTMLInputElement | null>(null);
  const passcodeInputRef = useRef<HTMLInputElement | null>(null);
  const adminStatusInputRef = useRef<HTMLInputElement | null>(null);

  // return empty if not admin, or if targetMember is unset
  if (!isAdmin || !targetMember) {
    return <></>;
  }

  async function submitMemberEdit() {
    if (!targetMember) {
      console.log("submitMemberEdit(): targetMember is null");
      return;
    }
    // check input refs
    if (
      !nameInputRef.current ||
      !balanceInputRef.current ||
      !passcodeInputRef.current ||
      !adminStatusInputRef.current
    ) {
      console.error("submitMemberEdit(): one or more input refs are null");
      return;
    }

    // validate inputs
    const newMember: {
      name?: string;
      balance?: number;
      passcode?: string;
      admin?: boolean;
    } = {};
    // add all non-empty inputs to the newMember object
    if (nameInputRef.current.value != "") {
      newMember.name = nameInputRef.current.value;
    }
    if (balanceInputRef.current.value != "") {
      newMember.balance = balanceInputRef.current.valueAsNumber;
    }
    if (passcodeInputRef.current.value != "") {
      newMember.passcode = passcodeInputRef.current.value;
    }
    if (adminStatusInputRef.current.checked != targetMember.admin) {
      newMember.admin = adminStatusInputRef.current.checked;
    }

    // const newMember = {
    //   name: nameInputRef.current.valueAsNumber,
    //   balance: balanceInputRef.current.valueAsNumber,
    //   passcode: passcodeInputRef.current.value,
    //   admin: adminStatusInputRef.current.value,
    // };

    // add to db
    const resp = await fetch("/api/family/members", {
      method: "PATCH",
      body: JSON.stringify({
        full_code: full_code,
        target: targetMember.name,
        member: newMember,
      }),
    });
    const resp_json = await resp.json();
    if (resp_json.status === "success") {
      toast.success("Member edited");

      // update local family data to reflect change
      setFamily((prevFamily) => {
        const updated_members = [...prevFamily.members];

        // find the member
        const memberIndex = updated_members.findIndex(
          (member: Member) => member.name === targetMember.name
        );

        updated_members[memberIndex] = resp_json.member;

        return {
          ...prevFamily,
          members: updated_members,
        };
      });

      // close modal
      setDisplayEditMemberModal((cur) => !cur);
    } else {
      console.error(resp_json.error);
      if (resp.status === 403) {
        toast.error("Only family admins can edit members");
      } else {
        toast.error("Error editing member");
      }
    }
  }

  return (
    <div
      className={styles.main}
      onClick={() => {
        setDisplayEditMemberModal((cur) => !cur);
      }}
    >
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <label>Name</label>
        <input type="text" placeholder={targetMember.name} ref={nameInputRef} />
        <label>Balance ($)</label>
        <input
          type="number"
          placeholder={String(targetMember.balance)}
          ref={balanceInputRef}
        />
        <label>Passcode</label>
        <input
          type="text"
          placeholder={targetMember.passcode}
          ref={passcodeInputRef}
        />
        <span className="admin_checkbox">
          <h4>Admin</h4>
          <input
            type="checkbox"
            defaultChecked={targetMember.admin}
            ref={adminStatusInputRef}
          />
        </span>
        <span>
          <button className="add_button" onClick={submitMemberEdit}>
            Save <FontAwesomeIcon icon={faSave} />
          </button>
          <button
            className="close_button"
            onClick={() => {
              setDisplayEditMemberModal((cur) => !cur);
            }}
          >
            Cancel
          </button>
        </span>
      </div>
    </div>
  );
}
