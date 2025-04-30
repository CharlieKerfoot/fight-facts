export interface Fighter {
  first_name: string,
  nickname?: string,
  last_name: string,
  female: boolean,
  height: string,
  reach: number,
  stance: "Orthodox" | "Southpaw" | "Switch",
  birth_day: Date,
  weight: "Strawweight" | "Flyweight" | "Bantamweight" | "Featherweight" | "Lightweight" | "Welterweight" | "Middleweight" | "Light Heavyweight" | "Heavyweight",
  record: {
    wins: number,
    losses: number,
    draws: number
  },
}

export interface Guess {
  id: number,
  correct: boolean,
  fighter: Fighter
}
