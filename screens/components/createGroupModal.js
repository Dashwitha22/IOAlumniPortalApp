import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import {userApiServer} from '../../config';
import {Picker} from '@react-native-picker/picker';
import {IoColor1, IoColor2} from '../../colorCode';
import {useSelector} from 'react-redux';
import {readFile} from 'react-native-fs';

const CreateGroupModal = ({modalVisible, setModalVisible, edit, groupData}) => {
  const user = useSelector(state => state.auth.user);
  const username = user ? user.firstName : ''; // Add null check here
  const userId = user ? user._id : null; // Add null check here
  const profile = user ? user : {}; // Add null check here

  const [groupName, setGroupName] = useState(edit ? groupData?.groupName : '');
  const [groupType, setGroupType] = useState(edit ? groupData?.groupType : '');
  const [category, setCategory] = useState(edit ? groupData?.category : '');
  const [backgroundName, setBackgroundName] = useState('');
  const [groupPictureName, setGroupPictureName] = useState('');
  const [background, setBackground] = useState(
    edit ? groupData?.groupLogo : '',
  );
  const [groupPicture, setGroupPicture] = useState(
    edit ? groupData?.groupPicture : '',
  );
  const [loading, setLoading] = useState(false);

  const categories = [
    'Cars and Vehicles',
    'Comedy',
    'Entertainment',
    'Business Connect',
    'Education',
    'Sport',
    'Pets and Animals',
  ];

  const handleImageUpload = async (setImage, setImageName) => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
      });
      const base64Image = await readFile(image.path, 'base64');
      setImage(`data:${image.mime};base64,${base64Image}`); // Store base64 string
      setImage(image.path); // Save the selected image path
      const imageName = image.path.split('/').pop(); // Extract the file name from the path
      setImageName(imageName); // Save the image name
    } catch (error) {
      console.error('Image selection canceled or failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!groupName || !groupType || !category) {
      Alert.alert('Validation Error', 'All fields marked with * are required.');
      return;
    }

    const groupData = {
      userId: profile._id,
      groupName,
      groupType,
      category,
      groupLogo: groupPicture,
      groupPicture: background,
      member: {
        userId: profile._id,
        profilePicture: profile.profilePicture,
        userName: `${profile.firstName} ${profile.lastName}`,
      },
    };

    try {
      setLoading(true);
      const url = edit
        ? `${userApiServer}/groups/${groupData._id}`
        : `${userApiServer}/groups/create`;
      const method = edit ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json', // Header included as per your ReactJS code
        },
        data: groupData,
      });

      console.log('CREATE GROUP RESPONSE : ', response.data);

      Alert.alert(
        'Success',
        `Group ${edit ? 'updated' : 'created'} successfully.`,
      );
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset all fields to their default values
    setGroupName('');
    setGroupType('');
    setCategory('');
    setBackground('');
    setGroupPicture('');
    setBackgroundName('');
    setGroupPictureName('');
    setModalVisible(false); // Close the modal
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {edit ? 'Edit Group' : 'Create A New Group'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Group Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Group Name"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Group Type <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={groupType}
                onValueChange={itemValue => setGroupType(itemValue)}
                dropdownIconColor="black"
                style={styles.picker}>
                <Picker.Item label="Select Group Type" value="" />
                <Picker.Item label="Public" value="Public" />
                <Picker.Item label="Private" value="Private" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Category <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={itemValue => setCategory(itemValue)}
                dropdownIconColor="black"
                style={styles.picker}>
                <Picker.Item label="Select Category" value="" />
                {categories.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Background</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() =>
                handleImageUpload(setBackground, setBackgroundName)
              }>
              <Text style={styles.uploadButtonText}>
                {background
                  ? 'Change Background Image'
                  : 'Upload Background Image'}
              </Text>
            </TouchableOpacity>
            {backgroundName ? (
              <Text style={styles.imageName}>{backgroundName}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Logo</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() =>
                handleImageUpload(setGroupPicture, setGroupPictureName)
              }>
              <Text style={styles.uploadButtonText}>
                {groupPicture ? 'Change Group Logo' : 'Upload Group Logo'}
              </Text>
            </TouchableOpacity>
            {groupPictureName ? (
              <Text style={styles.imageName}>{groupPictureName}</Text>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateGroupModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: 'black',
    height: 40,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden', // Ensures the picker stays within the border
  },
  picker: {
    color: 'black', // Text color inside picker
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: IoColor2,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: IoColor1,
  },
  submitButton: {
    backgroundColor: IoColor1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageName: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
  asterisk: {
    color: 'red', // Highlight the asterisk in red
  },
});
