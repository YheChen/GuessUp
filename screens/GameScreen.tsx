// screens/gamescreen.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function GameScreen({ route }) {
  const { deck } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{deck.prompts[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  prompt: { fontSize: 48 },
});
