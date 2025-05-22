import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert, // React Native Alert, React Native projeleri için uygundur
} from 'react-native';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ÖNEMLİ: Kendi geçerli Google Gemini API anahtarınızı buraya yapıştırın.
// Bu anahtar bir yer tutucudur ve çalışmayacaktır.
// Anahtarınızı Google Cloud Console'dan (Generative Language API etkinleştirilmiş olmalı) alın.
const API_KEY = 'AIzaSyD_CBfMy5KmnVi14hCUaO5l9AEbO4BWRkY'; // API anahtarınız buraya eklendi!

interface Message {
  text: string;
  isUser: boolean;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null); // ScrollView referansı eklendi

  // Google Generative AI istemcisini başlat
  // API_KEY'in geçerli olduğundan ve Generative Language API'nin etkinleştirildiğinden emin olun!
  let genAI;
  try {
    if (!API_KEY) {
      throw new Error('API anahtarı eksik veya geçersiz. Lütfen ChatBox.js dosyasındaki API_KEY değişkenini kendi anahtarınızla güncelleyin.');
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  } catch (e: any) {
    // Hata mesajını doğrudan Alert ile göster
    Alert.alert('Yapılandırma Hatası', e.message, [{ text: 'Tamam' }]);
    console.error(e.message);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>API Anahtarı Yapılandırma Hatası. Lütfen konsolu kontrol edin.</Text>
      </View>
    );
  }


  // Mesajlar değiştikçe ScrollView'i en alta kaydır
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    try {
      setIsLoading(true);

      // Kullanıcının mesajını sohbet geçmişine ekle
      setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

      // Modeli başlatırken 'gemini-pro' yerine 'gemini-1.0-pro' kullanıldı.
      // Eğer hala hata alıyorsanız, API anahtarınızın doğru olduğundan ve
      // Generative Language API'nin Google Cloud projenizde etkinleştirildiğinden emin olun.
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // Bu model adı daha güvenilir çalışır
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // Sohbet geçmişini oluştur
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'Sen bir moda danışmanısın. Kullanıcının hava durumu verilerine göre kombin önerisi yapmalısın.' }],
          },
          {
            role: 'model',
            parts: [{ text: 'Merhaba! Ben bir moda danışmanıyım. Hava durumu verilerinize göre size en uygun kombin önerilerini sunacağım. Lütfen bulunduğunuz şehrin hava durumu bilgilerini paylaşın.' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      const prompt = `Hava durumu verisi: ${userMessage}
Lütfen şu formatta yanıt ver:
1. Hava durumu analizi
2. Önerilen kombinler
3. Aksesuar önerileri
4. Ekstra tavsiyeler`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('AI yanıt vermedi');
      }

      // AI yanıtını sohbet geçmişine ekle
      setMessages(prev => [
        ...prev,
        { text, isUser: false },
      ]);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = 'Üzgünüm, bir hata oluştu. ';

      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage += 'API anahtarı geçersiz. Lütfen Google Cloud Console\'dan doğru API anahtarını aldığınızdan ve Generative Language API\'yi projenizde etkinleştirdiğinizden emin olun.';
        } else if (error.message.includes('quota')) {
          errorMessage += 'API kotası doldu. Lütfen daha sonra tekrar deneyin veya kota limitlerinizi kontrol edin.';
        } else if (error.message.includes('network')) {
          errorMessage += 'İnternet bağlantısı hatası. Lütfen cihazınızın internete bağlı olduğundan emin olun.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Model bulunamadı veya desteklenmiyor. API anahtarınızı ve model adınızı (`gemini-1.0-pro`) kontrol edin.';
        }
        else {
          errorMessage += error.message;
        }
      }

      // React Native Alert kullanıldı
      Alert.alert(
        'Hata',
        errorMessage,
        [{ text: 'Tamam', onPress: () => console.log('Hata alert kapatıldı') }]
      );

      // Hata mesajını da sohbet geçmişine ekle (isteğe bağlı)
      setMessages(prev => [
        ...prev,
        { text: errorMessage, isUser: false },
      ]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      generateResponse(inputText);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContentContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0000ff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Hava durumu verilerini girin..."
          multiline
          scrollEnabled={true}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContentContainer: {
    paddingBottom: 10, // Mesajların en altta boşluk bırakması için
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5, // Köşe yuvarlama düzeltmeleri
  },
  aiMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5, // Köşe yuvarlama düzeltmeleri
  },
  messageText: {
    fontSize: 16,
    color: '#000', // Varsayılan metin rengi
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end', // TextInput'ı alta hizala
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100, // TextInput'ın maksimum yüksekliği
    minHeight: 40, // TextInput'ın minimum yüksekliği
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10, // Düğme yüksekliğini artır
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row', // Yükleniyor metnini ve göstergeyi yan yana getir
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0000ff',
  },
  errorContainer: { // Yeni hata konteyneri stili
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fdd',
  },
  errorText: { // Yeni hata metni stili
    color: '#f00',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ChatBox;
