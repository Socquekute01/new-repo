import { chatbotAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Suggestion {
  productId: string;
  name: string;
  thumbnailUrl?: string;
  price?: number;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  suggestions?: Suggestion[];
}

interface ChatLog {
  message?: string;
  response?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const navigate = (path: string) => router.push(path as any);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedHistory = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || hasLoadedHistory.current) return;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setError("");
      try {
        const response = await chatbotAPI.getHistory();
        const logs: ChatLog[] = Array.isArray(response?.data)
          ? response.data
          : [];
        const history = logs
          .slice()
          .reverse()
          .flatMap((log) => {
            const items: Message[] = [];
            if (log?.message) items.push({ role: "user", text: log.message });
            if (log?.response)
              items.push({ role: "assistant", text: log.response });
            return items;
          });
        setMessages(history);
        hasLoadedHistory.current = true;
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isSending, isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || isSending) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setIsSending(true);

    try {
      const response = await chatbotAPI.chat({ message: messageText });
      const reply = response?.data?.response || response?.data?.message;
      const suggestions: Suggestion[] = Array.isArray(
        response?.data?.suggestions,
      )
        ? response.data.suggestions
        : [];

      if (!reply) throw new Error("Empty response");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, suggestions },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setError("Không thể kết nối chatbot. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  const SuggestionCard = ({ item }: { item: Suggestion }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() => navigate(`/product/${item.productId}`)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionImageContainer}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.suggestionImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.suggestionImagePlaceholder}>
            <Text style={styles.suggestionImagePlaceholderText}>No image</Text>
          </View>
        )}
      </View>
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName} numberOfLines={1}>
          {item.name}
        </Text>
        {typeof item.price === "number" && (
          <Text style={styles.suggestionPrice}>
            {item.price.toLocaleString("vi-VN")}₫
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const MessageBubble = ({ msg, index }: { msg: Message; index: number }) => {
    const isUser = msg.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text
            style={isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant}
          >
            {msg.text}
          </Text>
          {!isUser &&
            Array.isArray(msg.suggestions) &&
            msg.suggestions.length > 0 && (
              <View style={styles.suggestionsGrid}>
                {msg.suggestions.map((item) => (
                  <SuggestionCard key={item.productId} item={item} />
                ))}
              </View>
            )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleToggle}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <View style={styles.chatContainer}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Trợ lý mua sắm</Text>
                  <Text style={styles.headerSubtitle}>
                    Hỏi về sản phẩm, size, giá, hoặc gợi ý
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleToggle}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() =>
                  scrollRef.current?.scrollToEnd({ animated: true })
                }
              >
                {!isAuthenticated && (
                  <View style={styles.authNotice}>
                    <Text style={styles.authNoticeText}>
                      Vui lòng đăng nhập để sử dụng chatbot.
                    </Text>
                  </View>
                )}

                {isLoadingHistory && (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#9ca3af" />
                    <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
                  </View>
                )}

                {messages.length === 0 &&
                  isAuthenticated &&
                  !isLoadingHistory && (
                    <Text style={styles.emptyText}>
                      Bạn muốn tìm sản phẩm gì hôm nay?
                    </Text>
                  )}

                {messages.map((msg, index) => (
                  <MessageBubble
                    key={`${msg.role}-${index}`}
                    msg={msg}
                    index={index}
                  />
                ))}

                {isSending && (
                  <View style={[styles.messageRow, styles.messageRowAssistant]}>
                    <View style={[styles.bubble, styles.bubbleAssistant]}>
                      <ActivityIndicator size="small" color="#6b7280" />
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputContainer}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.inputRow}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Nhập câu hỏi..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    style={styles.textInput}
                    editable={isAuthenticated && !isSending}
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!isAuthenticated || isSending || !input.trim()}
                    style={[
                      styles.sendButton,
                      (!isAuthenticated || isSending || !input.trim()) &&
                        styles.sendButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sendButtonIcon}>➤</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handleToggle}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 50,
    alignItems: "flex-end",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  keyboardAvoid: {
    width: "100%",
  },
  chatContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: Dimensions.get("window").height * 0.8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  closeButtonText: {
    fontSize: 12,
    color: "#6b7280",
  },

  messageList: {
    height: 320,
    paddingHorizontal: 16,
  },
  messageListContent: {
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleUser: {
    backgroundColor: "#000000",
  },
  bubbleAssistant: {
    backgroundColor: "#f3f4f6",
  },
  bubbleTextUser: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 20,
  },
  bubbleTextAssistant: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },

  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  suggestionCard: {
    width: (SCREEN_WIDTH * 0.75 - 24 - 12) / 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  suggestionImageContainer: {
    height: 64,
    backgroundColor: "#f3f4f6",
  },
  suggestionImage: {
    width: "100%",
    height: "100%",
  },
  suggestionImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionImagePlaceholderText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  suggestionInfo: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  suggestionName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  suggestionPrice: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  authNotice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    padding: 12,
  },
  authNoticeText: {
    fontSize: 14,
    color: "#374151",
  },

  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  sendButtonIcon: {
    color: "#ffffff",
    fontSize: 14,
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 16,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default Chatbot;
