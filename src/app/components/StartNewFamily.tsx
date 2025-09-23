import styles from "@/app/style/module/StartNewFamily.module.css";
import Link from "next/link";

export default async function StartNewFamily() {
  return (
    <div className={styles.main}>
      <h1>Start a new family</h1>
      <Link href="/new">Create +</Link>
    </div>
  );
}
