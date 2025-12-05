import { useState, useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Copy, Check, ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, ChevronLeft, ChevronRight, Server, Globe, Activity, Shield, Zap, Cpu, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NodeTableProps {
  nodes: PNode[];
}

type SortField = 'rank' | 'status' | 'reputationScore' | 'uptimePercentage' | 'region' | 'stake';
type SortDirection = 'asc' | 'desc' | null;

const countryFlags: Record<string, string> = {
  US: '🇺🇸', CA: '🇨🇦', DE: '🇩🇪', NL: '🇳🇱', GB: '🇬🇧', FR: '🇫🇷', JP: '🇯🇵', SG: '🇸🇬', AU: '🇦🇺', IN: '🇮🇳', IE: '🇮🇪', ES: '🇪🇸'
};

const ITEMS_PER_PAGE = 10;

const NodeTable = ({ nodes }: NodeTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank'); // Default sort by Rank
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
      setSortDirection('desc'); // Default to desc for most stats
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
        const aVal = a[sortField], bVal = b[sortField];
        if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
      });
    }
    return result;
  }, [nodes, searchQuery, sortField, sortDirection]);

  // Add this inside NodeTable component, before the return statement
const getRankDisplay = (rank: number) => {
  if (rank === 1) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]">🏆</div>;
  if (rank === 2) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/50">🥈</div>;
  if (rank === 3) return <div className="flex justify-center items-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/50">🥉</div>;
  
  // For ranks 4+, just a clean subtle number
  return <div className="flex justify-center items-center w-8 h-8 font-mono text-muted-foreground opacity-70">#{rank}</div>;
};

  const paginatedNodes = filteredAndSortedNodes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAndSortedNodes.length / ITEMS_PER_PAGE);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors group">
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
        <Input placeholder="Search by Node ID or IP..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="py-4 px-4 text-center w-16"><SortButton field="rank" label="#" /></th>
                <th className="py-4 px-4 text-left font-medium text-muted-foreground">Validator / ID</th>
                <th className="py-4 px-4 text-left"><SortButton field="stake" label="Stake (XAND)" /></th>
                <th className="py-4 px-4 text-left"><SortButton field="reputationScore" label="Score" /></th>
                <th className="py-4 px-4 text-left"><SortButton field="uptimePercentage" label="Uptime" /></th>
                <th className="py-4 px-4 text-left"><SortButton field="region" label="Location" /></th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNodes.map((node) => (
                <tr key={node.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => openDetails(node)}>
                  <td className="py-4 px-4 text-center font-mono text-muted-foreground">{getRankDisplay(node.rank)}</td>
                  
                  {/* Identity Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{node.name || 'Anonymous Node'}</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs text-muted-foreground font-mono">{node.id.slice(0, 8)}...</code>
                          <StatusBadge status={node.status} size="sm" showLabel={false} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stake Column */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{Math.floor(node.stake || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">0.15%</span>
                    </div>
                  </td>

                  {/* Score Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", node.reputationScore >= 80 ? "bg-success" : "bg-warning")} style={{ width: `${node.reputationScore}%` }} />
                      </div>
                      <span className="text-sm font-medium">{node.reputationScore}</span>
                    </div>
                  </td>

                  {/* Uptime Column */}
                  <td className="py-4 px-4">
                    <span className={cn("text-sm font-bold", node.uptimePercentage > 98 ? "text-success" : "text-warning")}>
                      {node.uptimePercentage.toFixed(2)}%
                    </span>
                  </td>

                  {/* Location Column - FIXED */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={node.countryCode}>{countryFlags[node.countryCode] || '🌍'}</span>
                      <span className="text-sm text-muted-foreground">{node.countryCode}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); openDetails(node); }}>
                      View <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls ... (Same as before) */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}><ChevronLeft className="h-4 w-4"/></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}><ChevronRight className="h-4 w-4"/></Button>
          </div>
        </div>
      </div>

      {/* Magnificent Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          {selectedNode && (
            <>
              <DialogHeader className="space-y-4 pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {selectedNode.name || 'Anonymous Node'}
                        <StatusBadge status={selectedNode.status} size="sm" />
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">{selectedNode.id}</code>
                        <button onClick={() => handleCopy(selectedNode.id)}><Copy className="h-3 w-3 text-muted-foreground hover:text-primary"/></button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">#{selectedNode.rank}</div>
                    <div className="text-xs text-muted-foreground">Global Rank</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Zap className="h-4 w-4 text-yellow-500"/> Active Stake</div>
                  <div className="text-2xl font-bold">{Math.floor(selectedNode.stake || 0).toLocaleString()} <span className="text-sm text-muted-foreground font-normal">XAND</span></div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="h-4 w-4 text-green-500"/> Uptime (Epoch)</div>
                  <div className="text-2xl font-bold">{selectedNode.uptimePercentage.toFixed(2)}%</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Globe className="h-4 w-4 text-blue-500"/> Region</div>
                  <div className="text-lg font-medium">{countryFlags[selectedNode.countryCode]} {selectedNode.region}, {selectedNode.countryCode}</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Cpu className="h-4 w-4 text-purple-500"/> Version</div>
                  <div className="text-lg font-mono">{selectedNode.version}</div>
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