/**
 * OpenAI Service for MeltMonitor
 * Handles AI-powered quiz generation and climate chat
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured() {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here";
}

/**
 * Make a request to OpenAI API
 */
async function openaiRequest(messages, options = {}) {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || "gpt-4o-mini",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 1000,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate a climate quiz using OpenAI
 * @param {Object} options - Quiz generation options
 * @param {Array} options.emissionsData - Sample emissions data for context
 * @param {string} options.difficulty - 'easy', 'medium', 'hard'
 * @param {number} options.numQuestions - Number of questions to generate
 * @param {string} options.topic - Optional specific topic
 */
export async function generateQuiz({
  emissionsData = [],
  difficulty = "medium",
  numQuestions = 5,
  topic = null,
}) {
  // Prepare context from emissions data
  const topCountries = emissionsData
    .filter((d) => d.year === 2022 && d.co2 > 0)
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 20)
    .map((d) => ({
      country: d.country,
      co2: d.co2.toFixed(1),
      per_capita: d.co2_per_capita?.toFixed(2) || "N/A",
    }));

  const systemPrompt = `You are a climate education expert creating quiz questions about CO₂ emissions and climate change.

CURRENT DATA CONTEXT (2022):
Top emitting countries: ${JSON.stringify(topCountries.slice(0, 10))}

RULES:
1. Create exactly ${numQuestions} multiple choice questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should be ${difficulty} difficulty level
4. Focus on ${topic || "various aspects of CO₂ emissions and climate change"}
5. Include a mix of:
   - Factual questions about emissions data
   - Conceptual questions about climate science
   - Comparison questions between countries
   - Questions about climate policies and solutions
6. Provide a brief explanation for each correct answer

Return valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "easy|medium|hard",
      "category": "emissions|policy|science|comparison"
    }
  ]
}`;

  const userPrompt = `Generate a ${difficulty} difficulty quiz about ${topic || "climate change and CO₂ emissions"} with ${numQuestions} questions.`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { jsonMode: true, temperature: 0.8 }
    );

    const parsed = JSON.parse(response);
    return parsed.questions;
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    throw error;
  }
}

/**
 * Grade a user's answer and provide feedback
 */
export async function gradeAnswer({
  question,
  userAnswer,
  correctAnswer,
  emissionsData = [],
}) {
  const systemPrompt = `You are a helpful climate education tutor. 
Grade the student's answer and provide encouraging, educational feedback.
Be concise but informative. If they got it wrong, explain why the correct answer is right.`;

  const userPrompt = `Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
Was the student correct: ${userAnswer === correctAnswer ? "Yes" : "No"}

Provide brief feedback (2-3 sentences max).`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { maxTokens: 200, temperature: 0.7 }
    );

    return response;
  } catch (error) {
    // Fallback to simple feedback
    if (userAnswer === correctAnswer) {
      return "Correct! Great job on this question.";
    }
    return `The correct answer was: ${correctAnswer}. Keep learning!`;
  }
}

/**
 * Climate Chat - AI Assistant for climate questions
 * @param {Object} options - Chat options
 * @param {Array} options.messages - Conversation history
 * @param {Array} options.emissionsData - Current emissions data for context
 * @param {Object} options.userStats - User's learning stats
 */
