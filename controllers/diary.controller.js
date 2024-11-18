const mongoose = require("mongoose");
const Diary = require("../models/Diary");

const diaryController = {};

diaryController.createDiary = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content, image, selectedDate, mood } = req.body;
    if (!title || !content || !image || !selectedDate || !mood) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const newDiary = new Diary({
      userId,
      title,
      content,
      image,
      selectedDate,
      mood,
    });
    await newDiary.save();

    res.status(200).json({
      status: "success",
      diary: newDiary,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

diaryController.getDiaryList = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const diaries = await Diary.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$selectedDate" },
            month: { $month: "$selectedDate" },
          },
          diaries: {
            $push: {
              id: "$_id",
              title: "$title",
              content: "$content",
              image: "$image",
              selectedDate: "$selectedDate",
              mood: "$mood",
              isEdited: "$isEdited",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      {
        $project: {
          _id: 0,
          yearMonth: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          diaries: 1,
        },
      },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
    ]);
    const totalGroups = await Diary.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$selectedDate" },
            month: { $month: "$selectedDate" },
          },
        },
      },
    ]);

    const totalPages = Math.ceil(totalGroups.length / pageSize);

    res.status(200).json({
      data: diaries,
      currentPage: pageNumber,
      totalPages,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

diaryController.getDiaryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    const diary = await Diary.findOne({
      _id: mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!diary) {
      return res.status(404).json({ message: "Diary not found." });
    }

    res.status(200).json({
      status: "success",
      diary,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

diaryController.deleteDiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    const updatedDiary = await Diary.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id), isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!updatedDiary) {
      return res
        .status(404)
        .json({ message: "Diary not found or already deleted." });
    }

    res.status(200).json({
      status: "success",
      message: "Diary successfully deleted.",
      diary: updatedDiary,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

diaryController.updateDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image, selectedDate, mood } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    if (!title || !content || !image || !selectedDate || !mood) {
      return res
        .status(400)
        .json({ message: "All fields are required for updating." });
    }

    const updatedDiary = await Diary.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id), isDeleted: false },
      { title, content, image, selectedDate, mood },
      { new: true, runValidators: true }
    );

    if (!updatedDiary) {
      return res
        .status(404)
        .json({ message: "Diary not found or has been deleted." });
    }

    res.status(200).json({
      status: "success",
      message: "Diary successfully updated.",
      diary: updatedDiary,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

module.exports = diaryController;
