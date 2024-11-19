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
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "moods",
          localField: "mood",
          foreignField: "_id",
          as: "moodDetails",
        },
      },
      {
        $unwind: "$moodDetails",
      },
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
              mood: {
                id: "$moodDetails._id",
                name: "$moodDetails.name",
                image: "$moodDetails.image",
              },
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
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
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

    // Diary ID 확인
    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    const diary = await Diary.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false, // isDeleted 필터링
        },
      },
      {
        $lookup: {
          from: "moods", // Mood 컬렉션 이름
          localField: "mood",
          foreignField: "_id",
          as: "moodDetails",
        },
      },
      {
        $unwind: {
          path: "$moodDetails",
          preserveNullAndEmptyArrays: true, // 무드가 없는 경우에도 데이터를 유지
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          image: 1,
          selectedDate: 1,
          isEdited: 1,
          createdAt: 1,
          updatedAt: 1,
          mood: {
            id: "$moodDetails._id",
            name: "$moodDetails.name",
            image: "$moodDetails.image",
          },
        },
      },
    ]);

    if (!diary || diary.length === 0) {
      return res.status(404).json({ message: "Diary not found." });
    }

    res.status(200).json({
      status: "success",
      diary: diary[0], // Aggregate 결과가 배열이므로 첫 번째 요소 선택
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

    const diary = await Diary.findById(id);

    if (!diary || diary.isDeleted) {
      return res
        .status(404)
        .json({ message: "Diary not found or already deleted." });
    }

    diary.isDeleted = true;
    await diary.save();

    res.status(200).json({
      status: "success",
      message: "Diary successfully deleted.",
      diary,
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

    const diary = await Diary.findOne({ _id: id });

    if (!diary || diary.isDeleted) {
      return res
        .status(404)
        .json({ message: "Diary not found or has been deleted." });
    }

    diary.title = title;
    diary.content = content;
    diary.image = image;
    diary.selectedDate = selectedDate;
    diary.mood = mood;

    await diary.save();

    res.status(200).json({
      status: "success",
      message: "Diary successfully updated.",
      diary,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

module.exports = diaryController;
