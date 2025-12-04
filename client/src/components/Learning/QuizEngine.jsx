import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Chip,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Skeleton,
  Paper,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  EmojiEvents as TrophyIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  Whatshot as WhatshotIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { generateQuiz, gradeAnswer } from "../../services/openaiService";
import {
  recordDailyQuiz,
  recordQuizCompletion,
} from "../../services/localStorage";

// Quiz topics that AI can generate questions about
const QUIZ_TOPICS = [
  {
    id: "carbon-basics",
    title: "Carbon & CO₂ Basics",
    description: "Understanding carbon dioxide and its sources",
    icon: <PsychologyIcon />,
    color: "#4CAF50",
    difficulty: "beginner",
    context: "Basic concepts about CO2, greenhouse gases, and their sources",
  },
  {
    id: "emissions-data",
    title: "Global Emissions Data",
    description: "Facts about world CO₂ emissions and trends",
    icon: <AutoAwesomeIcon />,
    color: "#2196F3",
    difficulty: "intermediate",
    context:
      "Questions about emission statistics, top emitting countries, and trends",
  },
  {
    id: "climate-impact",
    title: "Climate Impact",
    description: "Effects of emissions on climate and environment",
    icon: <WhatshotIcon />,
    color: "#FF5722",
    difficulty: "intermediate",
    context: "Environmental impacts, temperature rise, and ecological effects",
  },
  {
    id: "solutions",
    title: "Climate Solutions",
    description: "Renewable energy and reducing emissions",
    icon: <StarIcon />,
    color: "#9C27B0",
    difficulty: "advanced",
    context:
      "Renewable energy, carbon capture, policy solutions, and individual actions",
  },
];

