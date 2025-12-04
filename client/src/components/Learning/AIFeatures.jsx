import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import PublicIcon from "@mui/icons-material/Public";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getQuizStats,
  getStreak,
  recordAIChatMessage,
} from "../../services/localStorage";
import { climateChat } from "../../services/openaiService";

// Suggested prompts for users
const SUGGESTED_PROMPTS = [
  { text: "What are the top CO₂ emitting countries?", icon: PublicIcon },
  { text: "Explain per capita emissions", icon: BarChartIcon },
  { text: "How can I reduce my carbon footprint?", icon: LightbulbIcon },
  { text: "What is the Paris Agreement?", icon: HelpOutlineIcon },
  { text: "Tell me about renewable energy trends", icon: TrendingUpIcon },
];

/**
 * Message component for chat display
 */
function ChatMessage({
  message,
  isUser,
  suggestions,
  onSuggestionClick,
  isError,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 2,
        flexDirection: isUser ? "row-reverse" : "row",
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? "#667eea" : isError ? "#f44336" : "#4caf50",
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      <Box
        sx={{
          maxWidth: "75%",
          p: 2,
          borderRadius: 3,
          bgcolor: isUser
            ? "#667eea"
            : isError
              ? "#ffebee"
              : "rgba(0,0,0,0.05)",
          color: isUser ? "white" : "text.primary",
          borderTopRightRadius: isUser ? 0 : 24,
          borderTopLeftRadius: isUser ? 24 : 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        {suggestions && suggestions.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ mt: 1.5, gap: 0.5 }}
          >
            {suggestions.map((text, index) => (
              <Chip
                key={index}
                label={text}
                size="small"
                onClick={() => onSuggestionClick(text)}
                sx={{
                  cursor: "pointer",
                  bgcolor: isUser
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(76, 175, 80, 0.1)",
                  color: isUser ? "white" : "primary.main",
                  border: isUser ? "none" : "1px solid rgba(76, 175, 80, 0.3)",
                  "&:hover": {
                    bgcolor: isUser
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(76, 175, 80, 0.2)",
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

/**
 * Climate AI Chatbot Component - OpenAI Powered
 */
export function ClimateChat({ emissionsData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm your AI Climate Data Assistant powered by OpenAI. I can help you understand CO₂ emissions, compare countries, learn about climate policies, and answer questions using real emissions data from our database. What would you like to know?",
      isUser: false,
      suggestions: [
        "Top emitters by country",
        "Per capita emissions explained",
        "Climate action strategies",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user context for personalized responses
  const getUserContext = () => {
    const stats = {
      streak: getStreak(),
      quiz: getQuizStats(),
    };
    return {
      quizzesTaken: stats.quiz.completed || 0,
      perfectScores: stats.quiz.perfectScores || 0,
      streakDays: stats.streak.count || 0,
    };
  };

  const handleSend = async (query = input) => {
    if (!query.trim() || isLoading) return;

    // Record AI chat message for badge tracking
    recordAIChatMessage();

    const userMessage = {
      id: Date.now(),
      text: query,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const userContext = getUserContext();

      const response = await climateChat({
        messages: [...messages, { text: query, isUser: true }],
        emissionsData: emissionsData,
        userStats: {
          quizzesCompleted: userContext.quizzesTaken,
          perfectScores: userContext.perfectScores,
          streak: userContext.streakDays,
        },
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.message,
        isUser: false,
        suggestions: response.suggestions || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error getting AI response:", err);

      const errorMessage = {
        id: Date.now() + 1,
        text: err.message.includes("API key")
          ? "⚠️ OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables."
          : `Sorry, I encountered an error: ${err.message}. Please try again.`,
        isUser: false,
        isError: true,
        suggestions: ["Try again", "Ask a different question"],
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "👋 Chat cleared! How can I help you understand climate data?",
        isUser: false,
        suggestions: [
          "Top emitters",
          "Per capita emissions",
          "Climate policies",
        ],
      },
    ]);
    setError(null);
  };

  return (
    <Paper
      sx={{
        height: "600px",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
            <AutoAwesomeIcon />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Climate Assistant
              <Chip
                label="GPT-4"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  height: 20,
                  fontSize: "0.65rem",
                }}
              />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              AI-powered with real emissions data
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClearChat}
          sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
          title="Clear chat"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "rgba(0,0,0,0.02)",
        }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            suggestions={msg.suggestions}
            onSuggestionClick={handleSend}
            isError={msg.isError}
          />
        ))}

        {isLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
            <Avatar sx={{ bgcolor: "#4caf50", width: 36, height: 36 }}>
              <SmartToyIcon />
            </Avatar>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.05)",
                borderTopLeftRadius: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Analyzing data and generating response...
              </Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions for new users */}
      {messages.length <= 1 && (
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Try asking about:
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ mt: 1, gap: 0.5 }}
          >
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Chip
                key={prompt.text}
                icon={<prompt.icon fontSize="small" />}
                label={prompt.text}
                size="small"
                onClick={() => handleSend(prompt.text)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: "primary.light", color: "white" },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask about climate data, emissions, or sustainability..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Box>
    </Paper>
  );
}

/**
 * Smart Recommendations Component
 */
export function SmartRecommendations() {
  const stats = {
    streak: getStreak(),
    quiz: getQuizStats(),
  };

  // Generate personalized recommendations
  const recommendations = [];

  if (stats.streak.count === 0) {
    recommendations.push({
      icon: TipsAndUpdatesIcon,
      title: "Start Your Learning Journey",
      description: "Take a daily quiz to begin your streak!",
      action: "Take Quiz",
      link: "/learn",
    });
  } else if (stats.streak.count < 7) {
    recommendations.push({
      icon: LightbulbIcon,
      title: "Build Your Streak",
      description: `You have a ${stats.streak.count}-day quiz streak! Keep it up to unlock badges.`,
      action: "Continue Learning",
      link: "/learn",
    });
  }

  if (stats.quiz.completed < 5) {
    recommendations.push({
      icon: HelpOutlineIcon,
      title: "Test Your Knowledge",
      description:
        "Take a daily quiz to test what you've learned about emissions data.",
      action: "Take Quiz",
      link: "/learn",
    });
  } else {
    recommendations.push({
      icon: TrendingUpIcon,
      title: "Quiz Master",
      description: `You've completed ${stats.quiz.completed} quizzes with ${stats.quiz.totalCorrect}/${stats.quiz.totalQuestions} correct!`,
      action: "Continue",
      link: "/learn",
    });
  }

  // Add contextual recommendations
  recommendations.push({
    icon: BarChartIcon,
    title: "Compare Emission Trends",
    description:
      "Use the comparison tool to analyze how different countries' emissions have changed over time.",
    action: "Compare Countries",
    link: "/learn",
  });

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Personalized Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-suggested actions based on your learning progress
          </Typography>
        </Box>
      </Box>

      <List disablePadding>
        {recommendations.slice(0, 4).map((rec, index) => (
          <ListItem
            key={index}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: "rgba(0,0,0,0.02)",
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1,
              py: 2,
              "&:hover": {
                bgcolor: "rgba(102, 126, 234, 0.05)",
                borderColor: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <rec.icon color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ m: 0, flex: 1 }}
              primary={
                <Typography variant="subtitle2" fontWeight={600}>
                  {rec.title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {rec.description}
                </Typography>
              }
            />
            <Button
              size="small"
              variant="outlined"
              href={rec.link}
              sx={{
                whiteSpace: "nowrap",
                flexShrink: 0,
                alignSelf: { xs: "flex-end", sm: "center" },
              }}
            >
              {rec.action}
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default ClimateChat;
