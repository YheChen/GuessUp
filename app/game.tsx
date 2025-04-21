import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Vibration } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import { Accelerometer } from "expo-sensors";

export default function GameScreen() {
  const { deck } = useLocalSearchParams();
  const parsedDeck = deck ? JSON.parse(deck as string) : { prompts: [] };
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const [correctPrompts, setCorrectPrompts] = useState<string[]>([]);
  const [skippedPrompts, setSkippedPrompts] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("white");

  const INITIAL_TIME = 60; // seconds obviously
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);

  // Lock screen orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    );
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  // Set first prompt randomly
  useEffect(() => {
    const first = pickRandomPrompt(parsedDeck.prompts);
    setCurrentPrompt(first);
    setUsedPrompts(first ? [first] : []);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  // Tilt detection
  useEffect(() => {
    if (gameOver) return;

    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (z > 0.98) {
        handleTilt("skip"); // tilt down
      } else if (z < -0.98) {
        handleTilt("correct"); // tilt up
      }
    });

    return () => subscription.remove();
  }, [currentPrompt, usedPrompts, gameOver]);

  const handleTilt = (type: "correct" | "skip") => {
    if (!currentPrompt || gameOver) return;

    Vibration.vibrate(100);

    if (type === "correct") {
      setScore((prev) => prev + 1);
      setCorrectPrompts((prev) => [...prev, currentPrompt]);
      setBackgroundColor("green");
    } else {
      setSkippedPrompts((prev) => [...prev, currentPrompt]);
      setBackgroundColor("red");
    }

    setTimeout(() => {
      const nextPrompt = pickRandomPrompt(parsedDeck.prompts, [
        ...usedPrompts,
        currentPrompt,
      ]);
      if (nextPrompt) {
        setUsedPrompts((prev) => [...prev, nextPrompt]);
        setCurrentPrompt(nextPrompt);
        setBackgroundColor("white");
      } else {
        setGameOver(true);
        setCurrentPrompt(null);
        setBackgroundColor("white");
      }
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {!gameOver ? (
        <>
          <Text style={styles.timer}>⏱ {timeLeft}s</Text>
          <Text style={styles.score}>✅ {score}</Text>
          <Text style={styles.prompt}>{currentPrompt || "No prompt"}</Text>
        </>
      ) : (
        <View style={styles.summaryContainer}>
          <Text style={styles.prompt}>🎉 Time’s Up!</Text>
          <Text style={styles.summaryTitle}>Final Score: {score}</Text>
          <Text style={styles.summaryTitle}>Correct:</Text>
          {correctPrompts.map((p, i) => (
            <Text key={`c-${i}`} style={styles.correctItem}>
              • {p}
            </Text>
          ))}
          <Text style={styles.summaryTitle}>Skipped:</Text>
          {skippedPrompts.map((p, i) => (
            <Text key={`s-${i}`} style={styles.skippedItem}>
              • {p}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function pickRandomPrompt(
  prompts: string[],
  used: string[] = []
): string | null {
  const available = prompts.filter((p) => !used.includes(p));
  if (available.length === 0) return null;
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  prompt: { fontSize: 42, textAlign: "center", marginTop: 10 },
  timer: { position: "absolute", top: 50, left: 40, fontSize: 20 },
  score: { position: "absolute", top: 50, right: 40, fontSize: 20 },
  summaryContainer: { alignItems: "center", padding: 20 },
  summaryTitle: { fontSize: 24, marginTop: 20, fontWeight: "bold" },
  correctItem: { color: "green", fontSize: 18, marginVertical: 2 },
  skippedItem: { color: "red", fontSize: 18, marginVertical: 2 },
});
