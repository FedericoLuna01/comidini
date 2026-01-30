import { Separator } from "@repo/ui/components/ui/separator";
import type { CartData } from "../api/cart";

interface CartSummaryProps {
	cartData: CartData;
}

export function CartSummary({ cartData }: CartSummaryProps) {
	const calculateTotals = () => {
		let subtotal = 0;

		for (const item of cartData.items) {
			if (!item.product) continue;

			const basePrice = Number.parseFloat(item.product.price);
			const variantPrice = item.variant?.extraPrice
				? Number.parseFloat(item.variant.extraPrice)
				: 0;
			const addonsPrice = item.addons.reduce((sum, addonItem) => {
				if (!addonItem.addon) return sum;
				return (
					sum +
					Number.parseFloat(addonItem.addon.price) *
						addonItem.cartItemAddon.quantity
				);
			}, 0);

			subtotal +=
				(basePrice + variantPrice + addonsPrice) * item.cartItem.quantity;
		}

		// Aquí puedes agregar lógica para delivery fee, tax, descuentos, etc.
		const deliveryFee = 0; // TODO: calcular según tienda
		const tax = 0; // TODO: calcular impuestos si aplica
		const discount = 0; // TODO: aplicar cupones

		const total = subtotal + deliveryFee + tax - discount;

		return {
			subtotal,
			deliveryFee,
			tax,
			discount,
			total,
		};
	};

	const totals = calculateTotals();

	return (
		<div className="space-y-4">
			<div className="space-y-2 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Subtotal</span>
					<span>${totals.subtotal.toFixed(2)}</span>
				</div>

				{totals.deliveryFee > 0 && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Envío</span>
						<span>${totals.deliveryFee.toFixed(2)}</span>
					</div>
				)}

				{totals.tax > 0 && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Impuestos</span>
						<span>${totals.tax.toFixed(2)}</span>
					</div>
				)}

				{totals.discount > 0 && (
					<div className="flex justify-between text-green-600">
						<span>Descuento</span>
						<span>-${totals.discount.toFixed(2)}</span>
					</div>
				)}
			</div>

			<Separator />

			<div className="flex justify-between text-base font-semibold">
				<span>Total</span>
				<span>${totals.total.toFixed(2)}</span>
			</div>
		</div>
	);
}
