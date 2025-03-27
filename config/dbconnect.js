const mongoose = require("mongoose");

const connectToDatabase = () => {
  return new Promise((resolve, reject) => {
    const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/chatApp', {
      "serverSelectionTimeoutMS": 60000,
      "socketTimeoutMS": 45000,
    });

    connection.on('open', () => {
      console.log("Connected to MongoDB");
      resolve(connection);
    });

    connection.on('error', (err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      reject(err);
    });
  });
};

module.exports = connectToDatabase;