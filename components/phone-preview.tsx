"use client";

import { CaseColor } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";

export const PhonePreview = ({
  croppedImageUrl,
  color,
}: {
  croppedImageUrl: string;
  color: CaseColor;
}) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [renderDimension, setRenderDimension] = useState({
    height: 0,
    width: 0,
  });

  const handleResize = useCallback(() => {
    if (!ref) return;

    const { width, height } = ref.getBoundingClientRect();

    setRenderDimension({ width, height });
  }, [ref]);

  useEffect(() => {
    if (!ref) return;

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref, handleResize]);

  let caseBackgroundColor = "bg-zinc-950";
  if (color === "blue") caseBackgroundColor = "bg-blue-950";
  if (color === "rose") caseBackgroundColor = "bg-rose-950";

  return (
    <AspectRatio ref={setRef} ratio={3000 / 2001} className="relative">
      <div
        className="absolute z-20 scale-[1.0352]"
        style={{
          left:
            renderDimension.width / 2 - renderDimension.width / (1216 / 121),

          top: renderDimension.height / 6.22,
        }}
      >
        <img
          width={renderDimension.width / (3000 / 637)}
          src={croppedImageUrl}
          alt="Phonecase preview"
          className={cn(
            "phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]",
            caseBackgroundColor
          )}
        />
      </div>

      <div className="relative h-full w-full z-40">
        <img
          src="/clearphone.png"
          alt="Phone"
          className="pointer-events-none h-full w-full antialiased rounded-md"
        />
      </div>
    </AspectRatio>
  );
};
