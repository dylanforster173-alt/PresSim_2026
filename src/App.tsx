import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { GameState } from './types/game';
import CharacterCreation from './components/CharacterCreation';
import LifePhase from './components/LifePhase';
import CampaignPhase from './components/CampaignPhase';
import PresidentPhase from './components/PresidentPhase';
import { Save, Menu } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (gameState && gameState.id) {
      saveGame();
    }
  }, [gameState]);

  const initializeGame = (name: string, birthYear: number) => {
    const newState: GameState = {
      characterName: name,
      birthYear,
      currentAge: 10,
      currentYear: birthYear + 10,
      phase: 'life',
      money: 1000,
      popularity: 50,
      educationLevel: 'elementary',
      militaryService: false,
      isPresident: false,
      skills: {
        charisma: 30,
        intelligence: 30,
        strength: 30,
        political: 10,
      },
      stateSupport: {},
      events: [],
    };

    createGameSave(newState);
  };

  const createGameSave = async (state: GameState) => {
    const { data, error } = await supabase
      .from('game_saves')
      .insert({
        character_name: state.characterName,
        birth_year: state.birthYear,
        current_age: state.currentAge,
        current_year: state.currentYear,
        phase: state.phase,
        political_party: state.politicalParty,
        money: state.money,
        popularity: state.popularity,
        education_level: state.educationLevel,
        career_path: state.careerPath,
        military_service: state.militaryService,
        is_president: state.isPresident,
        game_data: {
          skills: state.skills,
          stateSupport: state.stateSupport,
          events: state.events,
        },
      })
      .select()
      .maybeSingle();

    if (data && !error) {
      setGameState({ ...state, id: data.id });
    }
  };

  const saveGame = async () => {
    if (!gameState || !gameState.id) return;

    await supabase
      .from('game_saves')
      .update({
        current_age: gameState.currentAge,
        current_year: gameState.currentYear,
        phase: gameState.phase,
        political_party: gameState.politicalParty,
        money: gameState.money,
        popularity: gameState.popularity,
        education_level: gameState.educationLevel,
        career_path: gameState.careerPath,
        military_service: gameState.militaryService,
        is_president: gameState.isPresident,
        game_data: {
          skills: gameState.skills,
          stateSupport: gameState.stateSupport,
          events: gameState.events,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameState.id);
  };

  const updateGameState = (updates: Partial<GameState>) => {
    if (!gameState) return;
    setGameState({ ...gameState, ...updates });
  };

  const resetGame = () => {
    setGameState(null);
    setShowMenu(false);
  };

  const handleGameEnd = (endState: 'death' | 'assassination' | 'resignation' | 'two-terms' | 'one-term') => {
    const endMessages = {
      death: `President ${gameState?.characterName} passed away at age ${gameState?.currentAge}. Your presidency ended due to natural causes.`,
      assassination: `President ${gameState?.characterName} was assassinated. The nation mourns your loss.`,
      resignation: `President ${gameState?.characterName} resigned from office under pressure.`,
      'two-terms': `President ${gameState?.characterName} completed two full terms and stepped down as required by law. Legacy: ${Math.round(gameState?.popularity || 0)}% approval.`,
      'one-term': `President ${gameState?.characterName} completed one term and stepped down. Legacy: ${Math.round(gameState?.popularity || 0)}% approval.`,
    };

    alert(endMessages[endState]);
    resetGame();
  };

  if (!gameState) {
    return <CharacterCreation onComplete={initializeGame} />;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-slate-800/90 hover:bg-slate-700 text-white p-3 rounded-lg shadow-lg border border-slate-600 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {showMenu && (
        <div className="absolute top-16 right-4 z-50 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-600 p-4 min-w-[200px]">
          <div className="space-y-2">
            <div className="text-white font-bold mb-3 pb-2 border-b border-slate-600">
              Game Menu
            </div>
            <button
              onClick={saveGame}
              className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <Save className="w-4 h-4" />
              Save Game
            </button>
            <button
              onClick={resetGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-all"
            >
              New Game
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {gameState.phase === 'life' && (
        <LifePhase gameState={gameState} onUpdateState={updateGameState} />
      )}

      {gameState.phase === 'campaign' && (
        <CampaignPhase gameState={gameState} onUpdateState={updateGameState} />
      )}

      {gameState.phase === 'president' && (
        <PresidentPhase gameState={gameState} onUpdateState={updateGameState} onGameEnd={handleGameEnd} />
      )}
    </div>
  );
}

export default App;
