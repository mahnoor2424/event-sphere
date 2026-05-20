const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    expoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expo',
        required: true
    },
    exhibitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    boothNumber: {
        type: String,
        required: true
    },
    shopName: {
        type: String,
        required: [true, "Shop name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },

    // ✅ UPDATE: Products ko Object banaya taake image aur price bhi aa sakay
    products: [{
        name: { type: String, trim: true },
        price: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: "" } // Product ki picture
    }],

    // ✅ UPDATE: Staff ko Object banaya professional management ke liye
    staff: [{
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: "" },
        role: { 
            type: String, 
            enum: ["Manager", "Sales", "Support", "Technician"], 
            default: "Sales" 
        },
        isPassIssued: { type: Boolean, default: false }, // Pass status
    passId: { type: String, default: "" }
    }],

    banner: {
        type: String,
        default: ""
    },
       logo: { type: String, default: "" }, 
    startTime: {
        type: String,
        default: "10:00 AM"
    },
    endTime: {
        type: String,
        default: "06:00 PM"
    },
    status: {
        type: String,
        enum: ["live", "draft", "closed"],
        default: "live"
    }
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);