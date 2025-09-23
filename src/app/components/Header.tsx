import Link from "next/link";
import styles from "../style/module/Header.module.css";

export default function Header() {
  return (
    <div className={styles.header}>
      <img alt="logo" src="/img/png/logo.png" className="logo" />
      <h1>
        <Link href="/">sfmgr</Link>
      </h1>
    </div>
  );
}