export async function climateChat({
  messages,
  emissionsData = [],
  userStats = {},
}) {
  // Prepare emissions context
  const latestYear =
    Math.max(...emissionsData.map((d) => d.year).filter(Boolean)) || 2022;
  const topEmitters = emissionsData
    .filter((d) => d.year === latestYear && d.co2 > 0)
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 15)
    .map(
      (d) =>
        `${d.country}: ${d.co2.toFixed(1)} Mt CO₂, ${d.co2_per_capita?.toFixed(1) || "?"} t per capita`
    );

  const topPerCapita = emissionsData
    .filter((d) => d.year === latestYear && d.co2_per_capita > 0)
    .sort((a, b) => b.co2_per_capita - a.co2_per_capita)
    .slice(0, 10)
    .map((d) => `${d.country}: ${d.co2_per_capita.toFixed(1)} t per capita`);

  const systemPrompt = `You are MeltMonitor's Climate AI Assistant - a friendly, knowledgeable expert on CO₂ emissions and climate change.

CURRENT DATA (${latestYear}):
Top Total Emitters:
${topEmitters.join("\n")}

Top Per-Capita Emitters:
${topPerCapita.join("\n")}

USER LEARNING STATS:
- Countries explored: ${userStats.countriesExplored || 0}
- Quizzes completed: ${userStats.quizzesCompleted || 0}
- Current streak: ${userStats.streak || 0} days

YOUR ROLE:
1. Answer questions about climate change, CO₂ emissions, and environmental topics
2. Use the real emissions data provided when answering questions
3. Be encouraging about the user's learning progress
4. Suggest related topics they might want to explore
5. Keep responses concise but informative (2-4 paragraphs max)
6. Use emojis occasionally to keep it engaging 🌍
7. If asked about specific countries, use the data provided
8. If data isn't available, say so honestly

FORMATTING:
- Use bullet points for lists
- Use bold for emphasis (with **)
- Keep responses focused and educational`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text,
        })),
      ],
      { maxTokens: 800, temperature: 0.7 }
    );

    return {
      message: response,
      suggestions: generateSuggestions(
        messages[messages.length - 1]?.text || ""
      ),
    };
  } catch (error) {
    console.error("Climate chat error:", error);
    throw error;
  }
}

/**
 * Generate follow-up suggestions based on the conversation
 */
function generateSuggestions(lastMessage) {
  const lowerMsg = lastMessage.toLowerCase();

  if (lowerMsg.includes("china") || lowerMsg.includes("usa")) {
    return [
      "Compare with other countries",
      "Historical trends",
      "Per capita emissions",
    ];
  }
  if (lowerMsg.includes("per capita")) {
    return [
      "Why per capita matters",
      "Top per capita emitters",
      "Population vs emissions",
    ];
  }
  if (lowerMsg.includes("reduce") || lowerMsg.includes("solution")) {
    return [
      "Renewable energy progress",
      "Carbon capture technology",
      "Individual actions",
    ];
  }
  if (lowerMsg.includes("paris") || lowerMsg.includes("agreement")) {
    return ["Country commitments", "Progress tracking", "Net zero targets"];
  }

  // Default suggestions
  return ["Top CO₂ emitters", "Climate solutions", "Per capita comparison"];
}

/**
 * Generate a quiz question about a specific country
 */
