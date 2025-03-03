import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import LikeIcon from 'react-native-vector-icons/FontAwesome5';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {userApiServer} from '../../config';
import EllipsisVIcon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Carousel from 'react-native-reanimated-carousel';
import {archivePost} from '../../store/actions/archivePostActions';
import Slider from '@react-native-community/slider';

const Post = ({
  userId,
  post,
  postId,
  username,
  handleDeletePost,
  handleLikes,
  profilePicture,
  text,
  image,
  video,
  likes,
  smile,
  thumbsUp,
  clap,
  formatTimestamp,
  archived,
  groupID,
  reloadPost,
}) => {
  const user = useSelector(state => state.auth.user);
  // const username = user ? user.firstName : ''; // Add null check here
  // const userId = user ? user._id : null; // Add null check here
  const profile = user ? user : {}; // Add null check here
  const loggedInUserId = profile._id;
  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();

  const [isLiked, setLiked] = useState(false);
  const [isThumbsUp, setIsThumbsUp] = useState(false);
  const [isClapped, setIsClapped] = useState(false);
  const [isSmile, setIsSmile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const {width: screenWidth} = Dimensions.get('window');
  const videoRef = useRef(null);

  useEffect(() => {
    if (loggedInUserId && postId) {
      const postLiked = likes?.some(like => like.userId === loggedInUserId);
      setLiked(postLiked || false);
      const postSmiled = smile?.some(smile => smile.userId === loggedInUserId);
      setIsSmile(postSmiled || false);
      const postClapped = clap?.some(clap => clap.userId === loggedInUserId);
      setIsClapped(postClapped || false);
      const postThumbsUp = thumbsUp?.some(
        thumbsUp => thumbsUp.userId === loggedInUserId,
      );
      setIsThumbsUp(postThumbsUp || false);
    }
  }, [likes, loggedInUserId, postId, smile, thumbsUp, clap]);

  // console.log('groupIds in feed', groupID);

  const handleLike = async () => {
    setLiked(!isLiked);
    try {
      const response = await axios.patch(
        `${userApiServer}/posts/${postId}/likes`,
        {
          userId: loggedInUserId,
          userName: username,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleThumbsUp = async () => {
    setIsThumbsUp(!isThumbsUp);
    try {
      const response = await axios.patch(
        `${userApiServer}/posts/${postId}/thumbsUp`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error('Error giving thumbs up:', error);
    }
  };

  const handleSmile = async () => {
    setIsSmile(!isSmile);
    try {
      const response = await axios.patch(
        `${userApiServer}/posts/${postId}/smile`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error('Error smiling at post:', error);
    }
  };

  const handleClap = async () => {
    setIsClapped(!isClapped);
    try {
      const response = await axios.patch(
        `${userApiServer}/posts/${postId}/clap`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error('Error clapping for post:', error);
    }
  };

  const handleArchivePost = async () => {
    setShowOptions(false); // Close the options container
    dispatch(archivePost(postId)); // Dispatch the archive post action
    reloadPost();
  };

  const toggleOptions = () => {
    setShowOptions(prevState => !prevState);
  };

  const renderItem = ({item}) => (
    <Image
      source={{uri: item.uri}}
      style={styles.postImage}
      // onError={e => console.log('', e)}
    />
  );

  const PaginationDots = ({activeIndex, length}) => (
    <View style={styles.paginationContainer}>
      {Array.from({length}).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  const [currentTime, setCurrentTime] = useState(0); // Track current playback time
  const [duration, setDuration] = useState(0); // Track the video duration
  const [isPaused, setIsPaused] = useState(true); // Start with the video paused

  const handlePlayPause = () => {
    setIsPaused(!isPaused); // Toggle play/pause state
  };

  const handleProgress = progress => {
    setCurrentTime(progress.currentTime); // Update current playback time
  };

  const handleLoad = meta => {
    setDuration(meta.duration); // Set video duration when loaded
  };

  const handleSliderChange = value => {
    videoRef.current.seek(value); // Allow user to scrub through the video
    setCurrentTime(value); // Update the current time
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          style={styles.postAvatar}
          source={
            profilePicture
              ? {uri: profilePicture}
              : require('../../assets/images/profilepic.5188743c44340e4474b2.jpg') // Replace with your default avatar path
          }
        />
        <View style={{flex: 1}}>
          <Text style={styles.postUsername}>{username}</Text>
          <Text style={styles.postTimestamp}>
            {formatTimestamp(post.createdAt)}
          </Text>
        </View>
        {post.userId === profile._id && (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleDeletePost(post._id)}>
            <EllipsisVIcon name="trash" size={20} color="red" solid />
          </TouchableOpacity>
        )}
        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => handleEditPost(post._id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleArchivePost}
              style={styles.optionButton}>
              <Text style={styles.optionText}>
                {post.archive ? 'Unarchive' : 'Archive'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePost(post._id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {text && <Text style={styles.postText}>{text}</Text>}
      {image && image.length === 1 ? (
        <View style={styles.singleImageContainer}>
          <Image
            source={{uri: image[0]}}
            style={styles.singleImage}
            // onError={e => console.log('Failed to load image', e)}
          />
        </View>
      ) : image && image.length > 1 ? (
        <View style={{marginTop: 10}}>
          <Carousel
            data={image.map(p => ({uri: p, type: 'image'}))}
            renderItem={renderItem}
            width={screenWidth}
            height={200}
            autoPlay={true}
            autoPlayInterval={3000}
            scrollAnimationDuration={500}
            onSnapToItem={index => setActiveIndex(index)} // Update active index
          />
          <PaginationDots activeIndex={activeIndex} length={image.length} />
        </View>
      ) : null}
      {video && video?.uri ? (
        <View style={styles.videoContainer}>
          <Video
            source={{uri: video.uri}}
            style={styles.postVideo}
            resizeMode="cover"
            paused={isPaused} // Start video in paused state
            onProgress={handleProgress}
            onLoad={handleLoad}
            ref={videoRef}
            onError={e => console.log('Video Error:', e)}
            onEnd={() => {
              setCurrentTime(0); // Reset the current time
              setIsPaused(true); // Show the play button again
            }}
          />

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <FontAwesome5
              name={isPaused ? 'play' : 'pause'}
              size={20}
              color="white"
            />
          </TouchableOpacity>

          {/* Custom Progress Bar */}
          <View style={styles.controlsContainer}>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={handleSliderChange} // Scrub through the video
              minimumTrackTintColor="#FFF"
              maximumTrackTintColor="#777"
              thumbTintColor="#FFF"
            />
            <Text style={styles.timeText}>
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </Text>
          </View>
        </View>
      ) : null}
      {!archived && (
        <View style={styles.bottomAction}>
          <TouchableOpacity onPress={handleThumbsUp}>
            <FontAwesome5
              name="thumbs-up"
              size={20}
              color={isThumbsUp ? 'red' : 'black'}
              solid
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSmile}>
            <FontAwesome5
              name="smile"
              size={20}
              color={isSmile ? 'red' : 'black'}
              solid
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClap}>
            <FontAwesome5
              name="hands"
              size={20}
              color={isClapped ? 'red' : 'black'}
              solid
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLike}>
            <FontAwesome5
              name="heart"
              size={20}
              color={isLiked ? 'red' : 'black'}
              solid
            />
          </TouchableOpacity>
        </View>
      )}

      {/* <View style={styles.postFooter}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={handleLike}>
          <LikeIcon
            name="thumbs-up"
            size={15}
            color={isliked ? '#0000ff' : 'grey'}
            solid
          />
          <Text style={styles.footerButton}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <CommentIcon name="comment" size={15} color="gray" solid />
          <Text style={styles.footerButton}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <ShareIcon name="share" size={15} color="gray" solid />
          <Text style={styles.footerButton}>Share</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  postContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
    // marginTop: 10,
    position: 'relative', // Ensure positioning context
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUsername: {
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  postTimestamp: {
    fontSize: 14,
    color: '#004C8A',
    fontFamily: 'Lexend-Regular',
  },
  postText: {
    marginVertical: 10,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  postImage: {
    width: '80%',
    height: 200,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
    // width: screenWidth,
    height: 200, // Adjust height based on video content
    backgroundColor: 'black', // Fallback background color
    marginTop: 10,
  },
  postVideo: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    zIndex: 1, // Ensure the play button is always above the video
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for better visibility
    padding: 10,
    borderRadius: 50, // Make the play button circular
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure the controls stay above the video
  },
  progressBar: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: '#FFF',
    marginLeft: 10,
    marginRight: 10,
    fontFamily: 'Lexend-Regular',
  },
  bottomAction: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  footerButton: {
    fontFamily: 'Lexend-Regular',
    marginLeft: 5,
    color: '#65676b', // Change this to match the color in the screenshot
  },
  singleImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200, // Adjust the height as necessary
    marginTop: 10,
  },
  singleImage: {
    width: '100%', // Adjust as necessary
    height: '100%',
    resizeMode: 'contain', // Ensures the image fits without stretching
  },
  optionsButton: {
    padding: 5,
    position: 'relative',
  },
  optionsContainer: {
    position: 'absolute',
    top: 25, // Adjust according to your layout
    right: 0, // Aligns with the icon on the right side
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4}, // Increased height for a more pronounced shadow
    shadowOpacity: 0.3, // Adjusted for more visibility
    shadowRadius: 5, // Increased radius for a softer shadow
    elevation: 5, // Adds elevation on Android for shadow effect
    zIndex: 1000, // Ensure it appears above other elements
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  inactiveDot: {
    backgroundColor: 'grey',
    opacity: 0.4,
  },
});
