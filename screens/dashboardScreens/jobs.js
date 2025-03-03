import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import {Picker} from '@react-native-picker/picker';
import JobDetails from './jobComponents/jobDetails';
import {userApiServer} from '../../config';
import axios from 'axios';
import JobPost from './jobComponents/jobPost';
import StarredJobs from './jobComponents/starredJobs';
import AppliedJobs from './jobComponents/appliedJobs';
import ArchiveJobs from './jobComponents/archiveJobs';
import {useSelector} from 'react-redux';
import {IoColor1, IoColor2, IoColor3} from '../../colorCode';
import {ScrollView} from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [archivedJobs, setArchivedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // New state for verification filter
  const [selectedJob, setSelectedJob] = useState(null); // State to track selected job
  const [title, setTitle] = useState('Jobs');
  const titleS = 'job';

  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here

  const [index, setIndex] = useState(0);
  const routes =
    profile.profileLevel >= 2
      ? [
          {key: 'all', title: 'All Jobs'},
          {key: 'starred', title: 'Starred'},
          {key: 'applied', title: 'Applied'},
        ]
      : [{key: 'all', title: 'All Jobs'}];

  const getData = async () => {
    try {
      const response = await axios.get(`${userApiServer}/internships`);
      const filteredJobs = response.data.filter(job => !job.archive);
      const filteredArchivedJobs = response.data.filter(
        job => job.archive && job.approved && job.userId === profile._id,
      );
      setJobs(filteredJobs);
      setArchivedJobs(filteredArchivedJobs);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSearchChange = (type, selectedOption) => {
    if (type === 'text') {
      setSearchQuery(prevQuery => ({...prevQuery, title: selectedOption}));
    } else if (type === 'category') {
      if (selectedOption === 'Category') {
        setSelectedCategory('');
        setSearchQuery(prevQuery => ({...prevQuery, category: null}));
      } else {
        setSelectedCategory(selectedOption);
        setSearchQuery(prevQuery => ({...prevQuery, category: selectedOption}));
      }
    } else if (type === 'employmentType') {
      if (selectedOption === 'Employment Type') {
        setEmploymentType('');
        setSearchQuery(prevQuery => ({...prevQuery, employmentType: null}));
      } else {
        setEmploymentType(selectedOption);
        setSearchQuery(prevQuery => ({
          ...prevQuery,
          employmentType: selectedOption,
        }));
      }
    }
  };

  // Handle verification filter change
  const handleVerifiedFilterChange = itemValue => {
    console.log('Selected Verification Filter:', itemValue);
    setVerifiedFilter(itemValue);
  };

  // Filter by verification status
  const filterByVerified = job => {
    if (verifiedFilter === 'verified') {
      return job.verified === true;
    } else if (verifiedFilter === 'unverified') {
      return job.verified === false;
    }
    return true; // Show all jobs when "all" is selected
  };

  const filteredJobs = jobs
    .filter(job => filterByVerified(job))
    .filter(job => {
      const {title, category, employmentType} = searchQuery;

      const jobTitleMatch = title
        ? job.title.toLowerCase().includes(title.toLowerCase())
        : true;
      const categoryMatch = category
        ? job.category.toLowerCase() === category.toLowerCase()
        : true;
      const employmentTypeMatch = employmentType
        ? job.employmentType.toLowerCase() === employmentType.toLowerCase()
        : true;

      return jobTitleMatch && categoryMatch && employmentTypeMatch;
    });

  const filteredArchivedJobs = archivedJobs.filter(job => {
    const {title, category, employmentType} = searchQuery;
    const lowerCaseJobTitle = title ? title.toLowerCase() : '';
    const lowerCaseCategory = category ? category.toLowerCase() : '';
    const lowerCaseEmploymentType = employmentType
      ? employmentType.toLowerCase()
      : '';

    const jobTitleMatch = lowerCaseJobTitle
      ? job.title.toLowerCase().includes(lowerCaseJobTitle)
      : true;

    const categoryMatch = lowerCaseCategory
      ? job.category.toLowerCase().includes(lowerCaseCategory)
      : true;

    const employmentTypeMatch = lowerCaseEmploymentType
      ? job.employmentType.toLowerCase().includes(lowerCaseEmploymentType)
      : true;

    return jobTitleMatch && categoryMatch && employmentTypeMatch;
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleDropdownSelect = eventKey => {
    if (eventKey === 'Internship') {
      setTitle('Internships');
    }
  };

  const handleSelectJob = job => {
    setSelectedJob(job);
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  if (selectedJob) {
    return (
      <JobDetails
        job={selectedJob}
        onBack={handleBack}
        title={title}
        titleS={titleS}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Jobs</Text>
        <Text style={styles.headerText}>
          Discover, explore, and submit applications for job openings on the
          Alumni Portal.
        </Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for jobs/internships"
          placeholderTextColor="#000"
          value={searchQuery.title || ''}
          onChangeText={text => handleSearchChange('text', text)}
        />
        <View style={styles.filterContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={employmentType}
              onValueChange={itemValue =>
                handleSearchChange('employmentType', itemValue)
              }
              style={styles.picker}
              dropdownIconColor="#fff">
              <Picker.Item
                label="Employment Type"
                value="Employment Type"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Full-time"
                value="Full-time"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Part-time"
                value="Part-time"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Internship"
                value="Internship"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Volunteer"
                value="Volunteer"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Contract"
                value="Contract"
                style={styles.pickerValue}
              />
            </Picker>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={itemValue1 =>
                handleSearchChange('category', itemValue1)
              }
              style={styles.picker}
              dropdownIconColor="#fff">
              <Picker.Item
                label="Category"
                value="Category"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Admin & Office"
                value="Admin & Office"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Art & Design"
                value="Art & Design"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Business Operations"
                value="Business Operations"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Healthcare"
                value="Healthcare"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Management"
                value="Management"
                style={styles.pickerValue}
              />
              <Picker.Item
                label="Retail & Sales"
                value="Retail & Sales"
                style={styles.pickerValue}
              />
            </Picker>
          </View>
        </View>
      </View>
      {/* Verification Filter */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 40,
        }}>
        <Text style={{color: 'black', fontSize: 14}}>
          Filter by Verification:
        </Text>
        <View style={styles.filterWrapper}>
          <Picker
            selectedValue={verifiedFilter}
            onValueChange={itemValue => handleVerifiedFilterChange(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff">
            <Picker.Item
              label="All Jobs"
              value="all"
              style={styles.pickerValue}
            />
            <Picker.Item
              label="Verified Jobs"
              value="verified"
              style={styles.pickerValue}
            />
            <Picker.Item
              label="Unverified Jobs"
              value="unverified"
              style={styles.pickerValue}
            />
          </Picker>
        </View>
      </View>

      <TabView
        navigationState={{index, routes}}
        renderScene={({route}) => {
          switch (route.key) {
            case 'all':
              return (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  {filteredJobs.map(item => (
                    <JobPost
                      key={item._id}
                      job={item}
                      onSelectJob={handleSelectJob}
                      title={title}
                      titleS={titleS}
                      verified={item.verified}
                    />
                  ))}
                </ScrollView>
              );
            case 'starred':
              return (
                <StarredJobs
                  searchQuery={searchQuery}
                  handleSelectJob={handleSelectJob}
                />
              );
            case 'applied':
              return (
                <AppliedJobs
                  searchQuery={searchQuery}
                  handleSelectJob={handleSelectJob}
                />
              );

            default:
              return null;
          }
        }}
        onIndexChange={setIndex}
        initialLayout={{width: screenWidth}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: '#0d6efd'}}
            style={{backgroundColor: 'white', marginTop: 40}}
            labelStyle={{
              color: 'black',
              fontFamily: 'Lexend-Regular',
              textTransform: 'none',
              fontSize: 15,
            }}
          />
        )}
      />
    </ScrollView>
  );
};

export default Jobs;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: IoColor2,
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 50,
    marginBottom: 100,
  },
  heading: {
    fontSize: 18,
    color: 'black',
    marginVertical: 5,
    fontFamily: 'Lexend-Bold',
  },
  headerText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginBottom: 10,
  },
  searchContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    width: 250,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'absolute',
    top: 100,
  },
  searchBar: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
    color: 'black',
    width: '100%',
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
  },
  filterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  pickerWrapper: {
    backgroundColor: IoColor1,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  filterWrapper: {
    backgroundColor: IoColor1,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: '50%',
    marginLeft: 10,
  },
  picker: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
  },
  pickerValue: {
    fontFamily: 'Lexend-Regular',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
