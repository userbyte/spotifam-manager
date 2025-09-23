"use client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "@/app/style/module/BackBtn.module.css";

export default function BackBtn() {
  const router = useRouter();

  return (
    <div className={styles.backbtn}>
      <button type="button" onClick={() => router.back()}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    </div>
  );
}
