// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import Calendar from "react-native-calendars"; 
// import axios from "axios";

// const CalendarPage = () => {
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchEvents = (date) => {
//     setLoading(true);
//     axios
//       .get(`http://localhost:3000/events?date=${date}`)
//       .then((response) => {
//         setEvents(response.data);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching events:", error);
//         setLoading(false);
//       });
//   };

//   const handleDayPress = (day) => {
//     setSelectedDate(day.dateString);
//     fetchEvents(day.dateString);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity>
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#555" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Calendar</Text>
//         <TouchableOpacity>
//           <MaterialCommunityIcons name="calendar-outline" size={24} color="#555" />
//         </TouchableOpacity>
//       </View>

//       {/* Calendar */}
//       <Calendar
//         onDayPress={handleDayPress}
//         markedDates={{
//           [selectedDate]: { selected: true, selectedColor: "#6C63FF" },
//         }}
//         theme={{
//           todayTextColor: "#6C63FF",
//           arrowColor: "#6C63FF",
//         }}
//         style={styles.calendar}
//       />

//       {/* Event List */}
//       <View style={styles.eventsContainer}>
//         {loading ? (
//           <Text style={styles.loadingText}>Loading...</Text>
//         ) : events.length > 0 ? (
//           <FlatList
//             data={events}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.eventItem}>
//                 <View style={styles.eventTimeContainer}>
//                   <Text style={styles.eventTime}>{item.time}</Text>
//                   <MaterialCommunityIcons name="map-marker-outline" size={16} color="#555" />
//                   <Text style={styles.eventLocation}>{item.location}</Text>
//                 </View>
//                 <Text style={styles.eventTitle}>{item.title}</Text>
//                 <Text style={styles.eventParticipants}>
//                   <MaterialCommunityIcons name="account-multiple" size={16} color="#555" />
//                   {` Participants: ${item.participants}`}
//                 </Text>
//               </View>
//             )}
//           />
//         ) : (
//           <Text style={styles.noEventsText}>No events for this day.</Text>
//         )}
//       </View>

//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.fab}>
//         <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default CalendarPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#555",
//   },
//   calendar: {
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   eventsContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   loadingText: {
//     textAlign: "center",
//     color: "#555",
//     fontSize: 16,
//   },
//   noEventsText: {
//     textAlign: "center",
//     color: "#aaa",
//     fontSize: 16,
//   },
//   eventItem: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   eventTimeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   eventTime: {
//     fontSize: 14,
//     color: "#555",
//     marginRight: 5,
//   },
//   eventLocation: {
//     fontSize: 14,
//     color: "#555",
//   },
//   eventTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 5,
//   },
//   eventParticipants: {
//     fontSize: 14,
//     color: "#555",
//   },
//   fab: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: "#6C63FF",
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//   },
// });
