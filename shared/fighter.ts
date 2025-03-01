export interface Fighter {
  image: string,
  first_name: string,
  last_name: string,
  weight: "Strawweight" | "Flyweight" | "Bantamweight" | "Featherweight" | "Lightweight" | "Welterweight" | "Middleweight" | "Light Heavyweight" | "Heavyweight",
  record: {
    wins: number,
    losses: number,
    draws: number
  },
  nickname?: string,
}
