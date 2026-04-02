import { useState } from 'react';
import { User, Calendar } from 'lucide-react';

interface CharacterCreationProps {
  onComplete: (name: string, birthYear: number) => void;
}

export default function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1980);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim(), birthYear);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative max-w-2xl w-full">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Political Life Simulator
            </h1>
            <p className="text-slate-300 text-lg">
              From civilian to Commander-in-Chief
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-3 text-lg">
                <User className="w-5 h-5" />
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your character's name"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-3 text-lg">
                <Calendar className="w-5 h-5" />
                Birth Year: {birthYear}
              </label>
              <input
                type="range"
                min="1775"
                max="1991"
                value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>1775</span>
                <span>1991</span>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-2">Game Overview</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Start at age 10, live your life</li>
                <li>• Enter politics at age 16</li>
                <li>• Join military at age 18 (optional)</li>
                <li>• Run for President at age 35</li>
                <li>• Win the election and lead the nation</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Begin Your Journey
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
