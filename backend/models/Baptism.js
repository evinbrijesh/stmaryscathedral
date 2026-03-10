import mongoose from "mongoose";

const BaptismSchema = new mongoose.Schema({
  sl_no: {
    type: Number,
    required: true,
    unique: true,
  },
  reg_no: {
    type: String,
  },

  // 🔑 Key switch
  isParishioner: {
    type: Boolean,
    required: true,
  },

  // -------------------
  // Family Information (Parishioner only)
  // -------------------
  family_number: {
    type: String,
    ref: "Family",
  },
  family_name: {
    type: String,
  },
  hof: {
    type: String,
  },

  // -------------------
  // Member Information (Parishioner only)
  // -------------------
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
  },

  // -------------------
  // Person Information (Common)
  // -------------------
  member_name: {
    type: String,
    required: true,
  },
  member_dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },

  // -------------------
  // Non-Parishioner Info
  // -------------------
  home_parish: {
    type: String,
  },

  // -------------------
  // Certificate Fields (matching certificate order)
  // -------------------
  address: {
    type: String,
  },
  father_name: {
    type: String,
  },
  mother_name: {
    type: String,
  },

  // -------------------
  // Baptism Details
  // -------------------
  date_of_baptism: {
    type: Date,
    required: true,
  },
  place_of_baptism: {
    type: String,
  },
  church_where_baptised: {
    type: String,
  },
  bapt_name: {
    type: String,
    required: true,
  },

  // -------------------
  // Godparent Information
  // -------------------
  godparent_name: {
    type: String,
  },
  godparent_house_name: {
    type: String,
  },

  // -------------------
  // Officiant
  // -------------------
  baptised_by: {
    type: String,
  },

  // -------------------
  // Certificate & Remarks
  // -------------------
  certificate_number: {
    type: String,
  },
  remarks: {
    type: String,
  }

}, { timestamps: true });

export default mongoose.model("BaptismRecord", BaptismSchema);
