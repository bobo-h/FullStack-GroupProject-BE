const OpenAI = require("openai");
const openaiController = require("./openai.controller");
const { getUserChatbots } = require("./chatbot.controller");
const commentController = {};
const Comment = require("../models/Comment");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

commentController.createComment = async (req, res) => {
  try {

    const { diaryId, content, parentCommentId, chatbotId, personality } =
      req.body; 
    let { userId } = req.body;

    if (!userId) {
      userId = req.userId;
    }

    if (!diaryId || !content) {
      return res.status(400).json({
        status: "fail",
        message: "diaryId와 content는 필수 입력 항목입니다.",
      });
    }

    const newUserComment = new Comment({
      diaryId,
      userId,
      chatbotId: null,
      content,
      parentCommentId: parentCommentId,
    });

    const savedUserComment = await newUserComment.save();

    const { systemMessage, personalityContent } =
      openaiController.chatbotMessagePersonality(personality, 30);

    const formattedMessages = [{ role: "user", content }]; 
    let currentMessage = content; 

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemMessage} ${personalityContent}`,
        },
        { role: "user", content: currentMessage },
      ],
    });

    let reply = completion.choices[0].message.content.trim();
    if (reply.length > 30) {
      reply = reply.substring(0, 30);
    }

    formattedMessages.push({ role: "assistant", content: reply });

    const newChatbotComment = await Comment.create({
      diaryId,
      userId: null, 
      chatbotId,
      content: reply,
      parentCommentId: savedUserComment._id, 
    });

    await newChatbotComment.save();

    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      status: "fail",
      message: "댓글 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

commentController.getComment = async (req, res) => {
  try {
    const { diaryId } = req.params; 

    if (!diaryId) {
      return res.status(400).json({
        status: "fail",
        message: "diaryId는 필수 입력 항목입니다.",
      });
    }

    const comments = await Comment.find({ diaryId })
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "chatbotId",
        path: "chatbotId",
        populate: {
          path: "product_id", 
          select: "image",
        },
      })
      .sort({ createdAt: 1 }) 
      .lean(); 

    const commentMap = {};
    const topLevelComments = [];

    comments.forEach((comment) => {
      comment.replies = []; 
      commentMap[comment._id] = comment;

      if (!comment.parentCommentId) {
        topLevelComments.push(comment); 
      } else {
        if (commentMap[comment.parentCommentId]) {
          commentMap[comment.parentCommentId].replies.push(comment);
        }
      }
    });

    res.status(200).json({
      status: "success",
      message: "댓글 목록을 성공적으로 가져왔습니다.",
      data: topLevelComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      status: "fail",
      message: "댓글 가져오는 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

commentController.createChatbotMessage = async (req, res) => {
  try {
    const { userId, diaryId } = req;
    const { content } = req.body;
    if (content.length === 0) {
      return res.status(400).json({ error: "Invalid message array" });
    }

    const userChatbotList = await getUserChatbots(userId);

    if (!userChatbotList || userChatbotList.length === 0) {
      return res.status(404).json({ error: "No chatbots found for this user" });
    }

    const createdComments = [];

    for (const chatbot of userChatbotList) {
      const { personality } = chatbot; 
      const chatbotId = chatbot._id; 

      const { systemMessage, personalityContent } =
        openaiController.chatbotMessagePersonality(personality, 30);

      const formattedMessages = [{ role: "user", content }];
      let currentMessage = content; 

      for (let i = 0; i < 1; i++) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `${systemMessage} ${personalityContent}`,
            },
            { role: "user", content: currentMessage },
          ],
        });

        let reply = completion.choices[0].message.content.trim();
        if (reply.length > 30) {
          reply = reply.substring(0, 30);
        }

        formattedMessages.push({ role: "assistant", content: reply });

        const newComment = await Comment.create({
          diaryId,
          userId: null, 
          chatbotId,
          content: reply, 
          parentCommentId: null, 
        });

        await newComment.save();

        createdComments.push(newComment);
      }
    }
    res.status(200).json({ status: "success", data: createdComments });
  } catch (error) {
    console.error("Error during OpenAI API chatbotMessage request:", error);
    res
      .status(400)
      .json({ error: "AI request chatbotMessage failed", rawError: error });
  }
};

module.exports = commentController;
