import { ReactNode } from 'react';
// import { EnforceLoginStatePageWrapper } from "@/components/auth-wrappers/EnforceLoginStatePageWrapper";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  // enforce login here
  return children;
};

export default ProfileLayout;
