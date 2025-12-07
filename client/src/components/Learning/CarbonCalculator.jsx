import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Chip,
  Alert,
  Divider,
  LinearProgress,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FlightIcon from "@mui/icons-material/Flight";
import HomeIcon from "@mui/icons-material/Home";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NatureIcon from "@mui/icons-material/Nature";
import CalculateIcon from "@mui/icons-material/Calculate";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import {
  saveCarbonFootprint,
  getCarbonFootprint,
} from "../../services/localStorage";

// Average emissions factors (tonnes CO2 per year)
const EMISSIONS_FACTORS = {
  // Transportation
  car: {
    none: 0,
    small: 1.5,
    medium: 2.5,
    large: 4.0,
    electric: 0.5,
  },
  publicTransport: {
    never: 0,
    rarely: 0.2,
    sometimes: 0.5,
    often: 0.8,
    daily: 1.2,
  },
  flights: {
    none: 0,
    "1-2": 0.5,
    "3-5": 1.5,
    "6-10": 3.0,
    "10+": 5.0,
  },
  // Home
  homeSize: {
    apartment: 1.0,
    small: 1.5,
    medium: 2.5,
    large: 4.0,
  },
  energySource: {
    renewable: 0.2,
    mixed: 1.0,
    fossil: 2.0,
  },
  // Diet
  diet: {
    vegan: 1.5,
    vegetarian: 2.0,
    pescatarian: 2.5,
    "low-meat": 3.0,
    average: 3.5,
    "high-meat": 4.5,
  },
  // Shopping
  shopping: {
    minimal: 0.5,
    average: 1.5,
    frequent: 3.0,
  },
};

// World average is about 4.5 tonnes per person
const WORLD_AVERAGE = 4.5;
// Paris Agreement target is about 2 tonnes per person
const TARGET = 2.0;

const STEPS = [
  { label: "Transportation", icon: DirectionsCarIcon },
  { label: "Home Energy", icon: HomeIcon },
  { label: "Diet", icon: RestaurantIcon },
  { label: "Lifestyle", icon: ShoppingCartIcon },
];

/**
 * CarbonCalculator - Multi-step carbon footprint calculator
 */
