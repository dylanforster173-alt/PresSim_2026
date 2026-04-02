import { useState } from 'react';
import { GameState } from '../types/game';
import { Calendar, DollarSign, TrendingUp, GraduationCap, Briefcase, Shield } from 'lucide-react';

interface LifePhaseProps {
  gameState: GameState;
  onUpdateState: (updates: Partial<GameState>) => void;
}

interface LifeEvent {
  text: string;
  choice?: boolean;
  effects?: {
    money?: number;
    popularity?: number;
    skills?: Partial<GameState['skills']>;
  };
}

export default function LifePhase({ gameState, onUpdateState }: LifePhaseProps) {
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [eventHandled, setEventHandled] = useState(false);

  const getAgeAppropriateEvent = (age: number): LifeEvent | null => {
    if (age < 10) return null;

    if (age === 16) {
      return {
        text: "You're now old enough to enter politics! Choose your political party.",
        choice: true,
      };
    }

    if (age === 18) {
      return {
        text: "You've turned 18! You can now join the military or pursue higher education.",
        choice: true,
      };
    }

    if (age === 22 && !gameState.militaryService && gameState.educationLevel === 'college') {
      return {
        text: "College graduation! Time to choose your career path.",
        choice: true,
      };
    }

    if (age === 22 && gameState.militaryService) {
      return {
        text: "You've completed your military service. Time to pursue a civilian career.",
        choice: true,
      };
    }

    if (age === 35) {
      return {
        text: "You've reached 35 years old. You're now eligible to run for President of the United States!",
        choice: true,
      };
    }

    if (age < 16) {
      const schoolEvents = [
        { text: "You did well in school today and learned something new.", effects: { popularity: 1 } },
        { text: "You made new friends at school.", effects: { charisma: 1 } },
        { text: "You excelled in your studies.", effects: { intelligence: 1 } },
        { text: "You played sports and got stronger.", effects: { strength: 1 } },
      ];
      return schoolEvents[Math.floor(Math.random() * schoolEvents.length)];
    }

    if (age >= 16 && age < 25 && gameState.politicalParty) {
      const politicsEvents = [
        { text: "You attended a political rally and gained valuable connections.", effects: { popularity: 2, charisma: 1 } },
        { text: "You campaigned for a local candidate and learned about politics.", effects: { political: 2, money: 500 } },
        { text: "You gave a speech at a community event. People were impressed.", effects: { charisma: 2, popularity: 3 } },
        { text: "You volunteered for a political organization and made a small donation.", effects: { political: 1, money: -500 } },
        { text: "You wrote an opinion piece for a local newspaper.", effects: { intelligence: 1, political: 1, popularity: 2 } },
      ];
      return politicsEvents[Math.floor(Math.random() * politicsEvents.length)];
    }

    if (age >= 22 && age < 35 && gameState.careerPath) {
      const careerEvents = [
        { text: `You received a promotion at your ${gameState.careerPath} job!`, effects: { money: 3000, popularity: 1 } },
        { text: `You completed a successful project at work.`, effects: { money: 1500, charisma: 1 } },
        { text: `You took on additional responsibilities at work.`, effects: { intelligence: 1, political: 1, money: 2000 } },
        { text: `You gave a presentation that impressed your colleagues.`, effects: { charisma: 2, popularity: 2 } },
        { text: `You earned a bonus for your hard work.`, effects: { money: 2500 } },
      ];
      return careerEvents[Math.floor(Math.random() * careerEvents.length)];
    }

    if (age >= 25 && age < 35) {
      const lifeEvents = [
        { text: `You made important connections in your professional network.`, effects: { charisma: 1, popularity: 1 } },
        { text: `You invested in real estate and gained financial stability.`, effects: { money: 5000 } },
        { text: `You wrote a book about your life experiences that became popular.`, effects: { popularity: 5, money: 4000, intelligence: 1 } },
        { text: `You organized a successful community event.`, effects: { charisma: 2, political: 1, popularity: 3 } },
        { text: `You donated to charity and gained respect in your community.`, effects: { popularity: 2, money: -2000 } },
      ];
      return lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
    }

    return null;
  };

  const ageUp = () => {
    if (!eventHandled) {
      const newAge = gameState.currentAge + 1;
      const event = getAgeAppropriateEvent(newAge);

      if (event && event.choice) {
        setCurrentEvent(event);
        setEventHandled(true);
        onUpdateState({ currentAge: newAge, currentYear: gameState.currentYear + 1 });
        return;
      }

      if (event) {
        setCurrentEvent(event);
        setEventHandled(true);
        if (event.effects) {
          const skillUpdates = event.effects.skills ? { ...gameState.skills, ...event.effects.skills } : gameState.skills;
          onUpdateState({
            currentAge: newAge,
            currentYear: gameState.currentYear + 1,
            money: gameState.money + (event.effects.money || 0),
            popularity: Math.max(0, Math.min(100, gameState.popularity + (event.effects.popularity || 0))),
            skills: skillUpdates,
          });
        } else {
          onUpdateState({ currentAge: newAge, currentYear: gameState.currentYear + 1 });
        }
        return;
      }

      onUpdateState({ currentAge: newAge, currentYear: gameState.currentYear + 1 });
      setEventHandled(false);
      return;
    }

    setCurrentEvent(null);
    setEventHandled(false);
  };

  const handleChoice = (choice: string) => {
    const age = gameState.currentAge;

    if (age === 16) {
      if (choice === 'democrat' || choice === 'republican' || choice === 'independent') {
        onUpdateState({
          politicalParty: choice as 'Democrat' | 'Republican' | 'Independent',
          skills: {
            ...gameState.skills,
            political: Math.min(100, gameState.skills.political + 10),
          },
        });
      }
    } else if (age === 18) {
      if (choice === 'military') {
        onUpdateState({
          militaryService: true,
          skills: {
            ...gameState.skills,
            strength: Math.min(100, gameState.skills.strength + 20),
            political: Math.min(100, gameState.skills.political + 5),
          },
          money: gameState.money + 5000,
        });
      } else if (choice === 'college') {
        onUpdateState({
          educationLevel: 'college',
          skills: {
            ...gameState.skills,
            intelligence: Math.min(100, gameState.skills.intelligence + 20),
          },
          money: Math.max(0, gameState.money - 10000),
        });
      }
    } else if (age === 22) {
      if (choice === 'lawyer') {
        onUpdateState({
          careerPath: 'Lawyer',
          money: gameState.money + 20000,
          skills: {
            ...gameState.skills,
            charisma: Math.min(100, gameState.skills.charisma + 15),
            intelligence: Math.min(100, gameState.skills.intelligence + 10),
          },
        });
      } else if (choice === 'business') {
        onUpdateState({
          careerPath: 'Business Owner',
          money: gameState.money + 30000,
          skills: {
            ...gameState.skills,
            charisma: Math.min(100, gameState.skills.charisma + 10),
          },
        });
      } else if (choice === 'government') {
        onUpdateState({
          careerPath: 'Government Official',
          money: gameState.money + 15000,
          skills: {
            ...gameState.skills,
            political: Math.min(100, gameState.skills.political + 20),
          },
        });
      }
    } else if (age === 35) {
      onUpdateState({ phase: 'campaign' });
      return;
    }

    setCurrentEvent(null);
    setEventHandled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Age</span>
              </div>
              <div className="text-2xl font-bold text-white">{gameState.currentAge}</div>
              <div className="text-xs text-slate-400">Year: {gameState.currentYear}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Money</span>
              </div>
              <div className="text-2xl font-bold text-green-400">${gameState.money.toLocaleString()}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Popularity</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{gameState.popularity}%</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>Education</span>
              </div>
              <div className="text-sm font-semibold text-white capitalize">{gameState.educationLevel}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Career</span>
              </div>
              <div className="text-sm font-semibold text-white">{gameState.careerPath || 'Student'}</div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <Shield className="w-4 h-4" />
                <span>Party</span>
              </div>
              <div className="text-sm font-semibold text-white">{gameState.politicalParty || 'None'}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-4 border border-red-700/50">
            <h3 className="text-white font-semibold mb-2">Charisma</h3>
            <div className="text-3xl font-bold text-red-400">{gameState.skills.charisma}</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${gameState.skills.charisma}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-4 border border-blue-700/50">
            <h3 className="text-white font-semibold mb-2">Intelligence</h3>
            <div className="text-3xl font-bold text-blue-400">{gameState.skills.intelligence}</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${gameState.skills.intelligence}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-4 border border-purple-700/50">
            <h3 className="text-white font-semibold mb-2">Political Skill</h3>
            <div className="text-3xl font-bold text-purple-400">{gameState.skills.political}</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${gameState.skills.political}%` }}></div>
            </div>
          </div>
        </div>

        {currentEvent && (
          <div className="bg-gradient-to-r from-blue-900/40 to-slate-800/40 rounded-xl p-6 border border-blue-700/50 mb-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">{currentEvent.text}</h2>

            {currentEvent.choice && gameState.currentAge === 16 && (
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleChoice('democrat')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Democrat
                </button>
                <button
                  onClick={() => handleChoice('republican')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Republican
                </button>
                <button
                  onClick={() => handleChoice('independent')}
                  className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Independent
                </button>
              </div>
            )}

            {currentEvent.choice && gameState.currentAge === 18 && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleChoice('military')}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Join Military
                </button>
                <button
                  onClick={() => handleChoice('college')}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Attend College
                </button>
              </div>
            )}

            {currentEvent.choice && gameState.currentAge === 22 && (
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleChoice('lawyer')}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Lawyer
                </button>
                <button
                  onClick={() => handleChoice('business')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Business Owner
                </button>
                <button
                  onClick={() => handleChoice('government')}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Government Official
                </button>
              </div>
            )}

            {currentEvent.choice && gameState.currentAge === 35 && (
              <button
                onClick={() => handleChoice('campaign')}
                className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-xl"
              >
                Run for President!
              </button>
            )}

            {!currentEvent.choice && (
              <button
                onClick={ageUp}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={ageUp}
            className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Advance 1 Year →
          </button>
        </div>
      </div>
    </div>
  );
}
