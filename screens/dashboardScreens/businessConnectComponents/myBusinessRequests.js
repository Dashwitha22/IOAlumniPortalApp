import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import {userApiServer} from '../../config';
import {IoColor1} from '../../../colorCode';

const MyBusinessRequests = ({
  requests,
  name,
  updateRequests,
  totalRequests,
  page,
  limit,
  isLoading,
}) => {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Dynamically determine edit mode based on the `name` prop
    if (name === 'donations' || name === 'sponsorships') {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [name]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'long'});
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleDelete = async _id => {
    try {
      await axios.delete(`${userApiServer}/${name}/${_id}`);
      Alert.alert('Success', `Successfully deleted ${name} request.`);
      updateRequests(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting request:', error);
      Alert.alert('Error', 'Unable to delete the request.');
    }
  };

  const handleLoadMore = () => {
    updateRequests();
  };

  return (
    <ScrollView style={styles.container}>
      {requests.length > 0 ? (
        requests.map(request => (
          <View key={request._id} style={styles.card}>
            <Image
              source={{
                uri:
                  request.picturePath || 'https://via.placeholder.com/300x120',
              }}
              style={styles.image}
            />
            <Text style={styles.title}>{request.name || 'Request Title'}</Text>
            <Text style={styles.date}>{formatDate(request.createdAt)}</Text>

            {editMode ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    console.log(`Edit ${name} with ID: ${request._id}`)
                  }>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(request._id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount:</Text>
                <Text style={styles.amountValue}>
                  ₹{request.amount || request.sponsorshipAmount || '0'}
                </Text>
              </View>
            )}
          </View>
        ))
      ) : isLoading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Text style={styles.noRequests}>No Requests Found</Text>
      )}

      {page < totalRequests / limit && (
        <TouchableOpacity style={styles.loadMore} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16},
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
  image: {width: '100%', height: 120, borderRadius: 8, marginBottom: 8},
  title: {fontSize: 18, fontWeight: 'bold', color: 'black'},
  date: {fontSize: 14, color: 'gray', marginBottom: 8},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#0a3a4c',
    padding: 10,
    borderRadius: 8,
    width: 100,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    width: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  amountLabel: {fontSize: 14, fontWeight: '600', color: 'gray'},
  amountValue: {fontSize: 14, fontWeight: '600', color: 'black', marginLeft: 5},
  loadMore: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {fontSize: 16, color: 'blue'},
  noRequests: {textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray'},
});

export default MyBusinessRequests;
