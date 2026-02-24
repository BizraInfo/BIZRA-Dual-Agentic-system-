"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const BZSTokenWallet: React.FC = () => {
  const [walletData, setWalletData] = useState({
    balance: 15847.32,
    pendingEarnings: 247.85,
    totalEarned: 28934.67,
    stakingRewards: 1247.23,
    marketplaceSpent: 3456.78,
    donationsGiven: 892.45,
  })

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: "earned", amount: 150, description: "Teaching AI Ethics", time: "2 hours ago" },
    { id: 2, type: "spent", amount: -75, description: "Premium Tools Access", time: "1 day ago" },
    { id: 3, type: "earned", amount: 500, description: "Community Problem Solving", time: "2 days ago" },
    { id: 4, type: "staking", amount: 25.5, description: "Staking Rewards", time: "3 days ago" },
    { id: 5, type: "donated", amount: -100, description: "Education Fund", time: "5 days ago" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setWalletData((prev) => ({
        ...prev,
        balance: prev.balance + Math.random() * 5,
        pendingEarnings: Math.max(0, prev.pendingEarnings + (Math.random() - 0.7) * 10),
        stakingRewards: prev.stakingRewards + Math.random() * 2,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-green-400"
      case "spent":
        return "text-red-400"
      case "staking":
        return "text-blue-400"
      case "donated":
        return "text-purple-400"
      default:
        return "text-white"
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return "+"
      case "spent":
        return "-"
      case "staking":
        return "↗"
      case "donated":
        return "♥"
      default:
        return "•"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-8">
      <div className="text-center mb-8">
        <div className="relative mx-auto w-32 h-32 mb-6">
          {/* Token Symbol */}
          <div className="absolute inset-0 rounded-full border-4 border-gold animate-pulse">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/30 to-transparent backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-gold">BZS</div>
              </div>
            </div>
          </div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold rounded-full animate-float"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">BZS TOKEN WALLET</h3>
        <div className="text-5xl font-bold text-gold mb-2">{walletData.balance.toLocaleString()}</div>
        <div className="text-sm text-white/60">BZS Balance</div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{walletData.pendingEarnings.toFixed(2)}</div>
          <div className="text-xs text-white/60">Pending Earnings</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{walletData.totalEarned.toLocaleString()}</div>
          <div className="text-xs text-white/60">Total Earned</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{walletData.stakingRewards.toFixed(2)}</div>
          <div className="text-xs text-white/60">Staking Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{walletData.marketplaceSpent.toFixed(2)}</div>
          <div className="text-xs text-white/60">Marketplace Spent</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400">{walletData.donationsGiven.toFixed(2)}</div>
          <div className="text-xs text-white/60">Donations Given</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gold">
            {((walletData.totalEarned / walletData.balance) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-white/60">Growth Rate</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <h4 className="font-semibold text-white mb-4">Recent Transactions</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full ${getTransactionColor(tx.type)} bg-current/20 flex items-center justify-center text-sm font-bold`}
                >
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{tx.description}</div>
                  <div className="text-xs text-white/60">{tx.time}</div>
                </div>
              </div>
              <div className={`font-bold ${getTransactionColor(tx.type)}`}>
                {tx.amount > 0 ? "+" : ""}
                {tx.amount} BZS
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold">EARN MORE</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold">STAKE TOKENS</Button>
      </div>
    </Card>
  )
}

export const EarningMechanisms: React.FC = () => {
  const [earningOpportunities, setEarningOpportunities] = useState([
    { id: 1, title: "Teach a Skill Online", reward: 50, difficulty: "Easy", time: "30 min", category: "Education" },
    { id: 2, title: "Solve Community Problem", reward: 500, difficulty: "Medium", time: "2 hours", category: "Impact" },
    { id: 3, title: "Create Innovation", reward: 5000, difficulty: "Hard", time: "1 week", category: "Innovation" },
    { id: 4, title: "Mentor Someone", reward: 150, difficulty: "Easy", time: "1 hour", category: "Social" },
    {
      id: 5,
      title: "Environmental Action",
      reward: 300,
      difficulty: "Medium",
      time: "4 hours",
      category: "Environment",
    },
    { id: 6, title: "Open Source Contribution", reward: 200, difficulty: "Medium", time: "3 hours", category: "Tech" },
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/80 text-white"
      case "Medium":
        return "bg-yellow-500/80 text-black"
      case "Hard":
        return "bg-red-500/80 text-white"
      default:
        return "bg-gray-500/80 text-white"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Education":
        return "text-blue-400"
      case "Impact":
        return "text-green-400"
      case "Innovation":
        return "text-purple-400"
      case "Social":
        return "text-pink-400"
      case "Environment":
        return "text-emerald-400"
      case "Tech":
        return "text-cyan-400"
      default:
        return "text-white"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">EARNING OPPORTUNITIES</h3>

      <div className="space-y-4">
        {earningOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-all duration-300"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="font-semibold text-white">{opportunity.title}</div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(opportunity.difficulty)}`}
                >
                  {opportunity.difficulty}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span className={getCategoryColor(opportunity.category)}>{opportunity.category}</span>
                <span>⏱ {opportunity.time}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gold">{opportunity.reward}</div>
              <div className="text-xs text-white/60">BZS Reward</div>
              <Button size="sm" className="mt-2 bg-gold hover:bg-gold/80 text-black font-bold">
                START
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold">VIEW ALL OPPORTUNITIES</Button>
      </div>
    </Card>
  )
}

export const BZSMarketplace: React.FC = () => {
  const [marketplaceItems, setMarketplaceItems] = useState([
    { id: 1, name: "Premium AI Tools", price: 100, category: "Tools", seller: "BIZRA Labs", rating: 4.9 },
    { id: 2, name: "Advanced Analytics", price: 250, category: "Analytics", seller: "DataMind", rating: 4.8 },
    { id: 3, name: "Custom AI Training", price: 1500, category: "Services", seller: "AI Experts", rating: 5.0 },
    { id: 4, name: "Productivity Suite", price: 75, category: "Software", seller: "ProTools", rating: 4.7 },
    { id: 5, name: "Consultation Hour", price: 200, category: "Services", seller: "Mentors Guild", rating: 4.9 },
    { id: 6, name: "Research Access", price: 50, category: "Knowledge", seller: "Research Hub", rating: 4.6 },
  ])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Tools":
        return "🔧"
      case "Analytics":
        return "📊"
      case "Services":
        return "🤝"
      case "Software":
        return "💻"
      case "Knowledge":
        return "📚"
      default:
        return "📦"
    }
  }

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">BZS MARKETPLACE</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {marketplaceItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-gold/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-white/60">{item.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gold">{item.price} BZS</div>
                <div className="text-xs text-white/60">⭐ {item.rating}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">by {item.seller}</div>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                BUY
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold">SELL ITEM</Button>
        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 bg-transparent">
          BROWSE ALL
        </Button>
      </div>
    </Card>
  )
}

export const UniversalResourcePool: React.FC = () => {
  const [poolData, setPoolData] = useState({
    totalPool: 2847392.45,
    yourContribution: 1247.32,
    yourShare: 0.044,
    monthlyDistribution: 15847.23,
    participantCount: 847293,
    growthRate: 12.7,
  })

  const [contributionHistory, setContributionHistory] = useState([
    { month: "Jan", contributed: 150, received: 180 },
    { month: "Feb", contributed: 200, received: 220 },
    { month: "Mar", contributed: 180, received: 210 },
    { month: "Apr", contributed: 220, received: 250 },
    { month: "May", contributed: 250, received: 280 },
    { month: "Jun", contributed: 247, received: 290 },
  ])

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">UNIVERSAL RESOURCE POOL</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{poolData.totalPool.toLocaleString()}</div>
          <div className="text-xs text-white/60">Total Pool (BZS)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{poolData.participantCount.toLocaleString()}</div>
          <div className="text-xs text-white/60">Participants</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{poolData.growthRate}%</div>
          <div className="text-xs text-white/60">Monthly Growth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{poolData.yourContribution.toFixed(2)}</div>
          <div className="text-xs text-white/60">Your Contribution</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{poolData.yourShare.toFixed(3)}%</div>
          <div className="text-xs text-white/60">Your Share</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{poolData.monthlyDistribution.toFixed(2)}</div>
          <div className="text-xs text-white/60">Monthly Distribution</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-white mb-4">Contribution vs Distribution History</h4>
        <div className="space-y-2">
          {contributionHistory.map((data, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <span className="text-white text-sm">{data.month}</span>
              <div className="flex space-x-4">
                <span className="text-red-400 text-sm">-{data.contributed} BZS</span>
                <span className="text-green-400 text-sm">+{data.received} BZS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold">CONTRIBUTE</Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold">CLAIM REWARDS</Button>
      </div>
    </Card>
  )
}

export const TokenomicsAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalSupply: 1000000000,
    circulatingSupply: 247583921,
    burnedTokens: 15847392,
    stakingAPY: 12.5,
    liquidityPool: 45892341,
    marketCap: 892347521,
  })

  const [priceHistory, setPriceHistory] = useState([
    { period: "1D", change: 2.3, price: 3.47 },
    { period: "1W", change: -1.2, price: 3.52 },
    { period: "1M", change: 15.7, price: 3.01 },
    { period: "3M", change: 45.2, price: 2.39 },
    { period: "1Y", change: 234.8, price: 1.04 },
  ])

  return (
    <Card className="bg-black/80 backdrop-blur-xl border-gold/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6">TOKENOMICS ANALYTICS</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-gold">{(analyticsData.totalSupply / 1000000).toFixed(0)}M</div>
          <div className="text-xs text-white/60">Total Supply</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">
            {(analyticsData.circulatingSupply / 1000000).toFixed(0)}M
          </div>
          <div className="text-xs text-white/60">Circulating</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{(analyticsData.burnedTokens / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-white/60">Burned</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{analyticsData.stakingAPY}%</div>
          <div className="text-xs text-white/60">Staking APY</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{(analyticsData.liquidityPool / 1000000).toFixed(0)}M</div>
          <div className="text-xs text-white/60">Liquidity Pool</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400">${(analyticsData.marketCap / 1000000).toFixed(0)}M</div>
          <div className="text-xs text-white/60">Market Cap</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-white mb-4">Price Performance</h4>
        <div className="space-y-3">
          {priceHistory.map((data, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white font-semibold">{data.period}</span>
              <div className="text-right">
                <div className="text-white">${data.price.toFixed(2)}</div>
                <div className={`text-sm ${data.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.change >= 0 ? "+" : ""}
                  {data.change.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-gold hover:bg-gold/80 text-black font-bold">VIEW DETAILED ANALYTICS</Button>
    </Card>
  )
}
