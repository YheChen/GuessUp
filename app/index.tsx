import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const loadLastDeck = async () => {
    const raw = await AsyncStorage.getItem("CUSTOM_DECKS");
    const decks = raw ? JSON.parse(raw) : [];
    if (decks.length > 0) {
      router.push({
        pathname: "/game",
        params: { deck: JSON.stringify(decks[0]) },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>🎯 GuessUp</Text>

      <Pressable style={styles.button} onPress={loadLastDeck}>
        <Text style={styles.buttonText}>Play Last Deck</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.push("/decks")}
      >
        <Text style={styles.buttonText}>Browse Decks</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fefefe",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#2196f3",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginVertical: 10,
  },
  secondary: {
    backgroundColor: "#4caf50",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
