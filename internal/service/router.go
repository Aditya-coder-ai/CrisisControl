package service

import (
	"log"

	"emergency-response/internal/models"
)

// Router handles dynamic routing of incidents.
type Router struct{}

func NewRouter() *Router {
	return &Router{}
}

// RouteIncident analyzes an incident and determines team and agency routing.
func (r *Router) RouteIncident(incident *models.Incident) *models.RoutingDecision {
	decision := &models.RoutingDecision{
		IncidentID: incident.ID,
		Escalatation: incident.Severity == models.SeverityCritical,
	}

	switch incident.Type {
	case "Fire":
		decision.Team = models.TeamAssignment{TeamID: "T-FIRE", TeamName: "Fire Response Team"}
		decision.Agency = models.AgencyNotification{AgencyName: "Fire Department API", APIEndpoint: "https://api.firedepartment.mock/v1/dispatch", Status: "Notified"}
	case "Medical":
		decision.Team = models.TeamAssignment{TeamID: "T-MED", TeamName: "Medical Response Team"}
		decision.Agency = models.AgencyNotification{AgencyName: "EMS API", APIEndpoint: "https://api.ems.mock/v1/dispatch", Status: "Notified"}
	case "Security":
		decision.Team = models.TeamAssignment{TeamID: "T-SEC", TeamName: "Security Team"}
		decision.Agency = models.AgencyNotification{AgencyName: "Police API", APIEndpoint: "https://api.police.mock/v1/dispatch", Status: "Notified"}
	case "Hazmat":
		decision.Team = models.TeamAssignment{TeamID: "T-HAZ", TeamName: "Hazmat Team"}
		decision.Agency = models.AgencyNotification{AgencyName: "EPA API", APIEndpoint: "https://api.epa.mock/v1/dispatch", Status: "Notified"}
	default:
		decision.Team = models.TeamAssignment{TeamID: "T-GEN", TeamName: "General Operations Team"}
	}

	// Update the incident with routing details
	incident.AssignedTeam = decision.Team.TeamName
	incident.ExternalAgency = decision.Agency.AgencyName

	log.Printf("ROUTING ENGINE: Routed Incident %s [%s] -> Team: %s, Agency: %s (Escalation: %v)", 
		incident.ID, incident.Type, decision.Team.TeamName, decision.Agency.AgencyName, decision.Escalatation)

	return decision
}
