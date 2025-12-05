import { useState, useEffect, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { xandeumService } from '@/services/xandeum';
import { PNode, NetworkStats } from '@/types/pnode';
import { mockNodes, calculateNetworkStats } from '@/data/mockNodes';

// Helper to fetch country (Memoized to prevent rate limits)
const locationCache: Record<string, { region: string; country: string }> = {};
const getGeoData = async (ip: string) => {
  if (!ip || ip === 'Unknown') return { region: 'Unknown', country: 'UN' };
  if (locationCache[ip]) return locationCache[ip];
  
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) throw new Error('Rate limited');
    const data = await res.json();
    const result = { region: data.region_code || 'Unknown', country: data.country_code || 'UN' };
    locationCache[ip] = result;
    return result;
  } catch {
    return { region: 'Unknown', country: 'UN' };
  }
};

export const useNodeData = (useMockData = false) => {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setNodes(mockNodes);
      } else {
        // 1. Fetch Gossip Nodes (The "pNode" requirement)
        const gossipNodes = await xandeumService.getGossipNodes();
        
        // 2. Fetch Validator Info (To get Stake & "Identity" features)
        // We use a temporary connection to standard devnet for vote accounts if needed
        const connection = new Connection("https://api.devnet.solana.com");
        const { current, delinquent } = await connection.getVoteAccounts();
        const allValidators = [...current, ...delinquent];

        // 3. Merge Data
        const mappedNodes: PNode[] = await Promise.all(
          gossipNodes.slice(0, 50).map(async (gNode, index) => { // Limit to 50 for demo speed
            
            // Find matching validator info if it exists
            const validatorInfo = allValidators.find(v => v.nodePubkey === gNode.pubkey);
            
            // Real GeoIP
            const geo = await getGeoData(gNode.gossip || '');

            return {
              id: gNode.pubkey,
              // If we found a validator match, use their Identity Name (if known), else shorten ID
              // Note: On Devnet, names are rare. In a real app, you'd query a registry like keybase.
              name: validatorInfo ? `Validator ${gNode.pubkey.slice(0,4)}` : undefined, 
              
              ipAddress: gNode.gossip || 'Unknown',
              status: gNode.tpu ? 'Active' : 'Gossip',
              uptimePercentage: validatorInfo ? 99.5 : 0, // Assume active validators have uptime
              
              // FIX: Ensure we don't duplicate codes here
              region: geo.region !== 'Unknown' ? geo.region : 'Global',
              countryCode: geo.country,
              
              version: gNode.version || 'Unknown',
              lastSeen: new Date().toISOString(),
              
              // Calculate Score based on real presence
              reputationScore: (gNode.tpu ? 50 : 0) + (validatorInfo ? 40 : 0) + (gNode.version ? 10 : 0),
              
              // Real Stake from Vote Accounts
              stake: validatorInfo ? validatorInfo.activatedStake / 1000000000 : 0, // Convert Lamports to SOL
              
              rank: 0, // Will assign after sort
            };
          })
        );

        // Sort by Stake (like topvalidators.app) and assign Ranks
        const sortedNodes = mappedNodes
          .sort((a, b) => (b.stake || 0) - (a.stake || 0))
          .map((node, i) => ({ ...node, rank: i + 1 }));
        
        setNodes(sortedNodes);
      }
    } catch (err) {
      console.error("Fetch failed, using mock:", err);
      setNodes(mockNodes);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, [useMockData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const stats: NetworkStats = calculateNetworkStats(nodes);

  return { nodes, stats, loading, lastRefreshed, refresh: fetchData };
};