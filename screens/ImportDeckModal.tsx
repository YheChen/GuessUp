import React, { useState } from "react";
import { View, TextInput, Button, Modal } from "react-native";
import { saveDeck } from "../utils/storage";

export default function ImportDeckModal({ visible, onClose, onSave }) {
  const [deckName, setDeckName] = useState("");
  const [text, setText] = useState("");

  const handleSave = async () => {
    const prompts = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const deck = { name: deckName, prompts };
    await saveDeck(deck);
    onSave(deck);
    setDeckName("");
    setText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Deck Name"
          value={deckName}
          onChangeText={setDeckName}
        />
        <TextInput
          placeholder="One prompt per line"
          multiline
          value={text}
          onChangeText={setText}
          style={{ height: 200 }}
        />
        <Button title="Save Deck" onPress={handleSave} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
}
