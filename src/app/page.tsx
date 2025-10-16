import JoinFamily from "./components/JoinFamily";
import SavedFamilyCode from "./components/SavedFamilyCode";
import StartNewFamily from "./components/StartNewFamily";
import styles from "@/app/style/module/HomePage.module.css";

export default function HomePage() {
  return (
    <>
      <div className={styles.main}>
        <div className="widthcontainer">
          <SavedFamilyCode />
          <StartNewFamily />
          <JoinFamily />
        </div>
      </div>
    </>
  );
}
