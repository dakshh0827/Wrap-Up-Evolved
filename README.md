# 🌐 Wrap-Up Evolved: Study Differently
**A Decentralized Web3 AI Research & News Curation Platform**

[![Live Demo](https://img.shields.io/badge/Live%20App-wrap--up--evolved.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://wrap-up-evolved.vercel.app)
[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1VArPfAhkBISkHAeXDOzyIxS-Olp4CMUr/view?usp=sharing)
[![Chainlink Convergence](https://img.shields.io/badge/Hackathon-Chainlink%20Convergence-2A5ADA?style=for-the-badge)](https://chain.link/hackathon)

*Submitted for the **Chainlink Convergence Hackathon***
* **Main Track:** CRE & AI
* **Sponsor Track:** Tenderly Virtual TestNets

---

## 📖 Full Project Description

### What is it?
Wrap-Up Evolved is a fully-fledged social platform built for the modern Web3 researcher. We position it as a tool to **"Study Differently."** Instead of relying on noisy Twitter feeds or scattered Discord channels, Wrap-Up provides a gamified, decentralized ecosystem where high-quality articles and AI-generated research are curated, discussed, and cryptographically verified for accuracy.

### What problem does it solve?
The Web3 space is plagued by information overload, spam, and financially motivated "shilling." It is incredibly difficult for users to find factual, high-density educational content. Wrap-Up solves this by combining human curation with a **Chainlink CRE AI-in-the-loop fact-checker**, ensuring that the best content rises to the top and is visibly verified on-chain.

### 🌟 Core Features
1. **AI Research Reports:** Users input a prompt, and our backend AI engine scours the web to synthesize a comprehensive, high-quality research report. 
2. **Article Curation & Leaderboard:** Users can submit links to external articles. The platform extracts the content for better readability, and users earn tokens (WUP) by ranking on the curation leaderboard.
3. **Article Comparator:** A built-in tool allowing users to seamlessly compare different articles or research reports side-by-side.
4. **Decentralized Social Hub:** Wrap-Up is deeply social. Every curated article and research report features a Reddit-style discussion thread where users can comment, upvote, and debate, with all interactions permanently backed by the blockchain.

---

## 🏗️ Architecture & Technical Workflow

Our architecture bridges traditional Web2 AI capabilities with robust Web3 infrastructure:

1. **Generation & Storage:** When an article is curated or an AI Research Report is generated, the content is compiled and uploaded directly to **IPFS**.
2. **On-Chain Commitment:** The resulting IPFS Hash is then submitted to our smart contracts deployed on the **Tenderly Virtual TestNet**.
3. **Chainlink CRE Orchestration:** The submission triggers our Chainlink Runtime Environment (CRE) workflow. The CRE fetches the IPFS data, runs it through an AI Agent to evaluate its factual accuracy, and executes a verifiable transaction back to the Tenderly smart contract with an "AI Quality Score."
4. **Real-Time UI:** The frontend (built with React/Wagmi) polls the Tenderly testnet and dynamically displays the verified AI Score badge on the article card.

### 🛠️ Tech Stack
* **Smart Contracts:** Solidity, Foundry
* **Infrastructure:** Tenderly Virtual TestNets (Chain ID: `9991`)
* **Orchestration:** Chainlink Runtime Environment (CRE v1.3.0)
* **Frontend:** React, Vite, TailwindCSS, Zustand, Wagmi
* **Storage:** IPFS (Pinata)
* **Backend APIs:** Node.js, Express, AI Integration

---

## 🔗 Chainlink Usage (CRE & AI Track)

We utilized the **Chainlink Runtime Environment (CRE)** as the critical orchestration layer for our AI fact-checking engine. 

Instead of trusting a centralized backend to rate articles, we built a CRE Workflow that simulates a decentralized oracle network (DON) fetching the IPFS content and evaluating it via an AI Agent. The workflow then verifiably executes the `updateAIScore` function on our smart contract.

**Links to all files that use Chainlink:**
* 🧠 **The CRE Workflow Simulation:** [`/wrapup-cre/ai-audit/main.ts`](./wrapup-cre/ai-audit/main.ts) *(This file contains the TypeScript logic executed by the CRE CLI to trigger the AI evaluation and format the on-chain payload).*
* 📜 **The Smart Contract Receiver:** [`/contracts/src/WrapUp.sol`](./contracts/src/WrapUp.sol) *(See lines defining `articleAIScores` mapping and the `updateAIScore` function).*
* 🖥️ **The Frontend Verification:** [`/frontend/src/components/ArticleCard.jsx`](./frontend/src/components/ArticleCard.jsx) *(See the Wagmi `useReadContract` hook that polls the blockchain for the Chainlink-delivered AI Score).*

---

## 🐻 Tenderly Integration (Sponsor Track)

To ensure rapid, zero-setup testing while maintaining mainnet state parity, the entire smart contract architecture is deployed on a **Tenderly Virtual TestNet**. 

By using Tenderly, we were able to seamlessly test our Chainlink CRE transaction executions in a controlled, fully synced environment before moving to production.

### Tenderly Deployment Details
* **Network:** Tenderly Virtual TestNet (Forked Environment)
* **Chain ID:** `9991`
* **Tenderly RPC URL:** *(Add your specific Tenderly RPC here if you want it public, or mention it's configured locally)*

**Deployed Contracts (Tenderly Explorer Links):**
*(Note: Replace these with your actual Tenderly Explorer URLs if applicable, otherwise leave the addresses)*
* **WrapUp Core Contract:** `0xA5123b6D0e67b634DA8DC118DE99F72f24B6A33a`
* **WUP Token:** `0x0b8Fe0D4e677E6a99b2B47b2F34A0e0D85240C24`
* **WUP Claimer:** `0x5d8fE749F352F9D7C0725E9b78C51840B8b134e0`

---
