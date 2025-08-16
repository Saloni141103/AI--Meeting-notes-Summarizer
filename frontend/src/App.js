import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  const quickPrompts = [
    "Summarize in bullet points for executives",
    "Highlight only action items",
    "Summarize in one paragraph",
  ];

  const generateSummary = async () => {
    if (!transcript) return alert("Please paste a transcript first!");
    setLoading(true);
    setSummary("");
    try {
      // Use relative path for deployed environment
      const res = await axios.post("/summarize", { transcript, prompt });
      setSummary(res.data.summary);
    } catch (err) {
      alert("Error generating summary: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!email || !summary) return setEmailStatus("Enter email & generate summary first!");
    try {
      // Use relative path for deployed environment
      await axios.post("/send", { email, summary });
      setEmailStatus("✅ Email sent successfully!");
    } catch (err) {
      setEmailStatus("❌ Error sending email: " + err.message);
    }
  };

  return (
    <div className="App">
      <h2 className="App-title">AI Meeting Notes Summarizer</h2>

      <textarea
        className="App-textarea"
        rows="6"
        cols="60"
        placeholder="Paste transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
      <br />

      {/* Quick Prompts Dropdown */}
      <select
        className="App-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ color: "#000" }}
      >
        <option value="">--Choose a quick prompt--</option>
        {quickPrompts.map((p, idx) => (
          <option key={idx} value={p}>
            {p}
          </option>
        ))}
      </select>
      <br />

      {/* Manual prompt input */}
      <input
        className="App-input"
        type="text"
        placeholder="Or type a custom prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />

      <button className="App-button" onClick={generateSummary} disabled={loading}>
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      <h3 className="App-subtitle">Summary</h3>
      <textarea
        className="App-textarea"
        rows="6"
        cols="60"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <br />

      <input
        className="App-input"
        type="email"
        placeholder="Recipient email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <button className="App-button" onClick={sendEmail}>
        Send via Email
      </button>
      <p
        style={{
          color: emailStatus.startsWith("✅") ? "green" : "red",
          fontWeight: "bold",
        }}
      >
        {emailStatus}
      </p>
    </div>
  );
}

export default App;
