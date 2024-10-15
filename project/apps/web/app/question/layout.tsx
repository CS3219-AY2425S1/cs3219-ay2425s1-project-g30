import { ReactNode } from 'react';
// import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface QuestionLayoutProps {
  children: ReactNode;
}

const QuestionLayout = ({ children }: QuestionLayoutProps) => {
  // enforce login here
  return children;
};

export default QuestionLayout;
