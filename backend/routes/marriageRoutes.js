import express from "express";
import Marriage from "../models/Marriage.js";
import Member from "../models/Member.js";

const router = express.Router();

// ➕ Add Marriage Record
router.post("/", async (req, res) => {
  try {
    const {
      marriage_id,
      date,
      place,
      solemnized_by,
      officiant_number,

      spouse1_isParishioner,
      spouse1_id,
      spouse1_name,
      spouse1_address,
      spouse1_city_district,
      spouse1_state_country,
      spouse1_father_name,
      spouse1_mother_name,
      spouse1_home_parish,

      spouse2_isParishioner,
      spouse2_id,
      spouse2_name,
      spouse2_address,
      spouse2_city_district,
      spouse2_state_country,
      spouse2_father_name,
      spouse2_mother_name,
      spouse2_home_parish
    } = req.body;

    // Auto-generate reg_no: YY/NNNN
    const now = new Date();
    const year2 = String(now.getFullYear()).slice(-2);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const countThisYear = await Marriage.countDocuments({
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });
    const regNo = `${year2}/${String(countThisYear + 1).padStart(4, '0')}`;

    // ----------------------------
    // Basic validation
    // ----------------------------
    if (!date) {
      return res.status(400).json({ error: "Marriage date is required" });
    }

    if (spouse1_isParishioner && !spouse1_id) {
      return res.status(400).json({ error: "Spouse 1 member required" });
    }

    if (spouse2_isParishioner && !spouse2_id) {
      return res.status(400).json({ error: "Spouse 2 member required" });
    }

    if (spouse1_id && spouse2_id && spouse1_id === spouse2_id) {
      return res.status(400).json({ error: "Spouses cannot be the same person" });
    }

    // ----------------------------
    // Fetch members if parishioners
    // ----------------------------
    let spouse1Member = null;
    let spouse2Member = null;

    if (spouse1_isParishioner) {
      spouse1Member = await Member.findById(spouse1_id);
      if (!spouse1Member || spouse1Member.deceased) {
        return res.status(400).json({ error: "Invalid spouse 1 member" });
      }
    }

    if (spouse2_isParishioner) {
      spouse2Member = await Member.findById(spouse2_id);
      if (!spouse2Member || spouse2Member.deceased) {
        return res.status(400).json({ error: "Invalid spouse 2 member" });
      }
    }

    // ----------------------------
    // Auto-generate marriage_id from reg_no if not provided
    // ----------------------------
    const finalMarriageId = marriage_id || regNo;


    // ----------------------------
    // Create marriage record
    // ----------------------------
    const marriage = new Marriage({
      marriage_id: finalMarriageId,
      reg_no: regNo,

      spouse1_isParishioner,
      spouse1_id: spouse1Member?._id || null,
      spouse1_name: spouse1Member?.name || spouse1_name,
      spouse1_address: spouse1_address || null,
      spouse1_city_district: spouse1_city_district || null,
      spouse1_state_country: spouse1_state_country || null,
      spouse1_father_name: spouse1_father_name || null,
      spouse1_mother_name: spouse1_mother_name || null,
      spouse1_home_parish: spouse1_isParishioner ? null : spouse1_home_parish,

      spouse2_isParishioner,
      spouse2_id: spouse2Member?._id || null,
      spouse2_name: spouse2Member?.name || spouse2_name,
      spouse2_address: spouse2_address || null,
      spouse2_city_district: spouse2_city_district || null,
      spouse2_state_country: spouse2_state_country || null,
      spouse2_father_name: spouse2_father_name || null,
      spouse2_mother_name: spouse2_mother_name || null,
      spouse2_home_parish: spouse2_isParishioner ? null : spouse2_home_parish,

      date,
      place,
      solemnized_by,
      officiant_number
    });

    await marriage.save();

    // ----------------------------
    // Update member marital status
    // ----------------------------
    if (spouse1Member) {
      await Member.findByIdAndUpdate(spouse1Member._id, {
        marital_status: "Married",
        spouse_id: spouse2Member?._id || null,
        spouse_name: spouse2Member?.name || spouse2_name
      });
    }

    if (spouse2Member) {
      await Member.findByIdAndUpdate(spouse2Member._id, {
        marital_status: "Married",
        spouse_id: spouse1Member?._id || null,
        spouse_name: spouse1Member?.name || spouse1_name
      });
    }

    res.status(201).json({
      message: "Marriage record added successfully",
      marriage
    });

  } catch (err) {
    console.error("Error adding marriage:", err);

    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate marriage ID" });
    }

    res.status(400).json({ error: err.message });
  }
});

// 📜 Get All Marriages
router.get("/", async (req, res) => {
  try {
    const marriages = await Marriage.find()
      .populate('spouse1_id', 'name phone family_number')
      .populate('spouse2_id', 'name phone family_number')
      .sort({ date: -1 });
    res.json(marriages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Search marriages by spouse name
router.get("/search/:name", async (req, res) => {
  try {
    const searchName = req.params.name;
    const marriages = await Marriage.find({
      $or: [
        { spouse1_name: { $regex: searchName, $options: 'i' } },
        { spouse2_name: { $regex: searchName, $options: 'i' } }
      ]
    }).sort({ date: -1 });

    res.json(marriages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get marriages by date range
router.get("/date-range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const marriages = await Marriage.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });

    res.json(marriages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get marriages by year
router.get("/year/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const marriages = await Marriage.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    res.json(marriages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Get Marriage Statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const totalMarriages = await Marriage.countDocuments();
    const currentYear = new Date().getFullYear();

    const marriagesThisYear = await Marriage.countDocuments({
      date: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    const marriagesByYear = await Marriage.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalMarriages,
      marriagesThisYear,
      marriagesByYear
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📜 Get One Marriage
router.get("/:id", async (req, res) => {
  try {
    const marriage = await Marriage.findById(req.params.id)
      .populate('spouse1_id')
      .populate('spouse2_id');

    if (!marriage) {
      return res.status(404).json({ error: "Marriage not found" });
    }

    res.json(marriage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Marriage Record
router.put("/:id", async (req, res) => {
  try {
    const updatedMarriage = await Marriage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMarriage) {
      return res.status(404).json({ error: "Marriage not found" });
    }

    res.json(updatedMarriage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Marriage Record
router.delete("/:id", async (req, res) => {
  try {
    const marriage = await Marriage.findByIdAndDelete(req.params.id);

    if (!marriage) {
      return res.status(404).json({ error: "Marriage not found" });
    }

    if (marriage.spouse1_id) {
      await Member.findByIdAndUpdate(marriage.spouse1_id, {
        marital_status: "Single",
        $unset: { spouse_id: 1, spouse_name: 1 }
      });
    }

    if (marriage.spouse2_id) {
      await Member.findByIdAndUpdate(marriage.spouse2_id, {
        marital_status: "Single",
        $unset: { spouse_id: 1, spouse_name: 1 }
      });
    }

    res.json({ message: "Marriage record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
