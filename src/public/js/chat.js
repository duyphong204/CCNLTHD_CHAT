// Socket.io Chat Client
const socket = io();

let currentChatId = null;
let currentUser = null;
let onlineUsers = new Set();
let chatsCache = [];
let usersCache = [];
let replyToMessage = null;
let imageAttachment = null;

const ONLINE_TEXT = "Online";
const OFFLINE_TEXT = "Offline";
const DISPLAY_FLEX = "flex";

const messagesByChat = new Map();

// ========================
// DOM Elements
// ========================
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const searchChat = document.getElementById("searchChat");
const searchUser = document.getElementById("searchUser");
const chatsList = document.getElementById("chatsList");
const usersList = document.getElementById("usersList");
const messagesArea = document.getElementById("messagesArea");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");
const chatContent = document.getElementById("chatContent");
const chatEmpty = document.querySelector(".chat-empty");
const chatName = document.getElementById("chatName");
const chatStatus = document.getElementById("chatStatus");
const createGroupBtn = document.getElementById("createGroupBtn");
const createGroupModal = document.getElementById("createGroupModal");
const createGroupForm = document.getElementById("createGroupForm");
const groupNameInput = document.getElementById("groupName");
const userCheckboxList = document.getElementById("userCheckboxList");
const modalClose = document.querySelector(".modal-close");
const btnCancel = document.querySelector(".btn-cancel");
const replyPreview = document.getElementById("replyPreview");
const replySender = document.getElementById("replySender");
const replyText = document.getElementById("replyText");
const cancelReplyBtn = document.getElementById("cancelReplyBtn");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImageBtn = document.getElementById("removeImageBtn");

initializeUI();

// ========================
// Tab Navigation
// ========================
function bindTabNavigation() {
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");
    });
  });
}

// ========================
// Socket Events
// ========================
socket.on("connect", async () => {
  console.log("Connected to server");
  await initializePageData();
});

socket.on("online:users", (users) => {
  onlineUsers = new Set(users || []);
  updateOnlineStatus();
});

socket.on("message:new", (message) => {
  const chatId = normalizeId(message.chatId);
  if (!chatId) return;

  const inserted = upsertMessageCache(chatId, message);
  if (inserted && chatId === currentChatId) {
    addMessageToUI(message);
  }

  updateChatLastMessage(chatId, message);
});

// Backend emit event nay la chat:new
socket.on("chat:new", (chat) => {
  upsertChatCache(chat);
  displayChats(getFilteredChats(searchChat.value));
});

socket.on("chat:update", ({ chatId, lastMessage }) => {
  if (!chatId || !lastMessage) return;
  updateChatLastMessage(chatId, lastMessage);
});

// ========================
// Initialize
// ========================
async function initializePageData() {
  await getCurrentUser();
  await Promise.all([loadUsers(), loadChats()]);
}

// ========================
// Load Data Functions
// ========================
async function loadChats() {
  try {
    const data = await fetchJSON("/api/chat/all");

    chatsCache = Array.isArray(data.chats) ? data.chats : [];
    displayChats(getFilteredChats(searchChat.value));
  } catch (error) {
    console.error("Error loading chats:", error);
    chatsList.innerHTML = '<div class="loading">Lỗi khi tải chat</div>';
  }
}

async function loadUsers() {
  try {
    const data = await fetchJSON("/api/user/all");

    usersCache = Array.isArray(data.users) ? data.users : [];
    displayUsers(getFilteredUsers(searchUser.value));
    populateUserCheckbox(usersCache);
  } catch (error) {
    console.error("Error loading users:", error);
    usersList.innerHTML = '<div class="loading">Lỗi khi tải user</div>';
  }
}

