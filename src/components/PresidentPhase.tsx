import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { FileText, TrendingUp, Users, Globe, Shield, DollarSign, Heart, GraduationCap, AlertTriangle } from 'lucide-react';

interface PresidentPhaseProps {
  gameState: GameState;
  onUpdateState: (updates: Partial<GameState>) => void;
  onGameEnd: (endState: 'death' | 'assassination' | 'resignation' | 'two-terms' | 'one-term') => void;
}

interface ExecutiveOrder {
  id: string;
  title: string;
  description: string;
  category: 'economy' | 'healthcare' | 'education' | 'defense' | 'environment';
  popularityEffect: number;
  moneyEffect: number;
  icon: React.ReactNode;
}

export default function PresidentPhase({ gameState, onUpdateState, onGameEnd }: PresidentPhaseProps) {
  const [approvalRating, setApprovalRating] = useState(gameState.popularity);
  const [daysInOffice, setDaysInOffice] = useState(0);
  const [executedOrders, setExecutedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ExecutiveOrder | null>(null);
  const [criticalEvent, setCriticalEvent] = useState<{type: string; message: string} | null>(null);

  const yearsInOffice = Math.floor(daysInOffice / 365);
  const canServeSecondTerm = gameState.currentYear >= 1951;
  const isAgeForDeathRisk = gameState.currentAge >= 70;

  const executiveOrders: ExecutiveOrder[] = [
    {
      id: 'tax-cut',
      title: 'Tax Reduction Act',
      description: 'Reduce federal taxes for middle-class families',
      category: 'economy',
      popularityEffect: 5,
      moneyEffect: -50000,
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      id: 'tax-raise',
      title: 'Progressive Tax Increase',
      description: 'Raise taxes on wealthy corporations and individuals',
      category: 'economy',
      popularityEffect: 8,
      moneyEffect: 100000,
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      id: 'healthcare',
      title: 'Universal Healthcare Initiative',
      description: 'Expand healthcare coverage to all citizens',
      category: 'healthcare',
      popularityEffect: 10,
      moneyEffect: -100000,
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'healthcare-cuts',
      title: 'Healthcare Cost Controls',
      description: 'Implement cost-cutting measures in healthcare',
      category: 'healthcare',
      popularityEffect: -8,
      moneyEffect: 60000,
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'education',
      title: 'Education Reform Bill',
      description: 'Increase funding for public schools and universities',
      category: 'education',
      popularityEffect: 8,
      moneyEffect: -75000,
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      id: 'military-increase',
      title: 'Defense Spending Increase',
      description: 'Boost military budget and modernize armed forces',
      category: 'defense',
      popularityEffect: -5,
      moneyEffect: -150000,
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'military-reduce',
      title: 'Military Reduction',
      description: 'Scale back military spending and bases',
      category: 'defense',
      popularityEffect: 4,
      moneyEffect: 100000,
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'climate',
      title: 'Green Energy Initiative',
      description: 'Invest in renewable energy and combat climate change',
      category: 'environment',
      popularityEffect: 7,
      moneyEffect: -80000,
      icon: <Globe className="w-6 h-6" />
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure Modernization',
      description: 'Rebuild roads, bridges, and public transportation',
      category: 'economy',
      popularityEffect: 12,
      moneyEffect: -120000,
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      id: 'jobs',
      title: 'Job Creation Program',
      description: 'Create government-funded jobs in key sectors',
      category: 'economy',
      popularityEffect: 9,
      moneyEffect: -90000,
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'foreign',
      title: 'International Peace Treaty',
      description: 'Negotiate peace agreements with foreign nations',
      category: 'defense',
      popularityEffect: 6,
      moneyEffect: 0,
      icon: <Globe className="w-6 h-6" />
    },
    {
      id: 'space',
      title: 'Space Exploration Program',
      description: 'Fund ambitious space exploration and research',
      category: 'economy',
      popularityEffect: 6,
      moneyEffect: -60000,
      icon: <Globe className="w-6 h-6" />
    },
    {
      id: 'border',
      title: 'Border Security Enhancement',
      description: 'Increase funding for border security',
      category: 'defense',
      popularityEffect: 3,
      moneyEffect: -40000,
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'education-tech',
      title: 'STEM Education Initiative',
      description: 'Focus on science, technology, engineering, math education',
      category: 'education',
      popularityEffect: 7,
      moneyEffect: -50000,
      icon: <GraduationCap className="w-6 h-6" />
    },
  ];

  const signOrder = (order: ExecutiveOrder) => {
    if (executedOrders.includes(order.id)) {
      alert('You have already signed this executive order!');
      return;
    }

    const newApproval = Math.max(0, Math.min(100, approvalRating + order.popularityEffect));
    const newMoney = gameState.money + order.moneyEffect;

    setApprovalRating(newApproval);
    setExecutedOrders([...executedOrders, order.id]);
    setSelectedOrder(null);

    onUpdateState({
      popularity: newApproval,
      money: newMoney
    });
  };

  useEffect(() => {
    if (yearsInOffice >= 4 && !canServeSecondTerm) {
      setCriticalEvent({
        type: 'term-end',
        message: "Your first term has ended. You served your country with honor. Your presidency concludes here."
      });
    }

    if (yearsInOffice >= 8 && canServeSecondTerm) {
      setCriticalEvent({
        type: 'two-terms',
        message: "You have completed two full terms as President. Constitutional term limits require you to step down."
      });
    }
  }, [yearsInOffice, canServeSecondTerm]);

  const advanceMonth = () => {
    if (criticalEvent) return;

    const newDaysInOffice = daysInOffice + 30;
    setDaysInOffice(newDaysInOffice);
    const newYearsInOffice = Math.floor(newDaysInOffice / 365);

    const randomEvent = Math.random();

    if (approvalRating < 20 && randomEvent > 0.85) {
      setCriticalEvent({
        type: 'resignation-pressure',
        message: "Your approval rating has plummeted. Congressional pressure mounts for your resignation."
      });
      return;
    }

    if (isAgeForDeathRisk && randomEvent > 0.92) {
      setCriticalEvent({
        type: 'natural-death',
        message: `At age ${gameState.currentAge}, you suffer a serious health crisis. Your presidency ends due to natural causes.`
      });
      return;
    }

    if (randomEvent > 0.88 && approvalRating > 50) {
      setCriticalEvent({
        type: 'assassination-attempt',
        message: "An assassination attempt on your life has been thwarted by the Secret Service, but your safety remains at risk."
      });
      return;
    }

    if (randomEvent > 0.75) {
      const change = Math.floor(Math.random() * 10) - 5;
      setApprovalRating(Math.max(0, Math.min(100, approvalRating + change)));
    }
  };

  const handleCriticalEvent = (action: string) => {
    if (criticalEvent?.type === 'resignation-pressure') {
      if (action === 'resign') {
        onGameEnd('resignation');
      } else {
        setCriticalEvent(null);
        setApprovalRating(Math.max(10, approvalRating - 5));
      }
    } else if (criticalEvent?.type === 'assassination-attempt') {
      if (action === 'resign') {
        onGameEnd('resignation');
      } else {
        setCriticalEvent(null);
        const deathChance = Math.random();
        if (deathChance > 0.7) {
          onGameEnd('assassination');
        }
      }
    } else if (criticalEvent?.type === 'natural-death') {
      onGameEnd('death');
    } else if (criticalEvent?.type === 'term-end') {
      onGameEnd('one-term');
    } else if (criticalEvent?.type === 'two-terms') {
      onGameEnd('two-terms');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economy': return 'from-green-900/30 to-green-800/20 border-green-700/50';
      case 'healthcare': return 'from-red-900/30 to-red-800/20 border-red-700/50';
      case 'education': return 'from-blue-900/30 to-blue-800/20 border-blue-700/50';
      case 'defense': return 'from-slate-900/30 to-slate-800/20 border-slate-700/50';
      case 'environment': return 'from-emerald-900/30 to-emerald-800/20 border-emerald-700/50';
      default: return 'from-slate-900/30 to-slate-800/20 border-slate-700/50';
    }
  };

  const remainingDays = daysInOffice % 365;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-white mb-2">
              President {gameState.characterName}
            </h1>
            <p className="text-slate-300 text-xl">
              {gameState.currentYear} - Leading the United States of America
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-4 border border-blue-700/50">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Approval Rating</span>
              </div>
              <div className="text-4xl font-bold text-blue-400">{Math.round(approvalRating)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${approvalRating}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-4 border border-green-700/50">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Budget</span>
              </div>
              <div className="text-3xl font-bold text-green-400">${gameState.money.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-4 border border-purple-700/50">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                <FileText className="w-4 h-4" />
                <span>Orders Signed</span>
              </div>
              <div className="text-4xl font-bold text-purple-400">{executedOrders.length}</div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-lg p-4 border border-amber-700/50">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                <Users className="w-4 h-4" />
                <span>Time in Office</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {yearsInOffice}y {Math.floor(remainingDays / 30)}m
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Executive Orders & Legislation
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {executiveOrders.map(order => (
                  <div
                    key={order.id}
                    className={`bg-gradient-to-br ${getCategoryColor(order.category)} rounded-lg p-4 border cursor-pointer transition-all transform hover:scale-105 ${
                      executedOrders.includes(order.id)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => !executedOrders.includes(order.id) && setSelectedOrder(order)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-white mt-1">{order.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">{order.title}</h3>
                        <p className="text-slate-300 text-sm mb-2">{order.description}</p>
                        <div className="flex gap-2 text-xs">
                          {order.popularityEffect > 0 && (
                            <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded">
                              +{order.popularityEffect}% Approval
                            </span>
                          )}
                          {order.popularityEffect < 0 && (
                            <span className="bg-red-600/30 text-red-300 px-2 py-1 rounded">
                              {order.popularityEffect}% Approval
                            </span>
                          )}
                          {order.moneyEffect !== 0 && (
                            <span className="bg-amber-600/30 text-amber-300 px-2 py-1 rounded">
                              ${Math.abs(order.moneyEffect).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {executedOrders.includes(order.id) && (
                          <div className="mt-2 text-xs text-green-400 font-bold">✓ SIGNED</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedOrder && (
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-3">Sign Executive Order</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-white font-bold text-lg mb-1">{selectedOrder.title}</div>
                    <div className="text-slate-300 text-sm mb-3">{selectedOrder.description}</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Approval Effect:</span>
                      <span className={selectedOrder.popularityEffect > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {selectedOrder.popularityEffect > 0 ? '+' : ''}{selectedOrder.popularityEffect}%
                      </span>
                    </div>
                    {selectedOrder.moneyEffect !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Budget Impact:</span>
                        <span className="text-amber-400 font-bold">
                          ${Math.abs(selectedOrder.moneyEffect).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => signOrder(selectedOrder)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all"
                  >
                    Sign Into Law
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Presidential Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={advanceMonth}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  Advance 1 Month →
                </button>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-300 text-sm text-center">
                    Serve your term and build your legacy as President!
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-3">Your Administration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Party:</span>
                  <span className="text-white font-bold">{gameState.politicalParty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Born:</span>
                  <span className="text-white font-bold">{gameState.birthYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Military:</span>
                  <span className="text-white font-bold">{gameState.militaryService ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Career:</span>
                  <span className="text-white font-bold">{gameState.careerPath || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
