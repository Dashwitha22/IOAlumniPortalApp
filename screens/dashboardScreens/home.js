import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import UploadImageIcon from 'react-native-vector-icons/FontAwesome5';
import ChartIcon from 'react-native-vector-icons/FontAwesome';
import UploadVideoIcon from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video';
import {Alert} from 'react-native';
import {
  uploadData,
  uploadImage,
  createPost,
  deletePost,
  fetchPosts,
  uploadVideo,
} from '../../store/actions/postActions';
import {encode} from 'base64-arraybuffer';
import Post from './post';
import CreateJobModal from '../components/createJobModal';
import CreateGroupModal from '../components/createGroupModal';
import JobIntDisplay from './jobIntDisplay';
import axios from 'axios';
import {userApiServer} from '../../config';
import {deleteJob} from '../../store/actions/jobActions';
import {useNavigation} from '@react-navigation/native';
import PollDisplay from './pollComponents/pollDisplay';
import EventDisplay from './eventComponents/eventDisplay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PollModal from '../components/pollModal';
import {IoColor1} from '../../colorCode';
import CreateDonationModal from '../components/createDonationModal';
import CreateSponsorhipModal from '../components/createSponsorhipModal';
import DisplayNews from './newsComponents/displayNews';

const Home = ({
  profileUserId = null,
  isProfile,
  index,
  showDeleteButton,
  showCreatePost,
  entityId,
  entityType,
  groupID,
  showFloatingMenu = true,
}) => {
  const navigate = useNavigation();
  const [status, setStatus] = useState('');
  const [isInputFocused, setInputFocused] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log('groupID at initial place: ', groupID);

  const [modalVisible, setModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState({
    visible: false,
    edit: false,
    groupData: null,
  }); // State for CreateGroupModal
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [sponsorshipModalVisible, setSponsorshipModalVisible] = useState(false); // State for sponsorship modal

  const [uploadSuccessful, setUploadSuccessful] = useState(null); // Now stores the type of successful upload

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0)); // Animation for menu
  const [showPollModal, setShowPollModal] = useState(false);

  const [inputHeight, setInputHeight] = useState(40);

  const user = useSelector(state => state.auth.user);
  const username = user ? user.firstName : ''; // Add null check here
  const userId = user ? user._id : null; // Add null check here
  const profile = useMemo(() => (user ? user : {}), [user]);

  const isNewsComponent = entityType === 'news';
  const canShowCreatePost = isNewsComponent
    ? profile.profileLevel === 0 || profile.profileLevel === 1
    : true;

  // Menu options for the floating button
  const menuOptions = [
    {
      id: 1,
      title: 'Create Group',
      icon: 'group',
      onPress: () =>
        setGroupModalVisible({visible: true, edit: false, groupData: null}),
    },
    {
      id: 2,
      title: 'Create Job',
      icon: 'work',
      onPress: () => console.log('Create Job'),
    },
    {
      id: 3,
      title: 'Create Donations',
      icon: 'volunteer-activism',
      onPress: () => setDonationModalVisible(true),
    },
    {
      id: 4,
      title: 'Create Sponsorships',
      icon: 'favorite',
      onPress: () => setSponsorshipModalVisible(true),
    },
  ];

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Handler to close the keyboard and reset the input focus state
  const closeKeyboard = () => {
    Keyboard.dismiss();
    setInputFocused(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchMorePosts(true).finally(() => setRefreshing(false));
  };

  const handleImageUpload = () => {
    if (images.length >= 5) {
      Alert.alert('Limit Exceeded', 'You can only upload up to 5 images.');
      return;
    }

    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      maxFiles: 5 - images.length, // Enforce a dynamic limit based on already selected images
      width: 350,
      height: 300,
      cropping: true,
    })
      .then(response => {
        // Check if more images were picked than allowed (as a fallback safety measure)
        if (response.length > 5 - images.length) {
          Alert.alert(
            'Limit Exceeded',
            `You can only add ${5 - images.length} more image(s).`,
          );
          return; // Stop processing if too many images are selected
        }

        // Proceed to add images if within the limit
        const newImages = response.map(img => ({path: img.path}));
        setImages([...images, ...newImages]);
        if (newImages.length > 0) {
          setUploadSuccessful('image'); // Set to 'image' only if new images are added
        } else if (images.length === 0) {
          // No new images and no existing images
          setUploadSuccessful(null);
        }
      })
      .catch(err => {
        console.log('Image picker error:', err);
      });
  };

  const handleRemoveImage = indexToRemove => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    // If there are no images left, reset the uploadSuccessful state
    if (newImages.length === 0 && uploadSuccessful === 'image') {
      setUploadSuccessful(null);
    }
  };

  const handleRemoveVideo = () => {
    setVideo(null); // Clear the current video
    // If the last successful upload was a video, reset the uploadSuccessful state
    if (uploadSuccessful === 'video') {
      setUploadSuccessful(null);
    }
  };

  const handleVideoUpload = () => {
    if (video) {
      Alert.alert('Limit Exceeded', 'You can only upload one video.');
      return;
    }

    ImagePicker.openPicker({
      mediaType: 'video', // Set to 'video' for picking videos
      compressVideoPreset: 'MediumQuality', // Optional: you can adjust video compression
    })
      .then(response => {
        console.log('Video picked:', response); // Handle the response as needed
        setVideo(response); // Assuming you want to use the same state to hold the video, else create a new one
        setUploadSuccessful('video');
      })
      .catch(err => {
        console.log('Video picker error:', err);
      });
  };

  const handleCreatePoll = async (question, options) => {
    const pollData = {
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      question,
      options: options.map(option => ({option, votes: []})),
    };

    try {
      const response = await axios.post(
        `${userApiServer}/poll/createPoll`,
        pollData,
      );
      Alert.alert('Poll Created', 'Your poll was successfully created.');
      setStatus('');
      setShowPollModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create poll. Please try again later.');
    }
  };

  // Handler to handle the share button click
  const handleShare = async () => {
    console.log('Sharing post...');

    if (!user || !user._id) {
      console.error('User data is missing:', user);
      Alert.alert('Error', 'User data is missing. Please log in again.');
      return;
    }

    let postData = {
      userId: user._id,
      description: status,
      department: user.department || '',
      profilePicture: user.profilePicture || '',
      // groupID: groupID || null,
    };

    // **Only include groupID if it's not undefined**
    if (typeof groupID !== 'undefined') {
      postData.groupID = groupID;
    }

    console.log('Initial Post Data:', postData);

    // ✅ Handle Image Upload
    if (images.length > 0) {
      console.log('Processing images for upload...');

      const base64Images = await Promise.all(
        images.map(async img => {
          const response = await fetch(img.path);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1]; // Convert to Base64
              resolve(`data:image/jpeg;base64,${base64data}`);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }),
      );

      postData.picturePath =
        base64Images.length === 1 ? base64Images[0] : base64Images; // Ensure it's a string // ✅ Store images as Base64 array

      console.log('Final Image Data:', postData);

      await uploadImage(postData, entityType);
    }
    // ✅ Handle Video Upload
    else if (video) {
      console.log('Processing video for upload...');

      postData.videoPath = {
        uri: video.path,
        type: 'video/mp4',
        name: `video-${Date.now()}.mp4`,
      };

      const currentDate = new Date();
      const folderName = currentDate.toISOString().split('T')[0];

      console.log('Final Video Data:', postData);

      await uploadData(postData, folderName, entityType);
    }
    // ✅ Handle Text-Only Posts
    else if (entityType === 'news') {
      try {
        const response = await axios.post(
          `${userApiServer}/${entityType}/create`,
          postData,
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        Alert.alert('Success', 'News Created Successfully');
      } catch (error) {
        console.error(
          'Error creating news post:',
          error.response ? error.response.data : error.message,
        );
      }
    } else {
      console.log('Creating a text-only post...');

      try {
        const response = await axios.post(
          `${userApiServer}/posts/create`,
          postData,
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        Alert.alert('Success : ', 'Post Created Successfully');
        console.log('Text post created successfully:', response.data);
      } catch (error) {
        console.error(
          'Error creating text post:',
          error.response ? error.response.data : error.message,
        );
      }
    }

    // ✅ Reset after successful post
    setStatus('');
    setImages([]);
    setVideo(null);
    setUploadSuccessful(null);
  };

  const fetchMorePosts = async (refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);
    const nextPage = refresh ? 1 : page;

    // Fetch the posts
    const data = await fetchPosts(
      nextPage,
      5,
      profileUserId,
      groupID,
      entityType,
    ); // Assuming limit is 5

    // console.log('🔍 Fetched Posts Data:', data.records); // Check what data is received from API

    if (!data.error) {
      const newPosts = data.records;

      // If the number of posts returned is less than the limit, it means no more posts are available
      if (newPosts.length < 5) {
        setHasMore(false); // This will prevent the Load More button from appearing
      }

      setPosts(prev => (refresh ? newPosts : [...prev, ...newPosts]));
      setPage(nextPage + 1);
    } else {
      Alert.alert('Error', 'Failed to fetch posts');
    }

    setLoading(false);
  };

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const threshold = 16;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold
    );
  };

  // useEffect(() => {
  //   if (isProfile) {
  //     if (index == 1) {
  //       fetchMorePosts();
  //     } else {
  //       console.log('something');
  //     }
  //   } else {
  //     fetchMorePosts();
  //   }
  // }, []);

  useEffect(() => {
    if (isProfile) {
      if (index == 1) {
        fetchMorePosts();
      }
    } else {
      fetchMorePosts();
    }
  }, [index, entityType]);

  const handleDeletePost = async postId => {
    setPosts(posts.filter(post => post._id !== postId));
    try {
      await deletePost(postId); // Call the delete post action
      Alert.alert('Success', 'Post Deleted Successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteJob = async jobId => {
    setPosts(posts.filter(post => post._id !== jobId));
    try {
      await deleteJob(jobId); // Call the delete post action
      Alert.alert('Success', 'Job Deleted Successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  // Helper function to format the timestamp
  const formatTimestamp = timestamp => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid date provided:', timestamp);
        return 'Invalid date';
      } else {
        // Construct the date string in "MM/DD/YYYY h:mm A" format
        const options = {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        };
        return date.toLocaleString('en-US', options);
      }
    } catch (error) {
      console.error('Error formatting the date:', error);
      return 'Date format error';
    }
  };

  const reloadPost = () => {
    navigate.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const handleLikes = async entityId => {
    try {
      const response = await axios.get(`${userApiServer}/posts/${entityId}`);
      const updatedPost = response.data;

      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post._id === entityId) {
            return updatedPost;
          }
          return post;
        });
      });
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']} // Optional: customize the colors of the spinner (Android)
            tintColor="#689F38" // Optional: customize the color of the spinner (iOS)
          />
        }
        onScroll={
          !isProfile
            ? ({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent)) {
                  fetchMorePosts();
                }
              }
            : undefined // If `isProfile` is true, don't use scroll event
        }
        showsVerticalScrollIndicator={true}>
        <CreateJobModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <CreateGroupModal
          modalVisible={groupModalVisible.visible}
          setModalVisible={visible =>
            setGroupModalVisible(prevState => ({...prevState, visible}))
          }
          edit={groupModalVisible.edit}
          groupData={groupModalVisible.groupData}
        />
        <CreateDonationModal
          modalVisible={donationModalVisible}
          setModalVisible={setDonationModalVisible}
        />
        <CreateSponsorhipModal
          modalVisible={sponsorshipModalVisible}
          setModalVisible={setSponsorshipModalVisible}
        />
        {canShowCreatePost && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.createPostContainer}
            onPress={closeKeyboard}>
            <View style={styles.headerContainer}>
              <Image
                style={styles.avatar}
                source={
                  user.profilePicture
                    ? {uri: user.profilePicture} // If a profile picture exists, use it
                    : require('../../assets/images/girlAvatar.png') // Otherwise, use a default avatar
                }
              />
              <Text style={styles.username}>{username}</Text>
            </View>
            <TextInput
              style={[styles.statusInput, {height: inputHeight}]}
              onChangeText={setStatus}
              value={status}
              placeholder="Whats Going on??"
              placeholderTextColor="gray"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              multiline={true} // Enable multi-line support
              numberOfLines={3} // Set default height for better UX
              textAlignVertical="top" // Align text to the top
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height + 10);
              }}
            />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  uploadSuccessful &&
                    uploadSuccessful !== 'image' &&
                    styles.disabledButton,
                ]}
                onPress={handleImageUpload}
                disabled={uploadSuccessful && uploadSuccessful !== 'image'}>
                <UploadImageIcon
                  name="images"
                  size={15}
                  color={'orange'}
                  solid
                />
                <Text style={styles.buttonText}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  uploadSuccessful &&
                    uploadSuccessful !== 'job' &&
                    styles.disabledButton,
                ]}
                onPress={() => setShowPollModal(true)}
                disabled={uploadSuccessful && uploadSuccessful !== 'job'}>
                <ChartIcon name="bar-chart" size={15} color={'black'} />
                <Text style={styles.buttonText}>Poll</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  uploadSuccessful &&
                    uploadSuccessful !== 'video' &&
                    styles.disabledButton,
                ]}
                onPress={handleVideoUpload}
                disabled={uploadSuccessful && uploadSuccessful !== 'video'}>
                <UploadVideoIcon name="video" size={15} color={'green'} />
                <Text style={styles.buttonText}>Video</Text>
              </TouchableOpacity>
            </View>
            {images.length > 0 && (
              <View style={styles.imageContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((img, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image
                        source={{uri: img.path}}
                        style={[
                          styles.image,
                          {width: 80, height: 80, marginRight: 10},
                        ]}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}>
                        <Text style={styles.removeImageText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {video && (
              <View style={styles.videoContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {video && (
                    <View style={styles.videoPreviewContainer}>
                      <Video
                        source={{uri: video.path}} // Can be: { uri: "http://example.com/video.mp4"}
                        style={styles.video}
                        controls={true}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveVideo()}>
                        <Text style={styles.removeImageText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {isInputFocused && (
              <View style={styles.shareButtonContainer}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}>
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Add this part to render posts */}

        {posts.map((post, index) => {
          // console.log('🛠 Processing Post:', post);
          // console.log(
          //   '⚡ Post Type:',
          //   post.type,
          //   ' | Post GroupID:',
          //   post.groupID,
          //   ' | Current groupID:',
          //   groupID,
          // );
          // console.log('groupID : ', groupID);
          // console.log('post groupID : ', post.groupID);
          if (post.type === 'Post' && post.groupID === groupID) {
            return (
              <View key={post._id + index} style={styles.postBox}>
                <Post
                  userId={post.userId}
                  post={post}
                  postId={post._id}
                  username={`${post.firstName} ${post.lastName}`}
                  reloadPost={reloadPost}
                  fetchMorePosts={fetchMorePosts}
                  handleDeletePost={handleDeletePost}
                  text={post.description}
                  image={post.picturePath}
                  profilePicture={post.profilePicture}
                  video={post.videoPath}
                  thumbsUp={post.thumbsUp}
                  clap={post.clap}
                  smile={post.smile}
                  handleLikes={handleLikes}
                  likes={post.likes}
                  formatTimestamp={formatTimestamp}
                  groupID={post.groupID}
                />
              </View>
            );
          } else if (post.type === 'Job' && post.groupID === groupID) {
            // console.log('Post type : ', post.type);
            // console.log('✅ Job Matched: Rendering Job Post');
            return (
              <View key={post._id + index} style={styles.jobBox}>
                <JobIntDisplay
                  jobId={post._id}
                  job={post}
                  picture={post.coverImage}
                  jobTitle={post.title}
                  location={post.location}
                  salaryMin={post.salaryMin}
                  salaryMax={post.salaryMax}
                  currency={post.currency}
                  locationType={post.employmentType}
                  category={post.category}
                  description={post.description}
                  handleDeleteJob={handleDeleteJob}
                  formatTimestamp={formatTimestamp}
                  groupID={post.groupID}
                />
              </View>
            );
          } else if (post.type === 'poll') {
            return (
              <View key={post._id + index} style={styles.postBox}>
                <PollDisplay poll={post} />
              </View>
            );
          } else if (post.type === 'event') {
            console.log('EVENT Post type : ', post.type);
            return (
              <View key={post._id + index} style={styles.postBox}>
                <EventDisplay event={post} />
              </View>
            );
          } else if (entityType === 'news' && post.type === 'news') {
            return (
              <View key={post._id + index} style={styles.postBox}>
                <DisplayNews
                  key={post._id}
                  postId={post._id}
                  title={post.title}
                  description={post.description}
                  createdAt={post.createdAt}
                  picturePath={post.picturePath}
                  videoPath={post.videoPath}
                  department={post.department}
                  userId={post.userId}
                  onDeletePost={id =>
                    setPosts(prevPosts =>
                      prevPosts.filter(item => item._id !== id),
                    )
                  }
                />
              </View>
            );
          }
          return null; // Handle other types or simply return null
          // else {
          //   return null; // Handle other types or simply return null
          // }
        })}
        {/* <TouchableOpacity onPress={fetchMorePosts}>
          {isProfile ? <Text style={{color: 'black'}}> Load more</Text> : null}
        </TouchableOpacity> */}
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {/* Load More Button */}
        {/* Show "Load More" button if `isProfile` is true */}
        {!loading && hasMore && isProfile && posts.length > 0 && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => fetchMorePosts()}>
            <Text style={styles.loadMoreButtonText}>Load More</Text>
          </TouchableOpacity>
        )}

        {!loading && posts.length === 0 && !refreshing && (
          <View style={styles.endOfPostsMessage}>
            <Text style={styles.endOfPostsText}>No posts available.</Text>
          </View>
        )}

        {/* Show "End of Posts" message when no more posts are available */}
        {!loading && !hasMore && posts.length > 0 && (
          <View style={styles.endOfPostsMessage}>
            <Text style={styles.endOfPostsText}>
              You've reached the end of the posts.
            </Text>
          </View>
        )}
      </ScrollView>

      <PollModal
        visible={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* Floating Menu */}
      {showFloatingMenu && (
        <View style={styles.floatingMenuContainer}>
          {menuVisible &&
            menuOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                style={[
                  styles.menuItem,
                  {
                    transform: [
                      {
                        translateY: menuAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50 * (menuOptions.length - index), 0],
                        }),
                      },
                    ],
                    opacity: menuAnimation,
                  },
                ]}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    toggleMenu();
                    // Trigger modal for Create Job
                    if (option.title === 'Create Job') {
                      setModalVisible(true);
                    } else {
                      option.onPress();
                    }
                  }}>
                  <Icon name={option.icon} size={24} color="#fff" />
                  <Text style={styles.menuText}>{option.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

          {/* Floating Button */}
          <TouchableOpacity style={styles.floatingButton} onPress={toggleMenu}>
            <Icon name={menuVisible ? 'close' : 'add'} size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  createPostContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontFamily: 'Lexend-Bold',
    color: 'black',
  },
  statusInput: {
    // height: 40,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 24,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    marginHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    backgroundColor: '#cfcdcc',
    width: '100px',
  },
  image: {
    marginTop: 10,
    alignSelf: 'center',
  },
  video: {
    width: 80, // Adjust the width as needed
    height: 50, // Adjust the height as needed
    alignSelf: 'center',
    marginTop: 10,
  },
  // uploadImageButton: {
  //   backgroundColor: '#f9a825',
  // },
  // createJobButton: {
  //   backgroundColor: '#c0ca33',
  // },
  // uploadVideoButton: {
  //   backgroundColor: '#29b6f6',
  // },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'Lexend-Regular',
  },
  shareButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 10,
    marginHorizontal: 10,
  },
  shareButton: {
    backgroundColor: IoColor1, // Use the color that matches your design for the share button
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  shareButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  imageContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  videoPreviewContainer: {
    position: 'relative',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  disabledButton: {
    opacity: 0.5, // Make the button appear disabled
  },
  postBox: {
    marginBottom: 10,
  },
  jobBox: {
    marginBottom: 10,
  },
  loadMoreButton: {
    backgroundColor: IoColor1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  endOfPostsMessage: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  endOfPostsText: {
    color: '#999',
    fontSize: 16,
    // fontStyle: 'italic',
    fontFamily: 'Lexend-Regular',
  },
  floatingMenuContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingButton: {
    width: 60,
    height: 60,
    backgroundColor: IoColor1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  menuItem: {
    width: 160, // Adjust based on your needs for text and icon alignment
    height: 50,
    backgroundColor: IoColor1,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginBottom: 10, // Spacing between each menu button
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});
