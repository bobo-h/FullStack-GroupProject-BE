const OpenAI = require("openai");
require("dotenv").config();

const openaiController = {};

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

// 챗봇성격 및 시스템 메시지를 생성하는 함수
openaiController.chatbotMessagePersonality = (catPersonality, maxLength) => {
  // catPersonality가 CAT_PERSONALITY 객체에 정의된 키가 아니면 그대로 문자열을 사용
  const personalityContent = CAT_PERSONALITY[catPersonality] || catPersonality;

  if (!personalityContent) {
    throw new Error("Invalid cat personality type");
  }

  const systemMessage = `You are a chatbot with a ${catPersonality} personality. Reply briefly, in ${maxLength} characters or less.`;

  return { systemMessage, personalityContent };
};

// 챗봇 - 댓글/대댓글
// openaiController.createChatbotMessage = async (req, res) => {
//   try {
//     const { message, allowedReplies, catPersonality } = req.body;

//     if (!Array.isArray(message) || message.length === 0) {
//       return res.status(400).json({ error: "Invalid message array" });
//     }
//     if (
//       !allowedReplies ||
//       typeof allowedReplies !== "number" ||
//       allowedReplies <= 0
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Invalid number of allowed replies" });
//     }

//     //성격 보내주면 Open AI가 메세지 받아옴
//     const { systemMessage, personalityContent } =
//       openaiController.chatbotMessagePersonality(catPersonality, 20);

//     const formattedMessages = [{ role: "user", content: message[0] }];
//     let currentMessage = message[0];

//     for (let i = 0; i < allowedReplies; i++) {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: `${systemMessage} ${personalityContent}` },
//           { role: "user", content: currentMessage },
//         ],
//       });

//       let reply = completion.choices[0].message.content.trim();
//       if (reply.length > 20) {
//         reply = reply.substring(0, 20);
//       }

//       formattedMessages.push({ role: "assistant", content: reply });
//       currentMessage = reply;
//     }

//     res.status(200).json({ reply: formattedMessages });
//   } catch (error) {
//     console.error("Error during OpenAI API chatbotMessage request:", error);
//     res
//       .status(400)
//       .json({ error: "AI request chatbotMessage failed", rawError: error });
//   }
// };

// 챗봇 - 메인화면 말풍선
openaiController.createPrintLine = async (req, res) => {
  try {
    const { message, catPersonality } = req.body;
    // console.log("잘 도착하니?", message, catPersonality);

    const { systemMessage, personalityContent } =
      openaiController.chatbotMessagePersonality(catPersonality, 10);

    const userMessage = `${message} (Respond in 10 characters or less.)`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${systemMessage} ${personalityContent}` },
        { role: "user", content: userMessage },
      ],
    });

    let reply = completion.choices[0].message.content.trim();
    // console.log("잘 도착하니?222", reply);
    if (reply.length > 10) {
      reply = reply.substring(0, 10);
    }
    // console.log("잘 도착하니?333", reply);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error during OpenAI API printLine request:", error);
    res
      .status(400)
      .json({ error: "AI request printLine failed", rawError: error });
  }
};

module.exports = openaiController;
