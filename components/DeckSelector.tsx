import React from "react";
import { View, Text, Button } from "react-native";
import { getDecks } from "../utils/storage";

export default function DeckSelector({ selectedDeck, onSelectDeck }) {
  const loadDeck = async () => {
    const decks = await getDecks();
    if (decks.length > 0) onSelectDeck(decks[0]); // Select the first deck
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Button title="Load Last Deck" onPress={loadDeck} />
      {selectedDeck && <Text>Deck: {selectedDeck.name}</Text>}
    </View>
  );
}
