const express = require("express");
const router = express.Router();
const Expo = require("../Models/Expo");
const Application = require("../Models/Application");
const Notification = require("../Models/Notification");
const User = require("../Models/User");
const Registration = require("../Models/Registration"); // Attendee registration ke liye


// CREATE EXPO
router.post("/create-expo", async (req, res) => {
  try {
    const { title, theme, image, description, startDate, endDate, location, capacity, booths } = req.body;

    const expo = new Expo({
      title, image: image || "",   theme, description, startDate, endDate, location,
      capacity: Number(capacity),
      booths: { total: Number(booths?.total), available: Number(booths?.available) },
      status: "draft"
    });

    await expo.save();

   // ... after expo.save() ...
await Notification.create({
    recipient: 'all', // Sabko dikhega
    message: `New Event: "${title}" is now open for registrations!`,
    type: 'expo'
});
    res.status(201).json(expo);
  } catch (err) { res.status(400).json({ message: err.message }); }
});


// GET ALL EXPO
router.get("/all-expos", async (req, res) => {
  try {
    const data = await Expo.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// UPDATE STATUS (ACTIVE / DRAFT)
router.put("/update-status/:id", async (req, res) => {
  try {
    const expo = await Expo.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(expo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DELETE EXPO
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Expo.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Expo not found" });
    }

    res.json({ message: "Expo deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// SAVE FLOOR PLAN LAYOUT (Admin grid par booths set karega)
router.put("/update-layout/:id", async (req, res) => {
  try {
    const { layout } = req.body; 
    // layout array aisa hoga: [{id: 'R1-C1', row: 1, col: 1, status: 'available'}, ...]

    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id,
      { $set: { "booths.layout": layout } }, // Schema mein layout field honi chahiye
      { new: true }
    );

    if (!updatedExpo) return res.status(404).json({ message: "Expo not found" });
    res.json({ message: "Floor plan layout updated", data: updatedExpo });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ASSIGN EXHIBITOR TO A SPECIFIC BOOTH
// ASSIGN BOOTH
// ASSIGN BOOTH - backend/routes/expoRoutes.js
router.put("/assign-booth/:expoId", async (req, res) => {
  try {
    const { expoId } = req.params;
    const { boothId, requestId } = req.body;

    // 1. Find the application and exhibitor
    const application = await Application.findById(requestId).populate('exhibitorId');
    if (!application) return res.status(404).json({ message: "Request not found" });

    // 2. Update the Expo Layout: Set booth status to 'reserved' and link exhibitor
    const updatedExpo = await Expo.findOneAndUpdate(
      { _id: expoId, "booths.layout.id": boothId },
      { 
        $set: { 
          "booths.layout.$.status": "reserved", 
          "booths.layout.$.exhibitorId": application.exhibitorId._id,
          "booths.layout.$.companyName": application.exhibitorId.organization 
        } 
      },
      { new: true }
    );

    if (!updatedExpo) return res.status(404).json({ message: "Expo or Booth not found" });

    // 3. Update User's assigned booths
    await User.findByIdAndUpdate(application.exhibitorId._id, {
      $push: { assignedBooths: { expoId: expoId, boothId: boothId } }
    });

    // 4. Update Application status to approved
    application.status = "approved";
    await application.save();

    // 5. Notification
    await Notification.create({
      recipient: 'exhibitor',
      recipientId: application.exhibitorId._id,
      message: `Booth Approved: You have been assigned to Booth ${boothId} in ${updatedExpo.title}.`,
      type: 'approval'
    });

    res.json({ message: "Booth Assigned Successfully", data: updatedExpo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

 // Sample Express Route
// PUT: Update Booth Details in Expo Layout
router.put("/update-booth-content", async (req, res) => {
  try {
    const { expoId, boothId, boothDetails } = req.body;

    // findOneAndUpdate use karna behtar hai nested arrays ke liye
    const updatedExpo = await Expo.findOneAndUpdate(
      { 
        _id: expoId, 
        "booths.layout.id": boothId 
      },
      { 
        $set: { 
          "booths.layout.$.boothDetails": boothDetails,
          "booths.layout.$.companyName": boothDetails.shopName // Taake report mein bhi naam aaye
        } 
      },
      { new: true }
    );

    if (!updatedExpo) {
      return res.status(404).json({ message: "Expo or Booth not found" });
    }

    res.json({ message: "Booth Content Updated Successfully", data: updatedExpo });

  } catch (err) {
    console.error("DB Update Error:", err);
    res.status(500).json({ message: err.message });
  }
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

// UPDATE EXPO FULL DETAILS
router.put("/update/:id", async (req, res) => {
  try {
    const {
      title,
      theme,
      description,
      startDate,
      endDate,
      location,
      capacity,
      totalBooths
    } = req.body;

    // Data prepare karein jo update karna hai
    const updatedData = {
      title,
      theme,
      description,
      startDate,
      endDate,
      location: {
        venue: location?.venue,
        city: location?.city,
        address: location?.address,
      },
      capacity: Number(capacity),
      // Booths ka logic agar change karna ho
      "booths.total": Number(totalBooths), 
      // Note: "booths.total" use kiya kyunki schema mein nested object hai
    };

    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id, 
      { $set: updatedData }, 
      { new: true } // Taake updated data return ho
    );

    if (!updatedExpo) {
      return res.status(404).json({ message: "Expo not found" });
    }

    res.json(updatedExpo);
    
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
// expoRoutes.js mein update karein
router.get("/get-expo/:id", async (req, res) => {
  try {
    // populate('booths.layout.exhibitorId') user model se details khinch lega
    const expo = await Expo.findById(req.params.id)
      .populate({
        path: "booths.layout.exhibitorId",
        select: "organization email phone logo name" // Sirf zaroori fields uthayein
      });

    if (!expo) return res.status(404).json({ message: "Expo not found" });
    res.json(expo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/expoRoutes.js

router.post("/apply", async (req, res) => {
  try {
    const { expoId, exhibitorEmail } = req.body;

    const user = await User.findOne({ email: exhibitorEmail });
    if (!user) return res.status(404).json({ message: "Exhibitor profile not found." });

    const expo = await Expo.findById(expoId); 
    if (!expo) return res.status(404).json({ message: "Expo not found." });

    // 1. Check if already applied
    if (expo.appliedExhibitors && expo.appliedExhibitors.includes(exhibitorEmail)) {
        return res.status(400).json({ message: "You have already applied for this expo." });
    }

    // 2. Check if booths are available
    if (expo.booths.available <= 0) {
        return res.status(400).json({ message: "No booths available. All Booked!" });
    }

    // 3. Create Application
    const newApp = new Application({
      expoId: expoId,
      exhibitorId: user._id,
      status: "pending"
    });
    await newApp.save();

    // 4. Update Expo: Add Email and Decrease Available Count
    await Expo.findByIdAndUpdate(expoId, {
       $addToSet: { appliedExhibitors: exhibitorEmail },
       $inc: { "booths.available": -1 } // Ek booth kam kar dein
    });

    // 5. Send Notification
    await Notification.create({
      recipient: 'admin',
      message: `New Booth Request: ${user.name} has applied for "${expo.title}".`,
      type: 'request'
    });

    res.json({ message: "Applied successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PENDING APPLICATIONS FOR ADMIN
router.get("/pending-applications", async (req, res) => {
  try {
    const apps = await Application.find({ status: "pending" })
      .populate("exhibitorId", "organization email name") // Exhibitor info
      .populate("expoId", "title"); // Expo info
    res.json(apps);
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
});
router.delete("/delete-application/:id", async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application rejected and deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ATTENDEE REGISTRATION FOR EXPO
router.post("/register-attendee", async (req, res) => {
  try {
    const { attendeeId, expoId } = req.body;
    
    // Check if already registered
    const exists = await Registration.findOne({ attendeeId, expoId });
    if (exists) return res.status(400).json({ message: "Already registered for this event." });

    const ticketId = "TKT-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newReg = new Registration({ attendeeId, expoId, ticketId });
    await newReg.save();

    res.status(201).json({ message: "Registered Successfully", ticketId });
  } catch (err) { res.status(500).json(err); }
});

// CHECK STATUS
router.get("/registration-status/:attendeeId/:expoId", async (req, res) => {
    const reg = await Registration.findOne({ attendeeId: req.params.attendeeId, expoId: req.params.expoId });
    res.json({ isRegistered: !!reg, ticketData: reg });
});

router.get("/my-registrations/:attendeeId", async (req, res) => {
  try {
    const registrations = await Registration.find({ attendeeId: req.params.attendeeId })
      .populate("expoId") // Expo ki details (title, date, location) uthane ke liye
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching registrations", error: err.message });
  }
});
// GET MY EVENTS — row aur col bhi bhejo
router.get("/my-events/:userId", async (req, res) => {
  try {
    const expos = await Expo.find({
      "booths.layout.exhibitorId": req.params.userId
    }).sort({ createdAt: -1 });

    const myBooths = [];
    expos.forEach(e => {
      e.booths.layout.forEach(booth => {
        if (booth.exhibitorId?.toString() === req.params.userId) {
          myBooths.push({
            shopName:    booth.boothDetails?.shopName || booth.companyName || "My Booth",
            boothNumber: booth.id,
            boothRow:    booth.row,   // ✅ yeh add karo
            boothCol:    booth.col,   // ✅ yeh add karo
            logo:        booth.boothDetails?.logo || "",
            expoId:      { _id: e._id, title: e.title }
          });
        }
      });
    });

    res.json(myBooths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET EVENT ANALYTICS
router.get("/event-analytics/:userId", async (req, res) => {
  try {
    const expos = await Expo.find({
      "booths.layout.exhibitorId": req.params.userId
    });

    const analytics = [];
    expos.forEach(e => {
      e.booths.layout.forEach(booth => {
        if (booth.exhibitorId?.toString() === req.params.userId) {
          analytics.push({
            boothId: booth.id,
            leads:   booth.boothDetails?.leads   || 0,
            queries: booth.boothDetails?.queries || 0,
            views:   booth.boothDetails?.views   || 0,
          });
        }
      });
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Backend: routes/expoRoutes.js

// Lead track karne ka route
router.put("/track-lead/:expoId/:boothId", async (req, res) => {
  try {
    const result = await Expo.findOneAndUpdate(
      { _id: req.params.expoId, "booths.layout.id": req.params.boothId },
      { 
        $inc: { "booths.layout.$.boothDetails.leads": 1 },
        $set: { "booths.layout.$.status": "reserved" } // Dummy set taake document mile
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ message: `Booth ${req.params.boothId} not found in expo ${req.params.expoId}` });
    }
    
    console.log("Lead tracked for booth:", req.params.boothId);
    res.json({ message: "Lead tracked" });
  } catch (err) { 
    console.error("Track lead error:", err);
    res.status(500).json(err); 
  }
});

// Query track karne ka route
router.put("/track-query/:expoId/:boothId", async (req, res) => {
  try {
    const result = await Expo.findOneAndUpdate(
      { _id: req.params.expoId, "booths.layout.id": req.params.boothId },
      { 
        $inc: { "booths.layout.$.boothDetails.queries": 1 }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: `Booth ${req.params.boothId} not found in expo ${req.params.expoId}` });
    }

    console.log("Query tracked for booth:", req.params.boothId);
    res.json({ message: "Query tracked" });
  } catch (err) {
    console.error("Track query error:", err);
    res.status(500).json({ message: err.message });
  }
});

// View track karne ka route  
router.put("/track-view/:expoId/:boothId", async (req, res) => {
  try {
    const result = await Expo.findOneAndUpdate(
      { _id: req.params.expoId, "booths.layout.id": req.params.boothId },
      { 
        $inc: { "booths.layout.$.boothDetails.views": 1 }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: `Booth ${req.params.boothId} not found in expo ${req.params.expoId}` });
    }

    res.json({ message: "View tracked" });
  } catch (err) { 
    res.status(500).json(err); 
  }
});
// Get all expos for landing page
router.get('/all', async (req, res) => {
  try {
    const expos = await Expo.find({ status: "active" }).sort({ createdAt: -1 }).limit(6);
    res.json(expos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;  