export function CarbonCalculator({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({
    car: "medium",
    publicTransport: "sometimes",
    flights: "1-2",
    homeSize: "medium",
    energySource: "mixed",
    diet: "average",
    shopping: "average",
  });
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Check for saved data
  useEffect(() => {
    const saved = getCarbonFootprint();
    if (saved) {
      setAnswers(saved.answers || answers);
      setResult(saved);
    }
  }, []);

  const handleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const calculateFootprint = () => {
    const transport =
      EMISSIONS_FACTORS.car[answers.car] +
      EMISSIONS_FACTORS.publicTransport[answers.publicTransport] +
      EMISSIONS_FACTORS.flights[answers.flights];

    const home =
      EMISSIONS_FACTORS.homeSize[answers.homeSize] +
      EMISSIONS_FACTORS.energySource[answers.energySource];

    const diet = EMISSIONS_FACTORS.diet[answers.diet];

    const lifestyle = EMISSIONS_FACTORS.shopping[answers.shopping];

    const total = transport + home + diet + lifestyle;

    const breakdown = {
      transport: ((transport / total) * 100).toFixed(1),
      home: ((home / total) * 100).toFixed(1),
      diet: ((diet / total) * 100).toFixed(1),
      lifestyle: ((lifestyle / total) * 100).toFixed(1),
    };

    const result = {
      total: total.toFixed(1),
      breakdown,
      answers,
      vsWorldAverage: ((total / WORLD_AVERAGE) * 100 - 100).toFixed(0),
      vsTarget: ((total / TARGET) * 100).toFixed(0),
    };

    setResult(result);
    saveCarbonFootprint(result);
    setShowResult(true);

    if (onComplete) onComplete(result);
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      calculateFootprint();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setShowResult(false);
  };

  if (showResult && result) {
    return <CarbonResult result={result} onReset={handleReset} />;
  }

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
            background: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
            color: "white",
          }}
        >
          <CalculateIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Carbon Footprint Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estimate your annual CO₂ emissions
          </Typography>
        </Box>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Transportation */}
        <Step>
          <StepLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DirectionsCarIcon fontSize="small" />
              Transportation
            </Box>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel>What type of car do you drive?</FormLabel>
                <RadioGroup
                  row
                  value={answers.car}
                  onChange={(e) => handleAnswer("car", e.target.value)}
                >
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label="No car"
                  />
                  <FormControlLabel
                    value="electric"
                    control={<Radio />}
                    label="Electric"
                  />
                  <FormControlLabel
                    value="small"
                    control={<Radio />}
                    label="Small"
                  />
                  <FormControlLabel
                    value="medium"
                    control={<Radio />}
                    label="Medium"
                  />
                  <FormControlLabel
                    value="large"
                    control={<Radio />}
                    label="Large/SUV"
                  />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel>How often do you use public transport?</FormLabel>
                <RadioGroup
                  row
                  value={answers.publicTransport}
                  onChange={(e) =>
                    handleAnswer("publicTransport", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="never"
                    control={<Radio />}
                    label="Never"
                  />
                  <FormControlLabel
                    value="rarely"
                    control={<Radio />}
                    label="Rarely"
                  />
                  <FormControlLabel
                    value="sometimes"
                    control={<Radio />}
                    label="Sometimes"
                  />
                  <FormControlLabel
                    value="often"
                    control={<Radio />}
                    label="Often"
                  />
                  <FormControlLabel
                    value="daily"
                    control={<Radio />}
                    label="Daily"
                  />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" fullWidth>
                <FormLabel>How many flights do you take per year?</FormLabel>
                <RadioGroup
                  row
                  value={answers.flights}
                  onChange={(e) => handleAnswer("flights", e.target.value)}
                >
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label="None"
                  />
                  <FormControlLabel
                    value="1-2"
                    control={<Radio />}
                    label="1-2"
                  />
                  <FormControlLabel
                    value="3-5"
                    control={<Radio />}
                    label="3-5"
                  />
                  <FormControlLabel
                    value="6-10"
                    control={<Radio />}
                    label="6-10"
                  />
                  <FormControlLabel
                    value="10+"
                    control={<Radio />}
                    label="10+"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <StepButtons onNext={handleNext} onBack={handleBack} isFirst />
          </StepContent>
        </Step>

        {/* Step 2: Home Energy */}
        <Step>
          <StepLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HomeIcon fontSize="small" />
              Home Energy
            </Box>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel>What type of home do you live in?</FormLabel>
                <RadioGroup
                  row
                  value={answers.homeSize}
                  onChange={(e) => handleAnswer("homeSize", e.target.value)}
                >
                  <FormControlLabel
                    value="apartment"
                    control={<Radio />}
                    label="Apartment"
                  />
                  <FormControlLabel
                    value="small"
                    control={<Radio />}
                    label="Small house"
                  />
                  <FormControlLabel
                    value="medium"
                    control={<Radio />}
                    label="Medium house"
                  />
                  <FormControlLabel
                    value="large"
                    control={<Radio />}
                    label="Large house"
                  />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" fullWidth>
                <FormLabel>What's your main energy source?</FormLabel>
                <RadioGroup
                  row
                  value={answers.energySource}
                  onChange={(e) => handleAnswer("energySource", e.target.value)}
                >
                  <FormControlLabel
                    value="renewable"
                    control={<Radio />}
                    label="Mostly renewable"
                  />
                  <FormControlLabel
                    value="mixed"
                    control={<Radio />}
                    label="Mixed"
                  />
                  <FormControlLabel
                    value="fossil"
                    control={<Radio />}
                    label="Mostly fossil fuels"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <StepButtons onNext={handleNext} onBack={handleBack} />
          </StepContent>
        </Step>

        {/* Step 3: Diet */}
        <Step>
          <StepLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <RestaurantIcon fontSize="small" />
              Diet
            </Box>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel>How would you describe your diet?</FormLabel>
                <RadioGroup
                  value={answers.diet}
                  onChange={(e) => handleAnswer("diet", e.target.value)}
                >
                  <FormControlLabel
                    value="vegan"
                    control={<Radio />}
                    label="Vegan (no animal products)"
                  />
                  <FormControlLabel
                    value="vegetarian"
                    control={<Radio />}
                    label="Vegetarian (no meat)"
                  />
                  <FormControlLabel
                    value="pescatarian"
                    control={<Radio />}
                    label="Pescatarian (fish, no meat)"
                  />
                  <FormControlLabel
                    value="low-meat"
                    control={<Radio />}
                    label="Low meat (1-2 times/week)"
                  />
                  <FormControlLabel
                    value="average"
                    control={<Radio />}
                    label="Average (meat most days)"
                  />
                  <FormControlLabel
                    value="high-meat"
                    control={<Radio />}
                    label="High meat (every meal)"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <StepButtons onNext={handleNext} onBack={handleBack} />
          </StepContent>
        </Step>

        {/* Step 4: Lifestyle */}
        <Step>
          <StepLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShoppingCartIcon fontSize="small" />
              Lifestyle
            </Box>
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel>
                  How much do you shop for new items (clothes, electronics,
                  etc.)?
                </FormLabel>
                <RadioGroup
                  value={answers.shopping}
                  onChange={(e) => handleAnswer("shopping", e.target.value)}
                >
                  <FormControlLabel
                    value="minimal"
                    control={<Radio />}
                    label="Minimal (buy used, repair, rarely shop)"
                  />
                  <FormControlLabel
                    value="average"
                    control={<Radio />}
                    label="Average (occasional new purchases)"
                  />
                  <FormControlLabel
                    value="frequent"
                    control={<Radio />}
                    label="Frequent (regularly buy new items)"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <StepButtons onNext={handleNext} onBack={handleBack} isLast />
          </StepContent>
        </Step>
      </Stepper>
    </Paper>
  );
}

