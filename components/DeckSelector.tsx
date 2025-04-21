import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { getDecks } from "../utils/storage";

export default function DeckSelector({ selectedDeck, onSelectDeck }) {
  const [deckName, setDeckName] = useState<string | null>(null);

  const loadDeck = async () => {
    const decks = await getDecks();
    if (decks.length > 0) {
      onSelectDeck(decks[0]);
      setDeckName(decks[0].name);
    } else {
      setDeckName("No decks found");
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Button title="Load Last Deck" onPress={loadDeck} />
      {selectedDeck && <Text>Deck: {selectedDeck.name}</Text>}
      {!selectedDeck && deckName && <Text>{deckName}</Text>}
    </View>
  );
}
