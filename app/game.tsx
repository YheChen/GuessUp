import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";

export default function GameScreen() {
  const { deck } = useLocalSearchParams();
  const parsedDeck = deck ? JSON.parse(deck as string) : { prompts: [] };

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
    );

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{parsedDeck.prompts[0] || "No prompt"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  prompt: { fontSize: 48 },
});
