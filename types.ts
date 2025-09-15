export enum Role {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  profilePictureUrl?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  rating: number;
  message: string;
  createdAt: string;
}