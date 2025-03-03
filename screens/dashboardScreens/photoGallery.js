import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import {userApiServer} from '../../config';
import Toast from 'react-native-toast-message';
import {IoColor1} from '../../colorCode';

const PhotoGallery = () => {
  const [departments, setDepartments] = useState([]); // Store departments
  const [imagesByYear, setImagesByYear] = useState({}); // Organize images by year for selected department
  const [displayedImages, setDisplayedImages] = useState([]); // Images to display after department selection
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Track the selected department
  const [selectedYear, setSelectedYear] = useState(null); // Track the selected year
  const profile = useSelector(state => state.auth.user);

  const openImageModal = image => {
    if (!image || !image.id) {
      console.error('Invalid image object:', image);
      return;
    }

    const directImageUrl = `https://drive.google.com/thumbnail?id=${image.id}`;

    console.log('Opening Modal with Image URL:', directImageUrl);

    setSelectedImage({...image, url: directImageUrl});
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const fetchDepartmentsAndImages = async () => {
    setIsLoading(true);
    try {
      // Fetch Google Drive folder data (this contains the department as well)
      const response = await axios.get(
        `${userApiServer}/images/getGoogleDriveFolders`,
      );
      const folderData = response.data.folders;

      const departments = [
        ...new Set(folderData.map(folder => folder.department)),
      ]; // Get unique departments
      setDepartments(departments);

      const imagesByYear = {};
      for (const folder of folderData) {
        const {link, date, department} = folder;
        const year = new Date(date).getFullYear();

        if (department === selectedDepartment || !selectedDepartment) {
          // Filter by department if selected
          const imageResponse = await axios.post(
            `${userApiServer}/images/getImagesFromFolder`,
            {folderLink: link},
          );
          const images = imageResponse.data.images;

          if (!imagesByYear[year]) {
            imagesByYear[year] = [];
          }

          imagesByYear[year].push(...images);
        }
      }

      // Sort years in descending order
      const sortedYears = Object.keys(imagesByYear).sort((a, b) => b - a);

      setImagesByYear(imagesByYear);
      setDisplayedImages(sortedYears);
    } catch (err) {
      console.error('Error fetching images from Google Drive folders:', err);
      setError('Failed to load images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentClick = department => {
    setSelectedDepartment(department); // Set the selected department
    setSelectedYear(null); // Reset the selected year
  };

  const handleUploadSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${userApiServer}/uploadGoogleDrive`, {
        link: googleDriveLink,
        userId: profile._id,
        department: profile.department,
        requestedUserName: `${profile.firstName} ${profile.lastName}`,
      });
      Alert.alert('Request Sent!', 'Your request has been sent to the admin.');
      // Toast.show({
      //   type: 'success',
      //   text1: 'Request Sent!',
      //   text2: 'Your request has been sent to the admin.',
      //   position: 'top',
      //   visibilityTime: 4000,
      //   autoHide: true,
      // });
      setGoogleDriveLink('');
      closeUploadModal();
      fetchDepartmentsAndImages(); // Refresh gallery after upload
    } catch (error) {
      console.error('Error uploading link:', error);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndImages(); // Fetch departments and images on component mount
  }, [selectedDepartment]);

  if (isLoading) {
    return (
      <View style={{alignItems: 'center', marginTop: 20}}>
        <ActivityIndicator size="large" color={IoColor1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{alignItems: 'center', marginTop: 20}}>
        <Text style={{color: 'red', fontSize: 18}}>{error}</Text>
      </View>
    );
  }

  // Render department items
  const renderDepartment = ({item}) => (
    <TouchableOpacity
      style={styles.departmentItem}
      onPress={() => handleDepartmentClick(item)}>
      <Text style={{color: 'white', fontSize: 15, fontWeight: 'bold'}}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render year items
  const renderYear = ({item}) => (
    <TouchableOpacity
      style={styles.yearItem}
      onPress={() => setSelectedYear(item)}>
      <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Render image grid items
  const renderImage = ({item}) => {
    const directImageUrl = item.id
      ? `https://drive.google.com/thumbnail?id=${item.id}`
      : null;

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => openImageModal({...item, url: directImageUrl})}>
        <Image
          source={{uri: directImageUrl}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Photo Gallery</Text>
        <Text style={styles.subHeaderText}>
          Relive memorable moments and explore highlights through our
          community’s captured moments.
        </Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#28a745', marginTop: 10}]}
          onPress={openUploadModal}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="upload" size={16} color="white" />
            <Text style={{color: 'white', marginLeft: 5}}>
              Add Google Drive Link
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#71be95" />
      ) : error ? (
        <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
      ) : selectedDepartment === null ? (
        // Departments List
        <View style={styles.gridContainer}>
          {departments.map(department => (
            <TouchableOpacity
              key={department}
              style={styles.departmentItem}
              onPress={() => handleDepartmentClick(department)}>
              <Text style={{color: 'white', fontSize: 15, fontWeight: 'bold'}}>
                {department}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : selectedYear === null ? (
        // Years List
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedDepartment(null)}>
            <Text style={{color: 'white'}}>Back to Departments</Text>
          </TouchableOpacity>
          <View style={styles.gridContainer}>
            {Object.keys(imagesByYear).map(year => (
              <TouchableOpacity
                key={year}
                style={styles.yearItem}
                onPress={() => setSelectedYear(year)}>
                <Text
                  style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        // Images Grid
        <>
          <View style={{flexDirection: 'row', marginBottom: 10}}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedDepartment(null)}>
              <Text style={{color: 'white'}}>Back to Departments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backButton, {marginLeft: 10}]}
              onPress={() => setSelectedYear(null)}>
              <Text style={{color: 'white'}}>Back to Years</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridContainer}>
            {imagesByYear[selectedYear]?.map(image => {
              if (!image || !image.id) return null;

              const directImageUrl = `https://drive.google.com/thumbnail?id=${image.id}`;

              return (
                <TouchableOpacity
                  key={image.id}
                  style={styles.gridItem}
                  onPress={() =>
                    openImageModal({...image, url: directImageUrl})
                  }>
                  <Image
                    source={{uri: directImageUrl}}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        onRequestClose={closeImageModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={{position: 'absolute', top: 40, right: 20}}
            onPress={closeImageModal}>
            <Icon name="x" size={24} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{uri: selectedImage.url}}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        onRequestClose={closeUploadModal}>
        <View style={[styles.modalContainer, {padding: 20}]}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '90%',
            }}>
            <Text style={{fontSize: 20, marginBottom: 20, color: 'black'}}>
              Upload Photo
            </Text>
            <Text style={{color: 'gray', fontWeight: '600', marginBottom: 5}}>
              Enter Google Drive Link
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Google Drive Link"
              placeholderTextColor="#666"
              value={googleDriveLink}
              onChangeText={setGoogleDriveLink}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: '#6c757d'}]}
                onPress={closeUploadModal}>
                <Text style={{color: 'white'}}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {backgroundColor: IoColor1, marginLeft: 10},
                ]}
                onPress={handleUploadSubmit}>
                <Text style={{color: 'white'}}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScrollView>
  );
};

export default PhotoGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#71be95',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: 'black',
    fontSize: 15,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginRight: 10,
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  departmentItem: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignSelf: 'flex-start',
    flexBasis: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearItem: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignSelf: 'flex-start',
    flexBasis: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'black',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    // marginLeft: 10,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gridImage: {width: '100%', height: '100%', resizeMode: 'cover'},
});
