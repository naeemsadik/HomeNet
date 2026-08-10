import {
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppChrome } from "@/components/AppChrome";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, webPointer } from "@/theme";

interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  isVerified: boolean;
  propertyTitle: string;
  propertyLocation: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    name: "Farhan Ahmed",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    isOnline: true,
    isVerified: true,
    propertyTitle: "Skyview Residence",
    propertyLocation: "Gulshan 2",
    lastMessage: "Sure, the apartment is available for a visit tomorrow.",
    timestamp: "10:24",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    name: "Abrar",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    isOnline: false,
    isVerified: true,
    propertyTitle: "Lakeside Duplex",
    propertyLocation: "Baridhara",
    lastMessage: "The final price is negotiable for serious buyers.",
    timestamp: "Yesterday",
  },
  {
    id: "conv-3",
    name: "Tanvir Hasan",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    isOnline: true,
    isVerified: false,
    propertyTitle: "Modern 2BR",
    propertyLocation: "Dhanmondi",
    lastMessage: "You: I'll get back to you shortly.",
    timestamp: "Mon",
  },
];

const mockChatMessages: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "m-1",
      sender: "user",
      text: "Hi, is the Skyview apartment still available?",
      timestamp: "10:02",
    },
    {
      id: "m-2",
      sender: "agent",
      text: "Hello! Yes it is. Would you like to schedule a visit?",
      timestamp: "10:15",
    },
    {
      id: "m-3",
      sender: "user",
      text: "Yes please, sometime this week?",
      timestamp: "10:20",
    },
    {
      id: "m-4",
      sender: "agent",
      text: "Sure, the apartment is available for a visit tomorrow.",
      timestamp: "10:24",
    },
  ],
};

const quickSuggestions = [
  "Is it still available?",
  "Can I schedule a visit?",
  "Is the price negotiable?",
];

