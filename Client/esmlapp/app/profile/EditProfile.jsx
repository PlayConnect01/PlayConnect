import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableWithoutFeedback, Modal, FlatList } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import CountryPicker from 'react-native-country-picker-modal';
import { BASE_URL } from '../../Api.js';
import Navbar from '../navbar/Navbar.jsx';
import CustomAlert from '../../Alerts/CustomAlert';

global.Buffer = Buffer;

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  } catch (error) {
    console.error("Token decoding error:", error);
    return null;
  }
};

const iconMap = {
  american_soccer_american_soccer_football_rugby_icon_209383: require('../Homepage/Icons/american_soccer_american_soccer_football_rugby_icon_209383.png'),
  controller_gamepad_game_controller_joystick_console_gaming_console_video_game_egames_esports_icon_209387: require('../Homepage/Icons/controller_gamepad_game_controller_joystick_console_gaming_console_video_game_egames_esports_icon_209387.png'),
  court_sports_ball_basketball_icon_209379: require('../Homepage/Icons/court_sports_ball_basketball_icon_209379.png'),
  equipment_weight_dumbbell_training_workout_exercise_fitness_gym_gymming_icon_209384: require('../Homepage/Icons/equipment_weight_dumbbell_training_workout_exercise_fitness_gym_gymming_icon_209384.png'),
  game_sports_feather_tennis_racquet_badminton_shuttle_cock_icon_209374: require('../Homepage/Icons/game_sports_feather_tennis_racquet_badminton_shuttle_cock_icon_209374.png'),
  grandmaster_indoor_game_queen_king_piece_strategy_chess_icon_209370: require('../Homepage/Icons/grandmaster_indoor_game_queen_king_piece_strategy_chess_icon_209370.png'),
  olympic_sport_swim_water_pool_swimming_icon_209368: require('../Homepage/Icons/olympic_sport_swim_water_pool_swimming_icon_209368.png'),
  play_ball_sports_sport_baseball_icon_209376: require('../Homepage/Icons/play_ball_sports_sport_baseball_icon_209376.png'),
  player_gaming_sports_play_game_sport_table_tennis_icon_209385: require('../Homepage/Icons/player_gaming_sports_play_game_sport_table_tennis_icon_209385.png'),
  schedule_alarm_watch_time_timer_stopwatch_icon_209377: require('../Homepage/Icons/schedule_alarm_watch_time_timer_stopwatch_icon_209377.png'),
  sports_fitness_sport_gloves_boxing_icon_209382: require('../Homepage/Icons/sports_fitness_sport_gloves_boxing_icon_209382.png'),
  sports_game_sport_ball_soccer_football_icon_209369: require('../Homepage/Icons/sports_game_sport_ball_soccer_football_icon_209369.png'),
  tennis_ball_play_sport_game_ball_tennis_icon_209375: require('../Homepage/Icons/tennis_ball_play_sport_game_ball_tennis_icon_209375.png'),
};

const EditProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    profile_picture: "",
    phone_number: "",
    birthdate_day: "",
    birthdate_month: "",
    birthdate_year: "",
    phone_country_code: "+1",
  });

  const [sports, setSports] = useState([]);
  const [userSports, setUserSports] = useState([]);

  const handleSportToggle = async (sportId) => {
    try {      
      const userId = userData?.user_id;
      if (!userId) {
        console.log('No userId found in userData:')
        return;
      }
      
      const isSportSelected = userSports.some(us => us.sport.sport_id === sportId);

      if (isSportSelected) {
        // Find the user_sport_id for deletion
        const userSport = userSports.find(us => us.sport.sport_id === sportId);
        if (!userSport) return;

        await axios.delete(`${BASE_URL}/api/user-sport/${userId}/${sportId}`);
        setUserSports(current => current.filter(us => us.sport.sport_id !== sportId));
      } else {
        const response = await axios.post(`${BASE_URL}/api/user-sport/add`, {
          userId: parseInt(userId),
          sportId: parseInt(sportId)
        }); 
        const newUserSport = response.data;
        setUserSports(current => [...current, newUserSport]);
      }
    } catch (error) {
      console.error('Error toggling sport:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.log('No token found');
          navigation.navigate('login'); 
          return;
        }

        const decodedToken = decodeToken(token);

        if (!decodedToken) {
          console.log('Invalid token');
          throw new Error('Invalid token');
        }

        const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;
        console.log('User ID from token:', userId);
        
        if (!userId) {
          console.log('No user ID in token');
          throw new Error('User ID not found in token');
        }

        const response = await axios.get(`${BASE_URL}/users/${userId}`);
        const user = response.data;
        
        setUserData(user);
        
        if (user) {
          setFormData(prev => ({
            ...prev,
            username: user.username || "",
            email: user.email || "",
            profile_picture: user.profile_picture || "",
            phone_number: user.phone_number || "",
            phone_country_code: user.phone_country_code || "+1",
            location: user.location || "",
            ...(user.birthdate && {
              birthdate_day: new Date(user.birthdate).getDate().toString().padStart(2, '0'),
              birthdate_month: (new Date(user.birthdate).getMonth() + 1).toString().padStart(2, '0'),
              birthdate_year: new Date(user.birthdate).getFullYear().toString()
            })
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAlertTitle('Error');
        setAlertMessage('Failed to load user data. Please try again.');
        setAlertVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);


  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user-sport/sports`);
        setSports(response.data);
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    const fetchUserSports = async () => {
      try {
        if (!userData?.user_id) return;
        
        const response = await axios.get(`${BASE_URL}/api/user-sport/${userData.user_id}`);
        console.log('Fetched user sports:', response.data);
        setUserSports(response.data);
      } catch (error) {
        console.error('Error fetching user sports:', error);
      }
    };

    if (userData?.user_id) {
      fetchUserSports();
    }
  }, [userData?.user_id]);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSportsModal, setShowSportsModal] = useState(false);

  // Generate date options
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    // Validate birthdate if all fields are filled
    if (
      formData.birthdate_day &&
      formData.birthdate_month &&
      formData.birthdate_year
    ) {
      const date = new Date(
        parseInt(formData.birthdate_year),
        parseInt(formData.birthdate_month) - 1,
        parseInt(formData.birthdate_day)
      );

      if (isNaN(date.getTime()) || date > new Date()) {
        newErrors.birthdate = "Invalid birthdate";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setAlertTitle('Error');
        setAlertMessage('Sorry, we need camera roll permissions to change your profile picture.');
        setAlertVisible(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData((prev) => ({ ...prev, profile_picture: base64Image }));
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      setAlertTitle('Error');
      setAlertMessage('Error selecting image. Please try again.');
      setAlertVisible(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setAlertTitle('Error');
        setAlertMessage('Please log in again to continue.');
        setAlertVisible(true);
        return;
      }

      const decodedToken = decodeToken(token);
      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

      let birthdateToSend = null;
      if (formData.birthdate_day && formData.birthdate_month && formData.birthdate_year) {
        const formattedMonth = formData.birthdate_month.padStart(2, '0');
        const formattedDay = formData.birthdate_day.padStart(2, '0');
        birthdateToSend = `${formData.birthdate_year}-${formattedMonth}-${formattedDay}`;
      }
      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        location: formData.location.trim() || null,
        phone_number: formData.phone_number,
        phone_country_code: formData.phone_country_code,
        birthdate: birthdateToSend,
        ...(formData.profile_picture?.startsWith('data:image') && {
          profile_picture: formData.profile_picture
        })
      };
    
      const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        setAlertTitle('Success');
        setAlertMessage('Profile updated successfully!');
        setAlertVisible(true);
        setTimeout(() => {
          navigation.navigate('Profile');
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertTitle('Error');
      setAlertMessage(error.response?.data?.error || error.message || 'Failed to update profile. Please try again.');
      setAlertVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field,
    placeholder,
    icon,
    keyboardType = "default",
    customStyle = {}
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={[
          styles.input,
          { paddingLeft: 40 },
          errors[field] && styles.inputError,
          customStyle,
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const handleSelectDay = (day) => {
    setFormData((prev) => ({ ...prev, birthdate_day: day }));
    setShowDayPicker(false);
  };

  const handleSelectMonth = (month) => {
    setFormData((prev) => ({ ...prev, birthdate_month: month }));
    setShowMonthPicker(false);   
  };

  const handleSelectYear = (year) => {
    setFormData((prev) => ({ ...prev, birthdate_year: year }));
    setShowYearPicker(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095FF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.imagePickerContainer}
        >
          <Image
            source={{
              uri:
                formData.profile_picture || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <View style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#0095FF" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder={userData?.username || "Name"}
            value={formData.username}
            onChangeText={(value) => handleInputChange("username", value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder={userData?.email || "Email"}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.phoneContainer}>
          <TouchableOpacity
            style={styles.countryCodeContainer}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryCodeLabel}>
              {formData.phone_country_code}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder="(308) 555-0121"
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange("phone_number", value)}
            keyboardType="phone-pad"
          />
        </View>

        {showCountryPicker && (
          <CountryPicker
            visible={showCountryPicker}
            onClose={() => setShowCountryPicker(false)}
            onSelect={(country) => {
              handleInputChange(
                "phone_country_code",
                `+${country.callingCode[0]}`
              );
              setShowCountryPicker(false);
            }}
            withFilter
            withFlag
            withCallingCode
            withEmoji
          />
        )}

        <View style={styles.addressContainer}>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.location}
            onChangeText={(value) => handleInputChange("location", value)}
          />
        </View>

        <Text style={styles.birthdayLabel}>When's your birthday?</Text>
        <View style={styles.birthdateContainer}>
          <TouchableOpacity
            onPress={() => setShowDayPicker(true)}
            style={styles.dateInputContainer}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Day"
              value={formData.birthdate_day}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            style={styles.dateInputContainer}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Month"
              value={formData.birthdate_month}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowYearPicker(true)}
            style={styles.dateInputContainer}
          >
            <TextInput
              style={styles.dateInput}
              placeholder="Year"
              value={formData.birthdate_year}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Day Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showDayPicker}
          onRequestClose={() => setShowDayPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={days}
                keyExtractor={(item) => `day-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectDay(item)}
                    style={styles.pickerItem}
                  >
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Month Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showMonthPicker}
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={months}
                keyExtractor={(item) => `month-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectMonth(item)}
                    style={styles.pickerItem}
                  >
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Year Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showYearPicker}
          onRequestClose={() => setShowYearPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={years}
                keyExtractor={(item) => `year-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectYear(item)}
                    style={styles.pickerItem}
                  >
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.interestsButton}
          onPress={() => setShowSportsModal(true)}
        >
          <Text style={styles.interestsButtonText}>Edit Interests</Text>
        </TouchableOpacity>

        {/* Sports Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showSportsModal}
          onRequestClose={() => setShowSportsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sportsModalContainer}>
              <View style={styles.sportsModalHeader}>
                <Text style={styles.sportsModalTitle}>Select Your Interests</Text>
                <TouchableOpacity onPress={() => setShowSportsModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sportsModalContent}>
                <View style={styles.sportsContainer}>
                  {sports.map((sport) => (
                    <TouchableOpacity
                      key={`sport-${sport.sport_id}`}
                      style={[
                        styles.sportItem,
                        userSports.some(us => us.sport.sport_id === sport.sport_id) && styles.sportItemSelected
                      ]}
                      onPress={() => handleSportToggle(sport.sport_id)}
                    >
                      <View style={styles.sportContent}>
                        <Image 
                          source={iconMap[sport.icon]} 
                          style={styles.sportIcon} 
                        />
                        <Text style={[
                          styles.sportText,
                          userSports.some(us => us.sport.sport_id === sport.sport_id) && styles.sportTextSelected
                        ]}>
                          {sport.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setShowSportsModal(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Navbar />
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4FF",
    padding: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: "#0095FF",
    fontSize: 14,
    marginLeft: 5,
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    width: "30%",
  },
  countryCodeLabel: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  birthdayLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 16,
  },
  birthdateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "31%",
    height: 56,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#0095FF",
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#bbb",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerItem: {
    padding: 16,
  },
  pickerText: {
    fontSize: 18,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80, 
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  sportItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 4,
    width: '30%',
  },
  sportItemSelected: {
    backgroundColor: '#0095FF',
    borderColor: '#0095FF',
  },
  sportContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  sportText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  sportTextSelected: {
    color: 'white',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  interestsButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestsButtonText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  sportsModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    marginTop: 'auto',
  },
  sportsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sportsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066FF',
  },
  sportsModalContent: {
    padding: 16,
  },
  doneButton: {
    backgroundColor: '#0095FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;