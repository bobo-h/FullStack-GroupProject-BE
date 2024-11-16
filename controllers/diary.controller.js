const Diary = require("../models/Diary");

const diaryController = {};

diaryController.createDiary = async (req, res) => {
  try {
    const { userId, title, content, image, selectedDate, mood } = req.body;
    if (!userId || !title || !content || !image || !selectedDate || !mood) {
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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const diaries = await Diary.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
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
    ]);

    res.status(200).json({
      status: "success",
      data: diaries,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

module.exports = diaryController;
