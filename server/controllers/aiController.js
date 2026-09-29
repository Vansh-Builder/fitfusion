// Rule-based AI fitness assistant
// Architecture is ready for OpenAI API integration

const fitnessKnowledge = {
  greetings: ['hello', 'hi', 'hey', 'greetings'],
  bmi_keywords: ['bmi', 'body mass index', 'weight category'],
  calorie_keywords: ['calories', 'caloric', 'energy intake', 'how many calories', 'bmr', 'tdee'],
  workout_keywords: ['workout', 'exercise', 'training', 'gym', 'push up', 'squat', 'plank'],
  meal_keywords: ['meal', 'food', 'diet', 'nutrition', 'eat', 'protein', 'carbs', 'fat'],
  water_keywords: ['water', 'hydration', 'drink', 'fluids'],
  sleep_keywords: ['sleep', 'rest', 'insomnia', 'recovery'],
  weight_loss: ['lose weight', 'weight loss', 'fat loss', 'burn fat', 'slim'],
  muscle_gain: ['gain muscle', 'build muscle', 'bulk', 'mass', 'strength'],
};

const responses = {
  greeting: () => `👋 Hey there! I'm your FitFusion AI assistant. I can help you with:\n\n• 🏋️ Workout advice\n• 🥗 Nutrition tips\n• 💧 Hydration goals\n• 😴 Sleep optimization\n• 📊 BMI & calorie calculations\n• 🎯 Goal setting\n\nWhat would you like to know?`,

  bmi: (bmi) => bmi
    ? `Your BMI of ${bmi} ${bmi < 18.5 ? 'indicates you are **Underweight**. Consider increasing caloric intake and strength training.' : bmi < 25 ? 'is in the **Normal range**! Keep maintaining your healthy habits.' : bmi < 30 ? 'indicates you are **Overweight**. A caloric deficit of 500kcal/day and regular cardio can help.' : 'indicates **Obesity**. Please consult a healthcare provider for a personalized plan.'}`
    : `BMI (Body Mass Index) is calculated as:\n**BMI = weight(kg) / height(m)²**\n\n📊 Categories:\n• < 18.5: Underweight\n• 18.5 - 24.9: Normal weight\n• 25 - 29.9: Overweight\n• ≥ 30: Obese\n\nUse our BMI Calculator page for a detailed analysis!`,

  calories: () => `🔥 **Calorie Guide:**\n\nYour daily calorie needs depend on your BMR (Basal Metabolic Rate) × Activity Level:\n\n• **Sedentary:** BMR × 1.2\n• **Lightly active:** BMR × 1.375\n• **Moderately active:** BMR × 1.55\n• **Very active:** BMR × 1.725\n\n**Goals:**\n• Weight loss: TDEE - 500 kcal\n• Maintenance: TDEE\n• Muscle gain: TDEE + 300 kcal\n\nUse our Calorie Calculator for personalized numbers!`,

  workout: () => `💪 **Workout Tips:**\n\n**For Beginners:**\n1. Start with 3 days/week\n2. Focus on compound movements (squats, push-ups, rows)\n3. Rest 48 hours between muscle groups\n4. Warm up for 5-10 minutes\n\n**For Weight Loss:**\n• HIIT 3-4x/week (burns 25% more calories)\n• Strength training 2-3x/week\n• Stay active throughout the day\n\n**Recovery is key!** Muscles grow during rest, not during workouts.`,

  nutrition: () => `🥗 **Nutrition Basics:**\n\n**Macronutrient Distribution:**\n• 🥩 Protein: 25-35% of calories (4 kcal/g)\n• 🍞 Carbs: 35-50% of calories (4 kcal/g)\n• 🥑 Fat: 20-30% of calories (9 kcal/g)\n\n**Quality Foods:**\n✅ Lean proteins: chicken, fish, eggs, legumes\n✅ Complex carbs: oats, brown rice, quinoa\n✅ Healthy fats: avocado, olive oil, nuts\n❌ Avoid: processed foods, excessive sugar, trans fats`,

  water: () => `💧 **Hydration Guide:**\n\n**Daily Water Goal:**\n• General: 8 glasses (2L)\n• Formula: **weight (kg) × 33 ml**\n• Athletes: +500-1000ml extra\n\n**Signs of Dehydration:**\n• Dark urine\n• Fatigue\n• Headaches\n• Decreased performance\n\n**Tips:**\n• Start your day with 500ml water\n• Drink a glass before each meal\n• Set hourly reminders\n• Carry a water bottle`,

  sleep: () => `😴 **Sleep Optimization:**\n\n**Why Sleep Matters for Fitness:**\n• Growth hormone is released during deep sleep\n• Muscle repair happens overnight\n• Improves performance by 30%\n• Regulates hunger hormones (ghrelin/leptin)\n\n**Recommendations:**\n• 7-9 hours for adults\n• Keep consistent sleep/wake times\n• Dark, cool room (65-68°F/18-20°C)\n• No screens 1 hour before bed\n• Avoid caffeine after 2 PM`,

  weightLoss: () => `🎯 **Weight Loss Strategy:**\n\n**The Golden Rule:** Caloric deficit + Consistency\n\n**Weekly plan:**\n• Create 500 kcal/day deficit\n• 3-4 cardio sessions\n• 2-3 strength sessions\n• 7-8 hours sleep\n• 2-3L water daily\n\n**Expected results:**\n• Healthy rate: 0.5-1 kg/week\n• Don't skip meals - eat less, more often\n• Track progress weekly, not daily`,

  muscleGain: () => `💪 **Muscle Building Guide:**\n\n**Key Principles:**\n• **Progressive overload** - increase weight/reps each week\n• **Caloric surplus** - eat 300-500 kcal above maintenance\n• **Protein intake** - 1.6-2.2g per kg bodyweight\n• **Rest** - 7-9 hours sleep for recovery\n\n**Best exercises:**\n• Compound: squats, deadlifts, bench press, rows\n• Isolation: bicep curls, tricep extensions\n\n**Patience is key** - expect 1-2 kg of muscle per month for beginners`,

  default: (msg) => `I understand you're asking about "${msg}". Here's what I can help with:\n\n1. 🏋️ **Workouts** - Exercise plans and techniques\n2. 🥗 **Nutrition** - Diet and meal advice\n3. 💧 **Hydration** - Daily water intake\n4. 😴 **Sleep** - Rest and recovery\n5. 📊 **BMI & Calories** - Health metrics\n6. 🎯 **Goals** - Weight loss or muscle gain\n\nTry asking something like:\n• "How many calories should I eat?"\n• "What's a good beginner workout?"\n• "How much water should I drink?"`,
};

