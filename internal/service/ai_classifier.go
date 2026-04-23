package service

import (
	"math"
	"strings"

	"emergency-response/internal/models"
)

// AIClassification holds the result of the AI classification engine.
type AIClassification struct {
	DangerScore    float64              `json:"danger_score"`    // 0.0 - 1.0
	Severity       models.IncidentSeverity `json:"severity"`
	Type           string               `json:"type"`
	Confidence     float64              `json:"confidence"`      // 0.0 - 1.0
	ThreatKeywords []string             `json:"threat_keywords"` // Matched keywords
	RiskFactors    []string             `json:"risk_factors"`    // Human-readable risk factors
	Priority       string               `json:"priority"`        // "CRITICAL", "HIGH", "MODERATE", "LOW"
	ResponseTime   string               `json:"response_time"`   // Recommended response window
}

// AIClassifier uses NLP-style keyword analysis and weighted scoring to assess danger priority.
type AIClassifier struct {
	// Weighted keyword maps for each category
	fireKeywords     map[string]float64
	medicalKeywords  map[string]float64
	securityKeywords map[string]float64
	hazmatKeywords   map[string]float64
	naturalKeywords  map[string]float64

	// Severity amplifiers
	urgencyKeywords  map[string]float64
	scaleKeywords    map[string]float64
	casualtyKeywords map[string]float64
}

// NewAIClassifier initializes the classifier with weighted keyword databases.
func NewAIClassifier() *AIClassifier {
	return &AIClassifier{
		fireKeywords: map[string]float64{
			"fire": 0.7, "flame": 0.7, "blaze": 0.8, "burning": 0.75, "smoke": 0.6,
			"inferno": 0.9, "arson": 0.85, "explosion": 0.9, "ignited": 0.7,
			"wildfire": 0.9, "combustion": 0.7, "charred": 0.6, "engulfed": 0.85,
			"fireplace": 0.2, "campfire": 0.3, "bonfire": 0.4,
			"gas leak": 0.8, "propane": 0.7, "electrical fire": 0.85,
			"furnace": 0.5, "ember": 0.5, "scorched": 0.6,
		},
		medicalKeywords: map[string]float64{
			"injury": 0.6, "injured": 0.65, "wound": 0.6, "bleeding": 0.7,
			"unconscious": 0.85, "heart attack": 0.95, "cardiac": 0.9, "stroke": 0.9,
			"breathing": 0.7, "choking": 0.8, "seizure": 0.85, "allergic": 0.7,
			"anaphylaxis": 0.95, "overdose": 0.9, "poison": 0.85, "fracture": 0.6,
			"broken bone": 0.6, "concussion": 0.7, "drowning": 0.9, "cpr": 0.9,
			"ambulance": 0.7, "medical": 0.5, "hospital": 0.4, "doctor": 0.4,
			"pain": 0.4, "fainted": 0.7, "collapsed": 0.75, "not breathing": 0.95,
			"diabetic": 0.6, "insulin": 0.5, "blood": 0.6, "trauma": 0.7,
			"burn": 0.6, "chest pain": 0.85, "pregnant": 0.6, "labor": 0.7,
		},
		securityKeywords: map[string]float64{
			"gun": 0.9, "firearm": 0.9, "weapon": 0.85, "shooting": 0.95,
			"stabbing": 0.9, "knife": 0.8, "assault": 0.8, "attack": 0.75,
			"robbery": 0.8, "theft": 0.5, "burglary": 0.6, "intruder": 0.75,
			"hostage": 0.95, "threat": 0.7, "bomb": 0.95, "explosive": 0.95,
			"terrorist": 0.95, "terrorism": 0.95, "suspicious": 0.4, "fight": 0.6,
			"violence": 0.75, "murder": 0.95, "killed": 0.9, "shooter": 0.95,
			"active shooter": 0.99, "gunshot": 0.9, "kidnap": 0.9, "abduct": 0.9,
			"riot": 0.85, "looting": 0.7, "armed": 0.85, "ransom": 0.85,
			"carjack": 0.8, "gang": 0.7, "stalking": 0.6, "harassing": 0.5,
		},
		hazmatKeywords: map[string]float64{
			"chemical": 0.8, "toxic": 0.85, "hazardous": 0.8, "radiation": 0.9,
			"spill": 0.7, "contamination": 0.8, "biohazard": 0.9, "nuclear": 0.95,
			"gas": 0.5, "fumes": 0.6, "leak": 0.6, "asbestos": 0.7,
			"mercury": 0.75, "acid": 0.7, "corrosive": 0.75, "volatile": 0.7,
		},
		naturalKeywords: map[string]float64{
			"earthquake": 0.9, "flood": 0.85, "tsunami": 0.95, "tornado": 0.9,
			"hurricane": 0.9, "landslide": 0.85, "avalanche": 0.85, "storm": 0.6,
			"cyclone": 0.85, "lightning": 0.5, "hailstorm": 0.6, "drought": 0.4,
			"volcanic": 0.9, "sinkhole": 0.7, "mudslide": 0.8,
		},
		urgencyKeywords: map[string]float64{
			"help": 0.3, "emergency": 0.5, "urgent": 0.5, "immediately": 0.6,
			"hurry": 0.5, "fast": 0.3, "quick": 0.3, "dying": 0.9,
			"trapped": 0.8, "stuck": 0.5, "can't escape": 0.85, "spreading": 0.7,
			"getting worse": 0.6, "critical": 0.7, "life threatening": 0.9,
			"please": 0.2, "save": 0.5, "rescue": 0.6, "sos": 0.7,
			"mayday": 0.8, "danger": 0.6, "dangerous": 0.6,
		},
		scaleKeywords: map[string]float64{
			"building": 0.5, "school": 0.7, "hospital": 0.7, "apartment": 0.6,
			"neighborhood": 0.7, "city": 0.8, "multiple": 0.6, "several": 0.5,
			"many": 0.5, "crowd": 0.6, "mass": 0.7, "widespread": 0.8,
			"entire": 0.6, "highway": 0.6, "bridge": 0.6, "mall": 0.6,
			"factory": 0.6, "warehouse": 0.5, "residential": 0.5, "commercial": 0.5,
		},
		casualtyKeywords: map[string]float64{
			"dead": 0.95, "death": 0.95, "killed": 0.95, "died": 0.95,
			"casualties": 0.9, "victims": 0.7, "people hurt": 0.7, "children": 0.8,
			"elderly": 0.6, "baby": 0.8, "infant": 0.8, "disabled": 0.6,
			"fatality": 0.95, "bodies": 0.95, "survivor": 0.7, "critical condition": 0.85,
		},
	}
}

