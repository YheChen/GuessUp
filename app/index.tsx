import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DeckSelector from "../components/DeckSelector";
import ImportDeckModal from "../components/ImportDeckModal";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 GuessUp</Text>

      <DeckSelector
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />

      <TouchableOpacity
        style={[styles.button, !selectedDeck && styles.disabledButton]}
        disabled={!selectedDeck}
        onPress={() => {
          if (selectedDeck) {
            router.push({
              pathname: "/game",
              params: { deck: JSON.stringify(selectedDeck) },
            });
          }
        }}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setShowImport(true)}
      >
        <Text style={styles.secondaryButtonText}>Import Deck</Text>
      </TouchableOpacity>

      <ImportDeckModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onSave={setSelectedDeck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6e3",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#1e3a8a",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#a7f3d0",
  },
  secondaryButton: {
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#1e40af",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
