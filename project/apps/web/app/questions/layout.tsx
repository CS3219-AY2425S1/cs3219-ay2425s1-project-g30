import Topbar from "@/components/Topbar";
import { ReactNode } from "react";
import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface QuestionsLayoutProps {
  children: ReactNode;
}

const QuestionsLayout = ({ children }: QuestionsLayoutProps) => {
  return (
    <>
      {/* <EnforceLoginStatePageWrapper> */}
        <Topbar />
        <main>{children}</main>
      {/* /<EnforceLoginStatePageWrapper> */}
    </>
  );
};

export default QuestionsLayout;
