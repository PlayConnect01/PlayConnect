import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';

const EditProfile = ({ route, navigation }) => {
  const { userData } = route.params;

  const [formData, setFormData] = useState({
    username: userData.username,
    email: userData.email,
    location: userData.location,
    profile_picture: userData.profile_picture,
    phone_number: userData.phone_number || '',
    birthdate_day: userData.birthdate ? new Date(userData.birthdate).getDate() : '',
    birthdate_month: userData.birthdate ? new Date(userData.birthdate).getMonth() + 1 : '',
    birthdate_year: userData.birthdate ? new Date(userData.birthdate).getFullYear() : '',
    phone_country_code: userData.phone_country_code || '+216',  // Default to Tunisia
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profile_picture: result.uri });
    }
  };

  const handleSubmit = async () => {
    const { phone_number, birthdate_day, birthdate_month, birthdate_year } = formData;

    if (!formData.username || !formData.location || !phone_number || !birthdate_day || !birthdate_month || !birthdate_year) {
      return alert('Please fill out all fields.');
    }

    const birthdate = `${birthdate_year}-${birthdate_month}-${birthdate_day}`;

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://192.168.103.11:3000/users/${userData.user_id}`,
        { ...formData, birthdate }
      );
      alert('Profile updated successfully!');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerContainer}>
        <Image 
          source={{ uri: formData.profile_picture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }} 
          style={styles.profileImage} />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { paddingLeft: 40 }]}
          placeholder="Username"
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { paddingLeft: 40 }]}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { paddingLeft: 40 }]}
          placeholder="Location"
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
        />
      </View>

      <View style={styles.phoneContainer}>
        <Ionicons name="call-outline" size={20} color="#666" style={styles.phoneIcon} />
        <Picker
          selectedValue={formData.phone_country_code}
          style={[styles.picker, { marginLeft: 30 }]}
          onValueChange={(itemValue) => handleInputChange('phone_country_code', itemValue)}
        >
          <Picker.Item label="+1 (USA)" value="+1" />
          <Picker.Item label="+44 (UK)" value="+44" />
          <Picker.Item label="+33 (FR)" value="+33" />
          <Picker.Item label="+216 (Tunisia)" value="+216" />
          <Picker.Item label="+49 (Germany)" value="+49" />
          <Picker.Item label="+39 (Italy)" value="+39" />
          <Picker.Item label="+34 (Spain)" value="+34" />
          <Picker.Item label="+61 (Australia)" value="+61" />
          <Picker.Item label="+55 (Brazil)" value="+55" />
          <Picker.Item label="+91 (India)" value="+91" />
          <Picker.Item label="+971 (UAE)" value="+971" />
          <Picker.Item label="+52 (Mexico)" value="+52" />
        </Picker>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Phone Number"
          value={formData.phone_number}
          onChangeText={(value) => handleInputChange('phone_number', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.birthdateContainer}>
        <Ionicons name="calendar-outline" size={20} color="#666" style={styles.calendarIcon} />
        <View style={styles.dateContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="DD"
            keyboardType="numeric"
            value={formData.birthdate_day}
            onChangeText={(value) => handleInputChange('birthdate_day', value)}
            maxLength={2}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="MM"
            keyboardType="numeric"
            value={formData.birthdate_month}
            onChangeText={(value) => handleInputChange('birthdate_month', value)}
            maxLength={2}
          />
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY"
            keyboardType="numeric"
            value={formData.birthdate_year}
            onChangeText={(value) => handleInputChange('birthdate_year', value)}
            maxLength={4}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ccc', marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#6F61E8',
    fontSize: 14,
    marginTop: 10,
  },
  inputContainer: {
    width: '90%',
    position: 'relative',
    marginVertical: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    zIndex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    width: '90%',
    marginVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  phoneIcon: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  picker: {
    height: 40,
    width: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  birthdateContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '30%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6F61E8',
    padding: 14,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;