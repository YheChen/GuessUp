import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import DeckSelector from "../components/DeckSelector";
import ImportDeckModal from "../components/ImportDeckModal";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GuessUp</Text>
      <Button
        title="Play"
        disabled={!selectedDeck}
        onPress={() => {
          if (selectedDeck) {
            router.push({
              pathname: "/game",
              params: { deck: JSON.stringify(selectedDeck) },
            });
          }
        }}
      />
      <DeckSelector
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />
      <Button title="Import Deck" onPress={() => setShowImport(true)} />
      <ImportDeckModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onSave={setSelectedDeck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, marginBottom: 20 },
});
