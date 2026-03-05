// Deterministic mock question generator for AI preview
// Generates 6-10 questions based on focus area, marks, and difficulty

interface GenerateQuestionsParams {
  focusArea: string;
  marks: string;
  difficulty: string;
  questionStyle?: "numerical" | "conceptual";
}

interface GeneratedQuestion {
  id: string;
  text: string;
  marks: number;
  selected: boolean;
}

// Extract clean topic from focus area (remove instruction keywords)
function extractCleanTopic(focusArea: string): string {
  if (!focusArea || focusArea.trim() === "") {
    return "the given topic";
  }

  // Remove common instruction keywords and patterns
  const cleanedTopic = focusArea
    .toLowerCase()
    .replace(
      /\b(numerical|conceptual|theory|theoretical|practical|type|questions?|for|standard|std|class|grade|level|10th|9th|8th|7th|6th|11th|12th)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  // If nothing left after cleaning, use original
  if (cleanedTopic.length < 3) {
    return focusArea.trim();
  }

  return cleanedTopic;
}

// Numerical question templates with randomizable values
const numericalTemplates = {
  easy: {
    1: [
      "Calculate the value of {topic} when x = 5.",
      "Find the result of {topic} for the given condition.",
      "What is the numerical value of {topic} in the given scenario?",
      "Compute {topic} using the standard formula.",
    ],
    2: [
      "A system has {topic} with initial value 10. Calculate the final value after doubling.",
      "Given {topic} = 20 units, find the percentage change when it increases by 5 units.",
      "Calculate {topic} when the input parameters are 3 and 7. Show your work.",
      "Find the value of {topic} if the initial measurement is 15 units and it decreases by 20%.",
    ],
    3: [
      "A body undergoes {topic} with initial velocity 10 m/s and acceleration 2 m/s². Calculate the final velocity after 5 seconds. Show all steps.",
      "Calculate the total {topic} when three values 12, 18, and 24 are combined. Explain the process.",
      "Given {topic} with parameters a=5, b=8, and c=3, find the resultant value. Show your calculations.",
      "Find {topic} for a system where the initial reading is 50 units and it changes by 15% twice consecutively.",
    ],
    4: [
      "A process involves {topic} with three stages. Stage 1 has value 20, Stage 2 increases it by 30%, and Stage 3 doubles the result. Calculate the final value and show all intermediate steps.",
      "Calculate {topic} for a system with initial parameters: length=10m, width=5m, height=3m. Find the total value and explain each calculation step.",
      "Given {topic} where the first measurement is 25 units, second is 40 units, and third is 35 units, calculate the average and the percentage deviation of each from the average.",
      "A body experiences {topic} with initial value 100. It decreases by 20%, then increases by 30%, then decreases by 10%. Find the final value and net percentage change.",
    ],
  },
  medium: {
    1: [
      "Solve for {topic} when the ratio is 3:5.",
      "Calculate {topic} using the given data.",
      "Find the unknown value in {topic}.",
    ],
    2: [
      "Two quantities related to {topic} are in ratio 2:3. If the first is 18, find the second.",
      "Calculate {topic} when the efficiency is 75% and input is 80 units.",
      "A system shows {topic} with 20% loss. If output is 64, find the input.",
    ],
    3: [
      "Three measurements of {topic} are 15, 20, and 25 units. Calculate the mean, and find which measurement deviates most from the mean.",
      "Calculate {topic} for a process with 85% efficiency. If the desired output is 170 units, what should be the input? Show your work.",
      "A body undergoes {topic} in three phases: increases by 25%, decreases by 15%, then increases by 10%. If final value is 115.5, find the initial value.",
    ],
    4: [
      "A system involves {topic} with four components having values 12, 18, 24, and 30. Calculate the weighted average if weights are 1, 2, 3, and 4 respectively. Show all steps.",
      "Calculate {topic} for a process where input is 200 units, first stage has 90% efficiency, second stage 85% efficiency, and third stage 95% efficiency. Find the final output.",
      "Given {topic} with initial value 50. It undergoes four changes: +20%, -15%, +25%, -10%. Calculate the final value and the net percentage change from the initial value.",
    ],
  },
  hard: {
    1: [
      "Determine {topic} from the given complex ratio.",
      "Calculate the critical value of {topic}.",
    ],
    2: [
      "Two variables in {topic} are inversely proportional. If one is 15 when the other is 20, find the first when the second is 25.",
      "Calculate {topic} when three factors with values 4, 6, and 9 interact multiplicatively with 10% loss at each interaction.",
    ],
    3: [
      "A system exhibits {topic} with compound changes. Starting at 80, it increases by 25%, then the result decreases by 20%, then increases by 15%. Calculate final value and compare with simple average of percentage changes.",
      "Calculate {topic} for a process with three parallel paths having efficiencies 80%, 85%, and 90%. If total input is 300 units distributed equally, find total output.",
      "Given {topic} where measurements follow pattern: first=x, second=1.5x, third=2x, fourth=2.5x. If the sum is 350, find each measurement.",
    ],
    4: [
      "A complex system shows {topic} with four interdependent stages. Stage 1 output = 0.9×input, Stage 2 output = 0.85×(Stage 1 output), Stage 3 output = 0.95×(Stage 2 output), Stage 4 output = 0.88×(Stage 3 output). If final output must be 150 units, calculate required input. Show all intermediate values.",
      "Calculate {topic} for a scenario with five measurements: 18, 24, 30, 36, 42. Find mean, median, range, and standard deviation. Show all calculations.",
      "A body undergoes {topic} with variable rate. In first 5 seconds, rate is 2 units/sec. In next 5 seconds, rate is 3 units/sec. In final 5 seconds, rate is 1.5 units/sec. Calculate total change and average rate.",
    ],
  },
};

// NCERT-style conceptual question templates by difficulty and marks
const conceptualTemplates = {
  easy: {
    1: [
      "Define {topic}.",
      "What is {topic}?",
      "Name the main component of {topic}.",
      "List one example of {topic}.",
      "State the basic principle of {topic}.",
      "Identify the key feature of {topic}.",
    ],
    2: [
      "Explain the concept of {topic} in brief.",
      "Describe two characteristics of {topic}.",
      "What are the main features of {topic}?",
      "Give two examples of {topic} and explain.",
      "State and explain the basic principle of {topic}.",
      "Differentiate between two aspects of {topic}.",
    ],
    3: [
      "Explain the process of {topic} with suitable examples.",
      "Describe the structure and function related to {topic}.",
      "What is {topic}? Explain its significance with examples.",
      "Discuss the main characteristics of {topic} in detail.",
      "Explain how {topic} works with a labeled diagram.",
    ],
    4: [
      "Explain the concept of {topic} in detail with suitable examples and diagrams.",
      "Describe the complete process of {topic} and its applications.",
      "What is {topic}? Discuss its importance and real-world applications.",
      "Explain the mechanism of {topic} with appropriate examples.",
    ],
  },
  medium: {
    1: [
      "What is the role of {topic}?",
      "Name the process involved in {topic}.",
      "Identify the key factor in {topic}.",
      "State one application of {topic}.",
    ],
    2: [
      "How does {topic} function in its environment?",
      "Compare two aspects of {topic}.",
      "Explain the relationship between components of {topic}.",
      "What factors affect {topic}? Explain briefly.",
      "Describe the mechanism of {topic}.",
    ],
    3: [
      "Analyze the process of {topic} and explain its stages.",
      "How does {topic} contribute to its system? Explain with examples.",
      "Discuss the advantages and disadvantages of {topic}.",
      "Explain the working principle of {topic} with a diagram.",
      "What are the factors affecting {topic}? Discuss in detail.",
    ],
    4: [
      "Critically analyze the role of {topic} in its context with examples.",
      "Explain the complete mechanism of {topic} and discuss its applications.",
      "How does {topic} impact its environment? Discuss with suitable examples.",
      "Describe the process of {topic} and evaluate its significance.",
    ],
  },
  hard: {
    1: [
      "State the advanced principle of {topic}.",
      "What is the critical factor in {topic}?",
      "Identify the limitation of {topic}.",
    ],
    2: [
      "Analyze the relationship between {topic} and its environment.",
      "Evaluate the effectiveness of {topic}.",
      "Compare and contrast different approaches to {topic}.",
      "What are the challenges in implementing {topic}?",
    ],
    3: [
      "Critically evaluate the role of {topic} in modern applications.",
      "Analyze the advantages and limitations of {topic} with examples.",
      "How can {topic} be optimized? Discuss with suitable examples.",
      "Evaluate the impact of {topic} on its system with detailed analysis.",
      "Discuss the challenges and solutions related to {topic}.",
    ],
    4: [
      "Critically analyze and evaluate the complete process of {topic} with real-world applications.",
      "Discuss the significance and applications of {topic} in detail.",
      "How does {topic} integrate with other systems? Provide a comprehensive analysis.",
      "Evaluate the importance of {topic} in contemporary context with examples and case studies.",
    ],
  },
};

// Detect if focus area suggests numerical questions
function detectNumericalIntent(focusArea: string): boolean {
  const numericalKeywords =
    /\b(numerical|calculate|compute|find|solve|value|number|quantity|measurement|problem)\b/i;
  return numericalKeywords.test(focusArea);
}

function getRandomTemplate(
  difficulty: string,
  marks: number,
  questionStyle: "numerical" | "conceptual",
): string {
  const templates =
    questionStyle === "numerical"
      ? numericalTemplates[difficulty as keyof typeof numericalTemplates]?.[
          marks as keyof typeof numericalTemplates.easy
        ]
      : conceptualTemplates[difficulty as keyof typeof conceptualTemplates]?.[
          marks as keyof typeof conceptualTemplates.easy
        ];

  if (!templates || templates.length === 0) {
    return questionStyle === "numerical"
      ? "Calculate {topic} for the given conditions."
      : "Explain {topic} in detail.";
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateQuestionText(template: string, topic: string): string {
  return template.replace(/{topic}/g, topic || "the given topic");
}

export function generateMockQuestions(
  params: GenerateQuestionsParams,
): GeneratedQuestion[] {
  const { focusArea, marks, difficulty } = params;
  const marksNum = Number.parseInt(marks, 10);
  const count = Math.floor(Math.random() * 5) + 6; // 6-10 questions

  // Extract clean topic
  const cleanTopic = extractCleanTopic(focusArea);

  // Determine question style: explicit param, or auto-detect from focus area
  let questionStyle: "numerical" | "conceptual" =
    params.questionStyle || "conceptual";
  if (!params.questionStyle && detectNumericalIntent(focusArea)) {
    questionStyle = "numerical";
  }

  const questions: GeneratedQuestion[] = [];
  const usedTemplates = new Set<string>();

  for (let i = 0; i < count; i++) {
    let template = getRandomTemplate(difficulty, marksNum, questionStyle);
    let attempts = 0;

    // Try to get a unique template
    while (usedTemplates.has(template) && attempts < 10) {
      template = getRandomTemplate(difficulty, marksNum, questionStyle);
      attempts++;
    }

    usedTemplates.add(template);
    const text = generateQuestionText(template, cleanTopic);

    questions.push({
      id: `ai-q-${Date.now()}-${i}`,
      text,
      marks: marksNum,
      selected: false,
    });
  }

  return questions;
}
