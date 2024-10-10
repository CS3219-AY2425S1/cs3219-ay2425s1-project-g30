import Topbar from "@/components/Topbar";
import { ReactNode } from "react";

interface QuestionLayoutProps {
  children: ReactNode;
}

const QuestionLayout = ({ children }: QuestionLayoutProps) => {
  return (
    <>
      <Topbar />
      <main>{children}</main>
    </>
  );
};

export default QuestionLayout;
