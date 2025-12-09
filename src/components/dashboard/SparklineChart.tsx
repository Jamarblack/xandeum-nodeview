import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}

const SparklineChart = ({
  data,
  width = 80,
  height = 24,
  strokeColor = 'hsl(var(--primary))',
  fillColor = 'hsl(var(--primary) / 0.2)',
  className,
}: SparklineChartProps) => {
  const pathData = useMemo(() => {
    if (data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    const linePath = `M${points.join(' L')}`;
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return { linePath, areaPath };
  }, [data, width, height]);

  if (!pathData) return null;

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathData.areaPath}
        fill="url(#sparklineGradient)"
      />
      <path
        d={pathData.linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * height}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
};

export default SparklineChart;
