import { User, Role, Course, Feedback } from '../types';

// Define types used for function arguments, which are not in the global types.ts
export interface LoginCredentials {
  email: string;
  password?: string; // Password is not used in mock, but good for type consistency
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
}


// --- MOCK DATABASE ---

let users: User[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: Role.ADMIN,
    isBlocked: false,
    createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
  },
  {
    id: 'admin-002',
    name: 'Super Admin',
    email: 'super.admin@example.com',
    role: Role.ADMIN,
    isBlocked: false,
    createdAt: new Date('2023-01-15T09:00:00Z').toISOString(),
  },
  {
    id: 'student-001',
    name: 'Student User',
    email: 'student@example.com',
    role: Role.STUDENT,
    phoneNumber: '123-456-7890',
    dateOfBirth: new Date('2002-05-15T00:00:00Z').toISOString(),
    address: '123 University Ave, Learnville',
    isBlocked: false,
    createdAt: new Date('2023-02-10T11:00:00Z').toISOString(),
  },
  {
    id: 'student-002',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: Role.STUDENT,
    isBlocked: true,
    createdAt: new Date('2023-03-20T12:00:00Z').toISOString(),
  },
];

let courses: Course[] = [
    { id: 'course-101', name: 'Introduction to React', description: 'Learn the fundamentals of React and build modern web applications.', videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk', createdAt: new Date().toISOString() },
    { id: 'course-102', name: 'Advanced CSS', description: 'Master advanced CSS techniques like Flexbox, Grid, and animations.', createdAt: new Date().toISOString() },
    { id: 'course-201', name: 'Node.js for Beginners', description: 'An introduction to backend development with Node.js and Express.', videoUrl: 'https://www.youtube.com/watch?v=f2EqECiTBL8', createdAt: new Date().toISOString() },
    { id: 'course-301', name: 'Mastering Python', description: 'From basics to advanced concepts, become a Python pro.', createdAt: new Date().toISOString() },
    { id: 'course-302', name: 'Data Science with Pandas', description: 'Learn to manipulate and analyze data effectively using the Pandas library.', createdAt: new Date().toISOString() },
    { id: 'course-401', name: 'UI/UX Design Fundamentals', description: 'Discover the principles of user-centered design and create beautiful interfaces.', videoUrl: 'https://www.youtube.com/watch?v=cKZEgt61w_o', createdAt: new Date().toISOString() },
    { id: 'course-402', name: 'Agile Project Management', description: 'Learn the Scrum and Kanban frameworks for effective project delivery.', createdAt: new Date().toISOString() },
    { id: 'course-501', name: 'Database Systems & SQL', description: 'An in-depth look at relational databases and the SQL language.', createdAt: new Date().toISOString() },
];

let feedback: Feedback[] = [
    { id: 'fb-001', studentId: 'student-001', studentName: 'Student User', courseId: 'course-101', courseName: 'Introduction to React', rating: 5, message: 'Excellent course! The instructor was clear and the projects were very helpful.', createdAt: new Date('2023-10-01T10:00:00Z').toISOString() },
    { id: 'fb-002', studentId: 'student-001', studentName: 'Student User', courseId: 'course-102', courseName: 'Advanced CSS', rating: 4, message: 'Good content, but could use more real-world examples.', createdAt: new Date('2023-10-05T14:00:00Z').toISOString() },
    { id: 'fb-003', studentId: 'student-002', studentName: 'Jane Doe', courseId: 'course-101', courseName: 'Introduction to React', rating: 3, message: 'It was okay. A bit fast-paced for me.', createdAt: new Date('2023-10-02T18:00:00Z').toISOString() },
];

// --- MOCK API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Auth
export const login = async ({ email }: LoginCredentials): Promise<{ user: User, token: string }> => {
  await simulateDelay(500);
  // NOTE: Password isn't checked in this mock implementation
  const user = users.find(u => u.email === email);
  if (user && !user.isBlocked) {
    return { user, token: `mock-jwt-token-for-${user.id}` };
  }
  throw new Error('Invalid credentials or user is blocked.');
};

export const signup = async (data: SignupData): Promise<{ user: User, token: string }> => {
    await simulateDelay(500);
    if (users.some(u => u.email === data.email)) {
        throw new Error('User with this email already exists.');
    }
    const newUser: User = {
        id: `student-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: Role.STUDENT,
        isBlocked: false,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return { user: newUser, token: `mock-jwt-token-for-${newUser.id}` };
};

export const getUserById = async (id: string): Promise<User | null> => {
    await simulateDelay(200);
    return users.find(u => u.id === id) || null;
};

// Users
export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(300);
    return [...users];
};

export const updateUserProfile = async (id: string, updates: Partial<User>): Promise<User> => {
    await simulateDelay(400);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
};

export const deleteUser = async (id: string): Promise<void> => {
    await simulateDelay(500);
    users = users.filter(u => u.id !== id);
};

// Courses
export const getCourses = async (): Promise<Course[]> => {
    await simulateDelay(200);
    return [...courses];
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    await simulateDelay(200);
    return courses.find(c => c.id === id) || null;
};

export const addCourse = async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    await simulateDelay(300);
    const newCourse: Course = { ...data, id: `course-${Date.now()}`, createdAt: new Date().toISOString() };
    courses.push(newCourse);
    return newCourse;
};

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course> => {
    await simulateDelay(300);
    const courseIndex = courses.findIndex(c => c.id === id);
    if (courseIndex === -1) throw new Error('Course not found');
    courses[courseIndex] = { ...courses[courseIndex], ...updates };
    return courses[courseIndex];
};

export const deleteCourse = async (id: string): Promise<void> => {
    await simulateDelay(400);
    courses = courses.filter(c => c.id !== id);
};

// Feedback
export const getFeedback = async (): Promise<Feedback[]> => {
    await simulateDelay(300);
    return [...feedback];
};

export const getFeedbackForStudent = async (studentId: string): Promise<Feedback[]> => {
    await simulateDelay(300);
    return feedback.filter(f => f.studentId === studentId);
};

export const addFeedback = async (data: Omit<Feedback, 'id' | 'createdAt' | 'studentName' | 'courseName'> & { studentId: string }): Promise<Feedback> => {
    await simulateDelay(300);
    const student = users.find(u => u.id === data.studentId);
    const course = courses.find(c => c.id === data.courseId);
    if (!student || !course) throw new Error('Invalid student or course');
    
    const existingFeedbackIndex = feedback.findIndex(f => f.studentId === data.studentId && f.courseId === data.courseId);
    if (existingFeedbackIndex !== -1) {
       throw new Error('You have already submitted feedback for this course. Please edit the existing one.');
    }

    const newFeedback: Feedback = {
        ...data,
        id: `fb-${Date.now()}`,
        studentName: student.name,
        courseName: course.name,
        createdAt: new Date().toISOString(),
    };
    feedback.push(newFeedback);
    return newFeedback;
};

export const updateFeedback = async (id: string, updates: Partial<Omit<Feedback, 'id' | 'studentId' | 'studentName' | 'courseId' | 'courseName' | 'createdAt'>>): Promise<Feedback> => {
    await simulateDelay(300);
    const feedbackIndex = feedback.findIndex(f => f.id === id);
    if (feedbackIndex === -1) throw new Error('Feedback not found');
    feedback[feedbackIndex] = { ...feedback[feedbackIndex], ...updates };
    return feedback[feedbackIndex];
};

export const deleteFeedback = async (id: string): Promise<void> => {
    await simulateDelay(400);
    feedback = feedback.filter(f => f.id !== id);
};