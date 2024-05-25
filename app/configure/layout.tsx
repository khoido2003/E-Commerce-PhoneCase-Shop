import { ReactNode } from "react";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import Steps from "@/components/steps";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <MaxWidthWrapper className="flex-1 flex flex-col ">
      <Steps />
      {children}
    </MaxWidthWrapper>
  );
};

export default Layout;
