import styles from "@/app/style/module/JoinFamily.module.css";

export default async function JoinFamily() {
  return (
    <div className={styles.main}>
      <h1>Enter an existing family code</h1>
      <input type="text" placeholder="Enter a code..."></input>
    </div>
  );
}
