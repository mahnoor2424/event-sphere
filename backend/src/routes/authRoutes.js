var express = require("express");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var User = require("../models/User");
var Notification = require("../Models/Notification");

var router = express.Router();

// ==========================================
// 1. REGISTER
// ==========================================
router.post("/register", async function (req, res) {
  try {
    var { name, email, password, role, organization } = req.body;
    var emailClean = email.trim().toLowerCase();

    var exist = await User.findOne({ email: emailClean });
    if (exist) return res.status(400).json({ message: "User already exists" });

    var hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: emailClean,
      password: hash,
      role,
      organization: role === "exhibitor" ? organization : "",
      status: role === "exhibitor" ? "pending" : "approved",
      boothNumber: "" // Initialize booth as empty
    });

    await user.save();
    res.json({ message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. LOGIN
// ==========================================
router.post("/login", async function (req, res) {
  try {
    var email = req.body.email.trim().toLowerCase();
    var password = req.body.password;

    var user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    var match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    if (user.role === "exhibitor" && user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved by admin yet" });
    }

    var token = jwt.sign({ id: user._id, role: user.role }, "secretkey", { expiresIn: "1d" });
   
    // UPDATE YAHAN HAI: name aur email bhi bhej rahe hain
    res.json({ 
      token, 
      role: user.role, 
      status: user.status,
      name: user.name,   // Ye add kiya
      email: user.email,
      id: user._id   // Ye add kiya
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. FORGOT / RESET PASSWORD
// ==========================================
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "Email not found" });
    res.json({ message: "Email found" });
  } catch (err) { res.status(500).json(err); }
});

router.post("/reset-password", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.newPassword, 10);
    await User.findOneAndUpdate({ email: req.body.email.trim().toLowerCase() }, { password: hash });
    res.json({ message: "Password updated successfully" });
  } catch (err) { res.status(500).json(err); }
});

// ==========================================
// 4. ADMIN APIs (Exhibitor Management)
// ==========================================

// A. Get ALL Exhibitors (Approved, Pending, Rejected sab)
router.get("/all-exhibitors", async (req, res) => {
  try {
    // Sirf 'exhibitor' role wale users uthao
    const exhibitors = await User.find({ role: 'exhibitor' }).select("-password");
    res.status(200).json(exhibitors);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🟢 2. Document Approve karne ka route
router.put("/verify-user/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isVerified: true, verificationStatus: 'approved' } },
      { new: true }
    );

    // 🔔 EXHIBITOR KO NOTIFICATION (Approve hone par)
    await Notification.create({
        recipient: 'exhibitor',
        recipientId: req.params.id, 
        message: "Congratulations! Your business documents have been verified. You can now apply for booths.",
        type: 'broadcast' 
    });

    res.status(200).json({ message: "User Verified Successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// B. Get ONLY PENDING (For Pending Requests Page)
router.get("/pending-exhibitors", async (req, res) => {
  try {
    const users = await User.find({ role: "exhibitor", status: "pending" }); // 👈 Added status filter
    res.json(users);
  } catch (err) { res.status(500).json(err); }
});

// C. Get ONLY APPROVED (For Assigned Booths Page)
router.get("/approved-exhibitors", async (req, res) => {
  try {
    const users = await User.find({ role: "exhibitor", status: "approved" }); // 👈 Only approved ones
    res.json(users);
  } catch (err) { res.status(500).json(err); }
});

// D. APPROVE & ASSIGN BOOTH
router.put("/approve-user/:id", async (req, res) => {
  try {
    const { boothNumber } = req.body; 
    await User.findByIdAndUpdate(req.params.id, {
      status: "approved",
      boothNumber: boothNumber 
    });
    res.json({ message: "User approved and booth assigned" });
  } catch (err) { res.status(500).json(err); }
});

// E. REJECT USER
router.put("/reject-user/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.json({ message: "User rejected" });
  } catch (err) { res.status(500).json(err); }
});
// Password Update Route
router.put("/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE USER
router.delete("/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully from system" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// routes/auth.js mein ye add karein

// Update Profile API
router.put("/update-profile", async (req, res) => {
  try {
    const { email, description, website, phone, logo, banner } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        description, 
        website, 
        phone, 
        logo, 
        banner 
      },
      { new: true } 
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile Updated Successfully!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile Data Get karne ki API (Taake form pehle se bhara hua aaye)
router.get("/profile-details/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE USER DATA
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Password hide karke baqi sab de do
    if (!user) return res.status(404).json("User not found");
    
    // Yahan ensure karein ke 'documents' field user model mein hai aur return ho rahi hai
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    // 1. "documents" ko yahan add karna zaroori hai (Destructuring)
    const { organization, website, phone, description, logo, city, documents } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { organization, website, phone, description, logo, city, documents } 
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // 🔔 ADMIN KO NOTIFICATION (Messenger ke liye)
    if (documents && documents.length > 0) {
        await Notification.create({
            recipient: 'admin',
            message: `Verification Request: ${organization || updatedUser.name} has submitted documents for review.`,
            type: 'system' 
        });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// routes/auth.js mein kahin bhi add kar dein
router.get("/attendee-stats", async (req, res) => {
  try {
    // Ye line database mein check karegi ke kitne users ka role 'attendee' hai
    const count = await User.countDocuments({ role: "attendee" });
    res.json({ totalAttendees: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// authRoutes.js mein add karo
router.get("/get-admin-id", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" }).select("_id name email");
    if (!admin) return res.status(404).json({ message: "Admin nahi mila" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;