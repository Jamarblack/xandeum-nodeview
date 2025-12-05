import { useState, useMemo } from 'react';
import { Server, Activity, Globe, Shield, Zap, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import HealthScoreRing from '@/components/dashboard/HealthScoreRing';
import SparklineChart from '@/components/dashboard/SparklineChart';
import NodeTable from '@/components/dashboard/NodeTable';
import NetworkMap from '@/components/dashboard/NetworkMap';
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockNodes, calculateNetworkStats, uptimeHistory } from '@/data/mockNodes';

const Index = () => {
  const [activeTab, setActiveTab] = useState('explorer');
  
  const networkStats = useMemo(() => calculateNetworkStats(mockNodes), []);
  const uptimeSparklineData = useMemo(
    () => uptimeHistory.map(d => d.uptime),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-[0.02] pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] pointer-events-none" />
      
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gradient">Network</span> Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for the Xandeum pNode network
            </p>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Total pNodes Online"
              value={`${networkStats.activeNodes}/${networkStats.totalNodes}`}
              icon={<Server className="h-5 w-5" />}
              trend="up"
              trendValue="+2 today"
              className="animate-fade-in"
              style={{ animationDelay: '0.1s' } as React.CSSProperties}
            >
              <div className="flex items-center gap-4 text-sm">
                <span className="text-success">{networkStats.activeNodes} active</span>
                <span className="text-warning">{networkStats.gossipNodes} gossip</span>
                <span className="text-destructive">{networkStats.offlineNodes} offline</span>
              </div>
            </StatCard>

            <StatCard
              title="Global Avg. Uptime"
              value={`${networkStats.averageUptime}%`}
              icon={<Activity className="h-5 w-5" />}
              trend="up"
              trendValue="+0.3%"
              className="animate-fade-in"
              style={{ animationDelay: '0.15s' } as React.CSSProperties}
            >
              <SparklineChart data={uptimeSparklineData} width={100} height={28} />
            </StatCard>

            <StatCard
              title="Most Active Region"
              value={networkStats.mostActiveRegion.replace('-', ' ')}
              icon={<Globe className="h-5 w-5" />}
              subtitle="Based on node density"
              className="animate-fade-in"
              style={{ animationDelay: '0.2s' } as React.CSSProperties}
            />

            <StatCard
              title="Network Health"
              value=""
              icon={<Shield className="h-5 w-5" />}
              className="animate-fade-in"
              style={{ animationDelay: '0.25s' } as React.CSSProperties}
            >
              <div className="flex items-center justify-center -mt-2">
                <HealthScoreRing score={networkStats.networkHealthScore} size={100} />
              </div>
            </StatCard>
          </section>

          {/* Additional Stats Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Total Network Stake"
              value={`${(networkStats.totalStake / 1000000).toFixed(2)}M`}
              icon={<Zap className="h-5 w-5" />}
              trend="up"
              trendValue="+125K"
              subtitle="XND tokens staked"
              className="animate-fade-in"
              style={{ animationDelay: '0.3s' } as React.CSSProperties}
            />
            <StatCard
              title="24h Rewards Distributed"
              value="2,847.32"
              icon={<TrendingUp className="h-5 w-5" />}
              trend="neutral"
              trendValue="stable"
              subtitle="XND distributed to operators"
              className="animate-fade-in"
              style={{ animationDelay: '0.35s' } as React.CSSProperties}
            />
          </section>

          {/* Tabs Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' } as React.CSSProperties}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-secondary/50 border border-border/50 p-1">
                <TabsTrigger
                  value="explorer"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Node Explorer
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Network Map
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="mt-6">
                <NodeTable nodes={mockNodes} />
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <NetworkMap nodes={mockNodes} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AnalyticsCharts />
              </TabsContent>
            </Tabs>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>Xandeum pNode Analytics Platform • Built for Hackathon 2024</p>
            <p className="mt-1 text-xs">
              Powered by real-time network telemetry
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
