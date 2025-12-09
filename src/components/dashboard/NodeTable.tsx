import { useState, useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, Copy, Check, ChevronUp, ChevronDown, ChevronsUpDown, 
  ExternalLink, ChevronLeft, ChevronRight, Server, Globe, 
  Activity, Shield, Zap, Cpu 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NodeTableProps {
  nodes: PNode[];
}

type SortField = 'rank' | 'status' | 'reputationScore' | 'uptimePercentage' | 'region' | 'stake';
type SortDirection = 'asc' | 'desc' | null;

const countryFlags: Record<string, string> = {
  US: '🇺🇸', CA: '🇨🇦', DE: '🇩🇪', NL: '🇳🇱', GB: '🇬🇧', FR: '🇫🇷', 
  JP: '🇯🇵', SG: '🇸🇬', AU: '🇦🇺', IN: '🇮🇳', IE: '🇮🇪', ES: '🇪🇸'
};

const ITEMS_PER_PAGE = 10;

const NodeTable = ({ nodes }: NodeTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast({ title: 'Copied!', description: 'Address copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDetails = (node: PNode) => {
    setSelectedNode(node);
    setIsDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedNodes = useMemo(() => {
    let result = [...nodes];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => n.id.toLowerCase().includes(query) || n.ipAddress.includes(query));
    }
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        // @ts-ignore
        const aVal = a[sortField], bVal = b[sortField];
        if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
      });
    }
    return result;
  }, [nodes, searchQuery, sortField, sortDirection]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]">🏆</div>;
    if (rank === 2) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/50">🥈</div>;
    if (rank === 3) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/50">🥉</div>;
    return <div className="flex justify-center items-center w-8 h-8 font-mono text-muted-foreground opacity-70">#{rank}</div>;
  };

  const paginatedNodes = filteredAndSortedNodes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAndSortedNodes.length / ITEMS_PER_PAGE);

  const SortButton = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <button onClick={() => handleSort(field)} className={cn("flex items-center gap-1 hover:text-foreground transition-colors group", className)}>
      {label}
      <span className="text-muted-foreground group-hover:text-foreground">
        {sortField === field ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by Node ID or IP..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-10 bg-secondary/50 border-border/50" 
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="py-4 px-2 sm:px-4 text-center w-12 sm:w-16"><SortButton field="rank" label="#" /></th>
                <th className="py-4 px-2 sm:px-4 text-left font-medium text-muted-foreground">Validator / ID</th>
                {/* Hidden on Mobile */}
                <th className="py-4 px-4 text-left hidden md:table-cell"><SortButton field="stake" label="Stake" /></th>
                <th className="py-4 px-4 text-left hidden lg:table-cell"><SortButton field="reputationScore" label="Score" /></th>
                <th className="py-4 px-4 text-left hidden sm:table-cell"><SortButton field="uptimePercentage" label="Uptime" /></th>
                <th className="py-4 px-4 text-left hidden xl:table-cell"><SortButton field="region" label="Location" /></th>
                <th className="py-4 px-2 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNodes.map((node) => (
                <tr 
                  key={node.id} 
                  className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer group" 
                  onClick={() => openDetails(node)}
                >
                  <td className="py-3 px-2 sm:px-4 text-center font-mono text-muted-foreground">
                    {getRankDisplay(node.rank)}
                  </td>
                  
                  {/* Identity Column (Adaptive) */}
                  <td className="py-3 px-2 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hidden sm:flex items-center justify-center border border-primary/20">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                          {node.name || 'Anonymous Node'}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <code className="text-[10px] sm:text-xs text-muted-foreground font-mono">{node.id.slice(0, 8)}...</code>
                          {/* Status Badge - Compact on Mobile */}
                          <StatusBadge status={node.status} size="sm" showLabel={false} />
                          {/* Mobile Only: Show Stake Here */}
                          <span className="md:hidden text-[10px] text-muted-foreground bg-muted/50 px-1.5 rounded">
                            {Math.floor(node.stake || 0).toLocaleString()} X
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stake Column (Desktop) */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium">{Math.floor(node.stake || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">XAND</span>
                    </div>
                  </td>

                  {/* Score Column (Desktop) */}
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", node.reputationScore >= 80 ? "bg-success" : "bg-warning")} style={{ width: `${node.reputationScore}%` }} />
                      </div>
                      <span className="text-sm font-medium">{node.reputationScore}</span>
                    </div>
                  </td>

                  {/* Uptime Column (Tablet+) */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={cn("text-sm font-bold", node.uptimePercentage > 98 ? "text-success" : "text-warning")}>
                      {node.uptimePercentage.toFixed(2)}%
                    </span>
                  </td>

                  {/* Location Column (Large Desktop) */}
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryFlags[node.countryCode] || '🌍'}</span>
                      <span className="text-sm text-muted-foreground">{node.countryCode}</span>
                    </div>
                  </td>

                  {/* Action Column */}
                  <td className="py-3 px-2 sm:px-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                      <span className="hidden sm:inline mr-1.5">View</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl p-4 sm:p-6">
          {selectedNode && (
            <>
              <DialogHeader className="space-y-4 pb-4 border-b border-border/50 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
                        {selectedNode.name || 'Anonymous Node'}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={selectedNode.status} size="sm" />
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground truncate max-w-[150px]">{selectedNode.id}</code>
                        <button onClick={() => handleCopy(selectedNode.id)}><Copy className="h-3 w-3 text-muted-foreground hover:text-primary"/></button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:block sm:text-right bg-secondary/20 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold sm:mb-1">Global Rank</div>
                    <div className={cn(
                      "text-2xl sm:text-3xl font-bold",
                      selectedNode.rank === 1 ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" :
                      selectedNode.rank === 2 ? "text-slate-300" :
                      selectedNode.rank === 3 ? "text-amber-600" : "text-primary"
                    )}>
                      #{selectedNode.rank}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2">
                <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Zap className="h-4 w-4 text-yellow-500"/> Active Stake</div>
                  <div className="text-xl sm:text-2xl font-bold">{Math.floor(selectedNode.stake || 0).toLocaleString()} <span className="text-sm text-muted-foreground font-normal">XAND</span></div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="h-4 w-4 text-green-500"/> Uptime</div>
                  <div className="text-xl sm:text-2xl font-bold">{selectedNode.uptimePercentage.toFixed(2)}%</div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Globe className="h-4 w-4 text-blue-500"/> Region</div>
                  <div className="text-base sm:text-lg font-medium flex items-center gap-2">
                    {countryFlags[selectedNode.countryCode]} {selectedNode.region}
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Cpu className="h-4 w-4 text-purple-500"/> Version</div>
                  <div className="text-base sm:text-lg font-mono">{selectedNode.version}</div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NodeTable;