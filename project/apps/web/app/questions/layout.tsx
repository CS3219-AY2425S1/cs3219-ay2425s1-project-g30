import { ReactNode } from 'react';
// import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface QuestionsLayoutProps {
  children: ReactNode;
}

const QuestionsLayout = ({ children }: QuestionsLayoutProps) => {
  // enforce login here
  return children;
};

export default QuestionsLayout;
