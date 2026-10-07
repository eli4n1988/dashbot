export type Specialty =
  | "משפחה"
  | "ילדים"
  | "נשים"
  | "עור"
  | "אורתופדיה"
  | "עיניים"
  | "אף-אוזן-גרון"
  | "קרדיולוגיה"
  | "גסטרו";

export type CareType = "primary" | "specialty";

export type PhysicianStatus = "active" | "part_time" | "on_leave" | "vacancy";

export interface Clinic {
  id: string;
  name: string;
  city: string;
  members: number;
}

export interface Physician {
  id: string;
  name: string;
  specialty: Specialty;
  careType: CareType;
  clinicId: string;
  fte: number;
  status: PhysicianStatus;
  hireDate: string;
  panelSize?: number;
}

export type RecruitStage =
  | "פנייה ראשונית"
  | "ראיון מקצועי"
  | "אישור מחוז"
  | "הצעת שכר"
  | "חתימת חוזה"
  | "התחלה מתוכננת";

export interface RecruitCandidate {
  id: string;
  name: string;
  specialty: Specialty;
  targetClinicId: string;
  stage: RecruitStage;
  stageIndex: number;
  updatedAt: string;
  notes: string;
  owner: string;
}

export type CallStatus = "overdue" | "due" | "upcoming" | "done";

export interface FeedbackCall {
  id: string;
  physicianId: string;
  dueDate: string;
  lastCompletedAt?: string;
  status: CallStatus;
  mode?: "phone" | "in_person";
  cadenceYears: 1 | 2;
}

export type TaskPriority = "urgent" | "normal";
export type TaskKind = "one_off" | "recurring";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  kind: TaskKind;
  dueDate: string;
  completed: boolean;
  recurrence?: string;
  clinicId?: string;
}

export interface QualityMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  clinicBreakdown: { clinicId: string; value: number }[];
}

export type InquiryStage =
  | "התקבלה"
  | "הועברה לרופא"
  | "הועברה למחוז"
  | "מענה בכתב"
  | "מענה טלפוני"
  | "נסגרה";

export type InquiryType = "complaint" | "thanks";

export interface PublicInquiry {
  id: string;
  type: InquiryType;
  subject: string;
  receivedAt: string;
  stage: InquiryStage;
  physicianId?: string;
  clinicId: string;
  slaDays: number;
  daysOpen: number;
  channel: "מכתב" | "טלפון" | "פורטל";
}

export type SectionId =
  | "overview"
  | "workforce"
  | "calls"
  | "tasks"
  | "quality"
  | "inquiries";
