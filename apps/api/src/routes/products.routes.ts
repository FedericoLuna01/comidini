import { createProductSchema } from "@repo/db/src/types/product";
import { createProduct, getAllProductsByShopId } from "@repo/db/src/services/products"
import { Router } from "express";
import { requireShopUser } from "../middlewares/requireShopUser";
import { requireShop } from "../middlewares/requireShop";

const router: Router = Router();

router.post("/", requireShopUser, requireShop, async (req, res) => {

  if (!req.shop) {
    res.status(400).json({ error: "Shop not found" });
    return;
  }

  const body = req.body;

  const validatedFields = createProductSchema.safeParse(body)

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error);
    res.status(400).json({ error: "Invalid product data", details: validatedFields.error });
    return;
  }

  const newProduct = {
    ...validatedFields.data,
    shopId: req.shop.id,
  };

  const product = await createProduct(newProduct);

  if (!product) {
    res.status(500).json({ error: "Failed to create product" });
    return;
  }

  res.status(201).json(product);

})

router.get("/shop/:shopId", requireShopUser, requireShop, async (req, res) => {
  if (!req.shop) {
    res.status(400).json({ error: "Shop not found" });
    return;
  }

  const products = await getAllProductsByShopId(req.shop.id);
  res.status(200).json(products);
})

export default router;
