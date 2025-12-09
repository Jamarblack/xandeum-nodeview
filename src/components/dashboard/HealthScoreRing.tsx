import { cn } from '@/lib/utils';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const HealthScoreRing = ({
  score,
  size = 120,
  strokeWidth = 8,
  className,
}: HealthScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Background ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            getScoreColor(score)
          )}
          style={{
            filter: 'drop-shadow(0 0 6px currentColor)',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", getScoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Grade: {getScoreGrade(score)}
        </span>
      </div>
    </div>
  );
};

export default HealthScoreRing;
