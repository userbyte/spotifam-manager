import JoinFamily from "./components/JoinFamily";
import StartNewFamily from "./components/StartNewFamily";
import styles from "@/app/style/module/HomePage.module.css";

export default function HomePage() {
  return (
    <>
      <div className={styles.main}>
        <div className="widthcontainer">
          <StartNewFamily />
          <JoinFamily />
        </div>
      </div>
    </>
  );
}
