import { Logo } from "@repo/ui/components/ui/logo";
import AvatarDropdown from "./avatar-dropdown";
import { CartSheet } from "./cart-sheet";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-50 flex items-center justify-between py-4 border-b bg-background px-8">
			<Logo />
			<div className="flex items-center gap-4">
				<CartSheet />
				<AvatarDropdown />
			</div>
		</header>
	);
}