// Quiz card for topic selection
function QuizCard({ topic, onStart, isGenerating }) {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${topic.color}15 0%, ${topic.color}05 100%)`,
        borderLeft: `4px solid ${topic.color}`,
        transition: "all 0.3s ease",
        opacity: isGenerating ? 0.7 : 1,
        "&:hover": {
          transform: isGenerating ? "none" : "translateY(-4px)",
          boxShadow: isGenerating ? "none" : `0 8px 24px ${topic.color}30`,
        },
      }}
    >
      <CardActionArea
        onClick={() => !isGenerating && onStart(topic)}
        disabled={isGenerating}
        sx={{ height: "100%", p: 2 }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ color: topic.color }}>{topic.icon}</Box>
            <Chip
              label={topic.difficulty}
              size="small"
              sx={{
                backgroundColor: topic.color,
                color: "white",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            {topic.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {topic.description}
          </Typography>
          {isGenerating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <CircularProgress size={16} sx={{ color: topic.color }} />
              <Typography variant="caption" color="text.secondary">
                Generating AI quiz...
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

// Main Quiz Dialog with AI-powered questions
function QuizDialog({ open, onClose, topic, emissionsData, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [funFact, setFunFact] = useState("");
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);

  // Generate questions when dialog opens
  useEffect(() => {
    if (open && topic) {
      generateQuestions();
    }
  }, [open, topic]);

  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setQuizComplete(false);
    setShowResult(false);
    setSelectedAnswer("");

    try {
      const result = await generateQuiz({
        topic: topic.context,
        numQuestions: 5,
        emissionsData: emissionsData,
        difficulty: topic.difficulty || "medium",
      });
      if (result && result.length > 0) {
        // Transform to expected format
        const formattedQuestions = result.map((q) => ({
          question: q.question,
          options: q.options,
          correct: q.options[q.correctIndex],
          explanation: q.explanation,
        }));
        setQuestions(formattedQuestions);
      } else {
        setError("Failed to generate questions. Please try again.");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(err.message || "Failed to generate quiz questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || grading) return;

    setGrading(true);
    const question = questions[currentQuestion];

    try {
      // Use AI to grade the answer and get explanation
      const feedback = await gradeAnswer({
        question: question.question,
        userAnswer: selectedAnswer,
        correctAnswer: question.correct,
        emissionsData: emissionsData,
      });

      const isAnswerCorrect = selectedAnswer === question.correct;
      setIsCorrect(isAnswerCorrect);
      setExplanation(feedback || question.explanation);
      setFunFact("");

      if (isAnswerCorrect) {
        setScore((prev) => prev + 1);
      }

      setShowResult(true);
    } catch (err) {
      console.error("Error grading answer:", err);
      // Fallback to local grading
      const correct = selectedAnswer === question.correct;
      setIsCorrect(correct);
      setExplanation(question.explanation);
      if (correct) {
        setScore((prev) => prev + 1);
      }
      setShowResult(true);
    } finally {
      setGrading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= questions.length) {
      setQuizComplete(true);

      // Record quiz completion for stats and streak
      recordQuizCompletion(score, questions.length);
      const streakResult = recordDailyQuiz();
      setStreakInfo(streakResult);

      if (onComplete) {
        onComplete({
          topic: topic.id,
          score: score,
          total: questions.length,
          percentage: Math.round((score / questions.length) * 100),
          streakUpdated: streakResult.streakUpdated,
          newStreak: streakResult.count,
        });
      }
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
      setExplanation("");
      setFunFact("");
    }
  };

  const handleClose = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setLoading(true);
    setError(null);
    setStreakInfo(null);
    onClose();
  };
  const progress =
    questions.length > 0
      ? ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100
      : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${topic?.color || "#2196F3"} 0%, ${topic?.color || "#2196F3"}CC 100%)`,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QuizIcon />
          <Typography variant="h6">{topic?.title || "Quiz"}</Typography>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
            label="AI Generated"
            size="small"
            sx={{
              ml: 1,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          backgroundColor: `${topic?.color || "#2196F3"}20`,
          "& .MuiLinearProgress-bar": {
            backgroundColor: topic?.color || "#2196F3",
          },
        }}
      />

      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={48} sx={{ color: topic?.color, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI is creating your quiz...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generating personalized questions based on real emissions data
            </Typography>
            <Box sx={{ mt: 3 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={40}
                  sx={{ mb: 1, borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={generateQuestions}
              sx={{ backgroundColor: topic?.color }}
            >
              Try Again
            </Button>
          </Box>
        ) : quizComplete ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <TrophyIcon
              sx={{
                fontSize: 64,
                color:
                  score >= questions.length * 0.8 ? "#FFD700" : topic?.color,
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              Score: {score} / {questions.length}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {score >= questions.length * 0.8
                ? "🎉 Excellent work! You're a climate expert!"
                : score >= questions.length * 0.5
                  ? "👍 Good job! Keep learning!"
                  : "📚 Keep studying, you'll get better!"}
            </Typography>

            {/* Streak Info */}
            {streakInfo && (
              <Alert
                severity="success"
                icon={<WhatshotIcon />}
                sx={{ mb: 2, textAlign: "left" }}
              >
                {streakInfo.streakUpdated ? (
                  <>
                    <Typography variant="subtitle2" fontWeight={600}>
                      🔥 {streakInfo.count}-Day Streak!
                    </Typography>
                    <Typography variant="body2">
                      {streakInfo.count === 1
                        ? "You started a new streak! Come back tomorrow to keep it going."
                        : `Great job! You've completed quizzes for ${streakInfo.count} days in a row.`}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2">
                    ✅ You've already completed today's daily quiz. Current
                    streak: {streakInfo.count} days
                  </Typography>
                )}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="outlined" onClick={generateQuestions}>
                Try Again
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{ backgroundColor: topic?.color }}
              >
                Done
              </Button>
            </Box>
          </Box>
        ) : questions.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              {questions[currentQuestion]?.question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswer}
                onChange={(e) =>
                  !showResult && setSelectedAnswer(e.target.value)
                }
              >
                {questions[currentQuestion]?.options?.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer =
                    option === questions[currentQuestion]?.correct;

                  let backgroundColor = "transparent";
                  let borderColor = "divider";

                  if (showResult) {
                    if (isCorrectAnswer) {
                      backgroundColor = "#4CAF5015";
                      borderColor = "#4CAF50";
                    } else if (isSelected && !isCorrect) {
                      backgroundColor = "#f4433615";
                      borderColor = "#f44336";
                    }
                  } else if (isSelected) {
                    backgroundColor = `${topic?.color || "#2196F3"}10`;
                    borderColor = topic?.color || "#2196F3";
                  }

                  return (
                    <FormControlLabel
                      key={index}
                      value={option}
                      disabled={showResult}
                      control={<Radio sx={{ color: topic?.color }} />}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>{option}</Typography>
                          {showResult && isCorrectAnswer && (
                            <CheckCircleIcon
                              sx={{ color: "#4CAF50", fontSize: 20 }}
                            />
                          )}
                          {showResult &&
                            isSelected &&
                            !isCorrect &&
                            !isCorrectAnswer && (
                              <CancelIcon
                                sx={{ color: "#f44336", fontSize: 20 }}
                              />
                            )}
                        </Box>
                      }
                      sx={{
                        mb: 1,
                        p: 1.5,
                        border: 1,
                        borderColor,
                        borderRadius: 2,
                        backgroundColor,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: showResult
                            ? backgroundColor
                            : `${topic?.color || "#2196F3"}08`,
                        },
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            {showResult && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={isCorrect ? "success" : "error"}
                  icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2">
                    {isCorrect ? "Correct! 🎉" : "Not quite right"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {explanation}
                  </Typography>
                </Alert>

                {funFact && (
                  <Alert
                    severity="info"
                    icon={<LightbulbIcon />}
                    sx={{ backgroundColor: "#fff8e1" }}
                  >
                    <Typography variant="subtitle2">Did you know?</Typography>
                    <Typography variant="body2">{funFact}</Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>

      {!loading && !error && !quizComplete && questions.length > 0 && (
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            Score: {score} / {questions.length}
          </Typography>
          {!showResult ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedAnswer || grading}
              sx={{ backgroundColor: topic?.color }}
              startIcon={
                grading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {grading ? "Checking..." : "Submit Answer"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ backgroundColor: topic?.color }}
            >
              {currentQuestion + 1 >= questions.length
                ? "See Results"
                : "Next Question"}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

// Main QuizEngine component
export default function QuizEngine({ emissionsData, onQuizComplete }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingTopic, setGeneratingTopic] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  const handleStartQuiz = (topic) => {
    setSelectedTopic(topic);
    setGeneratingTopic(topic.id);
    setDialogOpen(true);
    // Clear generating state after dialog opens
    setTimeout(() => setGeneratingTopic(null), 500);
  };

  const handleQuizComplete = (result) => {
    setCompletedQuizzes((prev) => [...prev, result]);
    // Call parent callback to refresh stats
    if (onQuizComplete) {
      onQuizComplete(result);
    }
  };

  const totalScore = completedQuizzes.reduce((sum, q) => sum + q.score, 0);
  const totalQuestions = completedQuizzes.reduce((sum, q) => sum + q.total, 0);

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
      {/* Header with stats */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <QuizIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              AI Climate Quiz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test your knowledge with AI-generated questions based on real data
            </Typography>
          </Box>
        </Box>
        {completedQuizzes.length > 0 && (
          <Chip
            icon={<TrophyIcon />}
            label={`${totalScore}/${totalQuestions} correct`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Topic Grid */}
      <Grid container spacing={2}>
        {QUIZ_TOPICS.map((topic) => (
          <Grid key={topic.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <QuizCard
              topic={topic}
              onStart={handleStartQuiz}
              isGenerating={generatingTopic === topic.id}
            />
          </Grid>
        ))}
      </Grid>

      {/* Recent Results */}
      {completedQuizzes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Results
          </Typography>
          <Grid container spacing={2}>
            {completedQuizzes
              .slice(-4)
              .reverse()
              .map((result, index) => {
                const topic = QUIZ_TOPICS.find((t) => t.id === result.topic);
                return (
                  <Grid key={index} size={{ xs: 6, sm: 3 }}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderLeft: `4px solid ${topic?.color || "#2196F3"}`,
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {topic?.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: topic?.color, fontWeight: 600 }}
                      >
                        {result.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.score}/{result.total} correct
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      )}

      {/* Quiz Dialog */}
      <QuizDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        topic={selectedTopic}
        emissionsData={emissionsData}
        onComplete={handleQuizComplete}
      />
    </Paper>
  );
}
