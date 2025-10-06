
export interface TechnicianStats {
  name: string;
  position: string;
  technicianNumber: number;
  avgPerformance: number;
  ticketValue: number;
  impactPoints: number;
  fiveStarReviews: number;
  membershipsSold: number;
  badges?: string[];
}

export interface Technician extends TechnicianStats {
  id: string;
  photoUrl: string;
  quarter: string;
  year: string;
}

export interface TemplateTechnician {
  id: string;
  name: string;
  photoUrl: string;
  technicianNumber: number;
  position: string;
}