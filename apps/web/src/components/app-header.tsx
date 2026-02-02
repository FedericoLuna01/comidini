import { Button } from "@repo/ui/components/ui/button";
import { Logo } from "@repo/ui/components/ui/logo";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import AvatarDropdown from "./avatar-dropdown";
import { CartSheet } from "./cart-sheet";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-50 flex items-center justify-between py-4 border-b bg-background px-8">
			<Logo />
			<div className="flex items-center gap-4">
				<Link to="/buscar">
					<Button variant="ghost" size="icon" className="h-9 w-9">
						<Search className="h-5 w-5" />
						<span className="sr-only">Buscar</span>
					</Button>
				</Link>
				<CartSheet />
				<AvatarDropdown />
			</div>
		</header>
	);
}
