import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {userApiServer} from '../../config';
import BrowseBusiness from './businessConnectComponents/browseBusiness';
import {IoColor1, IoColor2} from '../../colorCode';
import BusinessConnectTab from './businessConnectComponents/businessConnectTab';
import CreateDonationModal from '../components/createDonationModal';

const screenWidth = Dimensions.get('window').width;

const BusinessConnect = () => {
  const [index, setIndex] = useState(0);

  const [businesses, setBusinesses] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const LIMIT = 4;
  const [page, setPage] = useState(1);
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  const profile = useSelector(state => state.auth.user);
  const superAdmin = profile.profileLevel === 0;
  const admin = profile.profileLevel === 2;
  const canViewRequests =
    profile.profileLevel === 0 || profile.profileLevel === 2;

  // ✅ Define routes dynamically based on canViewRequests
  const routes = [
    {key: 'browse', title: 'Browse Businesses'},
    ...(canViewRequests
      ? [{key: 'requests', title: 'My Business Requests'}]
      : []), // ✅ Only show "Requests" tab if canViewRequests is true
    {key: 'connect', title: 'Business Connect'},
  ];

  // Fetch businesses for "Browse Businesses" tab
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${userApiServer}/donations?page=${page}&size=${LIMIT}`,
      );
      const {records, total} = response.data;

      setBusinesses(prev => [
        ...prev,
        ...records.filter(
          record => !prev.some(prevBusiness => prevBusiness._id === record._id),
        ),
      ]);
      setTotalBusinesses(total);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page]);

  // Fetch user's business requests for "My Business Requests" tab
  const fetchUserRequests = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/donations/user/${profile._id}`,
      );
      console.log('BUsiness connect requests :', response.data.donations);
      setUserRequests(response.data.donations);
    } catch (error) {
      console.error('Error fetching user business requests:', error);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const updateBusinesses = (reset = false) => {
    if (reset) {
      setBusinesses([]); // Clear current data
      setPage(1); // Reset to the first page
      fetchBusinesses(); // Fetch the initial set of data
    } else {
      setIsLoading(true);
      setPage(prevPage => prevPage + 1); // Load the next page
    }
  };

  const renderScene = SceneMap({
    browse: () => (
      <BrowseBusiness
        businesses={businesses}
        name="donations"
        loading={loading}
        setPage={setPage}
        updateBusinesses={updateBusinesses}
        totalBusinesses={totalBusinesses}
        page={page}
        limit={LIMIT}
        isLoading={isLoading}
        isRequestsTab={false}
      />
    ),
    requests: () =>
      canViewRequests ? (
        <BrowseBusiness
          businesses={superAdmin ? businesses : userRequests} // ✅ Uses canViewRequests in props
          name="donations"
          loading={loading}
          setPage={setPage}
          updateBusinesses={superAdmin ? updateBusinesses : fetchUserRequests}
          totalBusinesses={superAdmin ? totalBusinesses : userRequests.length}
          page={page}
          limit={LIMIT}
          isLoading={isLoading}
          isRequestsTab={true}
        />
      ) : null,
    connect: BusinessConnectTab,
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Business Connect</Text>
        <Text style={styles.subHeader}>
          Discover opportunities, network with fellow alumni entrepreneurs, and
          explore collaboration possibilities in our dynamic Business Connect
          hub within the alumni portal.
        </Text>
      </View>

      {profile.profileLevel === 2 ? (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setDonationModalVisible(true)}>
          <Text style={styles.createButtonText}>Create Donation</Text>
        </TouchableOpacity>
      ) : null}

      <CreateDonationModal
        modalVisible={donationModalVisible}
        setModalVisible={setDonationModalVisible}
      />

      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: screenWidth}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            renderLabel={({route, focused}) => (
              <Text style={focused ? styles.activeLabel : styles.labelStyle}>
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: IoColor2,
    margin: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '400',
    color: 'black',
    paddingTop: 10,
  },
  createButton: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
    alignItems: 'center',
    margin: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: 'white',
  },
  indicator: {
    backgroundColor: 'black',
  },
  labelStyle: {
    color: 'black',
    fontSize: 15,
    textAlign: 'center',
  },
  activeLabel: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
  },
  connectTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default BusinessConnect;
