import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {IoColor2} from '../../../colorCode';

const PollModal = ({visible, onClose, onSubmit, edit, initialData}) => {
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '', '']);
  const [optionCount, setOptionCount] = useState(2);

  useEffect(() => {
    if (edit && initialData) {
      setPollQuestion(initialData.question || '');
      const options = initialData.options.map(option => option.option);
      setPollOptions([...options, '', '', ''].slice(0, 5));
      setOptionCount(options.length);
    }
  }, [edit, initialData]);

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

  const handleSubmit = () => {
    const validOptions = pollOptions
      .filter(option => option.trim() !== '')
      .map(option => ({option, votes: []}));

    if (pollQuestion.trim() && validOptions.length >= 2) {
      onSubmit(pollQuestion, validOptions);
      resetForm();
      onClose();
    } else {
      Alert.alert(
        'Validation Error',
        'Please provide a poll question and at least 2 options.',
      );
    }
  };

  const resetForm = () => {
    setPollQuestion('');
    setPollOptions(['', '', '', '', '']);
    setOptionCount(2);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {edit ? 'Edit Poll' : 'Create Poll'}
          </Text>
          <ScrollView>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Poll Question:</Text>
              <TextInput
                style={styles.input}
                value={pollQuestion}
                onChangeText={setPollQuestion}
              />
            </View>

            {Array.from({length: optionCount}).map((_, index) => (
              <View key={index} style={styles.inputContainer}>
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleSubmit}>
                <Text style={styles.actionButtonText}>
                  {edit ? 'Edit Poll' : 'Create Poll'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onClose}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PollModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    color: 'black',
  },
  addButton: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: IoColor2,
    borderRadius: 5,
    padding: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 5,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  primaryButton: {
    backgroundColor: IoColor2,
  },
  secondaryButton: {
    backgroundColor: IoColor2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
