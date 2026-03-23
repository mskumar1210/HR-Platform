import React, { useState, useRef, useEffect } from "react";
import { Send, Brain, Sparkles, Bot, User, Copy, RefreshCw, Zap } from "lucide-react";
import { aiAPI } from "../utils/api";
import toast from "react-hot-toast";

const SUGGESTED_PROMPTS = [
  "Which departments have the highest attrition risk right now?",
  "What's the average salary for Software Engineers vs market benchmarks?",
  "Who are the top performers ready for promotion this quarter?",
  "Summarize the key HR trends and risks across the organization.",
  "What skills are most missing in our Engineering team?",
  "Which candidates in the pipeline are the strongest matches?",
  "How does our employee satisfaction compare across departments?",
  "Identify employees who haven't had a review in over 6 months.",
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", ...(isUser && { flexDirection: "row-reverse" }) }} className="fade-in">
      <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isUser ? "linear-gradient(135deg,#3b82f6,#1d4ed8)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
        {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
      </div>
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{isUser ? "You" : "TalentIQ AI"}</div>
        <div className={`chat-bubble ${isUser ? "user" : "ai"}`} style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
          {msg.content}
        </div>
        {!isUser && (
          <button onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied!"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 0" }}>
            <Copy size={12} /> Copy
          </button>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Bot size={16} color="#fff" />
    </div>
    <div className="chat-bubble ai" style={{ padding: "14px 18px" }}>
      <div className="chat-typing" style={{ display: "flex", gap: 4 }}>
        <span /><span /><span />
      </div>
    </div>
  </div>
);

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm TalentIQ AI, your intelligent HR assistant. I have access to your workforce data and can help you with:\n\n• Attrition risk analysis & predictions\n• Candidate screening & matching\n• Performance trend insights\n• Salary benchmarking\n• Skill gap analysis\n• Workforce planning recommendations\n\nWhat would you like to explore today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data } = await aiAPI.ask({ question });
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
    } catch (err) {
      const errorMsg = err.response?.status === 401
        ? "Please log in to use the AI assistant."
        : "I'm having trouble connecting right now. Please check that the backend server is running and try again.";
      setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{ role: "ai", content: "Chat cleared. How can I help you with your HR data today?" }]);
  };

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", gap: 20 }}>
      {/* Main Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="card" style={{ marginBottom: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)" }}>TalentIQ AI Assistant</h3>
                <p style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                  Online • Connected to workforce data
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={clearChat}><RefreshCw size={13} />New Chat</button>
          </div>
        </div>

        {/* Messages */}
        <div className="card" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, padding: "24px" }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="card" style={{ marginTop: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about your workforce... (Enter to send, Shift+Enter for new line)"
              className="form-input"
              rows={2}
              style={{ flex: 1, resize: "none", lineHeight: 1.5 }}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ height: 58, padding: "0 20px" }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Quick prompts + AI Tools */}
      <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Suggested prompts */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={16} color="var(--warning)" />
            <h3 style={{ fontSize: 14 }}>Suggested Questions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} disabled={loading} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* AI capabilities */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Zap size={16} color="var(--accent)" />
            <h3 style={{ fontSize: 14 }}>AI Capabilities</h3>
          </div>
          {[
            { label: "Attrition Prediction", color: "#ef4444" },
            { label: "Resume Screening", color: "#3b82f6" },
            { label: "Performance Analysis", color: "#10b981" },
            { label: "Salary Benchmarking", color: "#f59e0b" },
            { label: "Skill Gap Analysis", color: "#8b5cf6" },
            { label: "Workforce Planning", color: "#14b8a6" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
