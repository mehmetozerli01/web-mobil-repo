import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatBox from '../../components/ChatBox';

const ChatScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ChatBox />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ChatScreen; 