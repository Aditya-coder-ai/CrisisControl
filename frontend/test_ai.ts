import { classifyDanger } from './src/lib/aiClassifier';

const testCases = [
  "There is a fire in the warehouse, smoke everywhere, people trapped",
  "Car accident on highway, 3 people injured, one unconscious, need ambulance immediately",
  "Suspicious package left unattended near the mall entrance",
  "Minor fender bender in the parking lot, no injuries",
  "Active shooter reported in the downtown area, multiple casualties, please hurry"
];

console.log("Testing AI Classifier:");
for (const text of testCases) {
  console.log(`\nInput: "${text}"`);
  const result = classifyDanger(text);
  console.log(`Category: ${result.type}`);
  console.log(`Severity: ${result.severity.toUpperCase()} (Score: ${result.danger_score})`);
  console.log(`Risk Factors: ${result.risk_factors.join(", ") || "None"}`);
  console.log(`Keywords Found: ${result.threat_keywords.join(", ")}`);
}