async function loadMessages(chatId) {
  try {
    const data = await fetchJSON(`/api/chat/${chatId}`);

    if (data.chat && data.messages) {
      messagesByChat.set(chatId, data.messages);
      displayMessages(data.chat, data.messages);
      socket.emit("chat:join", chatId, (err) => {
        if (err) console.error(err);
      });
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    messagesArea.innerHTML = '<div class="loading">Lỗi khi tải tin nhắn</div>';
  }
}

// ========================
// Display Functions
// ========================
function displayChats(chats) {
  if (!Array.isArray(chats) || chats.length === 0) {
    chatsList.innerHTML =
      '<div class="loading">Chưa có cuộc trò chuyện nào</div>';
    return;
  }

  chatsList.innerHTML = chats
    .map((chat) => {
      const chatId = normalizeId(chat._id);
      const chatTitle = getChatTitle(chat);
      const lastMessage = getLastMessagePreview(chat.lastMessage);
      const isActive = currentChatId === chatId;
      const isOnline = getChatOnlineState(chat);

      return `
        <div class="chat-item ${isActive ? "active" : ""}" data-chat-id="${chatId}">
          <div class="avatar">${escapeHtml(chatTitle.charAt(0).toUpperCase())}</div>
          <div class="chat-info-item">
            <div class="chat-name">${escapeHtml(chatTitle)}</div>
            <div class="chat-preview">${escapeHtml(lastMessage)}</div>
          </div>
          ${isOnline ? '<div class="online-badge"></div>' : ""}
        </div>
      `;
    })
    .join("");
}

function displayUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    usersList.innerHTML = '<div class="loading">Không có user nào</div>';
    return;
  }

  usersList.innerHTML = users
    .map((user) => {
      const isOnline = onlineUsers.has(normalizeId(user._id));
      return `
        <div class="user-item" data-user-id="${normalizeId(user._id)}" data-user-name="${escapeHtml(user.name || "")}">
          <div class="avatar">${escapeHtml((user.name || "?").charAt(0).toUpperCase())}</div>
          <div class="chat-info-item">
            <div class="user-name">${escapeHtml(user.name || "Người dùng")}</div>
            <div class="user-status">${isOnline ? "Online" : "Offline"}</div>
          </div>
          ${isOnline ? '<div class="online-badge"></div>' : ""}
        </div>
      `;
    })
    .join("");
}

function displayMessages(chat, messages) {
  const chatTitle = getChatTitle(chat);
  chatName.textContent = chatTitle;

  chatStatus.textContent = getChatStatusText(chat);

  messagesArea.innerHTML = (messages || []).map(renderMessageItem).join("");

  messagesArea.scrollTop = messagesArea.scrollHeight;
  setElementVisible(chatContent, true, DISPLAY_FLEX);
  setElementVisible(chatEmpty, false);
}

function renderMessageItem(msg) {
  const senderId = normalizeId(msg.sender);
  const senderName =
    typeof msg.sender === "object" ? msg.sender?.name || "" : "";
  const replySenderName =
    typeof msg.replyTo?.sender === "object"
      ? msg.replyTo.sender?.name || ""
      : "";

  return `
    <div class="message ${senderId === normalizeId(currentUser?._id) ? "own" : "other"}" data-message-id="${normalizeId(msg._id)}">
      <div class="message-bubble">
        ${
          msg.replyTo
            ? `<div class="reply-badge"><strong>${escapeHtml(replySenderName || "Tin nhắn cũ")}</strong><div>${escapeHtml(msg.replyTo.content || "[Ảnh]")}</div></div>`
            : ""
        }
        ${msg.content ? `<div class="message-text">${escapeHtml(msg.content)}</div>` : ""}
        ${msg.image ? `<div class="message-image"><img src="${msg.image}" alt="Ảnh tin nhắn" /></div>` : ""}
        <div class="message-time">${formatTime(msg.createdAt)}</div>
        <button type="button" class="reply-btn" data-message-id="${normalizeId(msg._id)}" data-sender-name="${escapeHtml(senderName)}">Trả lời</button>
      </div>
    </div>
  `;
}

function addMessageToUI(message) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderMessageItem(message).trim();
  const element = wrapper.firstElementChild;
  if (element) {
    messagesArea.appendChild(element);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

function populateUserCheckbox(users) {
  userCheckboxList.innerHTML = users
    .map(
      (user) => `
        <div class="checkbox-item">
          <input type="checkbox" name="participant" value="${normalizeId(user._id)}" id="user-${normalizeId(user._id)}">
          <label for="user-${normalizeId(user._id)}">${escapeHtml(user.name || "Người dùng")}</label>
        </div>
      `,
    )
    .join("");
}

// ========================
// Actions
// ========================
function initializeUI() {
  bindTabNavigation();
  bindUIEvents();
}

function bindUIEvents() {
  chatsList.addEventListener("click", handleChatListClick);
  usersList.addEventListener("click", handleUserListClick);
  messageForm.addEventListener("submit", handleMessageFormSubmit);
  createGroupBtn.addEventListener("click", () => {
    setCreateGroupModalVisible(true);
  });
  modalClose.addEventListener("click", () => {
    setCreateGroupModalVisible(false);
  });
  btnCancel.addEventListener("click", () => {
    setCreateGroupModalVisible(false);
  });
  createGroupModal.addEventListener("click", handleCreateGroupModalClick);
  createGroupForm.addEventListener("submit", handleCreateGroupFormSubmit);
  searchChat.addEventListener("input", handleSearchChatInput);
  searchUser.addEventListener("input", handleSearchUserInput);
  messagesArea.addEventListener("click", handleMessagesAreaClick);
  cancelReplyBtn.addEventListener("click", clearReply);
  imageInput.addEventListener("change", handleImageInputChange);
  removeImageBtn.addEventListener("click", clearImageAttachment);
}

async function handleChatListClick(e) {
  const chatItem = e.target.closest(".chat-item");
  if (!chatItem) return;

  const chatId = chatItem.dataset.chatId;
  if (!chatId) return;

  await selectChat(chatId);
}

async function handleUserListClick(e) {
  const userItem = e.target.closest(".user-item");
  if (!userItem) return;

  const userId = userItem.dataset.userId;
  if (!userId) return;

  await startChat(userId);
}

async function selectChat(chatId) {
  if (currentChatId && currentChatId !== chatId) {
    socket.emit("chat:leave", currentChatId);
  }

  currentChatId = chatId;
  displayChats(getFilteredChats(searchChat.value));
  await loadMessages(chatId);
}

async function startChat(userId) {
  try {
    const data = await fetchJSON("/api/chat/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participantId: userId }),
    });

    if (data.chat) {
      await loadChats();
      await selectChat(normalizeId(data.chat._id));
    }
  } catch (error) {
    console.error("Error creating chat:", error);
  }
}

