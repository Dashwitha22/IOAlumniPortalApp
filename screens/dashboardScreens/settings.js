import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const Settings = () => {
  const [brandLogo, setBrandLogo] = useState(null);
  const [groupLogo, setGroupLogo] = useState(null);

  const pickFile = async setFile => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setFile(result);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        throw err;
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <Text style={styles.label}>Change Brand Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your brand"
        placeholderTextColor="black"
      />

      <Text style={styles.label}>Change Brand Logo</Text>
      <TouchableOpacity
        style={styles.fileButton}
        onPress={() => pickFile(setBrandLogo)}>
        <Text>{brandLogo ? brandLogo.name : 'No file chosen'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Add a Group Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Category Name"
        placeholderTextColor="black"
      />

      <Text style={styles.label}>Add the Group Logo</Text>
      <TouchableOpacity
        style={styles.fileButton}
        onPress={() => pickFile(setGroupLogo)}>
        <Text>{groupLogo ? groupLogo.name : 'No file chosen'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Change Brand Colors</Text>
      <View style={styles.colorContainer}>
        <View style={[styles.colorBox, {backgroundColor: 'red'}]} />
        <View style={[styles.colorBox, {backgroundColor: 'blue'}]} />
        <View style={[styles.colorBox, {backgroundColor: 'black'}]} />
        <View style={[styles.colorBox, {backgroundColor: 'white'}]} />
      </View>

      <View style={styles.button}>
        <Text style={styles.buttonText}>Change</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    marginBottom: 20,
    color: 'black',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  fileButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderColor: '#d0d0d0',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 4,
    borderColor: 'lightgray',
  },
  button: {
    borderRadius: 10,
    marginVertical: 20,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
});

export default Settings;
