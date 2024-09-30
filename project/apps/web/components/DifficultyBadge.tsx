import { Badge } from "@/components/ui/badge";
import { COMPLEXITY } from "@/constants/question";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  complexity: string;
  className?: string;
}

const getBadgeColor = (complexity: string) => {
  switch (complexity) {
    case COMPLEXITY.Easy:
      return "bg-green-400 text-white hover:bg-green-400";
    case COMPLEXITY.Medium:
      return "bg-yellow-400 text-white hover:bg-yellow-400";
    case COMPLEXITY.Hard:
      return "bg-red-400 text-white hover:bg-red-400";
    default:
      return "bg-secondary text-white";
  }
};

const DifficultyBadge = ({ complexity, className }: DifficultyBadgeProps) => {
  const colorClass = getBadgeColor(complexity);

  return (
    <Badge style={{ userSelect: "none" }} className={cn(className, colorClass)}>
      {complexity}
    </Badge>
  );
};

export default DifficultyBadge;