export async function generateCountryQuestion(countryName, emissionsData) {
  const countryData = emissionsData
    .filter((d) => d.country === countryName && d.co2 > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  if (countryData.length === 0) {
    throw new Error(`No data available for ${countryName}`);
  }

  const systemPrompt = `Create a single quiz question about ${countryName}'s CO₂ emissions.

DATA:
${countryData.map((d) => `${d.year}: ${d.co2.toFixed(1)} Mt total, ${d.co2_per_capita?.toFixed(2) || "?"} t per capita`).join("\n")}

Return JSON format:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Why this is correct"
}`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a question about ${countryName}` },
      ],
      { jsonMode: true, temperature: 0.8 }
    );

    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to generate country question:", error);
    throw error;
  }
}

/**
 * Get Climate Fact of the Day
 * Caches the result in localStorage for 24 hours
 */

// Verified, working article links organized by category
const CLIMATE_RESOURCES = {
  emissions: [
    {
      title: "Global Carbon Budget - Latest Data",
      url: "https://www.globalcarbonproject.org/carbonbudget/",
      source: "Global Carbon Project",
    },
    {
      title: "CO2 and Greenhouse Gas Emissions - Our World in Data",
      url: "https://ourworldindata.org/co2-and-greenhouse-gas-emissions",
      source: "Our World in Data",
    },
    {
      title: "Global Monitoring Laboratory - Carbon Cycle",
      url: "https://gml.noaa.gov/ccgg/trends/",
      source: "NOAA",
    },
  ],
  climate: [
    {
      title: "NASA Global Climate Change: Vital Signs",
      url: "https://climate.nasa.gov/",
      source: "NASA",
    },
    {
      title: "Climate Change Evidence & Causes",
      url: "https://www.ipcc.ch/",
      source: "IPCC",
    },
    {
      title: "Climate at a Glance - Global Time Series",
      url: "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series",
      source: "NOAA NCEI",
    },
  ],
  solutions: [
    {
      title: "Climate Solutions - Project Drawdown",
      url: "https://drawdown.org/solutions",
      source: "Project Drawdown",
    },
    {
      title: "Renewable Energy - International Energy Agency",
      url: "https://www.iea.org/topics/renewables",
      source: "IEA",
    },
    {
      title: "Climate Action - United Nations",
      url: "https://www.un.org/en/climatechange/net-zero-coalition",
      source: "United Nations",
    },
  ],
  wildlife: [
    {
      title: "Climate Change and Biodiversity",
      url: "https://www.worldwildlife.org/threats/effects-of-climate-change",
      source: "WWF",
    },
    {
      title: "Species and Climate Change",
      url: "https://www.iucn.org/resources/issues-brief/species-and-climate-change",
      source: "IUCN",
    },
    {
      title: "Ecosystems and Climate",
      url: "https://www.nature.org/en-us/what-we-do/our-priorities/tackle-climate-change/",
      source: "The Nature Conservancy",
    },
  ],
  energy: [
    {
      title: "Global Energy Review",
      url: "https://www.iea.org/reports/global-energy-review-2023",
      source: "IEA",
    },
    {
      title: "Renewable Energy Statistics",
      url: "https://www.irena.org/Statistics",
      source: "IRENA",
    },
    {
      title: "Energy & Climate Intelligence",
      url: "https://eciu.net/",
      source: "ECIU",
    },
  ],
  oceans: [
    {
      title: "Ocean Warming and Acidification",
      url: "https://ocean.si.edu/conservation/climate-change",
      source: "Smithsonian Ocean",
    },
    {
      title: "State of the Ocean Report",
      url: "https://www.ioc.unesco.org/en/state-ocean-report",
      source: "UNESCO IOC",
    },
    {
      title: "Ocean and Climate Change",
      url: "https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification",
      source: "NOAA",
    },
  ],
  weather: [
    {
      title: "Extreme Weather & Climate Change",
      url: "https://www.climate.gov/news-features/understanding-climate/climate-change-global-temperature",
      source: "NOAA Climate.gov",
    },
    {
      title: "Weather Attribution Science",
      url: "https://www.worldweatherattribution.org/",
      source: "World Weather Attribution",
    },
    {
      title: "Climate and Extreme Events",
      url: "https://www.carbonbrief.org/mapped-how-climate-change-affects-extreme-weather-around-the-world/",
      source: "Carbon Brief",
    },
  ],
};

export async function getClimateFact() {
  const CACHE_KEY = "meltmonitor_climate_fact";
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const { fact, date } = JSON.parse(cached);
    const today = new Date().toDateString();
    if (date === today) {
      return fact;
    }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const systemPrompt = `You are a climate science educator. Generate a compelling, educational climate fact of the day.

TODAY'S DATE: ${dateStr}

REQUIREMENTS:
1. Provide ONE interesting climate/environmental fact
2. The fact should be scientifically accurate
3. Make the fact engaging and memorable (2-3 sentences max)
4. Focus on topics like: CO2 emissions, global warming, renewable energy, climate solutions, environmental changes, species impacts, ocean health, extreme weather
5. Vary the topic based on the date to keep content fresh

IMPORTANT: You must select exactly ONE category from: emissions, climate, solutions, wildlife, energy, oceans, weather

Return JSON in this exact format:
{
  "fact": "The interesting climate fact here (2-3 sentences max)",
  "source": "Primary source name (e.g., NASA, NOAA, IPCC)",
  "category": "emissions|climate|solutions|wildlife|energy|oceans|weather"
}`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate the climate fact of the day for ${dateStr}.`,
        },
      ],
      { jsonMode: true, temperature: 0.9, maxTokens: 400 }
    );

    const parsed = JSON.parse(response);

    // Get verified articles based on the category
    const category = parsed.category || "climate";
    const articles = CLIMATE_RESOURCES[category] || CLIMATE_RESOURCES.climate;

    // Add the verified articles to the response
    parsed.articles = articles;

    // Cache for 24 hours
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        fact: parsed,
        date: today.toDateString(),
      })
    );

    return parsed;
  } catch (error) {
    console.error("Failed to get climate fact:", error);
    throw error;
  }
}

/**
 * Clear the cached climate fact (for testing/refresh)
 */
export function clearClimateFact() {
  localStorage.removeItem("meltmonitor_climate_fact");
}

