import mongoose from "mongoose";

const marriageSchema = new mongoose.Schema({
  marriage_id: {
    type: String,
    unique: true,
    sparse: true
  },
  reg_no: {
    type: String,
  },

  // -------------------
  // Spouse 1 (Groom)
  // -------------------
  spouse1_isParishioner: {
    type: Boolean,
    required: true
  },
  spouse1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  spouse1_name: {
    type: String,
    required: true
  },
  spouse1_address: {
    type: String
  },
  spouse1_city_district: {
    type: String
  },
  spouse1_state_country: {
    type: String
  },
  spouse1_father_name: {
    type: String
  },
  spouse1_mother_name: {
    type: String
  },
  spouse1_home_parish: {
    type: String
  },

  // -------------------
  // Spouse 2 (Bride)
  // -------------------
  spouse2_isParishioner: {
    type: Boolean,
    required: true
  },
  spouse2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  spouse2_name: {
    type: String,
    required: true
  },
  spouse2_address: {
    type: String
  },
  spouse2_city_district: {
    type: String
  },
  spouse2_state_country: {
    type: String
  },
  spouse2_father_name: {
    type: String
  },
  spouse2_mother_name: {
    type: String
  },
  spouse2_home_parish: {
    type: String
  },

  // -------------------
  // Marriage Details
  // -------------------
  date: {
    type: Date,
    required: true
  },
  place: {
    type: String
  },
  solemnized_by: {
    type: String
  },
  officiant_number: {
    type: String
  }

}, { timestamps: true });

export default mongoose.model("Marriage", marriageSchema);
