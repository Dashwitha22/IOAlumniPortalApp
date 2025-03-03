import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {IoColor2} from '../../../colorCode';
import {useSelector} from 'react-redux';
import {userApiServer} from '../../../config';

const BusinessConnectDetails = ({route, navigation}) => {
  // const route = useRoute();
  const {business} = route.params;
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

  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>
        {business.nameOfEvent || business.businessName || 'Business Title'}
      </Text>
      <Text style={styles.detailsDate}>
        Posted on {formatDate(business.createdAt)}
      </Text>
      <Text style={styles.detailsAuthor}>
        By {business.userName || 'Admin'}
      </Text>
      <Image
        source={{
          uri: business.picturePath || 'https://via.placeholder.com/300x120',
        }}
        style={styles.imagePlaceholder}
      />
      <Text style={styles.detailsDescription}>
        {business.eventDescription ||
          business.businessDescription ||
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
      </Text>
      <View style={styles.details}>
        <Text style={styles.detailsItem}>
          Total Amount: ₹
          {business.amount || business.sponsorshipAmount || 'N/A'}
        </Text>
        <Text style={styles.detailsItem}>
          Name: {business.name || business.nameOfOrganiser || 'N/A'}
        </Text>
        <Text style={styles.detailsItem}>
          Contact Number: {business.phone || business.number || 'N/A'}
        </Text>
        <Text style={styles.detailsItem}>
          Email: {business.email || business.emailOfOrganiser || 'N/A'}
        </Text>
        {business.businessPlan && (
          <TouchableOpacity
            onPress={() => {
              const pdfUrl = `${userApiServer}/uploads/${business.businessPlan}`; // ✅ Construct Full URL
              Linking.openURL(pdfUrl)
                .then(() => console.log('Opened PDF:', pdfUrl))
                .catch(err => console.error('Error opening PDF:', err));
            }}>
            <Text style={styles.link}>View Business Plan</Text>
          </TouchableOpacity>
        )}
        {business.currentRevenue && (
          <Text style={styles.detailsItem}>
            Current Revenue: ₹{business.currentRevenue}
          </Text>
        )}
        {business.marketingStrategy && (
          <Text style={styles.detailsItem}>
            Marketing Strategy: {business.marketingStrategy}
          </Text>
        )}
        {business.targetMarket && (
          <Text style={styles.detailsItem}>
            Target Market: {business.targetMarket}
          </Text>
        )}
        {business.industry && (
          <Text style={styles.detailsItem}>Industry: {business.industry}</Text>
        )}
        {business.teamExperience && (
          <Text style={styles.detailsItem}>
            Team Experience: {business.teamExperience}
          </Text>
        )}
        {business.competitiveAdvantage && (
          <Text style={styles.detailsItem}>
            Competitive Advantage: {business.competitiveAdvantage}
          </Text>
        )}
        {business.targetAudience && (
          <Text style={styles.detailsItem}>
            Target Audience: {business.targetAudience}
          </Text>
        )}
        {business.eventDescription && (
          <Text style={styles.detailsItem}>
            Event Description: {business.eventDescription}
          </Text>
        )}
        {business.useOfFunds && (
          <Text style={styles.detailsItem}>
            Use Of Funds: {business.useOfFunds}
          </Text>
        )}
        {business.additionalInfo && (
          <Text style={styles.detailsItem}>
            Additional Information: {business.additionalInfo}
          </Text>
        )}
        {business.eventDate && (
          <Text style={styles.detailsItem}>
            Event Date: {business.eventDate}
          </Text>
        )}
        {business.location && (
          <Text style={styles.detailsItem}>
            Event Location: {business.location}
          </Text>
        )}
        {business.expectedAttendees && (
          <Text style={styles.detailsItem}>
            Expected Attendees: {business.expectedAttendees}
          </Text>
        )}
        {business.sponsorshipBenefits && (
          <Text style={styles.detailsItem}>
            Sponsorship Benefits: {business.sponsorshipBenefits}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      {profile._id !== business.userId && (
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              'https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt',
            )
          }
          style={styles.donateButton}>
          <Text style={styles.donateButtonText}>Donate</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default BusinessConnectDetails;

const styles = StyleSheet.create({
  detailsContainer: {
    flexGrow: 1,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    marginBottom: 5,
    color: 'black',
  },
  detailsDate: {
    fontSize: 14,
    marginBottom: 4,
    color: 'gray',
  },
  detailsAuthor: {
    fontSize: 14,
    marginBottom: 16,
    color: 'gray',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsDescription: {
    fontSize: 14,
    color: 'black',
    marginTop: 16,
  },
  details: {
    marginTop: 16,
  },
  detailsItem: {
    fontSize: 14,
    color: '#174873',
    marginTop: 8,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: IoColor2,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: 'black',
  },
  donateButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#efeff0',
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: 16,
    color: 'black',
  },
});
