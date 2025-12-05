import { useState, useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NodeTableProps {
  nodes: PNode[];
}

type SortField = 'status' | 'reputationScore' | 'uptimePercentage' | 'region' | 'version';
type SortDirection = 'asc' | 'desc' | null;

const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  CA: '🇨🇦',
  MX: '🇲🇽',
  DE: '🇩🇪',
  NL: '🇳🇱',
  PL: '🇵🇱',
  CZ: '🇨🇿',
  GB: '🇬🇧',
  FR: '🇫🇷',
  IE: '🇮🇪',
  ES: '🇪🇸',
  JP: '🇯🇵',
  KR: '🇰🇷',
  SG: '🇸🇬',
  AU: '🇦🇺',
  IN: '🇮🇳',
};

const ITEMS_PER_PAGE = 10;

const NodeTable = ({ nodes }: NodeTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({
      title: 'Copied!',
      description: 'Node ID copied to clipboard',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedNodes = useMemo(() => {
    let result = [...nodes];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (node) =>
          node.id.toLowerCase().includes(query) ||
          node.ipAddress.includes(query)
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (sortField === 'status') {
          const statusOrder = { Active: 0, Gossip: 1, Offline: 2 };
          const diff = statusOrder[a.status] - statusOrder[b.status];
          return sortDirection === 'asc' ? diff : -diff;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [nodes, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedNodes.length / ITEMS_PER_PAGE);
  const paginatedNodes = filteredAndSortedNodes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const truncateId = (id: string) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors group"
    >
      {label}
      <span className="text-muted-foreground group-hover:text-foreground">
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        )}
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Node ID
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <SortButton field="status" label="Status" />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <SortButton field="reputationScore" label="Reputation" />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <SortButton field="uptimePercentage" label="Uptime" />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <SortButton field="region" label="Location" />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <SortButton field="version" label="Version" />
                </th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedNodes.map((node, index) => (
                <tr
                  key={node.id}
                  className={cn(
                    "border-b border-border/30 hover:bg-secondary/30 transition-colors",
                    index === paginatedNodes.length - 1 && "border-b-0"
                  )}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-foreground">
                        {truncateId(node.id)}
                      </code>
                      <button
                        onClick={() => handleCopy(node.id)}
                        className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === node.id ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={node.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            node.reputationScore >= 80 ? "bg-success" :
                            node.reputationScore >= 60 ? "bg-warning" : "bg-destructive"
                          )}
                          style={{ width: `${node.reputationScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">
                        {node.reputationScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          node.uptimePercentage >= 95 ? "text-success" :
                          node.uptimePercentage >= 80 ? "text-warning" : "text-destructive"
                        )}
                      >
                        {node.uptimePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryFlags[node.countryCode] || '🌍'}</span>
                      <span className="text-sm text-muted-foreground">
                        {node.countryCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                      {node.version}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      View <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedNodes.length)} of{' '}
            {filteredAndSortedNodes.length} nodes
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeTable;
