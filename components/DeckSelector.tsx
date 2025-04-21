import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { getDecks } from "../utils/storage";
import { exampleDecks } from "../data/exampleDecks";

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
      {selectedDeck && (
        <Text style={{ marginTop: 10 }}>Selected: {selectedDeck.name}</Text>
      )}
      <Button title="Load Last Deck" onPress={loadDeck} />
      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Or use an example deck:
      </Text>
      {exampleDecks.map((deck, idx) => (
        <View key={idx} style={{ marginVertical: 4 }}>
          <Button
            title={`${deck.name}`}
            onPress={() => {
              onSelectDeck(deck);
              setDeckName(deck.name);
            }}
          />
        </View>
      ))}
    </View>
  );
}
