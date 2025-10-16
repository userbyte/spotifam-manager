"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/style/module/JoinFamily.module.css";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function JoinFamily() {
  const router = useRouter();
  const familyCodeInput = useRef<HTMLInputElement | null>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (familyCodeInput.current && e.key === "Enter") {
      router.replace(`/family?code=${familyCodeInput.current.value}`);
    }
  }

  function handleClick() {
    if (familyCodeInput.current) {
      router.replace(`/family?code=${familyCodeInput.current.value}`);
    }
  }

  return (
    <div className={styles.main}>
      <h1>Enter an existing family code</h1>
      <span>
        <input
          ref={familyCodeInput}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Enter a code..."
        ></input>
        <button onClick={handleClick}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </span>
    </div>
  );
}
