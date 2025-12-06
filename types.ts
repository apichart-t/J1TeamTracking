
export interface Metric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface Risk {
  issue: string;
  impact: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface AnalysisResult {
  projectTitle: string;
  executiveSummary: string;
  keyHighlights: string[];
  risks: Risk[];
  actionItems: string[];
  metrics: Metric[];
  overallSentiment: number; // 0-100
}

export interface TrendAnalysisResult {
  trend: 'improving' | 'stable' | 'deteriorating';
  summary: string;
  resolvedIssues: string[];
  newRisks: string[];
  progressAssessment: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}
