const mongoose = require("mongoose");


 
const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Apne User model ka naam yahan daalein
      },
    ],
  },
  { timestamps: true } // createdAt aur updatedAt automatically banta hai
);
 
module.exports = mongoose.model("Conversation", ConversationSchema);