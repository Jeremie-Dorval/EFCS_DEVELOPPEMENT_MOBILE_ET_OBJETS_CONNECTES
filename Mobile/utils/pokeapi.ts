import { PokemonDetail, PokemonListItem } from "@/types/pokemon";

const BASE = "https://pokeapi.co/api/v2";

export function idFromUrl(url: string): number {
  // https://pokeapi.co/api/v2/pokemon/1/
  const m = url.match(/\/pokemon\/(\d+)\/?$/); //regex pour extraire l'id fait avec chatgpt prompt: "write a regex to extract the number id from a url like https://pokeapi.co/api/v2/pokemon/1/"
  return m ? Number(m[1]) : 0;
}

export function artworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function fetchPokemonPage(
  offset = 0,
  limit = 20
): Promise<PokemonListItem[]> {
  const res = await fetch(`${BASE}/pokemon?offset=${offset}&limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.results as { name: string; url: string }[]).map((r) => ({
    id: idFromUrl(r.url),
    name: r.name,
  }));
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const res = await fetch(`${BASE}/pokemon/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return {
    id: j.id,
    name: j.name,
    base_experience: j.base_experience,
    types: (j.types as { type: { name: string } }[]).map((t) => t.type.name),
    image: artworkUrl(j.id),
  };
}

export async function fetchBaseExperience(id: number): Promise<number> {
  const res = await fetch(`${BASE}/pokemon/${id}`);
  if (!res.ok) return Number.MAX_SAFE_INTEGER;
  const j = await res.json();
  return j.base_experience ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Retourne l'ID de la prochaine évolution réelle d'un Pokémon via la chaîne d'évolution.
 * Ex: Bulbasaur (1) -> Ivysaur (2) -> Venusaur (3).
 * Si forme finale, retourne null.
 */
export async function fetchNextEvolutionId(id: number): Promise<number | null> {
  // 1) species -> evolution_chain
  const s = await fetch(`${BASE}/pokemon-species/${id}`);
  if (!s.ok) return null;
  const species = await s.json();
  const chainUrl: string | undefined = species.evolution_chain?.url;
  if (!chainUrl) return null;

  // 2) récupère la chaîne d'évolution
  const chRes = await fetch(chainUrl);
  if (!chRes.ok) return null;
  const chain = await chRes.json();

  // helper: extraire l'id depuis "species.url"
  const idFromSpeciesUrl = (u: string) =>
    Number((u.match(/\/pokemon-species\/(\d+)\//)?.[1]) ?? "0"); //regex pour extraire l'id fait avec chatgpt prompt: "write a regex to extract the number id from a url like https://pokeapi.co/api/v2/pokemon-species/1/"

  const stack = [chain.chain]; // { species, evolves_to: [...] }
  let nextSpeciesId: number | null = null;

  while (stack.length) {
    const node = stack.pop()!;
    const curId = idFromSpeciesUrl(node.species.url);
    if (curId === id) {
      const nxt = node.evolves_to?.[0]?.species?.url;
      nextSpeciesId = nxt ? idFromSpeciesUrl(nxt) : null;
      break;
    }
    (node.evolves_to || []).forEach((n: any) => stack.push(n));
  }

  return nextSpeciesId;
}
