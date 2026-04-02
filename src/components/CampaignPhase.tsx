import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { US_STATES } from '../data/states';
import { DollarSign, TrendingUp, Users, MapPin, Megaphone, Tv } from 'lucide-react';

interface CampaignPhaseProps {
  gameState: GameState;
  onUpdateState: (updates: Partial<GameState>) => void;
}

export default function CampaignPhase({ gameState, onUpdateState }: CampaignPhaseProps) {
  const [weeksUntilElection, setWeeksUntilElection] = useState(30);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [campaignFunds, setCampaignFunds] = useState(gameState.money);
  const [opponentSupport, setOpponentSupport] = useState<Record<string, number>>({});
  const [debateDebuff, setDebateDebuff] = useState(false);
  const [scandalsOccurred, setScandalsOccurred] = useState<string[]>([]);

  useEffect(() => {
    const initialSupport: Record<string, number> = {};
    const initialOpponent: Record<string, number> = {};

    US_STATES.forEach(state => {
      const baseLean = state.lean === 'blue'
        ? (gameState.politicalParty === 'Democrat' ? 5 : -15)
        : state.lean === 'red'
        ? (gameState.politicalParty === 'Republican' ? 5 : -15)
        : 0;

      initialSupport[state.abbreviation] = 35 + baseLean + Math.random() * 5;
      initialOpponent[state.abbreviation] = 35 - baseLean + Math.random() * 5;
    });

    onUpdateState({ stateSupport: initialSupport });
    setOpponentSupport(initialOpponent);
  }, []);

  const campaignInState = (stateAbbr: string, amount: number) => {
    if (campaignFunds < amount) return;

    const effectiveness = (gameState.skills.charisma + gameState.skills.political) / 30;
    const boost = (amount / 2000) * effectiveness;

    const newSupport = { ...gameState.stateSupport };
    newSupport[stateAbbr] = Math.min(100, (newSupport[stateAbbr] || 0) + boost);

    setCampaignFunds(campaignFunds - amount);
    onUpdateState({
      stateSupport: newSupport,
      money: gameState.money - amount
    });
  };

  const runNationalAd = () => {
    const cost = 80000;
    if (campaignFunds < cost) return;

    const effectiveness = (gameState.skills.charisma + gameState.skills.political) / 40;
    const newSupport = { ...gameState.stateSupport };
    US_STATES.forEach(state => {
      newSupport[state.abbreviation] = Math.min(100, (newSupport[state.abbreviation] || 0) + 1.5 * effectiveness);
    });

    setCampaignFunds(campaignFunds - cost);
    onUpdateState({
      stateSupport: newSupport,
      money: gameState.money - cost
    });
  };

  const hostDebate = () => {
    const cost = 30000;
    if (campaignFunds < cost || debateDebuff) return;

    const debateResult = Math.random();
    const skillBonus = gameState.skills.charisma / 100;

    if (debateResult < 0.3 - skillBonus) {
      setDebateDebuff(true);
      const newSupport = { ...gameState.stateSupport };
      US_STATES.forEach(state => {
        newSupport[state.abbreviation] = Math.max(0, (newSupport[state.abbreviation] || 0) - 8);
      });
      setCampaignFunds(campaignFunds - cost);
      onUpdateState({
        stateSupport: newSupport,
        money: gameState.money - cost
      });
    } else {
      const newSupport = { ...gameState.stateSupport };
      US_STATES.forEach(state => {
        newSupport[state.abbreviation] = Math.min(100, (newSupport[state.abbreviation] || 0) + 10);
      });
      setCampaignFunds(campaignFunds - cost);
      onUpdateState({
        stateSupport: newSupport,
        money: gameState.money - cost
      });
    }
  };

  const advanceWeek = () => {
    if (weeksUntilElection <= 0) return;

    const newWeeks = weeksUntilElection - 1;
    setWeeksUntilElection(newWeeks);

    const newOpponent = { ...opponentSupport };
    US_STATES.forEach(state => {
      newOpponent[state.abbreviation] = Math.min(100, (newOpponent[state.abbreviation] || 0) + Math.random() * 2.5);
    });
    setOpponentSupport(newOpponent);

    const scandals = [
      'A scandal emerges about your past!',
      'Your opponent leaks opposition research!',
      'A gaffe from your speech goes viral!',
      'External crisis dominates the news cycle!'
    ];

    if (Math.random() > 0.75 && scandalsOccurred.length < 3) {
      const scandal = scandals[Math.floor(Math.random() * scandals.length)];
      setScandalsOccurred([...scandalsOccurred, scandal]);
      const newSupport = { ...gameState.stateSupport };
      US_STATES.forEach(state => {
        newSupport[state.abbreviation] = Math.max(0, (newSupport[state.abbreviation] || 0) - 3);
      });
      onUpdateState({ stateSupport: newSupport });
    }

    if (newWeeks === 0) {
      calculateElectionResults();
    }
  };

  const calculateElectionResults = () => {
    let playerEV = 0;
    let opponentEV = 0;

    US_STATES.forEach(state => {
      const playerSupport = gameState.stateSupport[state.abbreviation] || 0;
      const oppSupport = opponentSupport[state.abbreviation] || 0;

      if (playerSupport > oppSupport) {
        playerEV += state.electoralVotes;
      } else {
        opponentEV += state.electoralVotes;
      }
    });

    if (playerEV >= 270) {
      onUpdateState({
        phase: 'president',
        isPresident: true
      });
    } else {
      alert(`You lost the election! ${playerEV} to ${opponentEV}. Try again!`);
    }
  };

  const getStateColor = (stateAbbr: string) => {
    const playerSupport = gameState.stateSupport[stateAbbr] || 0;
    const oppSupport = opponentSupport[stateAbbr] || 0;

    if (playerSupport > oppSupport + 10) {
      return gameState.politicalParty === 'Democrat' ? 'bg-blue-600' : 'bg-red-600';
    } else if (oppSupport > playerSupport + 10) {
      return gameState.politicalParty === 'Democrat' ? 'bg-red-600' : 'bg-blue-600';
    } else {
      return 'bg-purple-500';
    }
  };

  const calculateEV = () => {
    let playerEV = 0;
    US_STATES.forEach(state => {
      const playerSupport = gameState.stateSupport[state.abbreviation] || 0;
      const oppSupport = opponentSupport[state.abbreviation] || 0;
      if (playerSupport > oppSupport) {
        playerEV += state.electoralVotes;
      }
    });
    return playerEV;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">Presidential Campaign {gameState.currentYear}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-300 text-sm mb-1">Weeks Until Election</div>
              <div className="text-3xl font-bold text-white">{weeksUntilElection}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-300 text-sm mb-1">Campaign Funds</div>
              <div className="text-2xl font-bold text-green-400">${campaignFunds.toLocaleString()}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-300 text-sm mb-1">Electoral Votes</div>
              <div className="text-3xl font-bold text-blue-400">{calculateEV()}</div>
              <div className="text-xs text-slate-400">Need 270 to win</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-300 text-sm mb-1">Your Party</div>
              <div className="text-xl font-bold text-white">{gameState.politicalParty}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">United States Electoral Map</h2>

              <div className="relative w-full h-[500px] bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                {US_STATES.map(state => (
                  <div
                    key={state.abbreviation}
                    className={`absolute rounded-full cursor-pointer transition-all transform hover:scale-125 ${getStateColor(state.abbreviation)} border-2 border-white/30 hover:border-white flex items-center justify-center shadow-lg`}
                    style={{
                      left: `${state.position.x}%`,
                      top: `${state.position.y}%`,
                      width: `${Math.max(20, state.electoralVotes)}px`,
                      height: `${Math.max(20, state.electoralVotes)}px`,
                    }}
                    onClick={() => setSelectedState(state.abbreviation)}
                    title={`${state.name} - ${state.electoralVotes} EV`}
                  >
                    <span className="text-white text-xs font-bold">{state.abbreviation}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${gameState.politicalParty === 'Democrat' ? 'bg-blue-600' : 'bg-red-600'}`}></div>
                  <span className="text-slate-300">You Leading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span className="text-slate-300">Toss-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${gameState.politicalParty === 'Democrat' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                  <span className="text-slate-300">Opponent Leading</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedState && (
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-3">
                  {US_STATES.find(s => s.abbreviation === selectedState)?.name}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Your Support</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.round(gameState.stateSupport[selectedState] || 0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Opponent Support</div>
                    <div className="text-2xl font-bold text-red-400">
                      {Math.round(opponentSupport[selectedState] || 0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Electoral Votes</div>
                    <div className="text-2xl font-bold text-white">
                      {US_STATES.find(s => s.abbreviation === selectedState)?.electoralVotes}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => campaignInState(selectedState, 5000)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-between"
                    >
                      <span>Rally</span>
                      <span>$5,000</span>
                    </button>
                    <button
                      onClick={() => campaignInState(selectedState, 15000)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-between"
                    >
                      <span>TV Ads</span>
                      <span>$15,000</span>
                    </button>
                    <button
                      onClick={() => campaignInState(selectedState, 25000)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-between"
                    >
                      <span>Major Event</span>
                      <span>$25,000</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Campaign Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={runNationalAd}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={campaignFunds < 80000}
                >
                  <div className="flex items-center justify-between">
                    <span>National TV Campaign</span>
                    <span>$80,000</span>
                  </div>
                </button>

                <button
                  onClick={hostDebate}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={campaignFunds < 30000 || debateDebuff}
                >
                  <div className="flex items-center justify-between">
                    <span>{debateDebuff ? 'Debate Scheduled' : 'Host National Debate'}</span>
                    <span>$30,000</span>
                  </div>
                </button>

                {scandalsOccurred.length > 0 && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                    <div className="text-red-300 text-sm font-semibold mb-1">Recent Scandals:</div>
                    {scandalsOccurred.map((scandal, i) => (
                      <div key={i} className="text-red-300 text-xs mb-1">• {scandal}</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={advanceWeek}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  Advance 1 Week → ({weeksUntilElection} left)
                </button>

                {weeksUntilElection === 0 && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-4">
                    <div className="text-green-400 font-bold text-center">
                      Election Day! Results Below
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
