import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import React, {useState} from 'react';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import {connect, useDispatch} from 'react-redux';
import {clearError, registerUser} from '../store/actions/registrationActions';
import {useFocusEffect} from '@react-navigation/native';
import {IoColor1, IoColor2} from '../colorCode';

const windowWidth = Dimensions.get('window').width;
const contentWidth = windowWidth - 40; // Subtracting twice the marginHorizontal
const windowHeight = Dimensions.get('window').height;

const Register = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [decision, setDecision] = useState('');
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(true);

  const handlePickerPress = () => {
    // Open the picker items
    this.pickerRef.focus();
  };

  const handlePickerPress1 = () => {
    // Open the picker items
    this.pickerRef1.focus();
  };

  const handlePickerPress2 = () => {
    // Open the picker items
    this.pickerRef2.focus();
  };

  // Generate years function adapted for React Native
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i} - ${i + 1}`);
    }
    return years;
  };

  const nameRegex = /^[a-zA-Z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value) {
          return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (!nameRegex.test(value)) {
          return `${
            name === 'firstName' ? 'First' : 'Last'
          } name contains invalid characters`;
        }
        return '';
      case 'email':
        if (!value || !emailRegex.test(value)) {
          return 'Invalid email format';
        }
        return '';
      case 'password':
        if (!value || !passwordRegex.test(value)) {
          return 'Password must include at least 8 characters, one uppercase, one lowercase, one number, and one special character';
        }
        return '';
      case 'confirmPassword':
        if (value !== password) {
          return 'Passwords do not match';
        }
        return '';
      case 'decision':
        if (!value) {
          return 'You must agree to the terms and conditions';
        }
        return '';
      default:
        if (!value.trim()) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }
        return '';
    }
  };

  const handleInputChange = (name, value) => {
    // Set values
    switch (name) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'department':
        setDepartment(value);
        break;
      case 'batch':
        setBatch(value);
        break;
      case 'decision':
        setDecision(value);
        break;
    }

    // Optionally update errors state immediately if needed for UI updates
    const error = validateField(name, value);
    setErrors(prev => ({...prev, [name]: error}));
  };

  const dispatch = useDispatch();

  const handleSubmit = () => {
    // Object to hold local errors
    const newErrors = {};

    // Synchronously validate all fields
    newErrors.firstName = validateField('firstName', firstName);
    newErrors.lastName = validateField('lastName', lastName);
    newErrors.email = validateField('email', email);
    newErrors.password = validateField('password', password);
    newErrors.confirmPassword = validateField(
      'confirmPassword',
      confirmPassword,
    );
    newErrors.gender = validateField('gender', gender);
    // newErrors.department = validateField('department', department);
    // newErrors.batch = validateField('batch', batch);
    newErrors.decision = validateField('decision', decision);

    // Update the errors state once with all new errors
    setErrors(newErrors);

    const formIsValid = Object.values(newErrors).every(error => !error);

    // Check for any error
    if (formIsValid) {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        gender,
        department: department,
        batch: batch,
      };
      console.log('User Data', userData);
      dispatch(registerUser(userData, navigation));
    } else {
      console.log('Please correct the errors in the form.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true); // Ensure modal is visible when screen is focused
      return () => {
        clearError(); // Clear any specific registration errors
        setModalVisible(false); // Make sure to hide the modal when leaving the screen
      };
    }, []),
  );

  return (
    <View style={styles.fullScreen}>
      {/* Replace `require` with the path to your local asset or a uri for a network image */}
      <Image
        source={{
          uri: 'https://alumnify.in/static/media/high-school-graduates-graduation-adult-sky.671581c3af254788f40c.jpg',
        }}
        style={styles.welcomeImage}
      />
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-io.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome to Alumnify</Text>
        {/* <Text style={styles.welcomeSubtitle}>
          Share what's new and life moments with your friends
        </Text> */}
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView showsVerticalScrollIndicator={true}>
              {/* <Text style={styles.title}>BHU Alumni Association</Text>
              <Text style={styles.heading1}>Register</Text> */}
              <Text style={styles.heading2}>Create an account</Text>

              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
              {/* {errors.department && (
                <Text style={styles.errorText}>{errors.department}</Text>
              )}
              {errors.batch && (
                <Text style={styles.errorText}>{errors.batch}</Text>
              )} */}
              {errors.decision && (
                <Text style={styles.errorText}>{errors.decision}</Text>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  First Name <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={text => handleInputChange('firstName', text)}
                  onBlur={() => validateField('firstName', firstName)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Last Name <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={text => handleInputChange('lastName', text)}
                  onBlur={() => validateField('lastName', lastName)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Email <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={text => handleInputChange('email', text)}
                  keyboardType="email-address"
                  onBlur={() => validateField('email', email)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Password <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={text => handleInputChange('password', text)}
                  secureTextEntry={true}
                  onBlur={() => validateField('password', password)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Confirm Password <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={text =>
                    handleInputChange('confirmPassword', text)
                  }
                  secureTextEntry={true}
                  onBlur={() =>
                    validateField('confirmPassword', confirmPassword)
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Gender <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={handlePickerPress}
                  style={styles.pickerField}>
                  <Picker
                    ref={ref => (this.pickerRef = ref)}
                    selectedValue={gender}
                    onValueChange={(itemValue, itemIndex) =>
                      handleInputChange('gender', itemValue)
                    }
                    dropdownIconColor="black"
                    style={styles.inputField}
                    value={gender}>
                    <Picker.Item
                      label="Select Gender"
                      value={null}
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Female"
                      value="Female"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Male"
                      value="Male"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Other"
                      value="Other"
                      style={styles.inlineInput}
                    />
                  </Picker>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Department</Text>
                <TouchableOpacity
                  onPress={handlePickerPress1}
                  style={styles.pickerField}>
                  <Picker
                    ref={ref => (this.pickerRef1 = ref)}
                    selectedValue={department}
                    onValueChange={(itemValue, itemIndex) =>
                      handleInputChange('department', itemValue)
                    }
                    dropdownIconColor="black"
                    style={styles.inputField}
                    value={department}>
                    <Picker.Item
                      label="Select Department"
                      value={null}
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Agricultural Engineering"
                      value="Agricultural Engineering"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Gastroenterology"
                      value="Gastroenterology"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Indian languages"
                      value="Indian languages"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Neurosurgery"
                      value="Neurosurgery"
                      style={styles.inlineInput}
                    />
                    <Picker.Item
                      label="Vocal Music"
                      value="Vocal Music"
                      style={styles.inlineInput}
                    />
                  </Picker>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Batch</Text>
                <TouchableOpacity
                  onPress={handlePickerPress2}
                  style={styles.pickerField}>
                  <Picker
                    ref={ref => (this.pickerRef2 = ref)}
                    selectedValue={batch}
                    onValueChange={(itemValue, itemIndex) =>
                      handleInputChange('batch', itemValue)
                    }
                    dropdownIconColor="black"
                    style={styles.inputField}
                    value={batch}>
                    <Picker.Item
                      label="Select Batch"
                      value={null}
                      style={styles.inlineInput}
                    />
                    {generateYears().map(year => (
                      <Picker.Item key={year} label={year} value={year} />
                    ))}
                  </Picker>
                </TouchableOpacity>
              </View>

              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={decision}
                  onValueChange={newValue =>
                    handleInputChange('decision', newValue)
                  }
                  style={styles.checkbox}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
                />
                <Text style={styles.labelCheckbox}>
                  By creating your account, you agree to our Privacy Policy{' '}
                  <Text style={{color: 'red'}}>*</Text>
                </Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Let's go</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// const mapStateToProps = state => {
//   return {
//     error: state.user.error,
//   };
// };

const mapDispatchToProps = {
  registerUser,
  clearError,
};

export default connect(null, mapDispatchToProps)(Register);

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center', // This ensures that all child views are centered horizontally
    backgroundColor: IoColor1,
  },
  logoContainer: {
    alignItems: 'center', // Ensures the logo is centered
    marginVertical: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center', // Ensures the welcome title and subtitle are centered
    marginTop: -40,
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: 'Lexend-Regular',
    marginBottom: 10,
    color: 'white',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center', // Centers the text horizontally
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
  welcomeImage: {
    position: 'absolute', // Make the image cover the whole background
    top: 0,
    left: 0,
    width: windowWidth, // Full screen width
    height: windowHeight, // Full screen height
    resizeMode: 'cover', // Cover the entire space
    opacity: 0.5, // Optional: Add opacity for better contrast
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // This will center the modalView horizontally
    width: '100%', // Ensures the view takes the full width available
    marginTop: 160,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: windowWidth - 40, // Adjust modal width here
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
    marginBottom: 15,
    color: 'rgb(23, 72, 115)',
  },
  heading1: {
    fontSize: 25,
    fontFamily: 'Lexend-Bold',
    color: 'rgb(23, 72, 115)',
    textAlign: 'center', // Centers the text horizontally
    marginTop: 10,
  },
  heading2: {
    color: 'black',
    textAlign: 'center', // Centers the text horizontally
    marginTop: 20,
    marginBottom: 30,
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    color: 'black',
    fontFamily: 'Lexend-Bold',
  },
  input: {
    width: '100%',
    height: 40,
    marginBottom: 15,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    color: 'black',
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
    fontFamily: 'Lexend-Regular',
  },
  inputField: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  pickerField: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
    borderRadius: 4,
    height: 40,
    justifyContent: 'center',
    width: '100%', // Ensures the picker field is full width
    marginBottom: 15,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  inlineInput: {
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
  },
  button: {
    width: '100%',
    backgroundColor: IoColor2,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center', // Ensures the text within the footer is centered horizontally
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  link: {
    color: 'blue',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centers the checkbox and label horizontally
    width: '100%', // Ensures the container uses full width
  },
  checkbox: {
    marginRight: 8,
  },
  labelCheckbox: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'left', // Centers the error text horizontally
    fontFamily: 'Lexend-Regular',
  },
});
