"use server";

export async function generateAIResponse(prompt: string, preferGroq: boolean = false): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const tryGroq = async () => {
    if (!groqKey) throw new Error("No Groq Key available.");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error("Groq API error: " + err);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  };

  const tryGemini = async () => {
    if (!geminiKey) throw new Error("No Gemini Key available.");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error("Gemini API error: " + err);
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  };

  try {
    if (preferGroq) {
      try {
        return await tryGroq();
      } catch (e) {
        console.warn("Groq failed, falling back to Gemini:", e);
        return await tryGemini();
      }
    } else {
      try {
        return await tryGemini();
      } catch (e) {
        console.warn("Gemini failed, falling back to Groq:", e);
        return await tryGroq();
      }
    }
  } catch (finalError) {
    console.error("All AI providers failed:", finalError);
    return "I'm sorry, my AI processing failed. Please try again later.";
  }
}
