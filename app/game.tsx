import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Vibration, ScrollView } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Accelerometer } from "expo-sensors";

export default function GameScreen() {
  const { deck } = useLocalSearchParams();
  const parsedDeck = deck ? JSON.parse(deck as string) : { prompts: [] };

  const INITIAL_TIME = 60;
  const TILT_COOLDOWN_TIME = 1000;
  const COUNTDOWN_TIME = 5;

  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [displayPrompt, setDisplayPrompt] = useState<string | null>(null);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const [correctPrompts, setCorrectPrompts] = useState<string[]>([]);
  const [skippedPrompts, setSkippedPrompts] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#fdf6e3");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [canTilt, setCanTilt] = useState(true);
  const [tiltCooldown, setTiltCooldown] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [gameStarted, setGameStarted] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      };
    }, [])
  );

  useEffect(() => {
    if (gameOver || !gameStarted) {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    }
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const first = pickRandomPrompt(parsedDeck.prompts);
    setCurrentPrompt(first);
    setDisplayPrompt(first);
    setUsedPrompts(first ? [first] : []);

    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    );
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      setAccelData({ x, y, z });
      if (canTilt && !tiltCooldown) {
        if (z > 0.98) {
          handleTilt("skip");
        } else if (z < -0.98) {
          handleTilt("correct");
        }
      }
    });
    return () => subscription.remove();
  }, [
    currentPrompt,
    usedPrompts,
    gameOver,
    tiltCooldown,
    canTilt,
    gameStarted,
  ]);

  const handleTilt = (type: "correct" | "skip") => {
    if (!currentPrompt || gameOver) return;
    setCanTilt(false);
    setTiltCooldown(true);
    setTimeout(() => {
      setTiltCooldown(false);
      setCanTilt(true);
    }, TILT_COOLDOWN_TIME);

    Vibration.vibrate(100);

    if (type === "correct") {
      setScore((prev) => prev + 1);
      setCorrectPrompts((prev) => [...prev, currentPrompt]);
      setBackgroundColor("green");
      setDisplayPrompt("CORRECT");
    } else {
      setSkippedPrompts((prev) => [...prev, currentPrompt]);
      setBackgroundColor("red");
      setDisplayPrompt("PASS");
    }

    setTimeout(() => {
      const nextPrompt = pickRandomPrompt(parsedDeck.prompts, [
        ...usedPrompts,
        currentPrompt,
      ]);
      if (nextPrompt) {
        setUsedPrompts((prev) => [...prev, nextPrompt]);
        setCurrentPrompt(nextPrompt);
        setDisplayPrompt(nextPrompt);
        setBackgroundColor("#fdf6e3");
      } else {
        setGameOver(true);
        setCurrentPrompt(null);
        setDisplayPrompt(null);
        setBackgroundColor("#fdf6e3");
      }
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {!gameStarted ? (
        <Text style={styles.countdown}>Starting in {countdown}...</Text>
      ) : !gameOver ? (
        <>
          <Text
            style={[
              styles.prompt,
              (displayPrompt === "CORRECT" || displayPrompt === "PASS") && {
                color: "white",
              },
            ]}
          >
            {displayPrompt || "No prompt"}
          </Text>
          <Text style={styles.timer}>⏱ {timeLeft}s</Text>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.summaryContainer}>
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
        </ScrollView>
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
  prompt: {
    fontSize: 42,
    textAlign: "center",
    marginTop: 10,
  },
  timer: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  countdown: {
    fontSize: 36,
    textAlign: "center",
  },
  summaryContainer: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 80,
  },
  summaryTitle: { fontSize: 24, marginTop: 20, fontWeight: "bold" },
  correctItem: { color: "green", fontSize: 18, marginVertical: 2 },
  skippedItem: { color: "red", fontSize: 18, marginVertical: 2 },
  debugBox: {
    display: "none",
  },
  debugText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});
