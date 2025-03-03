import React, {useState, useEffect} from 'react';
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
import BrowseBusiness from './businessConnectComponents/browseBusiness';
import {IoColor1, IoColor2} from '../../colorCode';
import {userApiServer} from '../../config';
import CreateSponsorhipModal from '../components/createSponsorhipModal';

const screenWidth = Dimensions.get('window').width;

const Sponsorships = () => {
  const [index, setIndex] = useState(0);

  const [sponsorships, setSponsorships] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSponsorships, setTotalSponsorships] = useState(0);
  const [sponsorshipModalVisible, setSponsorshipModalVisible] = useState(false); // State for sponsorship modal
  const LIMIT = 4;
  const [page, setPage] = useState(1);

  const profile = useSelector(state => state.auth.user);
  const superAdmin = profile.profileLevel === 0;
  const admin = profile.profileLevel === 1 || profile.profileLevel === 3;
  const canViewRequests =
    profile.profileLevel === 0 ||
    profile.profileLevel === 1 ||
    profile.profileLevel === 3;

  // ✅ Only show "Requests" tab if the user is an admin (profileLevel 0, 1, or 3)
  const routes = [
    {key: 'browse', title: 'Browse Sponsorships'},
    ...(canViewRequests
      ? [{key: 'requests', title: 'My Sponsorship Requests'}]
      : []),
  ];

  // Fetch sponsorships for "Browse Sponsorships" tab
  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${userApiServer}/sponsorships?page=${page}&size=${LIMIT}`,
      );
      const {records, total} = response.data;

      setSponsorships(prev => [
        ...prev,
        ...records.filter(
          record =>
            !prev.some(prevSponsorship => prevSponsorship._id === record._id),
        ),
      ]);
      setTotalSponsorships(total);
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorships();
  }, [page]);

  // Fetch user's sponsorship requests for "My Sponsorship Requests" tab
  const fetchUserRequests = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/sponsorships/user/${profile._id}`,
      );
      console.log('Sponsorships requests :', response.data.sponsorships);
      setUserRequests(response.data.sponsorships);
    } catch (error) {
      console.error('Error fetching user sponsorship requests:', error);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const updateSponsorships = () => {
    setIsLoading(true);
    setPage(prevPage => prevPage + 1);
  };

  const renderScene = SceneMap({
    browse: () => (
      <BrowseBusiness
        businesses={sponsorships}
        name="sponsorships"
        loading={loading}
        setPage={setPage}
        updateBusinesses={updateSponsorships}
        totalBusinesses={totalSponsorships}
        page={page}
        limit={LIMIT}
        isLoading={isLoading}
        isRequestsTab={false}
      />
    ),
    requests: () =>
      canViewRequests ? (
        <BrowseBusiness
          businesses={superAdmin ? sponsorships : userRequests} // ✅ Uses admin in props
          name="sponsorships"
          loading={loading}
          setPage={setPage}
          updateBusinesses={superAdmin ? updateSponsorships : fetchUserRequests}
          totalBusinesses={superAdmin ? totalSponsorships : userRequests.length}
          page={page}
          limit={LIMIT}
          isLoading={isLoading}
          isRequestsTab={true}
        />
      ) : null, // ✅ If not admin, don't show anything
  });

  // if (selectedBusiness) {
  //   return (
  //     <BusinessConnectDetails
  //       details={selectedBusiness}
  //       onBack={() => setSelectedBusiness(null)}
  //     />
  //   );
  // }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sponsorships</Text>
        <Text style={styles.subHeader}>
          Discover opportunities, network with fellow alumni entrepreneurs, and
          explore collaboration possibilities in our dynamic Sponsorship hub
          within the alumni portal.
        </Text>
      </View>

      {profile.profileLevel === 3 || profile.profileLevel === 1 ? (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setSponsorshipModalVisible(true)}>
          <Text style={styles.createButtonText}>
            Create Sponsorship Request
          </Text>
        </TouchableOpacity>
      ) : null}

      <CreateSponsorhipModal
        modalVisible={sponsorshipModalVisible}
        setModalVisible={setSponsorshipModalVisible}
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
});

export default Sponsorships;
