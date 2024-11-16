const Chatbot = require("../models/Chatbot");
const OpenAI = require("openai");
require("dotenv").config();
const chabotController = {};

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

//임시 고양이 성격
const CAT_TYPE = {
    name1: "kind, cute, like a princess",
    name2: "badguy",
    name3: "lazy"
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

module.exports = chabotController;