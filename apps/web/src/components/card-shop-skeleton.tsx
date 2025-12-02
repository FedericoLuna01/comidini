import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

const CardShopSkeleton = () => {
	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0 hover:cursor-pointer h-full">
			<Skeleton className="aspect-[4/3] relative w-full h-full" />
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg flex items-center gap-2 leading-tight">
						<Skeleton className="w-32 h-6" />
					</CardTitle>
				</div>
				<CardDescription className="text-sm">
					<Skeleton className="w-full h-4" />
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Skeleton className="w-24 h-4" />
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Skeleton className="w-24 h-4" />
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Skeleton className="w-24 h-4" />
				</div>
			</CardContent>
		</Card>
	);
};

export default CardShopSkeleton;
