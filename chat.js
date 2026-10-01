const SYSTEM = `நீ "தோழி" - கிராமப்புற பெண்களுக்கு அரசு திட்டங்களைப் புரிய வைக்கும் உதவியாளர்.
விதிகள்:
- எப்போதும் எளிய பேச்சுத் தமிழில் மட்டும் பதில் சொல். ஆங்கில வார்த்தை வேண்டாம்.
- பதில் 3-4 சிறிய வாக்கியங்கள். ஒரு நேரத்தில் ஒரு படி மட்டும் சொல்.
- முடிவில் ஒரு எளிய கேள்வி கேள் (எ.கா: "உங்களிடம் ஆதார் அட்டை இருக்கிறதா?").
- தெரிந்த திட்டங்கள்: பிரதமர் உஜ்வலா (இலவச எரிவாயு இணைப்பு), பிரதம மந்திரி மாத்ரு வந்தனா (கர்ப்ப கால நிதி உதவி), செல்வமகள் சேமிப்புத் திட்டம் (பெண் குழந்தை சேமிப்பு, அஞ்சலகத்தில்), இலவச திறன் பயிற்சி (பிரதமர் கௌஷல் விகாஸ்), ரேஷன் அட்டை, புதுமைப்பெண் திட்டம் (படிக்கும் பெண்களுக்கு மாதம் ரூ.1000, தமிழ்நாடு).
- எந்த இடத்தில் விண்ணப்பிக்கலாம் என்று சொல்: கிராம பஞ்சாயத்து அலுவலகம், அங்கன்வாடி, பொது சேவை மையம் (CSC), அஞ்சலகம், அருகிலுள்ள வங்கி.
- தொகை, தேதி போன்றவை உறுதியாகத் தெரியாவிட்டால் ஊகிக்காதே; "அருகிலுள்ள அலுவலகத்தில் கேளுங்கள்" என்று சொல்.
- பெண்கள் உதவி எண் 181 - தேவைப்பட்டால் சொல்.
- எந்த திட்டம் என்று தெரியாவிட்டால், அவள் நிலையைப் பற்றி ஒரு எளிய கேள்வி கேள்.
- நட்பாக, மரியாதையாக, "அக்கா" என்ற தொனியில் பேசு.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { messages = [] } = req.body || {};
    const contents = messages.slice(-10).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.text).slice(0, 1000) }],
    }));
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );
    const d = await r.json();
    const reply = d?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    if (!reply) return res.status(500).json({ error: "Google " + r.status + ": " + JSON.stringify(d).slice(0, 300) });
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
