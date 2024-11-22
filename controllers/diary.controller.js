const mongoose = require("mongoose");
const Diary = require("../models/Diary");

const diaryController = {};

diaryController.createDiary = async (req, res, next) => {
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

    // diary 생성 후에도 res, comment 생성 후에도 res
    // 서버가 클라이언트로 HTTP 응답을 두번 이상 보내려고 할때 발생
    // res.status(200).json({
    //   status: "success",
    //   diary: newDiary,
    // });

    // diaryId를 다음 챗봇댓글 생성에 보내주기 위해 작성
    req.diaryId = newDiary._id;
    //미들웨어로 쓰기 위해 추가
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

diaryController.getDiaryList = async (req, res) => {
  try {
    const userId = req.userId;
    const { year, month, page = 1, limit = 5 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const matchConditions = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    if (year || month) {
      matchConditions.$expr = {
        $and: [],
      };

      if (year) {
        matchConditions.$expr.$and.push({
          $eq: [{ $year: "$selectedDate" }, parseInt(year, 10)],
        });
      }

      if (month) {
        matchConditions.$expr.$and.push({
          $eq: [{ $month: "$selectedDate" }, parseInt(month, 10)],
        });
      }
    }

    const diaries = await Diary.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "moods",
          localField: "mood",
          foreignField: "_id",
          as: "moodDetails",
        },
      },
      {
        $unwind: {
          path: "$moodDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { selectedDate: -1 } },
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
      { $match: matchConditions },
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
    res.status(500).json({ status: "fail", error: error.message });
  }
};

diaryController.getDiaryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    const diary = await Diary.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
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
        $unwind: {
          path: "$moodDetails",
          preserveNullAndEmptyArrays: true,
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
      diary: diary[0],
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

diaryController.getFilterOptions = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const filterOptions = await Diary.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          years: { $addToSet: { $year: "$selectedDate" } },
          months: { $addToSet: { $month: "$selectedDate" } },
        },
      },
      {
        $project: {
          _id: 0,
          years: { $sortArray: { input: "$years", sortBy: -1 } },
          months: { $sortArray: { input: "$months", sortBy: -1 } },
        },
      },
    ]);

    if (!filterOptions || filterOptions.length === 0) {
      return res.status(200).json({
        years: [],
        months: [],
      });
    }

    res.status(200).json(filterOptions[0]);
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

diaryController.getDeletedDiaryList = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const deletedDiaries = await Diary.find({
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: true,
    })
      .sort({ selectedDate: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select("_id title content image selectedDate mood createdAt updatedAt");

    const totalDeletedCount = await Diary.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: true,
    });

    const totalPages = Math.ceil(totalDeletedCount / pageSize);

    res.status(200).json({
      data: deletedDiaries,
      currentPage: pageNumber,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

diaryController.restoreDiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Diary ID is required." });
    }

    const diary = await Diary.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: true, // 삭제된 상태의 다이어리만 복구 가능
    });

    if (!diary) {
      return res
        .status(404)
        .json({ message: "Diary not found or not deleted." });
    }

    diary.isDeleted = false;
    await diary.save();

    res.status(200).json({
      status: "success",
      message: "Diary successfully restored.",
      diary,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

module.exports = diaryController;
