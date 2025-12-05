# Xandeum Analytics Dashboard 🛡️

> A real-time, decentralized network monitor for Xandeum pNodes.
> **Winner of the Xandeum "Build Analytics Platform" Bounty** (Hopefully!)

![Dashboard Screenshot](./public/screenshot.png)

##  Mission
This platform provides deep visibility into the Xandeum storage layer. Unlike standard block explorers, Xandeum Analytics focuses specifically on the health, uptime, and geographic distribution of **pNodes**—the backbone of Xandeum's scalable storage.

##  Key Features
* **Real-Time Gossip Monitoring:** Connects directly to the Solana/Xandeum RPC to listen for cluster nodes.
* **"Demo Mode" Toggle:** A developer-friendly feature allowing users to toggle between live RPC data and a simulated high-traffic network state.
* **Global Node Map:** Visualizes the decentralization of the network.
* **Health Scoring Engine:** Calculates a composite "Reputation Score" based on uptime and version consistency.

##  Tech Stack
* **Framework:** React + Vite (Lightning fast)
* **Language:** TypeScript (Strict typing for RPC responses)
* **Styling:** Tailwind CSS + Shadcn/ui (Professional, responsive design)
* **Data:** `@solana/web3.js` for RPC connection.

##  How to Run
1.  Clone the repo
2.  `npm install`
3.  `npm run dev`

##  Future Roadmap
* **Deep Storage Inspection:** Integration with specific pRPC methods to verify stored fragments.
* **Validator Alerts:** Telegram/Discord bot integration for uptime alerts.