import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {userApiServer} from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import {IoColor1} from '../../colorCode';

const WorkExperienceModal = ({
  visible,
  onClose,
  profile,
  fetchWorkExperiences,
}) => {
  const [forms, setForms] = useState([{}]);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 100}, (_, i) => currentYear - i);
  };

  const handleAddExperience = () => {
    setForms([...forms, {}]);
  };

  const handleRemoveExperience = index => {
    setForms(forms.filter((_, i) => i !== index));
  };

  const handleInputChange = (value, index, field) => {
    const newForms = [...forms];
    newForms[index][field] = value;
    setForms(newForms);
  };

  const handleCurrentWorkChange = index => {
    const newForms = [...forms];
    newForms[index].currentWork = !newForms[index].currentWork;
    setForms(newForms);
  };

  const handleSave = async () => {
    try {
      const updatedForms = forms.map(form => {
        if (!form.endMonth && !form.endYear) {
          return {
            ...form,
            endMonth: 'current',
          };
        }
        return form;
      });

      const token = await AsyncStorage.getItem('token');
      let body = JSON.stringify(updatedForms);
      await fetch(`${userApiServer}/alumni/workExperience/${profile._id}`, {
        method: 'PUT',
        body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      fetchWorkExperiences();
      setForms([{}]); // Reset fields after save
      onClose();
    } catch (error) {
      console.error('Error saving work experience:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContent}>
        <Text style={styles.modalTitle}>Add Work Experience</Text>
        {forms.map((form, index) => (
          <View key={index} style={styles.experienceContainer}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddExperience}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleRemoveExperience(index)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.label}>Title</Text>
            <TextInput
              placeholder="Enter title"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.title || ''}
              onChangeText={value => handleInputChange(value, index, 'title')}
            />

            <Text style={styles.label}>Company Name</Text>
            <TextInput
              placeholder="Company Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.companyName || ''}
              onChangeText={value =>
                handleInputChange(value, index, 'companyName')
              }
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              placeholder="Location"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.location || ''}
              onChangeText={value =>
                handleInputChange(value, index, 'location')
              }
            />

            <Text style={styles.label}>Location Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.locationType || ''}
                style={styles.picker}
                dropdownIconColor="black"
                onValueChange={value =>
                  handleInputChange(value, index, 'locationType')
                }>
                <Picker.Item label="Select Location Type" value="" />
                <Picker.Item label="On-site" value="On-site" />
                <Picker.Item label="Hybrid" value="Hybrid" />
                <Picker.Item label="Remote" value="Remote" />
              </Picker>
            </View>

            <View style={styles.checkboxContainer}>
              <CheckBox
                value={form.currentWork || false}
                style={styles.checkbox}
                tintColors={{true: IoColor1, false: 'gray'}} // for Android
                onValueChange={() => handleCurrentWorkChange(index)}
              />
              <Text style={styles.label}>I currently work here</Text>
            </View>

            <Text style={styles.label}>Start Date</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerContainer1}>
                <Picker
                  selectedValue={form.startMonth || ''}
                  style={styles.picker}
                  onValueChange={value =>
                    handleInputChange(value, index, 'startMonth')
                  }>
                  <Picker.Item label="Month" value="" />
                  {[
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ].map(month => (
                    <Picker.Item key={month} label={month} value={month} />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer1}>
                <Picker
                  selectedValue={form.startYear || ''}
                  style={styles.picker}
                  onValueChange={value =>
                    handleInputChange(value, index, 'startYear')
                  }>
                  <Picker.Item label="Year" value="" />
                  {generateYears().map(year => (
                    <Picker.Item
                      key={year}
                      label={String(year)}
                      value={String(year)}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Text style={styles.label}>End Date</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerContainer1}>
                <Picker
                  selectedValue={form.endMonth || ''}
                  style={styles.picker}
                  enabled={!form.currentWork}
                  onValueChange={value =>
                    handleInputChange(value, index, 'endMonth')
                  }>
                  <Picker.Item label="Month" value="" />
                  {[
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ].map(month => (
                    <Picker.Item key={month} label={month} value={month} />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer1}>
                <Picker
                  selectedValue={form.endYear || ''}
                  style={styles.picker}
                  enabled={!form.currentWork}
                  onValueChange={value =>
                    handleInputChange(value, index, 'endYear')
                  }>
                  <Picker.Item label="Year" value="" />
                  {generateYears().map(year => (
                    <Picker.Item
                      key={year}
                      label={String(year)}
                      value={String(year)}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Text style={styles.label}>Industry</Text>
            <TextInput
              placeholder="Industry"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.industry || ''}
              onChangeText={value =>
                handleInputChange(value, index, 'industry')
              }
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Description"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.description || ''}
              multiline
              onChangeText={value =>
                handleInputChange(value, index, 'description')
              }
            />

            <Text style={styles.label}>Profile Headline</Text>
            <TextInput
              placeholder="Profile Headline"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.profileHeadline || ''}
              onChangeText={value =>
                handleInputChange(value, index, 'profileHeadline')
              }
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteIcon: {padding: 10},
  addButton: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%', // Ensures the container uses full width
  },
  checkbox: {
    marginRight: 8,
  },
  label: {fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 5},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
    width: '100%',
  },
  pickerContainer1: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
    width: '45%',
  },
  picker: {height: 50, width: '100%', color: 'black'},
  button: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default WorkExperienceModal;
