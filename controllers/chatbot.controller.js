const Chatbot = require("../models/Chatbot");
const mongoose = require('mongoose');
const OpenAI = require("openai");
require("dotenv").config();

const chatbotController = {};

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const CAT_PERSONALITY = {
  ISFP: "creative, sensitive, and enjoy being spontaneous. They love exploring their environment and are very independent. While they can be quiet, they also have a gentle, emotional side that makes them kind and caring. 고양이이고 반말을 한다.",
  INFP: "idealistic, creative, and driven by their values. They seek authenticity and enjoy deep, meaningful connections. Often introspective and imaginative. 고양이이고 반말을 한다.",
  INFJ: "deep thinkers, empathetic, and focused on understanding others. They seek to help people and can often be perfectionistic. 고양이이고 반말을 한다.",
  INTJ: "strategic, analytical, and independent thinkers. They enjoy problem-solving and are often seen as visionaries. 고양이이고 반말을 한다.",
  ISFJ: "loyal, responsible, and hardworking. They value traditions and love helping others, often putting others' needs before their own. 고양이이고 반말을 한다.",
  ISTJ: "detail-oriented, organized, and practical. They value order and stability, often relying on past experiences to guide them. 고양이이고 반말을 한다.",
  ESTJ: "decisive, pragmatic, and responsible. They enjoy leadership roles and value structure, rules, and tradition. 고양이이고 반말을 한다.",
  ESFJ: "sociable, caring, and always looking out for others. They value harmony and enjoy creating strong relationships with those around them. 고양이이고 반말을 한다.",
  ENFP: "enthusiastic, imaginative, and full of energy. They are curious about the world and love exploring new ideas and possibilities. 고양이이고 반말을 한다.",
  ENFJ: "charismatic, empathetic, and natural leaders. They value helping others and seek to bring out the best in people. 고양이이고 반말을 한다.",
  ENTP: "innovative, curious, and clever. They love to challenge ideas and are always seeking new opportunities and possibilities. 고양이이고 반말을 한다.",
  ENTJ: "confident, strategic, and goal-oriented. They enjoy taking charge and are often focused on achieving success. 고양이이고 반말을 한다.",
  ESTP: "energetic, outgoing, and action-oriented. They enjoy living in the moment and thrive in high-energy environments. 고양이이고 반말을 한다.",
  ESFP: "spontaneous, fun-loving, and people-oriented. They enjoy making the most of life and bringing joy to others. 고양이이고 반말을 한다.",
  ISTP: "practical, logical, and independent. They love solving problems and enjoy working with their hands and tools. 고양이이고 반말을 한다.",
  INTP: "analytical, curious, and open-minded. They love exploring abstract concepts and seeking deep understanding. 고양이이고 반말을 한다.",
};


//챗봇 생성
chatbotController.createChatbot = async (req, res) => {
  try {
    // const userId = req.user._id; -> 미들웨어로 사용자 정보를 가져올때 여기있을 가능성이 높아보입니당.
    const {
      user_id = req.body.user_id, 
      product_id= req.body.product_id, 
      name, 
      personality, 
      position, 
      zIndex, 
      flip, 
      visualization 
    } = req.body;
    
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
    
    // 데이터베이스에 챗봇 저장
    const savedChatbot = await newChatbot.save();

    console.log("Chatbot saved:", savedChatbot);
    res.status(201).json(savedChatbot); // 저장된 챗봇 정보 반환
  } catch (error) {
    console.error("Error saving chatbot:", error);
    res.status(500).json({ error: "Failed to save chatbot", rawError: error });
  }
};


//챗봇 가져오기
chatbotController.getChatbots = async (req, res) => {
  try {
    // 요청에서 userId 추출
    const { userId } = req;

    // userId가 올바른 ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user_id format" });
    }

    // userId를 ObjectId로 변환
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // 변환된 ObjectId로 Chatbot을 찾기
    const chatbots = await Chatbot.find({ user_id: objectIdUserId });

    // 결과가 없으면 에러 메시지 반환
    if (!chatbots || chatbots.length === 0) {
      return res.status(404).json({ message: "No chatbots found" });
    }

    // 결과 반환
    res.status(200).json(chatbots);

  } catch (error) {
    console.error("Error fetching chatbots:", error);
    res.status(500).json({ error: "Failed to fetch chatbots", rawError: error });
  }
};


