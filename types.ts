
export interface Artifact {
  clue: string;
  description: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface LocationGuess {
  place: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  confidence: number; // 0 to 100
  reasoning: string;
}

export interface AnalysisResult {
  guesses: LocationGuess[];
  artifacts: Artifact[];
  summary: string;
  sources?: Source[];
}
