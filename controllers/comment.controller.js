const commentController = {};
const Comment = require("../models/Comment");

commentController.createComment = async (req, res) => {
  try {
    const { diaryId, content, parentCommentId } = req.body; // 클라이언트에서 전달받은 데이터
    const { userId, chatbotId } = req.body;
    // const userId = req.user._id; // 인증된 사용자의 ID

    // 필수 값 확인
    if (!userId && !chatbotId) {
      return res.status(400).json({
        status: "fail",
        message: "userId와 chatbotId 중 하나는 입력해야 합니다.",
      });

    }

    if (!diaryId || !content) {
      return res.status(400).json({
        status: "fail",
        message: "diaryId와 content는 필수 입력 항목입니다.",
      });
    }

    // 새로운 댓글 생성
    const newComment = new Comment({
      diaryId,
      userId: userId || null,
      chatbotId: chatbotId || null,
      content,
      parentCommentId: parentCommentId || null, // 대댓글이 아닌 경우 null
    });

    // 데이터베이스에 저장
    const savedComment = await newComment.save();

    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 생성되었습니다.",
      data: savedComment,
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

    // 해당 diaryId에 속한 댓글 가져오기
    const comments = await Comment.find({ diaryId })
      .populate("userId", "name email") // userId를 populate하여 사용자 정보 포함
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

module.exports = commentController;