import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, 
  FaBoxes, FaArrowLeft, FaSave, FaPen 
} from "react-icons/fa";

export default function EditExpo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    theme: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    city: "",
    address: "",
    capacity: "",
    totalBooths: ""
  });

  // 1. DATA FETCH KARNA (Pre-fill the form)
  useEffect(() => {
    const fetchExpo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/expo/get-expo/${id}`);
        const data = res.data;

        setForm({
          title: data.title || "",
          theme: data.theme || "",
          description: data.description || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          venue: data.location?.venue || "",
          city: data.location?.city || "",
          address: data.location?.address || "",
          capacity: data.capacity || "",
          totalBooths: data.booths?.total || ""
        });
      } catch (err) {
        Swal.fire({ title: "Error", text: "Could not load expo data", icon: "error", background: "#001a21", color: "#fff" });
      } finally {
        setLoading(false);
      }
    };
    fetchExpo();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 2. DATA UPDATE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Payload exactly matching your Mongoose Schema
    const payload = {
      title: form.title,
      theme: form.theme,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      location: {
        venue: form.venue,
        city: form.city,
        address: form.address,
      },
      capacity: Number(form.capacity),
      totalBooths: Number(form.totalBooths), // Backend route handles "booths.total"
    };

    try {
      await axios.put(`http://localhost:5000/api/expo/update/${id}`, payload);
      
      Swal.fire({
        title: "Success!",
        text: "Event updated successfully",
        icon: "success",
        background: "#001a21",
        color: "#fff",
        confirmButtonColor: "#00d4ff",
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/admin/expo/manage"), 2000);

    } catch (err) {
      Swal.fire({ title: "Error", text: "Update failed", icon: "error", background: "#001a21", color: "#fff" });
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Syncing Event Data...</p></div>;

  return (
    <div className="edit-expo-wrapper">
      
      {/* 🔙 BACK BUTTON & HEADER */}
      <div className="edit-header">
        <button className="back-btn" onClick={() => navigate("/admin/expo/manage")}>
          <FaArrowLeft /> Back to List
        </button>
        <div className="header-title">
          <div className="badge">Update Mode</div>
          <h1>Edit <span>{form.title || "Expo"}</span></h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-glass-form">
        
        {/* SECTION 1: IDENTITY */}
        <div className="edit-section">
          <div className="section-head"><FaInfoCircle /> Event Identity</div>
          <div className="edit-grid-2">
            <div className="edit-input-box">
              <label>Event Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="edit-input-box">
              <label>Event Theme</label>
              <input name="theme" value={form.theme} onChange={handleChange} required />
            </div>
          </div>
          <div className="edit-input-box mt-3">
            <label><FaPen /> Detailed Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4"></textarea>
          </div>
        </div>

        {/* SECTION 2: TIMELINE & LOGISTICS */}
        <div className="edit-section">
          <div className="section-head"><FaCalendarAlt /> Dates & Capacity</div>
          <div className="edit-grid-3">
            <div className="edit-input-box">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="edit-input-box">
              <label>End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
            <div className="edit-input-box">
              <label><FaUsers /> Max Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION */}
        <div className="edit-section">
          <div className="section-head"><FaMapMarkerAlt /> Venue Logistics</div>
          <div className="edit-grid-3">
            <div className="edit-input-box">
              <label>Venue Name</label>
              <input name="venue" value={form.venue} onChange={handleChange} required />
            </div>
            <div className="edit-input-box">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="edit-input-box">
              <label>Full Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 4: BOOTHS */}
        <div className="edit-section no-border">
          <div className="section-head"><FaBoxes /> Space Allocation</div>
          <div className="edit-grid-2">
            <div className="edit-input-box">
              <label>Total Booths Allotted</label>
              <input type="number" name="totalBooths" value={form.totalBooths} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SAVE BUTTONS */}
        <div className="edit-footer">
          <button type="submit" className="update-btn">
            <FaSave /> Save Changes
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate("/admin/expo/manage")}>
            Discard
          </button>
        </div>

      </form>

      <style>{`
        .edit-expo-wrapper { padding: 30px; animation: fadeIn 0.5s ease; }
        
        .edit-header { display: flex; align-items: center; gap: 30px; margin-bottom: 30px; }
        .back-btn { background: #1a333d; color: #00d4ff; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .back-btn:hover { background: #00d4ff; color: #000; }
        
        .header-title h1 { margin: 0; color: #fff; font-size: 32px; font-weight: 800; }
        .header-title h1 span { color: #00d4ff; }
        .badge { background: rgba(0, 212, 255, 0.1); color: #00d4ff; padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; text-transform: uppercase; border: 1px solid #00d4ff33; display: inline-block; margin-bottom: 5px; }

        .edit-glass-form { background: rgba(0, 18, 25, 0.8); backdrop-filter: blur(15px); border: 1px solid rgba(0, 212, 255, 0.1); padding: 40px; border-radius: 25px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }

        .edit-section { margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 25px; }
        .edit-section.no-border { border: none; }
        .section-head { color: #00d4ff; font-weight: 700; font-size: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

        .edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .edit-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

        .edit-input-box label { display: block; color: #829ca9; font-size: 13px; margin-bottom: 8px; }
        .edit-input-box input, .edit-input-box textarea { 
          width: 100%; background: #000c12; border: 1px solid #1a333d; padding: 13px; border-radius: 12px; color: white; outline: none; transition: 0.3s;
        }
        .edit-input-box input:focus, .edit-input-box textarea:focus { border-color: #00d4ff; box-shadow: 0 0 15px rgba(0,212,255,0.2); background: #00151e; }

        .edit-footer { display: flex; gap: 15px; margin-top: 20px; }
        .update-btn { background: #00d4ff; color: #000; border: none; padding: 15px 40px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
        .update-btn:hover { background: #00f0ff; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,212,255,0.4); }
        .cancel-btn { background: transparent; color: #617d8a; border: 1px solid #333; padding: 15px 30px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .cancel-btn:hover { background: #1a1a1a; color: #fff; }

        .loading-container { text-align: center; padding: 100px; color: #00d4ff; }
        .spinner { border: 4px solid rgba(0, 212, 255, 0.1); border-top: 4px solid #00d4ff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
    </div>
  );
}