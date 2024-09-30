import Topbar from "@/components/Topbar";
import { ReactNode } from "react";

interface QuestionsLayoutProps {
  children: ReactNode;
}

const QuestionsLayout = ({ children }: QuestionsLayoutProps) => {
  return (
    <>
      <Topbar />
      <main>{children}</main>
    </>
  );
};

export default QuestionsLayout;
