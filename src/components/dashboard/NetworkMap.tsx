import { useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface NetworkMapProps {
  nodes: PNode[];
}

// Simplified world map coordinates for node placement
const regionCoordinates: Record<string, { x: number; y: number }[]> = {
  'NA-East': [
    { x: 25, y: 35 },
    { x: 27, y: 38 },
    { x: 23, y: 40 },
    { x: 26, y: 42 },
  ],
  'NA-West': [
    { x: 15, y: 38 },
    { x: 13, y: 40 },
    { x: 17, y: 42 },
    { x: 14, y: 35 },
  ],
  'EU-Central': [
    { x: 52, y: 32 },
    { x: 54, y: 35 },
    { x: 50, y: 33 },
    { x: 53, y: 37 },
  ],
  'EU-West': [
    { x: 46, y: 34 },
    { x: 48, y: 36 },
    { x: 44, y: 38 },
    { x: 47, y: 32 },
  ],
  'APAC-Tokyo': [
    { x: 82, y: 38 },
    { x: 84, y: 40 },
    { x: 80, y: 42 },
    { x: 83, y: 36 },
  ],
  'APAC-Singapore': [
    { x: 75, y: 55 },
    { x: 77, y: 52 },
    { x: 73, y: 58 },
    { x: 76, y: 48 },
  ],
};

const NetworkMap = ({ nodes }: NetworkMapProps) => {
  const nodesByRegion = useMemo(() => {
    return nodes.reduce((acc, node) => {
      if (!acc[node.region]) acc[node.region] = [];
      acc[node.region].push(node);
      return acc;
    }, {} as Record<string, PNode[]>);
  }, [nodes]);

  const getStatusColor = (status: PNode['status']) => {
    switch (status) {
      case 'Active':
        return 'fill-success';
      case 'Gossip':
        return 'fill-warning';
      case 'Offline':
        return 'fill-destructive';
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Global Node Distribution</h3>
            <p className="text-sm text-muted-foreground">Real-time network topology visualization</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">Gossip</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative aspect-[2/1] bg-secondary/30 rounded-xl overflow-hidden border border-border/50">
          {/* Simplified world map outline */}
          <svg
            viewBox="0 0 100 60"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Connection lines between regions */}
            <g className="opacity-20">
              <line x1="25" y1="38" x2="47" y2="35" stroke="hsl(var(--primary))" strokeWidth="0.2" strokeDasharray="2,2" />
              <line x1="47" y1="35" x2="52" y2="34" stroke="hsl(var(--primary))" strokeWidth="0.2" strokeDasharray="2,2" />
              <line x1="52" y1="34" x2="75" y2="50" stroke="hsl(var(--primary))" strokeWidth="0.2" strokeDasharray="2,2" />
              <line x1="75" y1="50" x2="82" y2="38" stroke="hsl(var(--primary))" strokeWidth="0.2" strokeDasharray="2,2" />
              <line x1="15" y1="40" x2="25" y2="38" stroke="hsl(var(--primary))" strokeWidth="0.2" strokeDasharray="2,2" />
            </g>

            {/* Continent shapes (simplified) */}
            <g className="fill-muted/30 stroke-border/50" strokeWidth="0.3">
              {/* North America */}
              <path d="M5,25 Q15,15 25,20 L30,35 Q35,45 25,50 L15,48 Q5,45 5,35 Z" />
              {/* South America */}
              <path d="M22,55 Q25,50 28,55 L30,70 Q28,75 25,75 L22,70 Z" />
              {/* Europe */}
              <path d="M42,25 L55,23 Q60,28 55,35 L48,40 Q42,38 42,30 Z" />
              {/* Africa */}
              <path d="M45,42 L55,40 Q60,50 55,65 L50,70 Q45,68 45,55 Z" />
              {/* Asia */}
              <path d="M58,20 L85,18 Q90,30 85,45 L70,50 Q60,45 58,35 Z" />
              {/* Australia */}
              <path d="M78,55 Q82,52 88,55 L90,62 Q88,68 82,68 L78,62 Z" />
            </g>

            {/* Node points */}
            {Object.entries(nodesByRegion).map(([region, regionNodes]) => {
              const coords = regionCoordinates[region] || [];
              return regionNodes.slice(0, coords.length).map((node, index) => {
                const coord = coords[index];
                if (!coord) return null;
                return (
                  <g key={node.id}>
                    {/* Glow effect for active nodes */}
                    {node.status === 'Active' && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="2"
                        className="fill-success/30 animate-pulse-glow"
                      />
                    )}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="1"
                      className={cn(getStatusColor(node.status), "transition-all duration-300")}
                    />
                  </g>
                );
              });
            })}

            {/* Region labels */}
            <g className="fill-muted-foreground text-[3px] font-medium">
              <text x="20" y="48">NA</text>
              <text x="48" y="43">EU</text>
              <text x="80" y="48">APAC</text>
            </g>
          </svg>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Region stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {Object.entries(nodesByRegion).map(([region, regionNodes]) => {
            const activeCount = regionNodes.filter(n => n.status === 'Active').length;
            return (
              <div key={region} className="text-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="text-lg font-bold text-foreground">{regionNodes.length}</div>
                <div className="text-xs text-muted-foreground">{region.replace('-', ' ')}</div>
                <div className="text-[10px] text-success mt-1">{activeCount} active</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
