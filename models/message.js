const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        sourceId: {
            type: String,
            required: true,
        },
        targetId: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
            default: Date.now,
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);


