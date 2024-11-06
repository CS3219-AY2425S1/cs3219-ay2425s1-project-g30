import { ROLE } from '@repo/dtos/generated/enums/auth.enums';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const getBadgeColor = (complexity: string) => {
  switch (complexity) {
    case ROLE.Admin:
      return 'bg-red-400 text-white hover:bg-red-400';
    case ROLE.User:
      return 'bg-green-400 text-white hover:bg-green-400';
  }
};

const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  const colorClass = getBadgeColor(role);

  return (
    <Badge style={{ userSelect: 'none' }} className={cn(className, colorClass)}>
      {role}
    </Badge>
  );
};

export default RoleBadge;
