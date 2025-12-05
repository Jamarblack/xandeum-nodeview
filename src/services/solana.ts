// src/services/solana.ts
import { Connection, ContactInfo } from "@solana/web3.js";

// Default to Xandeum Devnet if not specified.
// You might need to replace this with the specific Xandeum RPC URL from their private docs if different.
const DEFAULT_RPC_ENDPOINT = "https://api.devnet.solana.com"; 

export class SolanaService {
  private connection: Connection;

  constructor(endpoint: string = DEFAULT_RPC_ENDPOINT) {
    this.connection = new Connection(endpoint, "confirmed");
  }

  /**
   * Fetches all nodes currently in the gossip network.
   * This corresponds to the "pNodes appearing in gossip" requirement.
   */
  async getGossipNodes(): Promise<ContactInfo[]> {
    try {
      const nodes = await this.connection.getClusterNodes();
      return nodes;
    } catch (error) {
      console.error("Failed to fetch gossip nodes:", error);
      throw error;
    }
  }

  /**
   * Fetches general network performance info (TPS, block time, etc.)
   */
  async getNetworkStats() {
    try {
      const performance = await this.connection.getRecentPerformanceSamples(1);
      const epochInfo = await this.connection.getEpochInfo();
      return {
        tps: performance[0]?.numTransactions / performance[0]?.samplePeriodSecs || 0,
        slot: epochInfo.absoluteSlot,
        blockHeight: epochInfo.blockHeight,
      };
    } catch (error) {
      console.error("Failed to fetch network stats:", error);
      return null;
    }
  }
}

export const solanaService = new SolanaService();