/**
 * Get Daily Climate Terms - 5 new terms each day
 * Caches the result in localStorage for 24 hours
 */
export async function getDailyTerms() {
  const CACHE_KEY = "meltmonitor_daily_terms";
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const { terms, date } = JSON.parse(cached);
    const today = new Date().toDateString();
    if (date === today) {
      return terms;
    }
  }

  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );

  const systemPrompt = `You are a climate science educator. Generate 5 climate-related terms for users to learn today.

DAY OF YEAR: ${dayOfYear} (use this to vary the terms each day)

REQUIREMENTS:
1. Provide exactly 5 different climate/environmental terms
2. Each term should have a clear, educational definition (2-3 sentences)
3. Include a mix of:
   - Scientific terms (e.g., albedo, carbon sequestration)
   - Policy terms (e.g., carbon tax, cap and trade)
   - Environmental concepts (e.g., biodiversity, ecosystem services)
   - Measurement terms (e.g., parts per million, radiative forcing)
4. Vary difficulty - include some basic and some advanced terms
5. Make definitions accessible but accurate
6. Include an example or context where helpful

Return JSON in this exact format:
{
  "terms": [
    {
      "term": "Term Name",
      "definition": "Clear, educational definition of the term (2-3 sentences)",
      "category": "science|policy|environment|measurement|energy|weather",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate 5 climate terms for day ${dayOfYear} of the year. Make them educational and varied.`,
        },
      ],
      { jsonMode: true, temperature: 0.9, maxTokens: 800 }
    );

    const parsed = JSON.parse(response);

    // Cache for 24 hours
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        terms: parsed.terms,
        date: today.toDateString(),
      })
    );

    return parsed.terms;
  } catch (error) {
    console.error("Failed to get daily terms:", error);
    throw error;
  }
}

/**
 * Clear the cached daily terms (for testing/refresh)
 */
export function clearDailyTerms() {
  localStorage.removeItem("meltmonitor_daily_terms");
}

/**
 * Generate AI-powered country comparison summary
 * @param {Array} countriesData - Array of country data objects with name, co2, co2_per_capita, population, trend
 */
export async function generateCountryComparison(countriesData) {
  if (!countriesData || countriesData.length < 2) {
    throw new Error("Need at least 2 countries to compare");
  }

  const dataContext = countriesData
    .map(
      (c) =>
        `${c.name} (${c.iso3}): Total CO₂: ${c.co2.toFixed(0)} Mt, Per Capita: ${c.co2_per_capita.toFixed(1)} t/person, Population: ${(c.population / 1e6).toFixed(1)}M, 5-Year Trend: ${c.trend > 0 ? "+" : ""}${c.trend.toFixed(1)}%/year`
    )
    .join("\n");

  const systemPrompt = `You are a climate data analyst providing educational comparisons between countries' CO₂ emissions.

COUNTRY DATA:
${dataContext}

WORLD AVERAGE: 4.5 tonnes per capita

Provide a comprehensive, educational comparison analysis. Include:
1. A summary paragraph explaining the key differences
2. Notable insights about each country
3. Context about why these differences exist (economy, energy sources, population)
4. What these numbers mean for climate action

Return JSON in this exact format:
{
  "summary": "A 2-3 sentence overview of the comparison",
  "keyFindings": [
    "Finding 1 - specific insight with numbers",
    "Finding 2 - another insight",
    "Finding 3 - another insight"
  ],
  "countryInsights": [
    {
      "country": "Country Name",
      "insight": "Specific insight about this country (1-2 sentences)",
      "highlight": "positive|negative|neutral"
    }
  ],
  "context": "1-2 sentences providing broader context about what these comparisons mean",
  "recommendation": "A brief educational takeaway for the user"
}`;

  try {
    const response = await openaiRequest(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Compare these ${countriesData.length} countries' CO₂ emissions and provide educational insights.`,
        },
      ],
      { jsonMode: true, temperature: 0.7, maxTokens: 800 }
    );

    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to generate country comparison:", error);
    throw error;
  }
}

export default {
  isOpenAIConfigured,
  generateQuiz,
  gradeAnswer,
  climateChat,
  generateCountryQuestion,
  getClimateFact,
  clearClimateFact,
  getDailyTerms,
  clearDailyTerms,
  generateCountryComparison,
};
