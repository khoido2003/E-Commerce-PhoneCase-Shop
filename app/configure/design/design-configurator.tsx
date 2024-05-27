"use client";

/*
[
'bg-blue-950 border-blue-950',
'bg-zinc-900 border-zinc-900',
'bg-rose-950 border-rose-950'
]
*/

import { cn, formatPrice } from "@/lib/utils";
import { Rnd } from "react-rnd";
import NextImage from "next/image";

import { HandleComponent } from "@/components/handle-component";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Description, Radio, RadioGroup } from "@headlessui/react";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";

import {
  COLORS,
  FINISHES,
  MATERIALS,
  MODELS,
} from "@/validators/option-validators";
import { BASE_PRICE } from "@/config/products";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { SaveConfigArgs, saveConfig as _saveConfig } from "./design";
import { useRouter } from "next/navigation";
import { config } from "process";

interface DesignConfiguratorProps {
  configId: string;
  imageUrl: string;
  imageDimension: {
    width: number;
    height: number;
  };
}

export const DesignConfigurator = ({
  configId,
  imageUrl,
  imageDimension,
}: DesignConfiguratorProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const { mutate: saveConfig } = useMutation({
    mutationKey: ["save-config"],

    mutationFn: async (args: SaveConfigArgs) => {
      await Promise.all([saveConfiguration(), _saveConfig(args)]);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      router.push(`/config/preview?id=${configId}`);
    },
  });

  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
    material: (typeof MATERIALS.options)[number];
    finish: (typeof FINISHES.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });

  const [renderDimension, setRenderDimension] = useState({
    width: imageDimension.width / 4,
    height: imageDimension.height / 4,
  });

  const [renderPosition, setRenderPosition] = useState({
    x: 100,
    y: 205,
  });

  const phonecaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startUpload } = useUploadThing("imageUploader");

  async function saveConfiguration() {
    try {
      const {
        left: caseLeft,
        top: caseTop,
        width,
        height,
      } = phonecaseRef!.current!.getBoundingClientRect();

      const { left: containerLef, top: containerTop } =
        containerRef.current!.getBoundingClientRect();

      const leftOffset = caseLeft - containerLef;
      const topOffset = caseTop - containerTop;

      const actualX = renderPosition.x - leftOffset;
      const actualY = renderPosition.y - topOffset;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      const userImage = new Image();

      userImage.crossOrigin = "anonymous";
      userImage.src = imageUrl;

      await new Promise((resolve) => (userImage.onload = resolve));

      ctx?.drawImage(
        userImage,
        actualX,
        actualY,
        renderDimension.width,
        renderDimension.height
      );

      const base64 = canvas.toDataURL();
      const base64Data = base64.split(",")[1];

      const blob = base64ToBlob(base64Data, "image/png");

      const file = new File([blob], "filename.png", { type: "image/png" });

      await startUpload([file], { configId });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description:
          "There was a problem saving your config, please try again later 😥",
        variant: "destructive",
      });
    }
  }

  // BASE64 to image(png)
  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div className="relative mt-20 mb-20 grid grid-cols-1 lg:grid-cols-3 pb-20">
      <div
        ref={containerRef}
        className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2  border-dashed border-gray-300 p-12 text-center focus:outline-none focus:right-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* Phonecase */}
        <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
          <AspectRatio
            ref={phonecaseRef}
            ratio={896 / 1831}
            className="pointer-events-none relative z-50 aspect-[896/1831 w-full"
          >
            <NextImage
              fill
              alt="phone image"
              src="/phone-template.png"
              className="pointer-events-none z-50 select-none"
            />
          </AspectRatio>
          <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
          <div
            className={cn(
              `absolute inset-0 left-[3px] top-px right-[1px] bottom-px rounded-[32px] bg-${options.color.tw}`
            )}
          />
        </div>

        {/* Resize the image to fit the phone case */}
        <Rnd
          default={{
            x: 100,
            y: 205,
            height: imageDimension.height / 4,
            width: imageDimension.width / 4,
          }}
          className="absolute z-20 border-[3px] border-primary"
          lockAspectRatio
          resizeHandleComponent={{
            bottomRight: <HandleComponent />,
            bottomLeft: <HandleComponent />,
            topLeft: <HandleComponent />,
            topRight: <HandleComponent />,
          }}
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            setRenderDimension({
              // 50px : Get rid of the pixel
              height: parseInt(ref.style.height.slice(0, -2)),
              width: parseInt(ref.style.width.slice(0, -2)),
            });

            setRenderPosition({ x, y });
          }}
          onDragStop={(_, data) => {
            const { x, y } = data;
            setRenderPosition({ x, y });
          }}
        >
          {" "}
          <div className="relative w-full h-full ">
            <NextImage
              src={imageUrl}
              fill
              alt="Your image"
              className="pointer-events-none"
            />
          </div>
        </Rnd>
      </div>

      <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          <div
            aria-hidden="true"
            className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"
          />

          <div className="px-8 pb-12 pt-8">
            <h2 className="tracking-tight font-bold text-3xl">
              Customize your case
            </h2>

            <div className="w-full h-px bg-zinc-200 my-6" />

            <div className="relative mt-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val,
                    }));
                  }}
                >
                  <Label>Color: {options.color.label}</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {COLORS.map((color) => (
                      <Radio
                        key={color.label}
                        value={color}
                        // @ts-ignore:next-line
                        className={({ active, checked }) =>
                          cn(
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:right-0 active:outline-none focus:outline-none border-2 border-transparent ",
                            {
                              [`border-${color.tw}`]: active || checked,
                            }
                          )
                        }
                      >
                        <span
                          className={cn(
                            `bg-${color.tw}`,
                            "h-8 w-8 rounded-full border border-black border-opacity-10 "
                          )}
                        ></span>
                      </Radio>
                    ))}
                  </div>
                </RadioGroup>

                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Model</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {options.model.label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {MODELS.options.map((model) => (
                        <DropdownMenuItem
                          key={model.label}
                          className={cn(
                            "flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100",
                            {
                              "bg-zinc-100":
                                model.label === options.model.label,
                            }
                          )}
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, model }));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              model.label === options.model.label
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {[MATERIALS, FINISHES].map(
                  ({ name, options: selectableOptions }) => (
                    <RadioGroup
                      key={name}
                      value={options[name]}
                      onChange={(val) => {
                        setOptions((prev) => ({
                          ...prev,
                          [name]: val,
                        }));
                      }}
                    >
                      <Label>
                        {name.slice(0, 1).toUpperCase() + name.slice(1)}
                      </Label>

                      <div className="mt-3 space-y-4">
                        {selectableOptions.map((option) => {
                          return (
                            <Radio
                              key={option.value}
                              value={option}
                              // @ts-ignore:next-line
                              className={({ active, checked }) =>
                                cn(
                                  "relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
                                  {
                                    "border-primary": active || checked,
                                  }
                                )
                              }
                            >
                              <span className="flex items-center">
                                <span className="flex flex-col text-sm">
                                  <Label className="font-medium text-gray-900">
                                    {option.label}
                                  </Label>

                                  {option.description ? (
                                    <Description
                                      as="span"
                                      className="text-gray-500"
                                    >
                                      <span className="block sm:inline">
                                        {option.description}
                                      </span>
                                    </Description>
                                  ) : null}
                                </span>
                              </span>

                              <Description
                                as="span"
                                className="flex mt-2 text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"
                              >
                                <span className="font-medium text-gray-900">
                                  {formatPrice(option.price / 100)}
                                </span>
                              </Description>
                            </Radio>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />

          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap">
                {formatPrice(
                  (BASE_PRICE + options.finish.price + options.material.price) /
                    100
                )}
              </p>
              <Button
                onClick={() =>
                  saveConfig({
                    configId,
                    color: options.color.value,
                    finish: options.finish.value,
                    material: options.material.value,
                    model: options.model.value,
                  })
                }
                size="sm"
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
