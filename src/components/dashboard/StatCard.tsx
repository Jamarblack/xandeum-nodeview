import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  children,
  style,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-6 relative overflow-hidden group hover-glow transition-all duration-300",
        className
      )}
      style={style}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            {value}
          </div>
          
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    trend === 'up' && "bg-success/10 text-success",
                    trend === 'down' && "bg-destructive/10 text-destructive",
                    trend === 'neutral' && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend === 'neutral' && <Minus className="h-3 w-3" />}
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

export default StatCard;
