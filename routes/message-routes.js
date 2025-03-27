const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Lấy tin nhắn giữa hai người
router.get("/", async (req, res) => {
    const { sourceId, targetId } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { sourceId: sourceId, targetId: targetId },
                { sourceId: targetId, targetId: sourceId },
            ],
        }).sort({ time: 1 }); // Sắp xếp theo thời gian
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// Lưu tin nhắn
router.post("/", async (req, res) => {
    const { message, sourceId, targetId, time } = req.body;

    try {
        const newMessage = new Message({
            message,
            sourceId,
            targetId,
            time,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Failed to save message" });
    }
});

module.exports = router;
