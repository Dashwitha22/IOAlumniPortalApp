import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Post from './post';
import axios from 'axios';
import {userApiServer} from '../../config';
import {useNavigation} from '@react-navigation/native';
import {deletePost} from '../../store/actions/postActions';

const Archive = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 5; // Number of posts per page

  const navigate = useNavigation();

  useEffect(() => {
    getPosts(page);
  }, []);

  const getPosts = async (refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);

    const nextPage = refresh ? 1 : page;
    try {
      const response = await axios.get(
        `${userApiServer}/posts/posts/archive?page=${nextPage}&size=${LIMIT}`,
      );
      const postsData = response.data.records;

      if (refresh) {
        setPosts(postsData);
      } else {
        setPosts(prevItems => [...prevItems, ...postsData]);
      }

      setPage(nextPage + 1);
      setHasMore(postsData.length === LIMIT); // Update hasMore based on the number of records fetched
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const reloadPost = () => {
    navigate.reset({
      index: 0,
      routes: [{name: 'Archive'}],
    });
  };

  const handleDeletePost = async postId => {
    setPosts(posts.filter(post => post._id !== postId));
    try {
      await deletePost(postId); // Call the delete post action
      Alert.alert('Success', 'Post Deleted Successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      getPosts();
      setLoadingMore(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Archived Posts</Text>
      <ScrollView
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => reloadPost()} />
        }>
        {posts.map((post, index) => {
          if (post.type === 'Post' && post.archive === true) {
            return (
              <View key={post._id} style={styles.postBox}>
                <Post
                  post={post}
                  username={`${post.firstName} ${post.lastName}`}
                  reloadPost={reloadPost}
                  postId={post._id}
                  handleDeletePost={handleDeletePost}
                  text={post.description}
                  image={post.picturePath}
                  profilePicture={post.profilePicture}
                  video={post.videoPath}
                  handleLikes={handleLikes}
                  likes={post.likes}
                  thumbsUp={post.thumbsUp}
                  clap={post.clap}
                  smile={post.smile}
                  formatTimestamp={formatTimestamp}
                  archived={true}
                />
              </View>
            );
          }
        })}
        {loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
      </ScrollView>
    </View>
  );
};

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

export default Archive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    marginBottom: 16,
    color: 'black',
  },
  postBox: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
