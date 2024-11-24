const Chatbot = require("../models/Chatbot");
const mongoose = require("mongoose");
const OpenAI = require("openai");
require("dotenv").config();

const chatbotController = {};

const validateIds = (userId, chatbotId) => {
  const userIdValidation = validateObjectId(userId, "user_id");
  const chatbotIdValidation = validateObjectId(chatbotId, "chatbotId");

  if (!userIdValidation.isValid) {
    return { isValid: false, message: userIdValidation.message };
  }

  if (!chatbotIdValidation.isValid) {
    return { isValid: false, message: chatbotIdValidation.message };
  }

  return { isValid: true };
};

chatbotController.createChatbot = async (req, res) => {
  try {
    const {
      product_id = req.body.product_id,
      name,
      personality,
      position,
      zIndex,
      flip,
      visualization,
    } = req.body;

    const { userId } = req;
    const user_id = userId;

    if (!product_id || !name || !personality) {
      return res.status(400).json({ error: "필수 값이 누락되었습니다." });
    }

    const newChatbot = new Chatbot({
      user_id,
      product_id,
      name,
      personality,
      position,
      zIndex,
      flip,
      visualization,
    });

    const savedChatbot = await newChatbot.save();
    res.status(201).json(savedChatbot);
  } catch (error) {
    res.status(500).json({ error: "Failed to save chatbot", rawError: error });
  }
};

chatbotController.getChatbots = async (req, res) => {
  try {
    const { userId } = req;

    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const chatbots = await Chatbot.find({ user_id: objectIdUserId }).populate({
      path: "product_id", 
    });

    if (!chatbots || chatbots.length === 0) {
      return res.status(404).json({ message: "No chatbots found" });
    }

    res.status(200).json(chatbots);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch chatbots", rawError: error });
  }
};

chatbotController.getChatbotDetail = async (req, res) => {
  try {
    const { userId, chatbotId } = req.params;

    const validation = validateIds(userId, chatbotId);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const objectIdChatbotId = new mongoose.Types.ObjectId(chatbotId);

    const chatbotDetail = await Chatbot.findOne({
      _id: objectIdChatbotId,
      user_id: objectIdUserId,
    });

    if (!chatbotDetail) {
      return res.status(404).json({ message: "No chatbot found" });
    }

    res.status(200).json(chatbotDetail);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch chatbots", rawError: error });
  }
};

chatbotController.updateChatbotPosition = async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { position, zIndex, flip, visualization } = req.body;
    const userId = req.userId;
    const chatbot = await Chatbot.findById(chatbotId);

    if (!chatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }
    if (chatbot.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this chatbot" });
    }

    const updateData = {};
    if (position) updateData.position = position;
    if (zIndex !== undefined) updateData.zIndex = zIndex;
    if (flip !== undefined) updateData.flip = flip;
    if (visualization !== undefined) updateData.visualization = visualization;

    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      updateData,
      { new: true }
    );

    if (!updatedChatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.status(200).json(updatedChatbot); 
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update chatbot position", rawError: error });
  }
};

chatbotController.updateName = async (req, res) => {
  try {
    const { chatbotId } = req.params; 
    const { name } = req.body; 

    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      { name },
      { new: true } 
    );

    if (!updatedChatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.status(200).json(updatedChatbot); 
  } catch (error) {
    console.error("Error updating chatbot name:", error);
    res
      .status(500)
      .json({ error: "Failed to update chatbot name", rawError: error });
  }
};

chatbotController.deleteChatbot = async (req, res) => {
  try {
    const { chatbotId } = req.params;

    const deletedChatbot = await Chatbot.findByIdAndDelete(chatbotId);

    if (!deletedChatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.status(200).json({ message: "Chatbot deleted successfully" });
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    res
      .status(500)
      .json({ error: "Failed to delete chatbot", rawError: error });
  }
};

chatbotController.updateChatbotJins = async (req, res) => {
  try {
    const { id } = req.params;
    const chatbotId = id;
    const { visualization, position, defaultPosition, zIndex, flip, name } =
      req.body;

    const updateData = {};
    if (visualization !== undefined) updateData.visualization = visualization;
    if (defaultPosition !== undefined)
      updateData.defaultPosition = defaultPosition;
    if (position !== undefined) updateData.position = position;
    if (zIndex !== undefined) updateData.zIndex = zIndex;
    if (flip !== undefined) updateData.flip = flip;
    if (name !== undefined) updateData.name = name;

    const chatbot = await Chatbot.findOne({ _id: chatbotId });
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: "Chatbot not found or unauthorized",
      });
    }

    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      { $set: updateData },
      { new: true } 
    ).populate({
      path: "product_id", 
    });

    res.status(200).json({
      success: true,
      data: updatedChatbot,
    });
  } catch (error) {
    console.error("Error updating chatbot:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update chatbot",
    });
  }
};

chatbotController.updateChatbotsByUser = async (req, res) => {
  try {
    const { userId } = req;
    const { updates } = req.body; 
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided",
      });
    }

    const bulkOps = updates.map(({ _id, user_id, ...updateData }) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(_id),
          user_id: objectIdUserId,
        },
        update: { $set: updateData },
      },
    }));

    const result = await Chatbot.bulkWrite(bulkOps);

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No chatbots were updated",
      });
    }

    const chatbots = await Chatbot.find({ user_id: objectIdUserId }).populate({
      path: "product_id", 
    });

    res.status(200).json({
      success: true,
      message: "Chatbots updated successfully",
      updatedCount: result.modifiedCount,
      data: chatbots,
    });
  } catch (error) {
    console.error("Error updating chatbots:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update chatbots",
      rawError: error,
    });
  }
};

const getUserChatbots = async (userId) => {
  try {
    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const userChatbots = await Chatbot.find({
      user_id: objectIdUserId,
      visualization: true,
    }).populate({
      path: "product_id", 
    });
    return userChatbots;
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    throw new Error("Failed to fetch chatbots");
  }
};

module.exports = { getUserChatbots, ...chatbotController };
