import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {IoColor1, IoColor2} from '../../../colorCode';
import {useSelector} from 'react-redux';
import CreateDonationModal from '../../components/createDonationModal';
import CreateSponsorhipModal from '../../components/createSponsorhipModal';
import {userApiServer} from '../../../config';

const screenWidth = Dimensions.get('window').width;

const BrowseBusiness = ({
  businesses,
  name,
  updateBusinesses,
  loading,
  totalBusinesses,
  page,
  limit,
  isLoading,
  isRequestsTab,
}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  // New state to store the selected donation ID for editing
  const [selectedDonationId, setSelectedDonationId] = useState(null);

  const profile = useSelector(state => state.auth.user);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'long'});
    const year = date.getFullYear();

    const getOrdinal = n => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  };

  const handleEdit = _id => {
    setSelectedDonationId(_id); // Set the selected donation ID
    setModalVisible(true);
  };

  const handleDelete = async _id => {
    try {
      await axios.delete(`${userApiServer}/${name}/${_id}`);
      Alert.alert('Success', `Successfully deleted ${name} request.`);
      updateBusinesses(true); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting request:', error);
      Alert.alert('Error', 'Unable to delete the request.');
    }
  };

  const handleLoadMore = () => {
    updateBusinesses();
  };

  return (
    <ScrollView style={styles.container}>
      {businesses.length > 0 ? (
        businesses.map(business => (
          <TouchableOpacity
            key={business._id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('BusinessConnectDetails', {business})
            }>
            <Image
              source={{
                uri:
                  business.picturePath || 'https://via.placeholder.com/300x120',
              }}
              style={styles.image}
            />
            <View style={styles.content}>
              <TouchableOpacity style={styles.eventButton}>
                <Text style={styles.eventTitle}>
                  {business.nameOfEvent || ''}
                </Text>
                <Text style={styles.organizer}>
                  {business.name || business.nameOfOrganiser || ''}
                </Text>
              </TouchableOpacity>
              <Text style={styles.date}>{formatDate(business.createdAt)}</Text>
              <Text style={styles.description}>
                {business.eventDescription || 'description'}
              </Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total amount:</Text>
                <Text style={styles.amountValue}>
                  ₹{business.amount || business.sponsorshipAmount || '0'}
                </Text>
              </View>
            </View>

            {isRequestsTab &&
            (profile.profileLevel === 0 || profile._id === business.userId) ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(business._id)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(business._id)}>
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </TouchableOpacity>
        ))
      ) : loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Text style={styles.noBusinesses}>No {name} Found</Text>
      )}

      {isLoading && <ActivityIndicator size="small" color="#000" />}
      {page < totalBusinesses / limit && (
        <TouchableOpacity style={styles.loadMore} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}

      {name === 'donations' && selectedDonationId && (
        <CreateDonationModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          donationId={selectedDonationId}
          business={selectedBusiness}
        />
      )}

      {name === 'sponsorships' && selectedDonationId && (
        <CreateSponsorhipModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          sponsorshipId={selectedDonationId}
          business={selectedBusiness}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    // paddingHorizontal: 8,
  },
  eventButton: {
    backgroundColor: '#fff',
    // padding: 8,
    // borderWidth: 1,
    // borderColor: '#ddd',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: IoColor1,
  },
  organizer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  date: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: IoColor1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'red',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  amountValue: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
    color: 'black',
  },
  loadMore: {
    padding: 16,
    backgroundColor: IoColor2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
  },
  noBusinesses: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default BrowseBusiness;
