const router = require("express").Router();
const Conversation = require("../Models/Conversation");
const Message = require("../Models/Message");

router.post("/conversation", async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "senderId aur receiverId zaroori hain" });
  }

  try {
    let existing = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate("members", "name email role organization _id");

    if (existing) return res.status(200).json(existing);

    // Nayi conversation banao
    const newConv = new Conversation({
      members: [senderId, receiverId],
    });

    const saved = await newConv.save();

 
    const fullConv = await Conversation.findById(saved._id).populate(
      "members",
      "name email role organization _id"
    );

    res.status(200).json(fullConv);
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/conversations/:userId", async (req, res) => {
  try {
    const convs = await Conversation.find({
      members: { $in: [req.params.userId] },
    })
      .populate("members", "name email role organization _id")
      .sort({ updatedAt: -1 }); 

    res.status(200).json(convs);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/message", async (req, res) => {
  const { conversationId, sender, text } = req.body;

  if (!conversationId || !sender || !text) {
    return res.status(400).json({ message: "conversationId, sender, text zaroori hain" });
  }

  try {
    const newMessage = new Message({ conversationId, sender, text });
    const saved = await newMessage.save();

   
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: Date.now(),
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Save message error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/messages/:convId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.convId,
    }).sort({ createdAt: 1 }); // Purane messages pehle

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;