const processMessage = (message) => {
  const msg = message.toLowerCase().trim();

  if (fitnessKnowledge.greetings.some(g => msg.includes(g))) return responses.greeting();
  if (fitnessKnowledge.bmi_keywords.some(k => msg.includes(k))) return responses.bmi();
  if (fitnessKnowledge.calorie_keywords.some(k => msg.includes(k))) return responses.calories();
  if (fitnessKnowledge.weight_loss.some(k => msg.includes(k))) return responses.weightLoss();
  if (fitnessKnowledge.muscle_gain.some(k => msg.includes(k))) return responses.muscleGain();
  if (fitnessKnowledge.workout_keywords.some(k => msg.includes(k))) return responses.workout();
  if (fitnessKnowledge.meal_keywords.some(k => msg.includes(k))) return responses.nutrition();
  if (fitnessKnowledge.water_keywords.some(k => msg.includes(k))) return responses.water();
  if (fitnessKnowledge.sleep_keywords.some(k => msg.includes(k))) return responses.sleep();
  return responses.default(message.substring(0, 50));
};

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    // TODO: Replace with OpenAI API call when API key is available
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const completion = await openai.chat.completions.create({...});

    const response = processMessage(message);
    res.json({ success: true, data: { message: response, timestamp: new Date().toISOString() } });
  } catch (err) { next(err); }
};

module.exports = { chat };
