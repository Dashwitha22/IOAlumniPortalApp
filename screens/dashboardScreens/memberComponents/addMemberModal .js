import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import {IoColor1} from '../../../colorCode';
import {userApiServer} from '../../../config';

const AddMemberModal = ({visible, onClose, profile, refreshMembers}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    userType: {
      admin: false,
      alumni: false,
      student: false,
      specialRole: false,
    },
    department: '',
    batch: '',
  });

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      userType: {
        admin: false,
        alumni: false,
        student: false,
        specialRole: false,
      },
      department: '',
      batch: '',
    });
  };

  const handleChange = (key, value) => {
    setFormData(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleUserTypeChange = type => {
    setFormData(prevFormData => ({
      ...prevFormData,
      userType: {
        admin: type === 'admin' ? !prevFormData.userType.admin : false,
        alumni: type === 'alumni' ? !prevFormData.userType.alumni : false,
        student: type === 'student' ? !prevFormData.userType.student : false,
        specialRole:
          type === 'specialRole' ? !prevFormData.userType.specialRole : false,
      },
      batch:
        type === 'admin' || type === 'specialRole' ? '' : prevFormData.batch,
      department: type === 'specialRole' ? '' : prevFormData.department,
    }));
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };

  const handleSubmit = async () => {
    if (
      !formData.userType.admin &&
      !formData.userType.alumni &&
      !formData.userType.student &&
      !formData.userType.specialRole
    ) {
      alert('Please select at least one user type.');
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      gender: formData.gender,
      department: formData.department,
      batch: formData.batch,
      ...formData.userType,
    };

    try {
      setLoading(true);
      console.log('Submitting form', payload);
      const response = await axios.post(
        `${userApiServer}/alumni/register/mobile`,
        payload,
      );
      console.log('Registration successful!', response.data);
      alert('User Registered successfully!');
      resetForm();
      setLoading(false);
      refreshMembers();
      onClose();
    } catch (error) {
      console.error(
        'Registration failed!',
        error.response?.data || error.message,
      );
      alert(error.response?.data?.error || 'Registration failed!');
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>Create A New Member</Text>

          {/* First Name */}
          <Text style={styles.label}>
            First Name <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={value => handleChange('firstName', value)}
          />

          {/* Last Name */}
          <Text style={styles.label}>
            Last Name <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={value => handleChange('lastName', value)}
          />

          {/* Email */}
          <Text style={styles.label}>
            Email Address <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={value => handleChange('email', value)}
          />

          {/* Password */}
          <Text style={styles.label}>
            Password <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={formData.password}
            onChangeText={value => handleChange('password', value)}
          />

          {/* Confirm Password */}
          <Text style={styles.label}>
            Confirm Password <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={value => handleChange('confirmPassword', value)}
          />

          {/* Gender Picker */}
          <Text style={styles.label}>
            Gender <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.pickerText}
              selectedValue={formData.gender}
              onValueChange={value => handleChange('gender', value)}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {/* User Type */}
          <Text style={styles.label}>
            Pick User Type <Text style={styles.asterisk}>*</Text>
          </Text>

          {profile?.profileLevel === 0 && (
            <View style={styles.checkBoxContainer}>
              <CheckBox
                tintColors={{true: IoColor1, false: 'gray'}}
                value={formData.userType.admin}
                onValueChange={() => handleUserTypeChange('admin')}
              />
              <Text style={styles.checkBoxLabel}>Admin</Text>
            </View>
          )}

          {(profile?.profileLevel === 0 || profile?.profileLevel === 1) && (
            <View style={styles.checkBoxContainer}>
              <CheckBox
                tintColors={{true: IoColor1, false: 'gray'}}
                value={formData.userType.alumni}
                onValueChange={() => handleUserTypeChange('alumni')}
              />
              <Text style={styles.checkBoxLabel}>Alumni</Text>
            </View>
          )}

          <View style={styles.checkBoxContainer}>
            <CheckBox
              tintColors={{true: IoColor1, false: 'gray'}}
              value={formData.userType.student}
              onValueChange={() => handleUserTypeChange('student')}
            />
            <Text style={styles.checkBoxLabel}>Student</Text>
          </View>

          <View style={styles.checkBoxContainer}>
            <CheckBox
              tintColors={{true: IoColor1, false: 'gray'}}
              value={formData.userType.specialRole}
              onValueChange={() => handleUserTypeChange('specialRole')}
            />
            <Text style={styles.checkBoxLabel}>Patron</Text>
          </View>

          {/* Department Picker */}
          <Text style={styles.label}>
            Department <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.pickerText}
              selectedValue={formData.department}
              onValueChange={value => handleChange('department', value)}>
              <Picker.Item label="Select Department" value="" />
              <Picker.Item
                label="Agricultural Engineering"
                value="Agricultural Engineering"
              />
              <Picker.Item label="Gastroenterology" value="Gastroenterology" />
              <Picker.Item label="Indian Languages" value="Indian Languages" />
              <Picker.Item label="Neurosurgery" value="Neurosurgery" />
              <Picker.Item label="Vocal Music" value="Vocal Music" />
            </Picker>
          </View>

          {/* Batch Picker */}
          <Text style={styles.label}>
            Batch <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.pickerText}
              selectedValue={formData.batch}
              onValueChange={value => handleChange('batch', value)}>
              <Picker.Item label="Select Batch" value="" />
              {generateYears().map(year => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                resetForm();
                onClose();
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  'Create'
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddMemberModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    width: '100%',
  },
  modalContent: {
    marginHorizontal: '5%',
    backgroundColor: 'white',
    borderRadius: 10,
    width: '85%',
    padding: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: 'black',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  pickerText: {
    color: 'black',
    fontSize: 14,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkBoxLabel: {
    marginLeft: 10,
    color: 'black',
    fontSize: 14,
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
  asterisk: {
    color: 'red', // Highlight the asterisk in red
  },
});
