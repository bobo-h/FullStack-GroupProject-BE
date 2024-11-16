const Chatbot = require("../models/Chatbot");
const OpenAI = require("openai");
require("dotenv").config();
const chabotController = {};

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

//임시 고양이 성격
const CAT_TYPE = {
  name1: "kind, cute, like a princess",
  name2: "badguy",
  name3: "lazy",
};

chabotController.createChatbot = async (req, res) => {
  try {
    // const userId = req.user._id; -> 미들웨어로 사용자 정보를 가져올때 여기있을 가능성이 높아보입니당.
    const {
      userId,
      name,
      appearance,
      personality,
      // productId
    } = req.body;

    // 새 챗봇 객체 생성
    const newChatbot = new Chatbot({
      userId,
      name,
      appearance,
      personality,
      // productId
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

// 메인화면에서 쳇봇 정보를 가져오기 위한 컨트롤러
// chatbotController.getChatbots = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const chatbots = await Chatbot.find({ user_id: userId })
//       .populate('product_id') // product_id를 통해 Product 정보 가져오기
//       .exec();

//     res.json(chatbots);
//   } catch (error) {
//     console.error("Error fetching chatbots:", error);
//     res.status(500).json({ error: "챗봇 정보를 가져오는 데 실패했습니다." });
//   }
// };

// 메인화면에서 쳇봇 위치 변경이 있을 때.
// chatbotController.updateChatbotPosition = async (req, res) => {
//   try {
//     const { x, y } = req.body;
//     const chatbotId = req.params.chatbotId;

//     await Chatbot.findByIdAndUpdate(chatbotId, { position: { x, y } });
//     res.status(200).json({ message: '위치가 업데이트되었습니다.' });
//   } catch (error) {
//     console.error("Error updating chatbot position:", error);
//     res.status(500).json({ error: "챗봇 위치 업데이트에 실패했습니다." });
//   }
// };

module.exports = chabotController;
