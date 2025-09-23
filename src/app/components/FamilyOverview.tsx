"use client";
import styles from "@/app/style/module/FamilyOverview.module.css";
import { prettifyUnixTime } from "../utils/shared";
import { Family, Member, Payment } from "../models/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faTrashAlt,
  faUser,
  faUserEdit,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import AddPaymentModal from "./AddPaymentModal";
import { MouseEvent, use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import EditMemberModal from "./EditMemberModal";
import AddMemberModal from "./AddMemberModal";
import RemoveMemberModal from "./RemoveMemberModal";

// const mockFamily: Family = {
//   name: "parga test",
//   family_code: "1234",
//   plan_start: 1721275200,
//   price: 20,
//   members: [
//     {
//       name: "admin",
//       balance: 0,
//       passcode: "0000",
//       admin: true,
//     },
//     {
//       name: "anton",
//       balance: 10,
//       passcode: "1111",
//       admin: false,
//     },
//     {
//       name: "mark",
//       balance: 0,
//       passcode: "2222",
//       admin: false,
//     },
//     {
//       name: "dom",
//       balance: 10,
//       passcode: "3333",
//       admin: false,
//     },
//     // code for logins will be [FAMILY CODE]_[PASSCODE]
//     // ex. for admin: 1234_0000
//     // for anton: 1234_1111
//     //
//     // obviously, we'll use randomly generated strings, maybe 4 or 5 random lowercase characters including numbers
//   ],
//   payments: [
//     { id: 1, timestamp: 1758156285, member: "mark", amount: 81 },
//     { id: 2, timestamp: 1758156285, member: "dom", amount: 40 },
//   ],
//   charges: [{ id: 1, timestamp: 1758156285, amount: 20 }],
// };

export default function FamilyOverview({
  searchParams_,
}: {
  searchParams_: Promise<{ code?: string }>;
}) {
  // process params
  // const searchParams = useSearchParams();
  const searchParams = use(searchParams_);
  const full_code = searchParams.code;

  // states
  // so.. many... modal states... surely there is a better way to do this
  const [displayAddPaymentModal, setDisplayAddPaymentModal] =
    useState<boolean>(false);
  const [displayAddMemberModal, setDisplayAddMemberModal] =
    useState<boolean>(false);
  const [displayEditMemberModal, setDisplayEditMemberModal] =
    useState<boolean>(false);
  const [displayRemoveMemberModal, setDisplayRemoveMemberModal] =
    useState<boolean>(false);
  const [me, setMe] = useState<Member>({
    name: "null",
    balance: 0,
    passcode: "",
    admin: false,
  });
  const [family, setFamily] = useState<Family>({
    name: "...",
    family_code: "...",
    plan_start: 0,
    next_renewal: 0,
    price: 0,
    members: [],
    payments: [],
    charges: [],
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [targetMember, setTargetMember] = useState<Member | null>(null);

  useEffect(() => {
    if (full_code) {
      // get family data from api
      fetch(`/api/family/get/${full_code}`, {
        method: "GET",
      })
        .then((resp) => resp.json())
        .then((resp_json) => {
          if (resp_json.status) {
            if (resp_json.status === "success") {
              if (resp_json.adminview) {
                setIsAdmin(true);
              }
              setFamily(resp_json.family);
            } else {
              toast.error("Error getting family data");
            }
          }
        });

      fetch(`/api/family/me/${full_code}`, {
        method: "GET",
      })
        .then((resp) => resp.json())
        .then((resp_json) => {
          if (resp_json.status) {
            if (resp_json.status === "success") {
              setMe(resp_json.member);
            }
          }
        });
    }
  }, [full_code]);

  function generateMemberEls(memberList: Array<Member>) {
    const memberEls: Array<React.JSX.Element> = [];

    // build out the list of member elements
    memberList.forEach((member) => {
      memberEls.push(
        <div key={member.name} className="member_item">
          <span className="member_info">
            <h3>
              {member.admin ? (
                <FontAwesomeIcon icon={faUserShield} />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}{" "}
              {member.name} {member.name === me.name ? "(you)" : <></>}
            </h3>
            <p>Balance: {member.balance}</p>
            {isAdmin ? <p>Passcode: {member.passcode}</p> : <></>}
          </span>
          {isAdmin ? (
            <span className="member_action_buttons">
              <button
                title="Edit"
                data-member-name={member.name}
                onClick={(e) => {
                  if (!e.currentTarget) return;

                  const memberName =
                    e.currentTarget.getAttribute("data-member-name");

                  // find the member
                  const memberIndex = family.members.findIndex(
                    (member: Member) => member.name === memberName
                  );
                  setTargetMember(family.members[memberIndex]);
                  setDisplayEditMemberModal((cur) => !cur);
                }}
              >
                <FontAwesomeIcon icon={faUserEdit} />
              </button>
              <button
                title="Delete"
                data-member-name={member.name}
                onClick={(e) => {
                  if (!e.currentTarget) return;

                  const memberName =
                    e.currentTarget.getAttribute("data-member-name");

                  // find the member
                  const memberIndex = family.members.findIndex(
                    (member: Member) => member.name === memberName
                  );
                  setTargetMember(family.members[memberIndex]);
                  setDisplayRemoveMemberModal((cur) => !cur);
                }}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </span>
          ) : (
            <></>
          )}
        </div>
      );
    });

    // fill remaining slots with "empty slot" items
    while (memberEls.length < 6) {
      memberEls.push(
        <div key={memberEls.length} className="member_item">
          <h3>Slot empty</h3>
          {isAdmin ? (
            <button
              onClick={() => {
                setDisplayAddMemberModal((cur) => !cur);
              }}
            >
              <FontAwesomeIcon icon={faAdd} />
            </button>
          ) : (
            <></>
          )}
        </div>
      );
    }
    return memberEls;
  }

  function generatePaymentLogEls(paymentList: Array<Payment>) {
    const logEls: Array<React.JSX.Element> = [];

    // sort payments by timestamp
    paymentList.sort((a, b) => a.timestamp - b.timestamp);

    // iterate through payments and create elements for them
    paymentList.forEach((payment) => {
      logEls.push(
        <p key={payment.id}>
          [{prettifyUnixTime(payment.timestamp)}]{" "}
          {payment.processed ? "(✅)" : "(⏳)"}
          {payment.approved ? <></> : "(📬)"} {payment.member} sent a payment of
          ${payment.amount}
          {isAdmin ? (
            payment.approved ? (
              <></>
            ) : (
              <>
                {" - [ "}
                <a
                  className="approve_deny_buttons"
                  onClick={approvePayment}
                  data-payment-id={payment.id}
                >
                  approve
                </a>
                {" / "}
                <a
                  className="approve_deny_buttons"
                  onClick={disprovePayment}
                  data-payment-id={payment.id}
                >
                  deny
                </a>
                {" ] "}
              </>
            )
          ) : (
            <></>
          )}
        </p>
      );
    });

    return logEls;
  }

  function approvePayment(e: MouseEvent<HTMLAnchorElement>) {
    if (e.currentTarget) {
      const paymentID = Number(e.currentTarget.getAttribute("data-payment-id"));

      // get family data from api
      fetch(`/api/family/payments`, {
        method: "PATCH",
        body: JSON.stringify({
          full_code: full_code,
          payment: {
            id: paymentID,
            approved: true,
          },
        }),
      })
        .then((resp) => resp.json())
        .then((resp_json) => {
          if (resp_json.status) {
            if (resp_json.status === "success") {
              toast.success("Payment approved");

              // find the payment
              const paymentIndex = family.payments.findIndex(
                (payment: Payment) => payment.id === paymentID
              );

              // update local family data to reflect change
              setFamily((prevFamily) => {
                const updated_payments = [...prevFamily.payments];
                updated_payments[paymentIndex] = resp_json.payment;

                return {
                  ...prevFamily,
                  payments: updated_payments,
                };
              });
            }
          }
        });
    }
  }

  function disprovePayment(e: MouseEvent<HTMLAnchorElement>) {
    if (e.currentTarget) {
      const paymentID = Number(e.currentTarget.getAttribute("data-payment-id"));

      // get family data from api
      fetch(`/api/family/payments`, {
        method: "PATCH",
        body: JSON.stringify({
          full_code: full_code,
          payment: {
            id: paymentID,
            approved: false,
          },
        }),
      })
        .then((resp) => resp.json())
        .then((resp_json) => {
          if (resp_json.status) {
            if (resp_json.status === "success") {
              toast.success("Payment denied");

              // update local paymentList to reflect change

              // find the payment
              const paymentIndex = family.payments.findIndex(
                (payment: Payment) => payment.id === paymentID
              );
              const updated_family = family;
              updated_family.payments[paymentIndex] = resp_json.payment;
              setFamily(updated_family);
            } else {
              console.error(resp_json.error);
              toast.error("Error setting payment approval");
            }
          }
        });
    }
  }

  return (
    <div className={styles.main}>
      {displayAddPaymentModal ? (
        <>
          <AddPaymentModal
            family={family}
            setFamily={setFamily}
            me={me}
            isAdmin={isAdmin}
            setDisplayAddPaymentModal={setDisplayAddPaymentModal}
          />
        </>
      ) : (
        <></>
      )}
      {displayAddMemberModal ? (
        <>
          <AddMemberModal
            setFamily={setFamily}
            me={me}
            isAdmin={isAdmin}
            setDisplayAddMemberModal={setDisplayAddMemberModal}
          />
        </>
      ) : (
        <></>
      )}
      {displayEditMemberModal ? (
        <>
          <EditMemberModal
            setFamily={setFamily}
            me={me}
            isAdmin={isAdmin}
            targetMember={targetMember}
            setDisplayEditMemberModal={setDisplayEditMemberModal}
          />
        </>
      ) : (
        <></>
      )}
      {displayRemoveMemberModal ? (
        <>
          <RemoveMemberModal
            setFamily={setFamily}
            me={me}
            isAdmin={isAdmin}
            targetMember={targetMember}
            setDisplayRemoveMemberModal={setDisplayRemoveMemberModal}
          />
        </>
      ) : (
        <></>
      )}
      <div className="family_info_container">
        <h1>Family overview {isAdmin ? "[Admin View]" : <></>}</h1>
        <hr />
        <h1>{family.name}</h1>
        <p>
          Cost: ${family.price}/mo
          <br />
          Next renewal: {prettifyUnixTime(family.next_renewal, "%Y-%M-%d")}
        </p>
      </div>
      <div className="member_list_container">
        <h2>Members ({Object.keys(family.members).length}/6)</h2>
        <div className="member_list">{generateMemberEls(family.members)}</div>
      </div>
      <div className="payment_log_container">
        <span>
          <h2>Payments</h2>
          <button
            onClick={() => {
              setDisplayAddPaymentModal(!displayAddPaymentModal);
            }}
          >
            Add <FontAwesomeIcon icon={faAdd} />
          </button>
        </span>
        <div className="payment_log">
          <p className="payment_log_key">
            <i>
              📬 = Payment is awaiting admin approval
              <br />⏳ = Payment is awaiting processing
              <br />✅ = Payment has been processed
              {/* <br />
              🚫 = Payment has been denied by an admin */}
            </i>
          </p>
          <hr />
          {generatePaymentLogEls(family.payments)}
        </div>
      </div>
    </div>
  );
}
