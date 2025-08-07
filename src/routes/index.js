import { lazy } from 'react';

// ===================== Teachers =====================
const Signup = lazy(() => import('../pages/signup/Signup'));
const Signin = lazy(() => import('../pages/signin/Signin'));
const TestSchedule = lazy(() => import('../pages/testschedule/TestSchedule'));
const EditProfile = lazy(() => import('../pages/EditProfile/EditProfile'));
const Profile = lazy(() => import('../pages/teacherprofile/profile'));

const ReviewPage = lazy(() => import('../pages/reviewpage/ReviewPage'));

// ===================== Groups =====================
const Dashboard = lazy(() => import('../pages/dashboard/dashboard'));
const CreateGroup = lazy(() => import('../pages/creategroup/CreateGroup'));
const Groupinfo = lazy(() => import('../pages/groupinfo/Groupinfo'));
const EditGroup = lazy(() => import('../pages/editgroup/EditGroup'));
const Reports = lazy(() => import('../pages/reports/Reports'));

// ===================== Students =====================
const StudentLogin = lazy(() => import('../pages/studentlogin/StudentLogin'));
const StudentDashboard = lazy(() => import('../pages/studentdashboard/StudentDashboard'));
const StudentTable = lazy(() => import('../pages/studenttable/StudentTable'));
const TestAttend = lazy(() => import('../pages/testattend/TestAttend'));

// ===================== Admin =====================
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admindashboard/AdminDashboard'));
const AdminAccounts = lazy(() => import('../pages/adminaccounts/AdminAccounts'));
const AdminTeachers = lazy(() => import('../pages/adminteachers/AdminTeachers'));
const AdminStudents = lazy(() => import('../pages/adminstudents/AdminStudents'));
const AdminSchools = lazy(() => import('../pages/adminschools/AdminSchools'));
const Amincontact = lazy(() => import('../pages/admincontact/AdminContact'));
const AdminReports = lazy(() => import('../pages/adminreports/AdminReports'));

// ===================== Common =====================
const OtpInput = lazy(() => import('../pages/otpInput/OtpInput'));
const NotFound = lazy(() => import('../pages/notfound/NotFound'));

const routes = [
  // ---------- Teacher & Group Routes ----------
  { path: '/', element: <Dashboard />, protected: true },
  { path: '/dashboard', element: <Dashboard />, protected: true },
  { path: '/profile', element: <Profile />, protected: true },
  { path: '/reports', element: <Reports />, protected: true },
  { path: '/create-group', element: <CreateGroup />, protected: true },
  { path: '/test-schedule', element: <TestSchedule />, protected: true },
  { path: '/student-table', element: <StudentTable />, protected: true },
  { path: '/edit-profile', element: <EditProfile />, protected: false },
  { path: '/info/:id', element: <Groupinfo />, protected: false },
  { path: '/edit-group/:id', element: <EditGroup />, protected: false },
  { path: '/review-page', element: <ReviewPage />, protected: false },

  // ---------- Auth Routes ----------
  { path: '/signup', element: <Signup />, protected: false },
  { path: '/signin', element: <Signin />, protected: false },

  // ---------- Student Routes ----------
  { path: '/student/login', element: <StudentLogin />, protected: false },
  { path: '/student/dashboard', element: <StudentDashboard />, protected: false },
  { path: '/test-attend', element: <TestAttend />, protected: false },

  // ---------- Admin Routes ----------
  { path: '/admin/login', element: <AdminLogin />, protected: false },
  { path: '/admin/dashboard', element: <AdminDashboard />, protected: true },
  { path: '/admin/accounts', element: <AdminAccounts />, protected: true },
  { path: '/admin/teachers', element: <AdminTeachers />, protected: true },
  { path: '/admin/students', element: <AdminStudents />, protected: true },
  { path: '/admin/schools', element: <AdminSchools />, protected: true },
  { path: '/admin/contact', element: <Amincontact />, protected: true },
  {path: '/admin/reports', element: <AdminReports />, protected: true },

  // ---------- Common Routes ----------
  { path: '/otp', element: <OtpInput />, protected: false },
  { path: '/404', element: <NotFound />, protected: false },
];

export default routes;