async function handleMessageFormSubmit(e) {
  e.preventDefault();

  if (!currentChatId) {
    alert("Vui lòng chọn cuộc trò chuyện trước khi gửi tin nhắn");
    return;
  }

  const messageText = messageInput.value.trim();
  if (!messageText && !imageAttachment) {
    alert("Bạn cần nhập nội dung hoặc chọn ảnh");
    return;
  }

  try {
    const payload = {
      chatId: currentChatId,
      content: messageText || undefined,
      image: imageAttachment || undefined,
      replyToId: replyToMessage?._id,
    };

    const data = await fetchJSON("/api/chat/message/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (data.userMessage) {
      const inserted = upsertMessageCache(currentChatId, data.userMessage);
      if (inserted) addMessageToUI(data.userMessage);
      updateChatLastMessage(currentChatId, data.userMessage);

      messageInput.value = "";
      clearImageAttachment();
      clearReply();
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

function handleCreateGroupModalClick(e) {
  if (e.target === createGroupModal) {
    setCreateGroupModalVisible(false);
  }
}

async function handleCreateGroupFormSubmit(e) {
  e.preventDefault();

  const groupName = groupNameInput.value.trim();
  const participants = getSelectedParticipants();

  if (!groupName || participants.length === 0) {
    alert("Vui lòng nhập tên nhóm và chọn thành viên");
    return;
  }

  try {
    const data = await fetchJSON("/api/chat/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupName,
        participants,
        isGroup: true,
      }),
    });

    if (data.chat) {
      await loadChats();
      setCreateGroupModalVisible(false);
      createGroupForm.reset();
    }
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Lỗi khi tạo nhóm");
  }
}

function handleSearchChatInput() {
  displayChats(getFilteredChats(searchChat.value));
}

function handleSearchUserInput() {
  displayUsers(getFilteredUsers(searchUser.value));
}

function handleMessagesAreaClick(e) {
  const replyBtn = e.target.closest(".reply-btn");
  if (!replyBtn) return;

  const messageId = replyBtn.dataset.messageId;
  const senderName = replyBtn.dataset.senderName || "Người dùng";
  if (!messageId || !currentChatId) return;

  const selectedMessage = getMessageById(currentChatId, messageId);

  if (!selectedMessage) return;

  openReplyPreview(selectedMessage, senderName);
}

async function handleImageInputChange(e) {
  const file = e.target.files?.[0];
  if (!file) {
    clearImageAttachment();
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh");
    clearImageAttachment();
    return;
  }

  imageAttachment = await fileToBase64(file);
  previewImg.src = imageAttachment;
  setElementVisible(imagePreview, true, DISPLAY_FLEX);
}

// ========================
// Utilities
// ========================
function updateOnlineStatus() {
  rerenderSidebarLists();

  const currentChat = getCurrentChat();
  if (currentChat) {
    chatStatus.textContent = getChatStatusText(currentChat);
  }
}

function upsertChatCache(chat) {
  const chatId = normalizeId(chat?._id);
  if (!chatId) return;

  const index = chatsCache.findIndex(
    (item) => normalizeId(item._id) === chatId,
  );
  if (index === -1) {
    chatsCache.unshift(chat);
  } else {
    chatsCache[index] = {
      ...chatsCache[index],
      ...chat,
    };
  }
}