function StepButtons({ onNext, onBack, isFirst, isLast }) {
  return (
    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
      {!isFirst && (
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
      )}
      <Button
        onClick={onNext}
        variant="contained"
        sx={{
          background: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
        }}
      >
        {isLast ? "Calculate My Footprint" : "Next"}
      </Button>
    </Box>
  );
}

/**
 * CarbonResult - Display calculation results
 */
export function CarbonResult({ result, onReset }) {
  const total = parseFloat(result.total);
  const isAboveAverage = total > WORLD_AVERAGE;
  const isAboveTarget = total > TARGET;

  const getTips = () => {
    const tips = [];
    if (result.answers.car !== "none" && result.answers.car !== "electric") {
      tips.push(
        "Consider switching to an electric vehicle or using public transport more"
      );
    }
    if (result.answers.flights !== "none") {
      tips.push("Reduce air travel or offset your flights with carbon credits");
    }
    if (
      result.answers.diet === "average" ||
      result.answers.diet === "high-meat"
    ) {
      tips.push(
        "Eating less meat can significantly reduce your carbon footprint"
      );
    }
    if (result.answers.energySource !== "renewable") {
      tips.push(
        "Switch to a renewable energy provider if available in your area"
      );
    }
    if (result.answers.shopping === "frequent") {
      tips.push(
        "Buy less, choose quality items that last, and consider second-hand"
      );
    }
    return tips.slice(0, 3);
  };

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
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Your Carbon Footprint
        </Typography>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            background: isAboveAverage
              ? "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)"
              : "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {result.total} tonnes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          CO₂ per year
        </Typography>
      </Box>

      {/* Comparison bars */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2">Your footprint</Typography>
            <Typography variant="body2" fontWeight={600}>
              {result.total} t
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (total / 10) * 100)}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                background: isAboveAverage
                  ? "linear-gradient(90deg, #ff6b6b 0%, #feca57 100%)"
                  : "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)",
                borderRadius: 6,
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2">World average</Typography>
            <Typography variant="body2">{WORLD_AVERAGE} t</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(WORLD_AVERAGE / 10) * 100}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#9e9e9e",
                borderRadius: 6,
              },
            }}
          />
        </Box>

        <Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2">Paris Agreement target</Typography>
            <Typography variant="body2">{TARGET} t</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(TARGET / 10) * 100}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#4caf50",
                borderRadius: 6,
              },
            }}
          />
        </Box>
      </Box>

      {/* Breakdown */}
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Breakdown by Category
      </Typography>
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {[
          { key: "transport", label: "Transport", icon: "🚗" },
          { key: "home", label: "Home", icon: "🏠" },
          { key: "diet", label: "Diet", icon: "🍽️" },
          { key: "lifestyle", label: "Lifestyle", icon: "🛍️" },
        ].map((cat) => (
          <Grid size={{ xs: 6, sm: 3 }} key={cat.key}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 1 }}>
              <Typography variant="h5">{cat.icon}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {result.breakdown[cat.key]}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tips */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TipsAndUpdatesIcon color="success" />
          <Typography variant="subtitle2" fontWeight={700}>
            Tips to Reduce Your Footprint
          </Typography>
        </Box>
        {getTips().map((tip, idx) => (
          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
            • {tip}
          </Typography>
        ))}
      </Box>

      <Button variant="outlined" fullWidth onClick={onReset} sx={{ mt: 2 }}>
        Recalculate
      </Button>
    </Paper>
  );
}

/**
 * CarbonSummary - Compact display for profile
 */
export function CarbonSummary() {
  const [footprint, setFootprint] = useState(null);

  useEffect(() => {
    setFootprint(getCarbonFootprint());
  }, []);

  if (!footprint) {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          textAlign: "center",
        }}
      >
        <NatureIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Calculate your carbon footprint to see personalized insights
        </Typography>
      </Paper>
    );
  }

  const total = parseFloat(footprint.total);
  const isAboveAverage = total > WORLD_AVERAGE;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background: isAboveAverage
          ? "linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(254,202,87,0.1) 100%)"
          : "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(139,195,74,0.1) 100%)",
        border: `1px solid ${isAboveAverage ? "rgba(255,107,107,0.3)" : "rgba(76,175,80,0.3)"}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <NatureIcon sx={{ color: isAboveAverage ? "#ff6b6b" : "#4caf50" }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Your Carbon Footprint
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={800}>
        {footprint.total} t/year
      </Typography>
      <Chip
        label={
          isAboveAverage
            ? `${Math.abs(footprint.vsWorldAverage)}% above average`
            : `${Math.abs(footprint.vsWorldAverage)}% below average`
        }
        size="small"
        color={isAboveAverage ? "warning" : "success"}
        sx={{ mt: 1 }}
      />
    </Paper>
  );
}

export default CarbonCalculator;
