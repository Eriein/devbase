import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null | undefined;
  image: string | null | undefined;
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-7", className)}>
      {image && <AvatarImage src={image} alt={name ?? "User"} />}
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
