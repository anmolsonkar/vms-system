export interface VisitorRegistrationData {
  propertyId: string;
  name: string;
  phone?: string;
  idCardType?: 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'other';
  idCardNumber?: string;
  idCardImageUrl?: string;
  photoUrl: string;
  purpose: string;
  hostResidentId: string;
  vehicleNumber?: string;
  numberOfPersons: number;
}

export interface VisitorApprovalData {
  visitorId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface VisitorCheckInData {
  visitorId: string;
  checkInTime: Date;
  actualNumberOfPersons?: number;
}

export interface VisitorExitData {
  visitorId: string;
  exitTime: Date;
}

export interface VisitorFilters {
  propertyId?: string;
  status?: string;
  hostResidentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface VisitorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  checkedIn: number;
  checkedOut: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}