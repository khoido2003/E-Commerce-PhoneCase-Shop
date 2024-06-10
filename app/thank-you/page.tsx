import { Suspense } from "react";
import { ThankYou } from "./thank-you";

const Page = () => {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
};

export default Page;
