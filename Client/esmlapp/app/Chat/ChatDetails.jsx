import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    TextInput,
    ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatDetails = ({ route, navigation }) => {
    const { user } = route.params;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                    <Image source={{ uri: user.image }} style={styles.userImage} />
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userStatus}>{user.status}</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity>
                        <Ionicons name="call" size={24} color="#6200ee" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="videocam" size={24} color="#6200ee" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <ScrollView style={styles.messagesContainer}>
                <View style={styles.messageReceived}>
                    <Text style={styles.messageText}>Are you still travelling?</Text>
                </View>

                <View style={styles.messageSent}>
                    <Text style={styles.messageText}>Yes, I'm at Istanbul..</Text>
                </View>

                <View style={styles.messageReceived}>
                    <Text style={styles.messageText}>OoOo, Thats so Cool!</Text>
                </View>

                <View style={styles.messageReceived}>
                    <Text style={styles.messageText}>Raining??</Text>
                </View>

                <View style={styles.messageSent}>
                    <Text style={styles.messageText}>Yes, I'm at Istanbul..</Text>
                </View>

                <Text style={styles.dateText}>Thursday 24, 2022</Text>

                <View style={styles.messageReceived}>
                    <Text style={styles.messageText}>Hi, Did you heared?</Text>
                </View>
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Send Message"
                    placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Ionicons name="mic" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingTop: 44,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 15,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userStatus: {
        fontSize: 12,
        color: '#666',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageReceived: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 20,
        borderTopLeftRadius: 5,
        maxWidth: '80%',
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    messageSent: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 20,
        borderTopRightRadius: 5,
        maxWidth: '80%',
        marginBottom: 12,
        alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    dateText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#6200ee',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatDetails;