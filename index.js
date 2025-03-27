const express = require("express");
var http = require("http");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
var io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});
const Message = require("./models/message");
const Chat = require("./models/chat");
//middleware
app.use(express.json());
app.use(cors());
var clients = {};

const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/chatApp', {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
}).then(
    () => console.log("Connected to MongoDB"),
    (err) => console.error("Failed to connect to MongoDB:", err.message)
)

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Xử lý sự kiện đăng nhập
    socket.on("signin", async (id) => {
        console.log("User signin:", id);

        if (typeof id === 'string' || id instanceof String) {
            clients[id] = socket;
            console.log("Current clients:", Object.keys(clients));

            try {
                // Lấy danh sách tin nhắn và danh sách chat
                const userMessages = await Message.find({ targetId: id }).sort({ timestamp: 1 }).exec();
                const userChats = await Chat.find().sort({ updatedAt: -1 }).exec();

                // Gửi danh sách tin nhắn và chat đến client
                socket.emit("messages", userMessages);
                socket.emit("chats", userChats);
                console.log("Chats and messages sent to user:", id);
            } catch (error) {
                console.error("Error fetching messages or chats for user:", id, error);
            }
        } else {
            console.error("Invalid signin ID:", id);
        }
    });

    // Xử lý sự kiện tin nhắn
    socket.on("message", async (msg) => {
        console.log("Received message:", msg);

        if (msg && msg.targetId && msg.message && msg.sourceId) {
            const { targetId, message, sourceId } = msg;

            try {
                // Lưu tin nhắn mới vào MongoDB
                const newMessage = new Message({
                    message,
                    sourceId,
                    targetId,
                });
                await newMessage.save();
                console.log("Message saved to database:", newMessage);

                // Cập nhật tin nhắn mới nhất trong Chat
                await Chat.updateOne(
                    { id: targetId },
                    { currentMessage: message, time: new Date() }
                );

                // Gửi tin nhắn đến client mục tiêu
                if (clients[targetId]) {
                    clients[targetId].emit("message", newMessage);
                    console.log("Message sent to:", targetId);
                } else {
                    console.log("Target client not found:", targetId);
                }
            } catch (error) {
                console.error("Error saving or sending message:", error);
            }
        } else {
            console.error("Invalid message format:", msg);
        }
    });

    // Xử lý khi client ngắt kết nối
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        for (let id in clients) {
            if (clients[id] === socket) {
                delete clients[id];
                console.log("Removed client:", id);
                break;
            }
        }
    });
});

app.post("/chats", async (req, res) => {
    try {
        const { name, icon, isGroup, currentMessage, status, select, id } = req.body;

        // Tạo một đối tượng Chat mới
        const newChat = new Chat({
            name,
            icon,
            isGroup,
            currentMessage,
            status,
            select,
            id,
        });

        // Lưu vào MongoDB
        await newChat.save();
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Failed to create chat", error });
    }
});

app.get("/chats", async (req, res) => {
    try {
        // Lấy danh sách tất cả các chat
        const chats = await Chat.find().sort({ updatedAt: -1 }).exec();
        res.status(200).json({ message: "Chats fetched successfully", chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ message: "Failed to fetch chats", error });
    }
});

server.listen(port, "192.168.0.83", () => {
    console.log(`Server started on port ${port}`);
});

