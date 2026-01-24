"use client";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Family, Member } from "../models/db";
import styles from "@/app/style/module/RemoveMemberModal.module.css";

export default function RemoveMemberModal({
  setFamily,
  isAdmin,
  targetMember,
  setDisplayRemoveMemberModal,
}: {
  setFamily: React.Dispatch<React.SetStateAction<Family>>;
  me: Member;
  isAdmin: boolean;
  targetMember: Member | null;
  setDisplayRemoveMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const full_code = searchParams.get("code");

  // return empty if not admin, or if targetMember is unset
  if (!isAdmin || !targetMember) {
    return <></>;
  }

  async function submitRemoveMember() {
    if (!targetMember) {
      return;
    }

    // delete from db
    const resp = await fetch("/api/family/members", {
      method: "DELETE",
      body: JSON.stringify({
        full_code: full_code,
        target: targetMember.name,
      }),
    });
    const resp_json = await resp.json();
    if (resp_json.status === "success") {
      toast.success("Member removed");

      // update local family data to reflect change
      setFamily((prevFamily) => {
        const updated_members = [...prevFamily.members];
        // find the member
        const memberIndex = updated_members.findIndex(
          (member_: Member) => member_.name === targetMember.name
        );
        updated_members.splice(memberIndex, 1);

        return {
          ...prevFamily,
          members: updated_members,
        };
      });

      // close modal
      setDisplayRemoveMemberModal((cur) => !cur);
    } else {
      console.error(resp_json.error);
      if (resp.status === 403) {
        toast.error("Only family admins can remove members");
      } else {
        toast.error("Error removing member");
      }
    }
  }

  return (
    <div
      className={styles.main}
      onClick={() => {
        setDisplayRemoveMemberModal((cur) => !cur);
      }}
    >
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <p className="title_text">Remove member</p>
        <hr />
        <h2>
          Are you sure you want to remove this member?
          <br />
          <br />
          This action is irreversible.
        </h2>
        <span>
          <button className="yes_button" onClick={submitRemoveMember}>
            Yes, absolutely
          </button>
          <button
            className="no_button"
            onClick={() => {
              setDisplayRemoveMemberModal((cur) => !cur);
            }}
          >
            Nevermind
          </button>
        </span>
      </div>
    </div>
  );
}
