import {
  getMessages,
  insertMessage,
  editMessage,
  deleteMessage,
} from "../api/messages.api";

export default class MessageService {
  async getMessages(options) {
    return getMessages(options);
  }

  async sendMessage(options) {
    return insertMessage(options);
  }

  async editMessage(messageId, userId, content) {
    return editMessage(messageId, userId, content);
  }

  async deleteMessage(messageId, userId) {
    return deleteMessage(messageId, userId);
  }
}