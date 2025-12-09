import { cn } from '@/lib/utils';
import { NodeStatus } from '@/types/pnode';

interface StatusBadgeProps {
  status: NodeStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<NodeStatus, { color: string; bgColor: string; label: string }> = {
  Active: {
    color: 'bg-success',
    bgColor: 'bg-success/10 text-success border-success/30',
    label: 'Active',
  },
  Gossip: {
    color: 'bg-warning',
    bgColor: 'bg-warning/10 text-warning border-warning/30',
    label: 'Gossip',
  },
  Offline: {
    color: 'bg-destructive',
    bgColor: 'bg-destructive/10 text-destructive border-destructive/30',
    label: 'Offline',
  },
};

const StatusBadge = ({ status, showLabel = true, size = 'md' }: StatusBadgeProps) => {
  // Safe fallback if status is somehow undefined or invalid
  const config = statusConfig[status] || statusConfig.Offline;

  const sizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  const badgeSizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.bgColor,
        badgeSizes[size]
      )}
    >
      <span className="relative flex">
        <span className={cn("rounded-full", config.color, sizeClasses[size])} />
        {status === 'Active' && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              config.color,
              "opacity-40"
            )}
          />
        )}
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export default StatusBadge;