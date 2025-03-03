import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {IoColor1, IoColor2} from '../../colorCode';
import {userApiServer} from '../../config';
import {Picker} from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import {readFile} from 'react-native-fs';
import {useSelector} from 'react-redux';

const CreateDonationModal = ({
  modalVisible,
  setModalVisible,
  donationId,
  business,
}) => {
  console.log('DonationId :', donationId);
  const user = useSelector(state => state.auth.user);
  const username = user ? user.firstName : ''; // Add null check here
  const userId = user ? user._id : null; // Add null check here
  const profile = user ? user : {}; // Add null check here

  const [fullName, setFullName] = useState(
    `${profile.firstName} ${profile.lastName}`,
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [teamExperience, setTeamExperience] = useState('');
  const [marketingStrategy, setMarketingStrategy] = useState('');
  const [businessPlan, setBusinessPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [businessPlanName, setBusinessPlanName] = useState('');

  // Function to reset all fields
  const resetFields = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setAmount('');
    setBusinessName('');
    setIndustry('');
    setBusinessDescription('');
    setTargetMarket('');
    setCompetitiveAdvantage('');
    setCurrentRevenue('');
    setFundingGoal('');
    setTeamExperience('');
    setMarketingStrategy('');
    setBusinessPlan(null);
  };

  const handleBusinessPlanUpload = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (res[0].size > 10 * 1024 * 1024) {
        // Limit to 10MB
        Alert.alert(
          'File too large',
          'Please select a file smaller than 10MB.',
        );
        return;
      }

      setBusinessPlan({
        uri: res[0].uri,
        type: res[0].type,
        name: res[0].name,
      });
      console.log('Selected Business Plan File:', businessPlan);
      setBusinessPlanName(res[0].name); // Save the file name to display
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Document selection was canceled');
      } else {
        console.error('Error selecting document:', err);
      }
    }
  };

  useEffect(() => {
    if (donationId) {
      fetchDonationDetails(donationId);
      setIsEditing(true);
    }
  }, [donationId]);

  const fetchDonationDetails = async id => {
    try {
      console.log('Donations fetching', id);
      const response = await axios.get(`${userApiServer}/donations/${id}`);
      const data = response.data;
      console.log('Donations fetching :', data);
      setFullName(data.name);
      setEmail(data.email);
      setPhone(data.phone ? data.phone.toString() : '');
      setAmount(data.amount ? data.amount.toString() : ''); // ✅ Ensure string
      setBusinessName(data.businessName);
      setIndustry(data.industry);
      setBusinessDescription(data.businessDescription);
      setTargetMarket(data.targetMarket);
      setCompetitiveAdvantage(data.competitiveAdvantage);
      setCurrentRevenue(
        data.currentRevenue ? data.currentRevenue.toString() : '',
      );
      setFundingGoal(data.fundingGoal ? data.fundingGoal.toString() : '');
      setTeamExperience(data.teamExperience);
      setMarketingStrategy(data.marketingStrategy);

      // Fetch the existing business plan name if available
      if (data.businessPlan) {
        setBusinessPlanName(data.businessPlan);
      }
    } catch (error) {
      console.error('Error fetching donation details:', error);
    }
  };

  const handleSubmit = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !amount ||
      !businessName ||
      !industry ||
      !businessDescription
    ) {
      Alert.alert('Validation Error', 'All fields marked with * are required.');
      return;
    }

    const formData = new FormData();

    formData.append('userId', profile._id);
    formData.append('name', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('amount', amount);
    formData.append('businessName', businessName);
    formData.append('industry', industry);
    formData.append('businessDescription', businessDescription);
    formData.append('targetMarket', targetMarket);
    formData.append('competitiveAdvantage', competitiveAdvantage);
    formData.append('currentRevenue', currentRevenue);
    formData.append('fundingGoal', fundingGoal);
    formData.append('teamExperience', teamExperience);
    formData.append('marketingStrategy', marketingStrategy);

    if (businessPlan) {
      formData.append('businessPlan', {
        uri: businessPlan.uri,
        type: businessPlan.type || 'application/pdf', // Ensure correct MIME type
        name: businessPlan.name,
      });
    }

    try {
      setLoading(true);
      let response;
      if (isEditing) {
        response = await axios.put(
          `${userApiServer}/donations/${donationId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        console.log('Update Response:', response.data); //  Log API response

        if (response.status === 200) {
          Alert.alert('Success', 'Donation updated successfully.');
          //  Fetch updated data again to confirm the update
          fetchDonationDetails(donationId);
        } else {
          Alert.alert('Error', 'Unexpected response from server.');
        }
      } else {
        response = await axios.post(
          `${userApiServer}/donations/create`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        console.log('CREATE DONATION RESPONSE : ', response.data);
        Alert.alert('Success', 'Donation created successfully.');
      }

      setModalVisible(false);
      if (!isEditing) resetFields();
    } catch (error) {
      console.error('Error creating donation:', error);

      if (error.response) {
        console.error('Error Response:', error.response.data);
        Alert.alert(
          'Error',
          error.response.data.message || 'Failed to create donation.',
        );
      } else if (error.request) {
        console.error('Error Request:', error.request);
        Alert.alert(
          'Error',
          'Network error. Please check your connection or try again.',
        );
      } else {
        console.error('Error Message:', error.message);
        Alert.alert('Error', error.message || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <ScrollView contentContainerStyle={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Donation' : 'Create A New Donation'}
          </Text>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Investment Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Investment Amount (₹):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Business Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Business Name"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Industry */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Industry:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={industry}
                onValueChange={itemValue => setIndustry(itemValue)}
                dropdownIconColor="black"
                style={styles.picker}>
                <Picker.Item label="Select Industry" value="" />
                <Picker.Item label="Technology" value="Technology" />
                <Picker.Item label="Finance" value="Finance" />
                <Picker.Item label="Healthcare" value="Healthcare" />
                <Picker.Item label="Manufacturing" value="Manufacturing" />
                <Picker.Item label="Retail" value="Retail" />
              </Picker>
            </View>
          </View>

          {/* Business Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Description:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Business Description"
              value={businessDescription}
              onChangeText={setBusinessDescription}
              multiline
            />
          </View>

          {/* Business Plan */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Plan (PDF):</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleBusinessPlanUpload}>
              <Text style={styles.uploadButtonText}>
                {businessPlan ? 'Change Business Plan' : 'Upload Business Plan'}
              </Text>
            </TouchableOpacity>
            {businessPlanName ? (
              <Text style={styles.fileName}>{businessPlanName}</Text>
            ) : null}
          </View>

          {/* Target Market */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Market:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Target Market"
              value={targetMarket}
              onChangeText={setTargetMarket}
            />
          </View>

          {/* Competitive Advantage */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Competitive Advantage:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Competitive Advantage"
              value={competitiveAdvantage}
              onChangeText={setCompetitiveAdvantage}
              multiline
            />
          </View>

          {/* Current Revenue */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Revenue (₹):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Current Revenue"
              value={currentRevenue}
              onChangeText={setCurrentRevenue}
              keyboardType="numeric"
            />
          </View>

          {/* Funding Goal */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Funding Goal (₹):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Funding Goal"
              value={fundingGoal}
              onChangeText={setFundingGoal}
              keyboardType="numeric"
            />
          </View>

          {/* Team Experience */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Team Experience:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Team Experience"
              value={teamExperience}
              onChangeText={setTeamExperience}
              multiline
            />
          </View>

          {/* Marketing Strategy */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Marketing Strategy:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Marketing Strategy"
              value={marketingStrategy}
              onChangeText={setMarketingStrategy}
              multiline
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                if (!isEditing) resetFields(); // Reset fields on cancel
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : isEditing ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default CreateDonationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
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
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: 'black',
    height: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: 'black',
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
  fileName: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
});
