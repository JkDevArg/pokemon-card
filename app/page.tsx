"use client"

import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
  };
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonCards, setPokemonCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchPokemon = async () => {
    setLoading(true);
    setError('');
    try {
      const pokeApiResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      setPokemon(pokeApiResponse.data);

      const tcgApiResponse = await axios.get(`https://api.pokemontcg.io/v2/cards`, {
        params: { q: `name:${searchTerm}`, pageSize: 20 }, // Fetch up to 20 cards
        headers: { 'X-Api-Key': 'your-api-key-here' } // Replace with your actual API key
      });
      if (tcgApiResponse.data.data.length > 0) {
        setPokemonCards(tcgApiResponse.data.data);
      } else {
        setPokemonCards([]);
      }
    } catch (err) {
      setError('Pokemon not found');
      setPokemon(null);
      setPokemonCards([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pokemon Card Search</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Pokemon name"
          className="flex-grow"
        />
        <Button onClick={searchPokemon} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pokemon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>PokeAPI Data</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={pokemon.sprites.front_default} alt={pokemon.name} className="mx-auto" />
              <p className="text-center mt-2">Name: {pokemon.name}</p>
              <p className="text-center">ID: {pokemon.id}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pokemon TCG Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="grid grid-cols-2 gap-4">
                  {pokemonCards.map((card) => (
                    <div key={card.id} className="text-center">
                      <img src={card.images.small} alt={card.name} className="mx-auto mb-2" />
                      <p className="text-sm">ID: {card.id}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}