// Classify analyzes the text description and returns an AI classification.
func (c *AIClassifier) Classify(description string) *AIClassification {
	text := strings.ToLower(description)

	// Calculate category scores
	fireScore, fireMatches := c.scoreCategory(text, c.fireKeywords)
	medicalScore, medicalMatches := c.scoreCategory(text, c.medicalKeywords)
	securityScore, securityMatches := c.scoreCategory(text, c.securityKeywords)
	hazmatScore, hazmatMatches := c.scoreCategory(text, c.hazmatKeywords)
	naturalScore, naturalMatches := c.scoreCategory(text, c.naturalKeywords)

	// Calculate amplifier scores
	urgencyScore, urgencyMatches := c.scoreCategory(text, c.urgencyKeywords)
	scaleScore, scaleMatches := c.scoreCategory(text, c.scaleKeywords)
	casualtyScore, casualtyMatches := c.scoreCategory(text, c.casualtyKeywords)

	// Determine primary category
	categories := map[string]float64{
		"Fire":           fireScore,
		"Medical":        medicalScore,
		"Security":       securityScore,
		"Hazmat":         hazmatScore,
		"Natural":        naturalScore,
	}

	bestType := "Medical" // Default
	bestScore := 0.0
	for cat, score := range categories {
		if score > bestScore {
			bestScore = score
			bestType = cat
		}
	}

	// Collect all matched keywords
	allMatches := make([]string, 0)
	allMatches = append(allMatches, fireMatches...)
	allMatches = append(allMatches, medicalMatches...)
	allMatches = append(allMatches, securityMatches...)
	allMatches = append(allMatches, hazmatMatches...)
	allMatches = append(allMatches, naturalMatches...)
	allMatches = append(allMatches, urgencyMatches...)
	allMatches = append(allMatches, scaleMatches...)
	allMatches = append(allMatches, casualtyMatches...)

	// Calculate composite danger score
	amplifier := 1.0 + (urgencyScore * 0.3) + (scaleScore * 0.25) + (casualtyScore * 0.45)
	rawDanger := bestScore * amplifier
	dangerScore := math.Min(rawDanger, 1.0)

	// Determine confidence based on keyword density
	totalKeywords := len(allMatches)
	wordCount := len(strings.Fields(text))
	confidence := 0.0
	if wordCount > 0 {
		keywordDensity := float64(totalKeywords) / float64(wordCount)
		confidence = math.Min(0.4 + keywordDensity*3.0 + bestScore*0.3, 0.99)
	}
	if totalKeywords == 0 {
		confidence = 0.15
		dangerScore = 0.2 // Unknown content, treat as potential threat
	}

	// Determine severity from danger score
	var severity models.IncidentSeverity
	var priority string
	var responseTime string

	switch {
	case dangerScore >= 0.8:
		severity = models.SeverityCritical
		priority = "CRITICAL"
		responseTime = "< 2 minutes"
	case dangerScore >= 0.6:
		severity = models.SeverityHigh
		priority = "HIGH"
		responseTime = "< 5 minutes"
	case dangerScore >= 0.35:
		severity = models.SeverityModerate
		priority = "MODERATE"
		responseTime = "< 15 minutes"
	default:
		severity = models.SeverityLow
		priority = "LOW"
		responseTime = "< 30 minutes"
	}

	// Build risk factors
	riskFactors := make([]string, 0)
	if casualtyScore > 0.3 {
		riskFactors = append(riskFactors, "Potential casualties reported")
	}
	if scaleScore > 0.3 {
		riskFactors = append(riskFactors, "Large-scale incident indicated")
	}
	if urgencyScore > 0.3 {
		riskFactors = append(riskFactors, "High urgency language detected")
	}
	if securityScore > 0.5 {
		riskFactors = append(riskFactors, "Active threat situation")
	}
	if fireScore > 0.5 && scaleScore > 0.3 {
		riskFactors = append(riskFactors, "Structural fire with spread risk")
	}
	if medicalScore > 0.5 && casualtyScore > 0.3 {
		riskFactors = append(riskFactors, "Multiple medical emergencies")
	}
	if len(riskFactors) == 0 && dangerScore > 0.2 {
		riskFactors = append(riskFactors, "General emergency situation")
	}

	return &AIClassification{
		DangerScore:    math.Round(dangerScore*100) / 100,
		Severity:       severity,
		Type:           bestType,
		Confidence:     math.Round(confidence*100) / 100,
		ThreatKeywords: allMatches,
		RiskFactors:    riskFactors,
		Priority:       priority,
		ResponseTime:   responseTime,
	}
}

// scoreCategory returns the weighted score and matched keywords for a keyword category.
func (c *AIClassifier) scoreCategory(text string, keywords map[string]float64) (float64, []string) {
	totalScore := 0.0
	matches := make([]string, 0)
	matchCount := 0

	for keyword, weight := range keywords {
		if strings.Contains(text, keyword) {
			totalScore += weight
			matches = append(matches, keyword)
			matchCount++
		}
	}

	if matchCount == 0 {
		return 0.0, matches
	}

	// Normalize: use average weight boosted by match count (diminishing returns)
	avgWeight := totalScore / float64(matchCount)
	countBoost := math.Log2(float64(matchCount) + 1) / 3.0
	finalScore := math.Min(avgWeight+countBoost, 1.0)

	return finalScore, matches
}