//챗봇 수정 - 위치수정
chatbotController.updateChatbotPosition = async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { position, zIndex, flip, visualization } = req.body;
    const userId = req.userId;

    console.log("User ID from request:", userId);
    console.log("Chatbot ID from params:", chatbotId);

    // 챗봇을 찾기 전에 userId와 일치하는지 확인
    const chatbot = await Chatbot.findById(chatbotId);

    if (!chatbot) {
      console.log("Chatbot not found");
      return res.status(404).json({ error: "Chatbot not found" });
    }

    console.log("Found chatbot:", chatbot);

    // 챗봇이 사용자에게 속하는지 확인
    if (chatbot.user_id.toString() !== userId) {
      console.log("Unauthorized access");
      return res.status(403).json({ error: "Unauthorized to update this chatbot" });
    }

    // prepare update data
    const updateData = {};
    if (position) updateData.position = position;
    if (zIndex !== undefined) updateData.zIndex = zIndex;
    if (flip !== undefined) updateData.flip = flip;
    if (visualization !== undefined) updateData.visualization = visualization;

    console.log("Update data:", updateData);

    // 챗봇을 찾아서 업데이트
    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      updateData,
      { new: true }
    );

    console.log("Updated Chatbot:", updatedChatbot);

    if (!updatedChatbot) {
      console.log("Update failed");
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.status(200).json(updatedChatbot); // Updated chatbot response
  } catch (error) {
    console.error("Error updating chatbot position:", error);
    res.status(500).json({ error: "Failed to update chatbot position", rawError: error });
  }
};




//챗봇 수정 - name 수정
chatbotController.updateName = async (req, res) => {
  try {
    const { chatbotId } = req.params; // URL에서 chatbotId 가져오기
    const { name } = req.body; // 요청 본문에서 새로운 이름 가져오기

    // 챗봇 이름 업데이트
    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      { name },
      { new: true } // 업데이트 후 수정된 문서를 반환
    );

    // 챗봇이 존재하지 않을 경우
    if (!updatedChatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    res.status(200).json(updatedChatbot); // 수정된 챗봇 정보 반환
  } catch (error) {
    console.error("Error updating chatbot name:", error);
    res.status(500).json({ error: "Failed to update chatbot name", rawError: error });
  }
};



//챗봇 삭제
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
    res.status(500).json({ error: "Failed to delete chatbot", rawError: error });
  }
};


// 챗봇 - 댓글/대댓글
// chabotController.createChatbotMessage = async(req, res) =>{
//     try {
//         // 프론트엔드에서 들고온 메시지 받아서
//         const { message, catType } = req.body;

//         // ChatGPT에 전달
//         const completion = await openai.chat.completions.create({
//           model: "gpt-4o-mini",
//           messages: [
//             { role: "system", content: CAT_TYPE[catType] },
//             { role: "user", content: message },
//           ],
//         });

//         const reply = completion.choices[0].message.content;
//         console.log(reply);
//         res.status(200).json({ reply });
//       } catch (error) {
//         console.error("Error during OpenAI API request:", error);
//         res.status(400).json({ error: "AI request failed", rawError: error });
//       }
// }

// 챗봇 - 메인화면 말풍선
chatbotController.createPrintLine = async(req, res) => {
  try {
    const { message, catPersonality } = req.body;

    if (!CAT_PERSONALITY[catPersonality]) {
      return res.status(400).json({ error: "Invalid cat personality type" });
    }

    const personalityContent = CAT_PERSONALITY[catPersonality].description;
    const userMessage = `${message} (Respond in 10 characters or less.)`;
    const systemMessage = `You are a chatbot with a ${catPersonality} personality. Reply briefly, in 10 characters or less.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${systemMessage} ${personalityContent}` },
        { role: "user", content: userMessage },
      ],
    });

    let reply = completion.choices[0].message.content.trim();

    if (reply.length > 10) {
      reply = reply.substring(0, 10); 
    }

    // console.log(reply); 

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Error during OpenAI API request:", error); 
    res.status(400).json({ error: "AI request failed", rawError: error });
  }
};


module.exports = chatbotController;
