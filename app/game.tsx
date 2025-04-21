import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Vibration } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import { Accelerometer } from "expo-sensors";

export default function GameScreen() {
  const { deck } = useLocalSearchParams();
  const parsedDeck = deck ? JSON.parse(deck as string) : { prompts: [] };

  const INITIAL_TIME = 60;
  const NEUTRAL_HOLD_TIME = 1000; // ms
  const TILT_COOLDOWN_TIME = 1000; // ms

  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);
  const [correctPrompts, setCorrectPrompts] = useState<string[]>([]);
  const [skippedPrompts, setSkippedPrompts] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [canTilt, setCanTilt] = useState(true);
  const [resetStartTime, setResetStartTime] = useState<number | null>(null);
  const [resetCountdown, setResetCountdown] = useState<number>(0);
  const [tiltCooldown, setTiltCooldown] = useState(false);

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

  useEffect(() => {
    const first = pickRandomPrompt(parsedDeck.prompts);
    setCurrentPrompt(first);
    setUsedPrompts(first ? [first] : []);
  }, []);

  useEffect(() => {
    if (gameOver) return;
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
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      setAccelData({ x, y, z });
      const now = Date.now();

      if (canTilt && !tiltCooldown) {
        if (z > 0.98) {
          handleTilt("skip");
        } else if (z < -0.98) {
          handleTilt("correct");
        }
      } else {
        if (Math.abs(z) < 0.5) {
          if (resetStartTime === null) {
            setResetStartTime(now);
            setResetCountdown(NEUTRAL_HOLD_TIME / 1000);
          } else {
            const elapsed = now - resetStartTime;
            setResetCountdown(
              Math.max(
                0,
                parseFloat(((NEUTRAL_HOLD_TIME - elapsed) / 1000).toFixed(1))
              )
            );
            if (elapsed >= NEUTRAL_HOLD_TIME && !tiltCooldown) {
              setCanTilt(true);
              setResetStartTime(null);
              setResetCountdown(0);
            }
          }
        } else {
          if (resetStartTime !== null) {
            setResetStartTime(null);
            setResetCountdown(0);
          }
        }
      }
    });

    return () => subscription.remove();
  }, [currentPrompt, usedPrompts, gameOver, tiltCooldown]);

  const handleTilt = (type: "correct" | "skip") => {
    if (!currentPrompt || gameOver) return;
    setCanTilt(false);
    setTiltCooldown(true);
    setTimeout(() => setTiltCooldown(false), TILT_COOLDOWN_TIME);

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
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>z = {accelData.z.toFixed(2)}</Text>
            <Text style={styles.debugText}>
              Reset Timer:{" "}
              {resetCountdown > 0 ? `${resetCountdown}s` : "Not resetting"}
            </Text>
            <Text style={styles.debugText}>
              Cooldown: {tiltCooldown ? "On" : "Off"}
            </Text>
          </View>
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
  debugBox: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});
