import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "CUSTOM_DECKS";

export interface Deck {
  name: string;
  prompts: string[];
}

export async function saveDeck(deck: Deck): Promise<void> {
  const existing = await getDecks();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, deck]));
}

export async function getDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
