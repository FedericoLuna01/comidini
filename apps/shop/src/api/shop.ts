import { CreateShop } from "@repo/db/src/types/shop";

export async function createShop(data: CreateShop) {
  await fetch("http://localhost:3001/api/shops/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
}
