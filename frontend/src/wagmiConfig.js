import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { arbitrumSepolia, baseSepolia, foundry } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// 1. Define Tenderly Virtual Testnet
const tenderlyTestnet = {
  id: 9991,
  name: 'Tenderly Virtual Testnet',
  network: 'tenderly-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'VETH',
    symbol: 'VETH',
  },
  rpcUrls: {
    public: { http: ['https://virtual.rpc.tenderly.co/iammohit64/project/private/iammohit64/d45bede3-6281-4ed8-82ce-ae482d735155'] },
    default: { http: ['https://virtual.rpc.tenderly.co/iammohit64/project/private/iammohit64/d45bede3-6281-4ed8-82ce-ae482d735155'] },
  },
  blockExplorers: {
    default: { name: 'Tenderly Explorer', url: 'https://virtual.tenderly.co/explorer' }, // Users can find exact links in dashboard
  },
};

const chains = [arbitrumSepolia, baseSepolia, foundry, tenderlyTestnet];

const metadata = {
  name: 'Wrap-Up',
  description: 'A Decentralised Web3 AI Research & News Curation Platform',
  url: 'https://wrapup.xyz', 
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  defaultChain: tenderlyTestnet, // Defaulting to your hackathon chain!
  themeMode: 'dark',
});

// 2. Address Mappings
export const CONTRACT_ADDRESSES = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
  84532: import.meta.env.VITE_BASE_WRAPUP,            
  421614: import.meta.env.VITE_ARB_WRAPUP,            
  9991: "0xA5123b6D0e67b634DA8DC118DE99F72f24B6A33a", // Tenderly WrapUp
};

export const WUPToken_ADDRESSES = {
  31337: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  84532: import.meta.env.VITE_BASE_TOKEN,
  421614: import.meta.env.VITE_ARB_TOKEN,
  9991: "0x0b8Fe0D4e677E6a99b2B47b2F34A0e0D85240C24", // Tenderly WUPToken
};

export const WUPClaimer_ADDRESSES = {
  31337: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  84532: import.meta.env.VITE_BASE_CLAIMER,
  421614: import.meta.env.VITE_ARB_CLAIMER,
  9991: "0x5d8fE749F352F9D7C0725E9b78C51840B8b134e0", // Tenderly WUPClaimer
};

// 3. Updated ABIs
// WUP_TOKEN and WUP_CLAIMER are exactly the same as before, keep your old ones.
// WRAPUP_ABI includes the new AI Score mapping and function.
export const WRAPUP_ABI = [
  {"type":"function","name":"articleAIScores","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},
  {"type":"function","name":"updateAIScore","inputs":[{"name":"_articleId","type":"uint256","internalType":"uint256"},{"name":"_score","type":"uint8","internalType":"uint8"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"articleComments","inputs":[{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"articleCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"articles","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"ipfsHash","type":"string","internalType":"string"},{"name":"curator","type":"address","internalType":"address"},{"name":"upvoteCount","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"exists","type":"bool","internalType":"bool"},{"name":"isResearch","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"commentCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"comments","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"ipfsHash","type":"string","internalType":"string"},{"name":"articleId","type":"uint256","internalType":"uint256"},{"name":"commenter","type":"address","internalType":"address"},{"name":"upvoteCount","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"exists","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"displayNames","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"getArticle","inputs":[{"name":"_articleId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple","internalType":"struct WrapUp.Article","components":[{"name":"ipfsHash","type":"string","internalType":"string"},{"name":"curator","type":"address","internalType":"address"},{"name":"upvoteCount","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"exists","type":"bool","internalType":"bool"},{"name":"isResearch","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},{"type":"function","name":"getUserPoints","inputs":[{"name":"_user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"hasUpvotedArticle","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"hasUpvotedComment","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"postComment","inputs":[{"name":"_articleId","type":"uint256","internalType":"uint256"},{"name":"_ipfsHash","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setDisplayName","inputs":[{"name":"_newName","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"submitArticle","inputs":[{"name":"_ipfsHash","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"submitResearchReport","inputs":[{"name":"_ipfsHash","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"upvoteArticle","inputs":[{"name":"_articleId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"upvoteComment","inputs":[{"name":"_commentId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"userPoints","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"event","name":"AIScoreUpdated","inputs":[{"name":"articleId","type":"uint256","indexed":true},{"name":"score","type":"uint8","indexed":false}],"anonymous":false},{"type":"event","name":"ArticleSubmitted","inputs":[{"name":"articleId","type":"uint256","indexed":true},{"name":"ipfsHash","type":"string","indexed":false},{"name":"curator","type":"address","indexed":true},{"name":"isResearch","type":"bool","indexed":false},{"name":"timestamp","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"CommentPosted","inputs":[{"name":"articleId","type":"uint256","indexed":true},{"name":"commentId","type":"uint256","indexed":true},{"name":"ipfsHash","type":"string","indexed":false},{"name":"commenter","type":"address","indexed":true},{"name":"timestamp","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"DisplayNameSet","inputs":[{"name":"user","type":"address","indexed":true},{"name":"displayName","type":"string","indexed":false}],"anonymous":false},{"type":"event","name":"PointsAwarded","inputs":[{"name":"user","type":"address","indexed":true},{"name":"pointsEarned","type":"uint256","indexed":false},{"name":"totalPoints","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Upvoted","inputs":[{"name":"id","type":"uint256","indexed":true},{"name":"isArticle","type":"bool","indexed":false},{"name":"voter","type":"address","indexed":true},{"name":"receiver","type":"address","indexed":true},{"name":"newUpvoteCount","type":"uint256","indexed":false}],"anonymous":false}
];
export const WUP_TOKEN_ABI = [{"type":"constructor","inputs":[{"name":"initialOwner","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},{"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"approve","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},{"type":"function","name":"mint","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true},{"name":"spender","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true},{"name":"newOwner","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true},{"name":"to","type":"address","indexed":true},{"name":"value","type":"uint256","indexed":false}],"anonymous":false},{"type":"error","name":"ERC20InsufficientAllowance","inputs":[{"name":"spender","type":"address"},{"name":"allowance","type":"uint256"},{"name":"needed","type":"uint256"}]},{"type":"error","name":"ERC20InsufficientBalance","inputs":[{"name":"sender","type":"address"},{"name":"balance","type":"uint256"},{"name":"needed","type":"uint256"}]},{"type":"error","name":"ERC20InvalidApprover","inputs":[{"name":"approver","type":"address"}]},{"type":"error","name":"ERC20InvalidReceiver","inputs":[{"name":"receiver","type":"address"}]},{"type":"error","name":"ERC20InvalidSender","inputs":[{"name":"sender","type":"address"}]},{"type":"error","name":"ERC20InvalidSpender","inputs":[{"name":"spender","type":"address"}]},{"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address"}]},{"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address"}]}];
export const WUP_CLAIMER_ABI = [{"type":"constructor","inputs":[{"name":"_wrapUpAddress","type":"address","internalType":"address"},{"name":"_wupTokenAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},{"type":"function","name":"POINTS_TO_TOKEN_RATE","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"claimReward","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"claimedPoints","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"wrapUp","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IWrapUp"}],"stateMutability":"view"},{"type":"function","name":"wupToken","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IWUPToken"}],"stateMutability":"view"},{"type":"event","name":"RewardClaimed","inputs":[{"name":"user","type":"address","indexed":true},{"name":"pointsClaimedThisTx","type":"uint256","indexed":false},{"name":"tokenAmount","type":"uint256","indexed":false}],"anonymous":false}];
