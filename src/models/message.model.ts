import mongoose, { Document, Schema } from "mongoose";

export interface MessageDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  image?: string;
  replyTo?: mongoose.Types.ObjectId;
  isEdit: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId, // Tin nhắn này thuộc về cuộc hội thoại nào (Quan hệ 1-n).
      ref: "Chat",
      required: true,
    },
    content: { type: String }, // Nội dung tin nhắn bằng văn bản (text).
    image: { type: String },
    sender: {
      // Người gửi tin nhắn này.
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message", // Tham chiếu đến tin nhắn gốc nếu đây là một tin nhắn trả lời (Reply).
      default: null,
    },
    isEdit: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);

export default MessageModel;
