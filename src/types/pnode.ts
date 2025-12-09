export interface PNode {
  id: string;
  ipAddress: string;
  status: 'Active' | 'Gossip' | 'Offline';
  uptimePercentage: number;
  region: string;
  countryCode: string;
  version: string;
  lastSeen: string;
  reputationScore: number;
  stake?: number;
  rewards24h?: number;
}

export type NodeStatus = PNode['status'];

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  gossipNodes: number;
  offlineNodes: number;
  averageUptime: number;
  networkHealthScore: number;
  mostActiveRegion: string;
  totalStake: number;
}
