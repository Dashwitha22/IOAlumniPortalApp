import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import {userApiServer} from '../../../config';
import {updateProfile} from '../../../store/actions/authActions';
import {Picker} from '@react-native-picker/picker';
import {FlatList} from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';

const ProfileSettings = ({navigation}) => {
  const profile = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isCurrentStudent, setIsCurrentStudent] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  const [internshipFormData, setInternshipFormData] = useState({
    firstName: '',
    lastName: '',
    aboutMe: '',
    workingAt: '',
    companyWebsite: '',
    location: '',
    city: '',
    country: '',
    student: false,
    linkedIn: '',
    graduatingYear: '',
    class: '',
    jobRole: '',
  });

  useEffect(() => {
    setInternshipFormData(prevData => ({
      ...prevData,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      aboutMe: profile.aboutMe || '',
      workingAt: profile.workingAt || '',
      companyWebsite: profile.companyWebsite || '',
      location: profile.location || '',
      city: profile.city || '',
      country: profile.country || '',
      graduatingYear: profile.graduatingYear || '',
      class: profile.class || '',
      jobRole: profile.jobRole || '',
      linkedIn: profile.linkedIn || '',
      profilePicture: profile.profilePicture || '',
      coverPicture: profile.coverPicture || '',
      ID: profile.ID || '',
    }));
    // console.log('Internship Form Data:', internshipFormData); // Debugging
  }, [profile._id]);

  const handleProfileImageChange = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
      });

      // ✅ Show local image immediately
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        profilePicture: image.path, // Temporary local image
      }));

      // Prepare FormData
      const formData = new FormData();
      formData.append('image', {
        uri: image.path.startsWith('file://')
          ? image.path
          : `file://${image.path}`,
        type: image.mime,
        name: image.path.split('/').pop(),
      });

      // Upload Image
      const response = await axios.post(
        `${userApiServer}/uploadImage/singleImage`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      // ✅ Update state with server image URL
      if (response.data) {
        console.log('Server Image URL:', response.data); // Debugging
        setInternshipFormData(prevFormData => ({
          ...prevFormData,
          profilePicture: response.data, // Server Image URL
        }));
      } else {
        throw new Error('Failed to upload image');
      }

      Toast.show({type: 'success', text1: 'Profile picture updated!'});
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({type: 'error', text1: 'Image upload failed'});
    }
  };

  console.log(
    '🌍 Final Profile Picture in State:',
    internshipFormData.profilePicture,
  );

  const handleCoverImageChange = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1200,
        height: 400,
        cropping: true,
      });

      console.log('🖼 Selected Cover Image:', image.path);

      // **1️⃣ Remove extra file:// prefix**
      const imageUri = image.path.startsWith('file://')
        ? image.path
        : `file://${image.path}`;

      // **2️⃣ Show local image immediately**
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        coverPicture: imageUri, // ✅ No duplicate file://
      }));

      // **3️⃣ Prepare FormData**
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri, // ✅ Ensuring correct format
        type: image.mime,
        name: image.path.split('/').pop(),
      });

      console.log('📤 Uploading Cover Image:', formData);

      // **4️⃣ Upload using axios**
      const response = await axios.post(
        `${userApiServer}/uploadImage/singleImage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('🌍 Server Cover Image URL:', response.data);

      // **5️⃣ Replace local image with server image URL**
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        coverPicture: response.data, // ✅ This is the correct URL for MongoDB
      }));

      Toast.show({
        type: 'success',
        text1: 'Cover picture updated successfully!',
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      Toast.show({
        type: 'error',
        text1: 'Cover image upload failed!',
      });
    }
  };

  const handleUploadID = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
      });

      console.log('🆔 Selected ID Image:', image);

      // **1️⃣ Display selected local image instantly**
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        ID: `file://${image.path}`, // ✅ Shows local image instantly
      }));

      // **2️⃣ Prepare FormData for upload**
      const formData = new FormData();
      formData.append('image', {
        uri: image.path.startsWith('file://')
          ? image.path
          : `file://${image.path}`,
        type: image.mime,
        name: image.path.split('/').pop(),
      });

      console.log('📤 Uploading ID Image:', formData);

      // **3️⃣ Upload using axios (Same as ReactJS)**
      const response = await axios.post(
        `${userApiServer}/uploadImage/singleImage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('🌍 Server Image URL for ID:', response.data);

      // **4️⃣ Replace local image with server image URL**
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        ID: response.data, // ✅ This is now the HTTP URL
      }));

      Toast.show({
        type: 'success',
        text1: 'ID uploaded successfully!',
      });
    } catch (error) {
      console.error('❌ Error uploading ID:', error);
      Toast.show({
        type: 'error',
        text1: 'ID upload failed!',
      });
    }
  };

  const handleInputChange = (name, value) => {
    setInternshipFormData({...internshipFormData, [name]: value});
  };

  const handleCurrentStudentChange = newValue => {
    setIsCurrentStudent(newValue);
    if (!isCurrentStudent) {
      setInternshipFormData({
        ...internshipFormData,
        workingAt: '',
        student: true,
        graduatingYear: '',
        jobRole: '',
      });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    console.log('formData', internshipFormData);
    if (!internshipFormData.firstName) newErrors.firstName = true;
    if (!internshipFormData.lastName) newErrors.lastName = true;
    if (!internshipFormData.city) newErrors.city = true;
    if (!internshipFormData.country) newErrors.country = true;
    if (!isCurrentStudent && !internshipFormData.workingAt)
      newErrors.workingAt = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Toast.show({
        type: 'custom_error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
        position: 'bottom', // Position toast to the bottom
        visibilityTime: 4000, // How long the toast will be visible
        topOffset: 300, // Offset from the top to display in middle
      });
      return;
    }

    // Proceed with form submission if validation passes
    setErrors({});

    setLoading(true);
    const userID = profile._id;
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${userApiServer}/alumni/${userID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(internshipFormData),
      });

      if (response) {
        const responseData = await response.json();
        dispatch(updateProfile(responseData));
        Toast.show({
          type: 'success',
          text1: 'Profile updated successfully!',
        });
        setLoading(false);
        navigation.navigate('ProfilePage');
      } else {
        console.error('Failed to update user');
        Toast.show({
          type: 'error',
          text1: 'Failed to update profile.',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred.',
      });
      setLoading(false);
    }
  };

  // Custom Toast Config
  const toastConfig = {
    custom_error: ({text1, text2}) => (
      <View style={styles.toastError}>
        <Text style={styles.toastErrorText}>{text1}</Text>
        {text2 ? <Text style={styles.toastErrorText}>{text2}</Text> : null}
      </View>
    ),
  };

  const handleSearch = async value => {
    setShowDropdown(true);
    setInternshipFormData(prevFormData => ({
      ...prevFormData,
      workingAt: value, // Update the workingAt field in formData
    }));

    if (value.length >= 3) {
      try {
        const response = await fetch(
          `${userApiServer}/search/search/company?q=${value}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.companies);
        } else {
          console.error('Failed to fetch search results');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectCompany = company => {
    setInternshipFormData(prevFormData => ({
      ...prevFormData,
      workingAt: company,
    }));
    setShowDropdown(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <FontAwesome name="user" size={30} color="#174873" />
        <Text style={styles.title}>Profile Settings</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          First Name<Text style={styles.mandatory}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          placeholderTextColor="gray"
          value={internshipFormData.firstName}
          onChangeText={value => handleInputChange('firstName', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Last Name<Text style={styles.mandatory}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          placeholderTextColor="gray"
          value={internshipFormData.lastName}
          onChangeText={value => handleInputChange('lastName', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>About Me</Text>
        <TextInput
          style={[styles.input, {height: 100}]}
          multiline
          placeholder="Tell us about yourself"
          placeholderTextColor="gray"
          value={internshipFormData.aboutMe}
          onChangeText={value => handleInputChange('aboutMe', value)}
        />
      </View>

      <View
        style={[
          styles.formGroup,
          {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          },
        ]}>
        <CheckBox
          value={isCurrentStudent}
          onValueChange={handleCurrentStudentChange}
          style={{alignSelf: 'flex-start'}}
          tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
          boxType={'square'}
          borderColor="blue"
        />
        <Text style={styles.label}>Current Student</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>LinkedIn profile link</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter linkedIn profile link"
          placeholderTextColor="gray"
          value={internshipFormData.linkedIn}
          onChangeText={value => handleInputChange('linkedIn', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Working At<Text style={styles.mandatory}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            isCurrentStudent && {backgroundColor: 'lightgray'},
          ]}
          placeholder="Enter working at"
          placeholderTextColor="gray"
          value={internshipFormData.workingAt}
          onChangeText={value => handleSearch(value)} // Call handleSearch here
          editable={!isCurrentStudent}
        />

        {showDropdown && (
          <View style={styles.dropDownContainer}>
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectCompany(item.name)}>
                  <Text style={styles.dropdownItem}>{item.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={() =>
                  handleSelectCompany(internshipFormData.workingAt)
                }>
                <View style={styles.addContainer}>
                  <FontAwesome name="plus" size={20} color="black" />
                  <Text style={{color: 'black', marginLeft: 10}}>
                    Add {internshipFormData.workingAt}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Website</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company website"
          placeholderTextColor="gray"
          value={internshipFormData.companyWebsite}
          onChangeText={value => handleInputChange('companyWebsite', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Class</Text>
        <View
          style={[
            styles.pickerWrapper,
            !isCurrentStudent && {backgroundColor: 'lightgray'},
          ]}>
          <Picker
            selectedValue={internshipFormData.class}
            placeholder="Enter your current class"
            placeholderTextColor="gray"
            style={styles.input}
            onValueChange={itemValue => handleInputChange('class', itemValue)}
            dropdownIconColor="black"
            enabled={isCurrentStudent} // Enable only when the user is a current student
          >
            <Picker.Item
              label="Enter your current class"
              value="Enter your current class"
            />
            <Picker.Item label="1" value="1" />
            <Picker.Item label="2" value="2" />
            <Picker.Item label="3" value="3" />
            <Picker.Item label="4" value="4" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="6" value="6" />
            <Picker.Item label="7" value="7" />
            <Picker.Item label="8" value="8" />
            <Picker.Item label="9" value="9" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="11" value="11" />
            <Picker.Item label="12" value="12" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Graduating Year</Text>
        <TextInput
          style={[
            styles.input,
            isCurrentStudent && {backgroundColor: 'lightgray'},
          ]}
          placeholder="Enter your graduating year"
          placeholderTextColor="gray"
          value={internshipFormData.graduatingYear.toString()}
          onChangeText={value => handleInputChange('graduatingYear', value)}
          editable={!isCurrentStudent}
        />
      </View>

      {/* <View style={styles.formGroup}>
        <Text style={styles.label}>Job Role</Text>
        <TextInput
          style={[
            styles.input,
            isCurrentStudent && {backgroundColor: 'lightgray'},
          ]}
          placeholder="Enter your job role"
          placeholderTextColor="gray"
          value={internshipFormData.jobRole}
          onChangeText={value => handleInputChange('jobRole', value)}
          editable={!isCurrentStudent}
        />
      </View> */}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          City<Text style={styles.mandatory}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          placeholderTextColor="gray"
          value={internshipFormData.city}
          onChangeText={value => handleInputChange('city', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Country<Text style={styles.mandatory}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter country"
          placeholderTextColor="gray"
          value={internshipFormData.country}
          onChangeText={value => handleInputChange('country', value)}
        />
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleProfileImageChange}>
          <Text style={styles.buttonText}>Change Profile Picture</Text>
        </TouchableOpacity>

        {internshipFormData.profilePicture && (
          <Image
            source={{uri: internshipFormData.profilePicture}}
            style={styles.image}
            onError={e => console.log('Image load error:', e.nativeEvent.error)}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCoverImageChange}>
          <Text style={styles.buttonText}>Change Cover Picture</Text>
        </TouchableOpacity>

        {internshipFormData.coverPicture && (
          <Image
            source={{uri: internshipFormData.coverPicture}}
            style={styles.coverImage}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity style={styles.button} onPress={handleUploadID}>
          <Text style={styles.buttonText}>
            Upload ID (College ID, Aadhaar Card, PAN Card, Passport)
          </Text>
        </TouchableOpacity>

        {internshipFormData.ID && (
          <Image
            source={{uri: internshipFormData.ID}}
            style={styles.coverImage}
          />
          // <Text style={styles.documentText}>
          //   Selected File: {internshipFormData.ID}
          // </Text>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {loading ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ProfilePage')}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Notification */}
      <Toast config={toastConfig} />
    </ScrollView>
  );
};

export default ProfileSettings;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    fontFamily: 'Lexend-Regular',
  },
  title: {
    fontSize: 24,
    marginLeft: 10,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginBottom: 5,
  },
  mandatory: {
    color: 'red',
  },
  input: {
    fontFamily: 'Lexend-Regular',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: 'black',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
    marginBottom: 30,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  coverImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingTop: 5,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: 'black',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: 'rgb(23, 72, 115)', // Button background color
    paddingVertical: 10, // Padding for height
    paddingHorizontal: 20, // Padding for width
    borderRadius: 5, // Make corners rounded
    alignItems: 'center', // Center text
    marginBottom: 10, // Add margin at bottom
  },
  buttonText: {
    color: 'white', // Button text color
    fontSize: 16, // Font size
    textTransform: 'none', // Disable text transformation (no uppercase)
    fontFamily: 'Lexend-Regular',
  },
  toastError: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastErrorText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  documentText: {
    marginTop: 10,
    color: 'black',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
});
