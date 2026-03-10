import express from "express";
import Baptism from "../models/Baptism.js";
import Member from "../models/Member.js";
import Family from "../models/Family.js";

const router = express.Router();

// Get next available serial number
router.get("/next-sl-no", async (req, res) => {
  try {
    const lastRecord = await Baptism.findOne().sort({ sl_no: -1 });
    const nextSlNo = lastRecord ? lastRecord.sl_no + 1 : 1;
    res.json({ next_sl_no: nextSlNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search families by name
router.get("/search-families/:searchTerm", async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    console.log("Searching for:", searchTerm); // Debug log

    const families = await Family.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).limit(20);

    console.log("Found families:", families.length); // Debug log
    res.json(families);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get heads of family by family name
router.get("/heads-of-family/:familyName", async (req, res) => {
  try {
    const familyName = req.params.familyName;

    // Get all families with this name
    const families = await Family.find({
      name: { $regex: `^${familyName}$`, $options: 'i' }
    });

    res.json(families);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unbaptized members by family number
router.get("/unbaptized-members/:familyNumber", async (req, res) => {
  try {
    const familyNumber = req.params.familyNumber;
    console.log("========================================");
    console.log("Fetching unbaptized members for family:", familyNumber);

    // First, get ALL members from this family to debug
    const allMembers = await Member.find({ family_number: familyNumber });
    console.log(`Total members in family ${familyNumber}:`, allMembers.length);

    allMembers.forEach(m => {
      console.log(`- ${m.name}: baptism=${m.baptism}, deceased=${m.deceased}`);
    });

    // Get unbaptized members
    const unbaptizedMembers = await Member.find({
      family_number: familyNumber,
      baptism: false,
      deceased: { $ne: true }  // Not true (includes false, null, undefined)
    }).sort({ dob: -1 });

    console.log(`Unbaptized members found: ${unbaptizedMembers.length}`);
    unbaptizedMembers.forEach(m => {
      console.log(`✓ ${m.name} (${m.gender})`);
    });
    console.log("========================================");

    res.json(unbaptizedMembers);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: err.message });
  }
});

// Utility route: Check member baptism status
router.get("/check-member/:memberId", async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const baptismRecord = await Baptism.findOne({ member_id: req.params.memberId });

    res.json({
      member: {
        name: member.name,
        baptism_field: member.baptism
      },
      has_baptism_record: !!baptismRecord,
      baptism_record: baptismRecord || null,
      status: baptismRecord ? "Baptized" : "Not Baptized"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Utility route: Fix inconsistent baptism status
router.post("/fix-baptism-status", async (req, res) => {
  try {
    // Get all baptism records
    const baptisms = await Baptism.find();

    let fixed = 0;
    for (const baptism of baptisms) {
      const member = await Member.findById(baptism.member_id);
      if (member && member.baptism !== true) {
        member.baptism = true;
        await member.save();
        fixed++;
      }
    }

    // Get all members marked as baptized but have no record
    const baptizedMembers = await Member.find({ baptism: true });
    let unmarked = 0;

    for (const member of baptizedMembers) {
      const baptismRecord = await Baptism.findOne({ member_id: member._id });
      if (!baptismRecord) {
        // This member is marked baptized but has no record
        console.log(`Member ${member.name} marked baptized but has no record`);
        // Optionally uncomment to auto-fix:
        // member.baptism = false;
        // await member.save();
        // unmarked++;
      }
    }

    res.json({
      message: "Baptism status check completed",
      members_fixed: fixed,
      members_without_records: unmarked,
      total_baptism_records: baptisms.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new baptism record
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received baptism data:", req.body);

    const {
      isParishioner,
      member_id,
      member_name,
      member_dob,
      gender,
      home_parish,
      address,
      father_name,
      mother_name,
      date_of_baptism,
      place_of_baptism,
      church_where_baptised,
      bapt_name,
      godparent_name,
      godparent_house_name,
      baptised_by,
      certificate_number,
      remarks
    } = req.body;

    // Get next serial number
    const lastRecord = await Baptism.findOne().sort({ sl_no: -1 });
    const nextSlNo = lastRecord ? lastRecord.sl_no + 1 : 1;

    // Auto-generate reg_no: YY/NNNN
    const now = new Date();
    const year2 = String(now.getFullYear()).slice(-2);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const countThisYear = await Baptism.countDocuments({
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });
    const regNo = `${year2}/${String(countThisYear + 1).padStart(4, '0')}`;

    let baptismData = {
      sl_no: nextSlNo,
      reg_no: regNo,
      isParishioner,
      member_name,
      member_dob,
      gender,
      address,
      father_name,
      mother_name,
      date_of_baptism,
      place_of_baptism,
      church_where_baptised,
      bapt_name,
      godparent_name,
      godparent_house_name,
      baptised_by,
      certificate_number,
      remarks
    };

    // ----------------------------
    // ✅ PARISHIONER FLOW
    // ----------------------------
    if (isParishioner) {
      if (!member_id) {
        return res.status(400).json({ error: "Member ID required for parishioner" });
      }

      const member = await Member.findById(member_id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      if (member.baptism === true) {
        return res.status(400).json({
          error: "This member is already marked as baptized"
        });
      }

      const existingBaptism = await Baptism.findOne({ member_id });
      if (existingBaptism) {
        return res.status(400).json({
          error: "A baptism record already exists for this member"
        });
      }

      const family = await Family.findOne({ family_number: member.family_number });
      if (!family) {
        return res.status(404).json({ error: "Family not found" });
      }

      baptismData = {
        ...baptismData,
        family_number: family.family_number,
        family_name: family.name,
        hof: family.hof,
        member_id: member._id,
        member_name: member.name,
        member_dob: member.dob,
        gender: member.gender
      };

      // Mark member baptized
      member.baptism = true;
      await member.save();
    }

    // ----------------------------
    // ✅ NON-PARISHIONER FLOW
    // ----------------------------
    if (!isParishioner) {
      baptismData.home_parish = home_parish || "Unknown";
      baptismData.member_id = null;
      baptismData.family_number = null;
      baptismData.family_name = null;
      baptismData.hof = null;
    }

    const baptism = new Baptism(baptismData);
    await baptism.save();

    console.log("✅ Baptism saved:", baptism);
    res.status(201).json({
      message: "Baptism record created successfully",
      data: baptism
    });

  } catch (err) {
    console.error("❌ Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: "Duplicate entry: Serial number already exists"
      });
    }

    res.status(400).json({ error: err.message });
  }
});


// Get all baptism records
router.get("/", async (req, res) => {
  try {
    const baptisms = await Baptism.find()
      .populate('member_id')
      .sort({ sl_no: -1 });
    res.json(baptisms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single baptism record
router.get("/:id", async (req, res) => {
  try {
    const baptism = await Baptism.findById(req.params.id)
      .populate('member_id');

    if (!baptism) {
      return res.status(404).json({ error: "Baptism record not found" });
    }

    res.json(baptism);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update baptism record
router.put("/:id", async (req, res) => {
  try {
    const updatedBaptism = await Baptism.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBaptism) {
      return res.status(404).json({ error: "Baptism record not found" });
    }

    res.json({
      message: "Baptism record updated successfully",
      data: updatedBaptism
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete baptism record
router.delete("/:id", async (req, res) => {
  try {
    const baptism = await Baptism.findById(req.params.id);

    if (!baptism) {
      return res.status(404).json({ error: "Baptism record not found" });
    }

    // ✅ Only update Member if parishioner
    if (baptism.member_id) {
      await Member.findByIdAndUpdate(
        baptism.member_id,
        { baptism: false }
      );
    }

    // Delete baptism record
    await Baptism.findByIdAndDelete(req.params.id);

    res.json({
      message: "Baptism record deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
