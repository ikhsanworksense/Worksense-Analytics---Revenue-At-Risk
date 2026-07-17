export interface Customer {
  id: string;
  name: string;
  segment: string;
  recency: number;
  freqScore: number;
  monetary: number;
  status: "Pending" | "Contacted" | "Declined" | string;
  riskScore?: number;
  riskCategory?: "High" | "Medium" | "Low" | string;
}

export interface ActionLog {
  id: string;
  customerId: string;
  customerName: string;
  timestamp: string;
  type: string;
  notes: string;
  officer: string;
  impact: number;
  status: string;
}

export interface ScoringConfig {
  recencyMed: number;
  recencyHigh: number;
  freqMultiplier: number;
  highScoreThreshold: number;
}
