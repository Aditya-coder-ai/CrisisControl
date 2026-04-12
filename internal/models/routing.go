package models

// RoutingDecision represents the outcome of the dynamic routing algorithm
type RoutingDecision struct {
	IncidentID    string             `json:"incident_id"`
	Team          TeamAssignment     `json:"team"`
	Agency        AgencyNotification `json:"agency"`
	Escalatation  bool               `json:"escalation"`
}

type TeamAssignment struct {
	TeamID   string `json:"team_id"`
	TeamName string `json:"team_name"`
}

type AgencyNotification struct {
	AgencyName string `json:"agency_name"`
	APIEndpoint string `json:"api_endpoint"`
	Status      string `json:"status"`
}
