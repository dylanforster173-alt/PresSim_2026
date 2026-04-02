export interface GameState {
  id?: string;
  characterName: string;
  birthYear: number;
  currentAge: number;
  currentYear: number;
  phase: 'character-creation' | 'life' | 'campaign' | 'president';
  politicalParty?: 'Democrat' | 'Republican' | 'Independent';
  money: number;
  popularity: number;
  educationLevel: 'elementary' | 'high-school' | 'college' | 'graduate';
  careerPath?: string;
  militaryService: boolean;
  isPresident: boolean;
  skills: {
    charisma: number;
    intelligence: number;
    strength: number;
    political: number;
  };
  stateSupport: Record<string, number>;
  events: GameEvent[];
}

export interface GameEvent {
  id: string;
  age: number;
  year: number;
  type: 'life' | 'political' | 'career' | 'military';
  title: string;
  description: string;
  choices?: EventChoice[];
}

export interface EventChoice {
  text: string;
  effects: {
    money?: number;
    popularity?: number;
    skills?: Partial<GameState['skills']>;
  };
}

export interface USState {
  name: string;
  abbreviation: string;
  electoralVotes: number;
  position: { x: number; y: number };
  lean: 'blue' | 'red' | 'swing';
}
