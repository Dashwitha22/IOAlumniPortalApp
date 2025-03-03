import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {IoColor2} from '../../colorCode';

const PollModal = ({visible, onClose, onCreatePoll}) => {
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '', '']);
  const [optionCount, setOptionCount] = useState(2);

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleAddOption = () => {
    if (optionCount < 5) {
      setOptionCount(optionCount + 1);
    } else {
      Alert.alert('Limit Exceeded', 'You can only add up to 5 options.');
    }
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(option => option.trim() !== '');
    if (!pollQuestion.trim() || validOptions.length < 2) {
      Alert.alert('Invalid Poll', 'Provide a question and at least 2 options.');
      return;
    }
    onCreatePoll(pollQuestion, validOptions);
    setPollQuestion('');
    setPollOptions(['', '', '', '', '']);
    setOptionCount(2);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Poll</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Poll Question:</Text>
            <TextInput
              style={styles.input}
              value={pollQuestion}
              onChangeText={setPollQuestion}
            />
          </View>
          <ScrollView>
            {Array.from({length: optionCount}).map((_, index) => (
              <View key={index} style={styles.inputGroup}>
                <Text style={styles.label}>Option {index + 1}:</Text>
                <TextInput
                  style={styles.input}
                  value={pollOptions[index]}
                  onChangeText={value => handleOptionChange(index, value)}
                />
              </View>
            ))}
            {optionCount < 5 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddOption}>
                <Text style={styles.addButtonText}>Add Option</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreatePoll}>
              <Text style={styles.actionButtonText}>Create Poll</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: 400,
    maxWidth: '90%',
  },
  modalTitle: {
    marginTop: 0,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    color: 'black',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: IoColor2,
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
  },
  modalActions: {
    marginTop: 10,
  },
  actionButton: {
    marginVertical: 5,
    padding: 10,
    width: '100%',
    borderRadius: 3,
    backgroundColor: IoColor2,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
  },
});

export default PollModal;
