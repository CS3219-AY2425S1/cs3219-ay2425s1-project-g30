import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";
// import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface QuestionLayoutProps {
  children: ReactNode;
}

const QuestionLayout = ({ children }: QuestionLayoutProps) => {
  return (
    <>
      {/* <EnforceLoginStatePageWrapper> */}
      <div className="flex h-screen overflow-hidden">
        <Topbar />
        <Sidebar />
        <main className="flex-1 ml-20 mt-16 p-4 overflow-auto">
          {children}
        </main>
      </div>
      {/* /<EnforceLoginStatePageWrapper> */}
    </>
  );
};

export default QuestionLayout;
