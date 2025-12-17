import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // load env variables

// Initialize Express server 
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.envOPENAI_API_KEY
});

app.post("/api/getAISuggestions", async (req, res) => {
  const { recentTasks } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Suggest 3 tasks based on: ${recentTasks.join(", ")}` }
      ],
      max_tokens: 50
    });

    const suggestions = response.choices[0].message.content
      .split("\n")
      .map(t => t.replace(/^\d+\.?\s*/, ""));

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ suggestions: [] });
  }
});

app.listen(3001, () => console.log("AI server running on http://localhost:3001"));
