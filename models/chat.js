const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
        isGroup: {
            type: Boolean,
            required: true,
        },
        time: {
            type: Date,
            default: Date.now,
        },
        currentMessage: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        select: {
            type: Boolean,
            required: true,
        },
        id: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger, // Kiểm tra xem giá trị có phải là số nguyên không
                message: '{VALUE} is not an integer value',
            },
        },
    },
    {timestamps: true}
);
module.exports = mongoose.model("Chat", ChatSchema);