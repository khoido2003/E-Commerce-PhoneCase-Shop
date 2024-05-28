"use server";

import { BASE_PRICE, PRODUCTS_PRICE } from "@/config/products";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("Configuration not found!");
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You need to be logged in!");
  }

  const { finish, material } = configuration;

  let price = BASE_PRICE;

  if (finish === "textured") {
    price += PRODUCTS_PRICE.finish.textured;
  }
  if (material === "polycarbonate") {
    price += PRODUCTS_PRICE.material.polycarbonate;
  }
};
