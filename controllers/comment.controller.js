const OpenAI = require("openai");
const openaiController = require("./openai.controller");
const { getUserChatbots } = require("./chatbot.controller");
const commentController = {};
const Comment = require("../models/Comment");
require("dotenv").config();
// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 유저와 챗봇 댓글 동시 생성
commentController.createComment = async (req, res) => {
  try {
    // 1. 유저만이 댓글 폼을 통해서 댓글 작성
    // 2. req.body의 userId는 null 값
    // 3. authenticate로 userId를 불러옴
    // 4. 유저의 댓글 생성 (diaryId, content (유저가 쓴 내용), parentCommentId 이용)

    const { diaryId, content, parentCommentId, chatbotId, personality } =
      req.body; // 클라이언트에서 전달받은 데이터
    let { userId } = req.body;

    if (!userId) {
      userId = req.userId;
    }
    // // 필수 값 확인
    // if (!userId && !chatbotId) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "userId와 chatbotId 중 하나는 입력해야 합니다.",
    //   });
    // }

    if (!diaryId || !content) {
      return res.status(400).json({
        status: "fail",
        message: "diaryId와 content는 필수 입력 항목입니다.",
      });
    }

    // 일단 유저 댓글 생성
    const newUserComment = new Comment({
      diaryId,
      userId,
      chatbotId: null,
      content,
      parentCommentId: parentCommentId,
    });

    // 유저 댓글 DB에 저장
    // 작성한 유저의 아이디를 챗봇의 parentCommentId로 사용하기 위해 추출
    const savedUserComment = await newUserComment.save();

    // 유저의 댓글에 따른 챗봇 댓글을 바로 생성 (챗봇 성격 가져와야 함)
    // 성격과 기본 시스템 메시지를 기반으로 OpenAI 메시지 생성
    const { systemMessage, personalityContent } =
      openaiController.chatbotMessagePersonality(personality, 20);

    const formattedMessages = [{ role: "user", content }]; // 초기 메시지 설정
    let currentMessage = content; // OpenAI와 대화의 시작 메시지

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
    if (reply.length > 20) {
      reply = reply.substring(0, 20);
    }

    formattedMessages.push({ role: "assistant", content: reply });

    // Comment 스키마에 챗봇 댓글 생성
    const newChatbotComment = await Comment.create({
      diaryId,
      userId: null, // 사용자 ID는 null로 설정 (챗봇이 생성한 경우)
      chatbotId,
      content: reply, // 댓글 내용
      parentCommentId: savedUserComment._id, // 방금 작성한 유저 댓글의 아이디
    });

    await newChatbotComment.save();

    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 생성되었습니다.",
      //데이터 보낼 필요 없는 거 같아 일단 주석처리
      // data :
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
    const { diaryId } = req.params; // 요청 URL에서 diaryId 가져오기

    // 필수 값 확인
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
        path: "chatbotId", // chatbotId를 참조
        populate: {
          path: "product_id", // Product 컬렉션 참조
          select: "image", // Product에서 image 필드만 가져옴 (댓글 쪽에서 이미지 넣는 곳이 있어서)
        },
      })
      .sort({ createdAt: 1 }) // 생성 시간순으로 정렬
      .lean(); // Mongoose 문서를 일반 JavaScript 객체로 변환

    // 댓글과 대댓글 계층 구조로 정렬
    const commentMap = {};
    const topLevelComments = [];

    comments.forEach((comment) => {
      comment.replies = []; // 대댓글 리스트 초기화
      commentMap[comment._id] = comment;

      if (!comment.parentCommentId) {
        topLevelComments.push(comment); // 최상위 댓글
      } else {
        // 대댓글인 경우 부모 댓글의 replies에 추가
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

// 다이어리 생성시, 챗봇리스트들이 댓글 생성
commentController.createChatbotMessage = async (req, res) => {
  try {
    // 다이어리 아이디가 필요
    const { userId, diaryId } = req;
    const { content } = req.body;
    if (content.length === 0) {
      return res.status(400).json({ error: "Invalid message array" });
    }

    // 유저의 챗봇 리스트 가져오기
    const userChatbotList = await getUserChatbots(userId);

    if (!userChatbotList || userChatbotList.length === 0) {
      return res.status(404).json({ error: "No chatbots found for this user" });
    }

    // 생성된 댓글 정보를 저장하는 배열
    const createdComments = [];

    for (const chatbot of userChatbotList) {
      const { personality } = chatbot; // 챗봇의 성격 가져오기
      const chatbotId = chatbot._id; // 챗봇 고유 ID 가져오기

      // 성격과 기본 시스템 메시지를 기반으로 OpenAI 메시지 생성
      const { systemMessage, personalityContent } =
        openaiController.chatbotMessagePersonality(personality, 20);

      const formattedMessages = [{ role: "user", content }]; // 초기 메시지 설정
      let currentMessage = content; // OpenAI와 대화의 시작 메시지

      for (let i = 0; i < 1; i++) {
        // 허용된 댓글 수를 1로 제한
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
        if (reply.length > 20) {
          reply = reply.substring(0, 20);
        }

        formattedMessages.push({ role: "assistant", content: reply });

        // Comment 스키마에 데이터 생성
        const newComment = await Comment.create({
          diaryId,
          userId: null, // 사용자 ID는 null로 설정 (챗봇이 생성한 경우)
          chatbotId,
          content: reply, // 댓글 내용
          parentCommentId: null, // 부모 댓글 ID (최상위 댓글)
        });

        await newComment.save();

        // 생성된 댓글 정보를 배열에 추가
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
