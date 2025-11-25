export type PokemonListItem = {
  id: number;
  name: string;
};

export type PokemonDetail = {
  id: number;
  name: string;
  base_experience: number;
  types: string[];
  image: string;
};

export type DeckEntry = {
  id: string;
  userId: string;
  pokeId: number;
  name: string;
  image: string;
  experience: number;
  capturedAt: string;
};

export type CaptureStatus = {
  id: string;
  userId: string;
  pokeId: number;
  attempts: number;
  status: "idle" | "captured" | "fled";
};
