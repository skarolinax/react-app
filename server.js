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
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/getAISuggestions", async (req, res) => {
  const { recentTasks } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
       messages: [
      {
        role: "system",
        content: "You are a task suggestion assistant. You must ONLY repeat or slightly vary the activities the user already does. Do NOT invent new tasks. Reply ONLY with task names, one per line. No bold, colons, numbering, explanations, or extra text. Each task must be 5 words or less."
      },
      {
        role: "user",
        content: `Here are 3 recent activities:  ${recentTasks.map(t => `"${t}"`).join("\n")}. Suggest the user 3 out of 5 possibilities. Prefer repeating the same activity or small variations (e.g., 'reading in morning' for 'reading'). Reply ONLY in bullets, one per line. Do not merge activities.`
      }
    ]
    });

    const suggestions = response.choices[0].message.content
      .split("\n")
      .map(t => t.replace(/^[-\*\s]+/, "").trim()) // remove bullets/asterisks/spaces
      .filter(t => t.length > 0); // remove empty lines

        console.log("Raw AI output:", response.choices[0].message.content);
        console.log("Cleaned suggestions:", suggestions);

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ suggestions: [] });
  }
});

app.listen(3001, () => console.log("AI server running on http://localhost:3001"));
