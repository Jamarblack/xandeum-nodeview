import { PNode, NetworkStats } from '@/types/pnode';

const regions = ['NA-East', 'NA-West', 'EU-Central', 'EU-West', 'APAC-Tokyo', 'APAC-Singapore'];
const countries: Record<string, string[]> = {
  'NA-East': ['US', 'CA'],
  'NA-West': ['US', 'CA', 'MX'],
  'EU-Central': ['DE', 'NL', 'PL', 'CZ'],
  'EU-West': ['GB', 'FR', 'IE', 'ES'],
  'APAC-Tokyo': ['JP', 'KR'],
  'APAC-Singapore': ['SG', 'AU', 'IN'],
};

const versions = ['v1.2.4', 'v1.2.3', 'v1.2.2', 'v1.2.1', 'v1.1.9'];

const generateHash = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = 'Qm';
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

const generateIP = (): string => {
  return `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const getRandomStatus = (): PNode['status'] => {
  const rand = Math.random();
  if (rand < 0.75) return 'Active';
  if (rand < 0.92) return 'Gossip';
  return 'Offline';
};

const generateNode = (index: number): PNode => {
  const region = regions[Math.floor(Math.random() * regions.length)];
  const countryList = countries[region];
  const status = getRandomStatus();
  
  const baseUptime = status === 'Active' ? 95 : status === 'Gossip' ? 80 : 40;
  const uptimeVariation = Math.random() * 5;
  
  const lastSeenHours = status === 'Active' ? 0 : status === 'Gossip' ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 24) + 2;
  const lastSeen = new Date(Date.now() - lastSeenHours * 60 * 60 * 1000).toISOString();
  
  return {
    id: generateHash(),
    ipAddress: generateIP(),
    status,
    uptimePercentage: parseFloat((baseUptime + uptimeVariation).toFixed(2)),
    region,
    countryCode: countryList[Math.floor(Math.random() * countryList.length)],
    version: versions[Math.floor(Math.random() * versions.length)],
    lastSeen,
    reputationScore: Math.floor(Math.random() * 30) + (status === 'Active' ? 70 : status === 'Gossip' ? 50 : 20),
    stake: Math.floor(Math.random() * 100000) + 10000,
    rewards24h: parseFloat((Math.random() * 50 + 5).toFixed(2)),
  };
};

export const mockNodes: PNode[] = Array.from({ length: 50 }, (_, i) => generateNode(i));

export const calculateNetworkStats = (nodes: PNode[]): NetworkStats => {
  const activeNodes = nodes.filter(n => n.status === 'Active').length;
  const gossipNodes = nodes.filter(n => n.status === 'Gossip').length;
  const offlineNodes = nodes.filter(n => n.status === 'Offline').length;
  
  const averageUptime = nodes.reduce((acc, n) => acc + n.uptimePercentage, 0) / nodes.length;
  
  const regionCounts = nodes.reduce((acc, n) => {
    if (n.status === 'Active') {
      acc[n.region] = (acc[n.region] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const mostActiveRegion = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  
  const healthScore = Math.round(
    (activeNodes / nodes.length * 50) +
    (averageUptime / 100 * 30) +
    ((100 - offlineNodes / nodes.length * 100) * 0.2)
  );
  
  const totalStake = nodes.reduce((acc, n) => acc + (n.stake || 0), 0);
  
  return {
    totalNodes: nodes.length,
    activeNodes,
    gossipNodes,
    offlineNodes,
    averageUptime: parseFloat(averageUptime.toFixed(2)),
    networkHealthScore: healthScore,
    mostActiveRegion,
    totalStake,
  };
};

// Generate uptime history for charts
export const uptimeHistory = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
  uptime: 96 + Math.random() * 3,
  nodes: 45 + Math.floor(Math.random() * 5),
}));

// Region distribution for charts
export const regionDistribution = regions.map(region => ({
  region: region.split('-')[0] + (region.includes('-') ? ` ${region.split('-')[1]}` : ''),
  shortName: region.split('-')[0],
  count: mockNodes.filter(n => n.region === region).length,
  active: mockNodes.filter(n => n.region === region && n.status === 'Active').length,
}));