function updateChatLastMessage(chatId, message) {
  const normalizedChatId = normalizeId(chatId);
  const index = chatsCache.findIndex(
    (chat) => normalizeId(chat._id) === normalizedChatId,
  );

  if (index === -1) {
    return;
  }

  chatsCache[index] = {
    ...chatsCache[index],
    lastMessage: message,
    updatedAt: new Date().toISOString(),
  };

  chatsCache.sort((a, b) => {
    const ta = new Date(a.updatedAt || 0).getTime();
    const tb = new Date(b.updatedAt || 0).getTime();
    return tb - ta;
  });

  displayChats(getFilteredChats(searchChat.value));
}

function upsertMessageCache(chatId, message) {
  const normalizedChatId = normalizeId(chatId);
  const items = messagesByChat.get(normalizedChatId) || [];
  const messageId = normalizeId(message._id);

  if (items.some((msg) => normalizeId(msg._id) === messageId)) {
    return false;
  }

  items.push(message);
  messagesByChat.set(normalizedChatId, items);
  return true;
}

function getFilteredChats(query) {
  const keyword = (query || "").trim().toLowerCase();
  if (!keyword) return chatsCache;

  return chatsCache.filter((chat) =>
    getChatTitle(chat).toLowerCase().includes(keyword),
  );
}

function getFilteredUsers(query) {
  const keyword = (query || "").trim().toLowerCase();
  if (!keyword) return usersCache;

  return usersCache.filter((user) =>
    (user.name || "").toLowerCase().includes(keyword),
  );
}

function getParticipantId(participant) {
  if (!participant) return "";
  if (typeof participant === "string") return participant;
  return normalizeId(participant._id || participant);
}

function getChatTitle(chat) {
  if (chat?.isGroup) {
    return chat.groupName || "Nhóm";
  }

  const other = (chat?.participants || []).find(
    (p) => getParticipantId(p) !== normalizeId(currentUser?._id),
  );

  return typeof other === "object" && other?.name ? other.name : "Chat";
}

function getChatOnlineState(chat) {
  if (chat?.isGroup) {
    return (chat?.participants || []).some((p) =>
      onlineUsers.has(getParticipantId(p)),
    );
  }

  const other = (chat?.participants || []).find(
    (p) => getParticipantId(p) !== normalizeId(currentUser?._id),
  );

  return other ? onlineUsers.has(getParticipantId(other)) : false;
}

function getLastMessagePreview(lastMessage) {
  if (!lastMessage) return "Không có tin nhắn";
  if (lastMessage.content) return lastMessage.content;
  if (lastMessage.image) return "[Ảnh]";
  return "Tin nhắn mới";
}

function getChatStatusText(chat) {
  if (chat?.isGroup) {
    const onlineCount = (chat.participants || []).filter((p) =>
      onlineUsers.has(getParticipantId(p)),
    ).length;
    return `${onlineCount} online`;
  }

  return getChatOnlineState(chat) ? ONLINE_TEXT : OFFLINE_TEXT;
}

function getMessageById(chatId, messageId) {
  return (messagesByChat.get(chatId) || []).find(
    (msg) => normalizeId(msg._id) === messageId,
  );
}

function getSelectedParticipants() {
  return Array.from(
    userCheckboxList.querySelectorAll('input[name="participant"]:checked'),
  ).map((cb) => cb.value);
}

function openReplyPreview(message, senderName) {
  replyToMessage = message;
  replySender.textContent = `Trả lời ${senderName}`;
  replyText.textContent = message.content || "[Ảnh]";
  setElementVisible(replyPreview, true, DISPLAY_FLEX);
  messageInput.focus();
}

function rerenderSidebarLists() {
  displayChats(getFilteredChats(searchChat.value));
  displayUsers(getFilteredUsers(searchUser.value));
}

function getCurrentChat() {
  if (!currentChatId) return null;

  return (
    chatsCache.find((chat) => normalizeId(chat._id) === currentChatId) || null
  );
}

function setCreateGroupModalVisible(isVisible) {
  setElementVisible(createGroupModal, isVisible, DISPLAY_FLEX);
}

function clearReply() {
  replyToMessage = null;
  setElementVisible(replyPreview, false);
  replyText.textContent = "";
}

function clearImageAttachment() {
  imageAttachment = null;
  imageInput.value = "";
  previewImg.src = "";
  setElementVisible(imagePreview, false);
}

function setElementVisible(element, isVisible, displayValue = "block") {
  if (isVisible) {
    element.classList.remove("is-hidden");
    element.style.display = displayValue;
    return;
  }

  element.classList.add("is-hidden");
  element.style.display = "";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) return normalizeId(value._id);
    if (typeof value.toString === "function") return value.toString();
  }
  return "";
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  return response.json();
}

async function getCurrentUser() {
  try {
    const data = await fetchJSON("/api/auth/status");
    if (data.user) {
      currentUser = data.user;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
}
