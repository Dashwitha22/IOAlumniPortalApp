import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {IoColor1} from '../../../colorCode';
import {userApiServer} from '../../../config';
import {useSelector} from 'react-redux';
import axios from 'axios';

const CreateForum = ({navigation, route}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Public');
  const [description, setDescription] = useState('');
  const [isHeadingActive, setIsHeadingActive] = useState(false);

  const user = useSelector(state => state.auth.user);
  const username = user ? user.firstName : ''; // Add null check here
  const userId = user ? user._id : null;
  const profile = user ? user : {};

  let richText = React.createRef();

  const handleHead = () => (
    <Text style={{color: 'black', fontSize: 20}}>H1</Text>
  );

  const handlePress = action => {
    if (action === actions.heading1) {
      setIsHeadingActive(!isHeadingActive);
    }
  };

  // Determine if we're editing by checking for a forumId in route params
  const forumId = route?.params?.forumId;
  const isEditing = !!forumId;

  useEffect(() => {
    if (isEditing && forumId) {
      fetchForumDetails();
    }
  }, [forumId, isEditing]);

  // Fetch details when editing so that the form fields are pre-populated
  const fetchForumDetails = async () => {
    try {
      const response = await axios.get(`${userApiServer}/forums/${forumId}`);
      const forum = response.data;
      setTitle(forum.title);
      setDescription(forum.description);
      setType(forum.type);
    } catch (error) {
      console.error('Error fetching forum details:', error);
    }
  };

  // Submits the form—performs a PUT request if editing, or a POST request if creating a new forum
  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (isEditing) {
      try {
        const body = {
          title,
          picture: '',
          description,
          type,
        };
        await axios.put(`${userApiServer}/forums/edit/${forumId}`, body);
        Alert.alert('Success', 'Forum Updated Successfully');
        navigation.navigate('Forums');
      } catch (error) {
        console.error('Error updating forum:', error);
        Alert.alert('Error', 'Failed to update forum');
      }
    } else {
      try {
        const body = {
          userId: profile._id,
          title,
          picture: '',
          description,
          type,
          department: profile.department,
          userName: `${profile.firstName} ${profile.lastName}`,
          profilePicture: profile.profilePicture,
        };
        const response = await axios.post(
          `${userApiServer}/forums/createForum`,
          body,
        );
        console.log('Forum created:', response.data);
        Alert.alert('Success', 'New Forum Created');
        navigation.navigate('Forums');
      } catch (error) {
        console.error('Error creating forum:', error);
        Alert.alert('Error', 'Failed to create forum');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isEditing ? 'Edit Forum' : 'Create New Forum'}
      </Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Forum title"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            style={styles.picker}
            onValueChange={itemValue => setType(itemValue)}
            dropdownIconColor="black">
            <Picker.Item label="Public" value="Public" />
            <Picker.Item label="Private" value="Private" />
          </Picker>
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <RichEditor
          ref={richText}
          onChange={setDescription}
          placeholder="Description"
          initialContentHTML={description}
          style={styles.richEditor}
        />
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.heading1,
            actions.insertImage,
            actions.insertTable,
            actions.blockquote,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.code,
            actions.undo,
            actions.redo,
          ]}
          iconMap={{
            [actions.setBold]: () => (
              <Icon name="format-bold" size={20} color="black" />
            ),
            [actions.setItalic]: () => (
              <Icon name="format-italic" size={20} color="black" />
            ),
            [actions.setUnderline]: () => (
              <Icon name="format-underlined" size={20} color="black" />
            ),
            [actions.heading1]: handleHead,
            [actions.insertImage]: () => (
              <Icon name="image" size={24} color="black" />
            ),
            [actions.insertTable]: () => (
              <Icon name="table-chart" size={20} color="black" />
            ),
            [actions.blockquote]: () => (
              <Icon name="format-quote" size={20} color="black" />
            ),
            [actions.alignLeft]: () => (
              <Icon name="format-align-left" size={20} color="black" />
            ),
            [actions.alignCenter]: () => (
              <Icon name="format-align-center" size={20} color="black" />
            ),
            [actions.alignRight]: () => (
              <Icon name="format-align-right" size={20} color="black" />
            ),
            [actions.code]: () => <Icon name="code" size={20} color="black" />,
            [actions.undo]: () => <Icon name="undo" size={20} color="black" />,
            [actions.redo]: () => <Icon name="redo" size={20} color="black" />,
          }}
          style={styles.richToolbar}
          onPress={handlePress}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Submit' : 'Create'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateForum;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    color: IoColor1,
    textAlign: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: 'black',
    height: 45,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    color: 'black',
    height: 45,
  },
  richEditor: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    height: 200,
  },
  richToolbar: {
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: IoColor1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
});
