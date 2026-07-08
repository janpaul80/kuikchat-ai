

export interface StatusReplyInfo {
  content: string;
  type: 'image' | 'video' | 'text';
  backgroundColor?: string;
  senderName: string;
  caption?: string;
}

export interface Media {
  type: 'image' | 'video' | 'gif' | 'sticker' | 'document' | 'audio' | 'video_note';
  url: string;
  fileName?: string;
  fileSize?: string;
  duration?: string; // for audio/video
}

export interface ReplyInfo {
  messageId: string;
  senderName: string;
  text?: string;
  media?: Media;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
}

export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';

export type TextEffect = 'none' | 'big' | 'small' | 'shake' | 'nod' | 'explode' | 'ripple' | 'bloom' | 'jitter';

export interface Message {
  id: string;
  text?: string;
  textEffect?: TextEffect; // New property for text effects
  timestamp: string; // Display time
  sentAt: number; // For expiry calculation
  senderId: string;
  isBot?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: { [key: string]: string[] };
  statusReply?: StatusReplyInfo;
  replyTo?: ReplyInfo;
  media?: Media;
  event?: CalendarEvent;
  type?: 'user' | 'system';
  disappearsAt?: number;
  transcript?: string;
  scheduledFor?: number; // Timestamp for when the message should be sent
  repeatInterval?: RepeatInterval;
  isVanish?: boolean; // New: message belongs to a vanish mode session
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isBot?: boolean;
  isVerified?: boolean;
  about?: string;
  aboutExpiresAt?: number;
  profileColor?: string;
}

// Base interface for all chat types
interface BaseChat {
  id:string;
  messages: Message[];
  disappearingMessagesTimer?: number; // Duration in ms, 0 or undefined means off.
  isHidden?: boolean;
  pinnedMessages?: string[]; // Array of message IDs
  scheduledMessages?: Message[]; // Messages waiting to be sent
  theme?: string; // New: Chat theme ID
  isVanishMode?: boolean; // New: Is Vanish Mode active
}

// Chat with a single user
export interface IndividualChat extends BaseChat {
  type: 'individual';
  user: User;
}

// Group chat with multiple users
export interface GroupChat extends BaseChat {
  type: 'group';
  name: string;
  avatar: string;
  participants: User[];
  admins: string[]; // array of user IDs
  permissions: {
    sendMessages: 'all' | 'admins';
    editInfo: 'all' | 'admins';
  };
}

// Channel within a community
export interface ChannelChat extends BaseChat {
  type: 'channel';
  name: string; // e.g., "#general"
  avatar: string; // Community avatar
  communityId: string;
  communityName: string;
}

// FIX: Define and export the missing PublicChannelChat interface.
// This type is used in ChannelsList.tsx for discoverable channels.
export interface PublicChannelChat extends BaseChat {
  type: 'public_channel';
  name: string;
  avatar: string;
  description: string;
  followerCount: number;
  isFollowing: boolean;
}

// Union type for any kind of chat
// FIX: Add PublicChannelChat to the Chat union type.
export type Chat = IndividualChat | GroupChat | ChannelChat | PublicChannelChat;

// Community Interface
export interface Community {
  id: string;
  name: string;
  avatar: string;
  description: string;
  channels: ChannelChat[];
  joined: boolean;
}


// Interfaces for the new Status feature
export interface StatusItem {
  id: string;
  type: 'image' | 'video' | 'text';
  content: string; // URL for image/video, text content for text
  caption?: string;
  timestamp: number; // Use number (Date.now()) for easier comparison
  duration: number; // in milliseconds, for image/text
  backgroundColor?: string; // For text statuses
}

export interface UserStatus {
  userId: string;
  userName: string;
  userAvatar: string;
  items: StatusItem[];
}