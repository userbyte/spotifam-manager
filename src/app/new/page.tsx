import styles from "@/app/style/module/NewFamilyPage.module.css";
import NewFamilyDialog from "../components/NewFamilyDialog";

export default function NewFamilyPage() {
  return (
    <div className={styles.main}>
      <NewFamilyDialog />
    </div>
  );
}
