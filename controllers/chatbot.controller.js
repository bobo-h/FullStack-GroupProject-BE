const Chatbot = require("../models/Chatbot");
const OpenAI = require("openai");
require("dotenv").config();
const chabotController = {};

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
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



chabotController.createChatbot = async (req, res) => {
    try {
      const { userId, name, appearance, personality } = req.body;
  
      // 새 챗봇 객체 생성
      const newChatbot = new Chatbot({
        userId,
        name,
        appearance,
        personality,
      });
  
      // 데이터베이스에 챗봇 저장
      const savedChatbot = await newChatbot.save();
  
      // console.log("Chatbot saved:", savedChatbot);
      res.status(201).json(savedChatbot); // 저장된 챗봇 정보 반환
    } catch (error) {
      console.error("Error saving chatbot:", error);
      res.status(500).json({ error: "Failed to save chatbot", rawError: error });
    }
  };

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

//메인화면 고양이 말풍선 출력
chabotController.createPrintLine = async(req, res) => {
  try {
    const { message, catPersonality } = req.body;

    if (!CAT_PERSONALITY[catPersonality]) {
      return res.status(400).json({ error: "Invalid cat personality type" });
    }

    const personalityContent = CAT_PERSONALITY[catPersonality].description;
    const userMessage = `${message} (Respond in 20 characters or less.)`;
    const systemMessage = `You are a chatbot with a ${catPersonality} personality. Reply briefly, in 20 characters or less.`;
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

    console.log(reply); 

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Error during OpenAI API request:", error); 
    res.status(400).json({ error: "AI request failed", rawError: error });
  }
};


module.exports = chabotController;