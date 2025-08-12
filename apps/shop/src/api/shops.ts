import { CreateShop, CreateShopHours } from "@repo/db/src/types/shop";

export async function createShop(data: CreateShop) {
  const response = await fetch("http://localhost:3001/api/shops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  return response.json()
}

export async function getShopHours() {
  const response = await fetch("http://localhost:3001/api/shops/hours", {
    method: "GET",
    credentials: "include",
  });

  return response.json();
}

export async function updateShopHours(hoursData: CreateShopHours[]) {
  const response = await fetch(`http://localhost:3001/api/shops/hours`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(hoursData),
  });

  if (!response.ok) {
    throw new Error("Failed to update shop hours");
  }

  return response.json();
}
