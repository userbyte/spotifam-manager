import { Suspense } from "react";
import FamilyOverview from "../components/FamilyOverview";
import styles from "@/app/style/module/FamilyOverviewPage.module.css";

export default function FamilyOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  return (
    <div className={styles.main}>
      <Suspense>
        <FamilyOverview searchParams_={searchParams} />
      </Suspense>
    </div>
  );
}