export function MessagesScreen() {
  const { isPhone } = useResponsive();
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(
    mockChatMessages["conv-1"] || []
  );

  const activeConv =
    mockConversations.find((c) => c.id === activeConvId) || mockConversations[0];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");
  };

  return (
    <AppChrome active="messages">
      <View style={[styles.container, isPhone && styles.containerPhone]}>
        {/* Left Conversations Panel */}
        <View style={[styles.conversationsPanel, isPhone && styles.conversationsPanelPhone]}>
          <Text style={styles.panelTitle}>Messages</Text>

          {/* Search Conversations Input */}
          <View style={styles.searchBox}>
            <Search color="#899790" size={16} />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search conversations"
              placeholderTextColor="#899790"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          {/* Conversations List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.conversationsScroll}>
            {mockConversations
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <Pressable
                    key={conv.id}
                    onPress={() => {
                      setActiveConvId(conv.id);
                      setMessages(mockChatMessages[conv.id] || []);
                    }}
                    style={[
                      styles.convItem,
                      isActive && styles.convItemActive,
                      webPointer,
                    ]}
                  >
                    <View style={styles.avatarWrap}>
                      <Image source={{ uri: conv.avatarUrl }} style={styles.avatarImg} />
                      {conv.isOnline && <View style={styles.onlineDot} />}
                    </View>

                    <View style={styles.convDetails}>
                      <View style={styles.convHeaderRow}>
                        <Text style={styles.convName}>{conv.name}</Text>
                        <Text style={styles.convTime}>{conv.timestamp}</Text>
                      </View>

                      <View style={styles.propertyBadgeRow}>
                        <Text numberOfLines={1} style={styles.propertyBadgeText}>
                          {conv.propertyTitle} — {conv.propertyLocation}
                        </Text>
                      </View>

                      <Text numberOfLines={1} style={styles.convPreview}>
                        {conv.lastMessage}
                      </Text>
                    </View>

                    {conv.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>

        {/* Right Active Chat Panel */}
        <View style={styles.chatPanel}>
          {/* Active Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderUser}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: activeConv.avatarUrl }} style={styles.avatarImg} />
                {activeConv.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={{ gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.chatHeaderName}>{activeConv.name}</Text>
                  {activeConv.isVerified && (
                    <CheckCircle2 color="#0F6D55" size={16} />
                  )}
                </View>
                <Text style={styles.chatHeaderStatus}>
                  {activeConv.isOnline ? "Online now" : "Offline"}
                </Text>
              </View>
            </View>

            <View style={styles.chatHeaderIcons}>
              <Pressable style={({ pressed }) => [styles.headerIconBtn, webPointer, pressed && styles.pressed]}>
                <Phone color="#0B1A17" size={18} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.headerIconBtn, webPointer, pressed && styles.pressed]}>
                <Video color="#0B1A17" size={18} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.headerIconBtn, webPointer, pressed && styles.pressed]}>
                <MoreVertical color="#0B1A17" size={18} />
              </Pressable>
            </View>
          </View>

          {/* Property Context Bar */}
          <View style={styles.propertyContextBar}>
            <View style={styles.propertyContextInfo}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80",
                }}
                style={styles.propertyContextThumb}
              />
              <View style={{ gap: 2 }}>
                <Text style={styles.propertyContextTitle}>
                  {activeConv.propertyTitle} — {activeConv.propertyLocation}
                </Text>
                <Text style={styles.propertyContextSub}>Discussion about this listing</Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Schedule Visit",
                  `Requesting visit appointment with ${activeConv.name} for ${activeConv.propertyTitle}.`
                )
              }
              style={({ pressed }) => [styles.scheduleVisitBtn, webPointer, pressed && styles.pressed]}
            >
              <Calendar color="#FFFFFF" size={15} />
              <Text style={styles.scheduleVisitText}>Schedule visit</Text>
            </Pressable>
          </View>

          {/* Chat Messages Body */}
          <ScrollView contentContainerStyle={styles.messagesBody} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAgent,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.messageBubbleUser : styles.messageBubbleAgent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.messageTextUser : styles.messageTextAgent,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isUser ? styles.messageTimeUser : styles.messageTimeAgent,
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Suggestions Pills */}
          <View style={styles.suggestionsRow}>
            {quickSuggestions.map((sug) => (
              <Pressable
                key={sug}
                onPress={() => handleSendMessage(sug)}
                style={({ pressed }) => [styles.suggestionPill, webPointer, pressed && styles.pressed]}
              >
                <Text style={styles.suggestionPillText}>{sug}</Text>
              </Pressable>
            ))}
          </View>

          {/* Message Input Footer Bar */}
          <View style={styles.inputFooter}>
            <Pressable style={({ pressed }) => [styles.attachBtn, webPointer, pressed && styles.pressed]}>
              <ImageIcon color="#5C6B66" size={20} />
            </Pressable>

            <TextInput
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              placeholder="Type a message..."
              placeholderTextColor="#899790"
              style={styles.messageInput}
              value={inputText}
            />

            <Pressable
              onPress={() => handleSendMessage()}
              style={({ pressed }) => [styles.sendBtn, webPointer, pressed && styles.pressed]}
            >
              <Send color="#FFFFFF" size={16} />
            </Pressable>
          </View>
        </View>
      </View>
    </AppChrome>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    overflow: "hidden",
    minHeight: 680,
  },
  containerPhone: {
    flexDirection: "column",
  },
  conversationsPanel: {
    width: 320,
    borderRightWidth: 0.8,
    borderRightColor: "rgba(11,26,23,0.08)",
    backgroundColor: "#FAFBFB",
    padding: 20,
    gap: 16,
  },
  conversationsPanelPhone: {
    width: "100%",
    height: 260,
  },
  panelTitle: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    color: "#0B1A17",
  },
  searchBox: {
    height: 40,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  conversationsScroll: {
    flex: 1,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    marginBottom: 6,
    position: "relative",
  },
  convItemActive: {
    backgroundColor: "#E7F2EE",
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: "relative",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0F6D55",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  convDetails: {
    flex: 1,
    gap: 2,
  },
  convHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convName: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  convTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  propertyBadgeRow: {
    alignSelf: "flex-start",
  },
  propertyBadgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#0F6D55",
  },
  convPreview: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  unreadBadge: {
    backgroundColor: "#F4823A",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  chatPanel: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  chatHeader: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
  },
  chatHeaderUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  chatHeaderStatus: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#0F6D55",
  },
  chatHeaderIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  propertyContextBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(11,26,23,0.08)",
  },
  propertyContextInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  propertyContextThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  propertyContextTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: "#0B1A17",
  },
  propertyContextSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: "#5C6B66",
  },
  scheduleVisitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4823A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scheduleVisitText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  messagesBody: {
    flexGrow: 1,
    padding: 24,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    width: "100%",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAgent: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  messageBubbleUser: {
    backgroundColor: "#0F6D55",
    borderBottomRightRadius: 4,
  },
  messageBubbleAgent: {
    backgroundColor: "#F4F6F5",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  messageTextUser: {
    color: "#FFFFFF",
  },
  messageTextAgent: {
    color: "#0B1A17",
  },
  messageTime: {
    fontSize: 10,
    fontFamily: fonts.regular,
    alignSelf: "flex-end",
  },
  messageTimeUser: {
    color: "rgba(255,255,255,0.7)",
  },
  messageTimeAgent: {
    color: "#5C6B66",
  },
  suggestionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexWrap: "wrap",
  },
  suggestionPill: {
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(11,26,23,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  suggestionPillText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#0B1A17",
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 0.8,
    borderTopColor: "rgba(11,26,23,0.08)",
    backgroundColor: "#FFFFFF",
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  messageInput: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 18,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#0B1A17",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F6D55",
    alignItems: "center",
    justifyContent: "center",
  },
});
