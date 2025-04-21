import React, { useState } from "react";
import { View, Text, Button, Modal, StyleSheet } from "react-native";
import DeckSelector from "../components/DeckSelector";
import ImportDeckModal from "../components/ImportDeckModal";

export default function HomeScreen({ navigation }) {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showImport, setShowImport] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GuessUp</Text>
      <DeckSelector
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />
      <Button
        title="Play"
        disabled={!selectedDeck}
        onPress={() => navigation.navigate("Game", { deck: selectedDeck })}
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
