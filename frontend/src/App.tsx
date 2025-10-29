import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import FeedPage from "./pages/FeedPage";
import ClubsPage from "./pages/ClubsPage";
import ClubProfilePage from "./pages/ClubProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import PendingPostsPage from "./pages/admin/PendingPostsPage";
import ClubsManagementPage from "./pages/admin/ClubsManagementPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";

const pageVariants = {
  initial: { opacity: 0, x: "-100%" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100%" },
};

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{
                type: "tween",
                ease: "anticipate",
                duration: 0.5,
              }}
            >
              <LoginPage />
            </motion.div>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/feed"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <FeedPage />
                </motion.div>
              }
            />
            <Route
              path="/clubs"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <ClubsPage />
                </motion.div>
              }
            />
            <Route
              path="/clubs/:id"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <ClubProfilePage />
                </motion.div>
              }
            />
            <Route
              path="/reports"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <ReportsPage />
                </motion.div>
              }
            />
            <Route
              path="/profile"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <ProfilePage />
                </motion.div>
              }
            />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <DashboardPage />
                </motion.div>
              }
            />
            <Route
              path="pending-posts"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <PendingPostsPage />
                </motion.div>
              }
            />
            <Route
              path="clubs"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <ClubsManagementPage />
                </motion.div>
              }
            />
            <Route
              path="users"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={{
                    type: "tween",
                    ease: "anticipate",
                    duration: 0.5,
                  }}
                >
                  <UsersManagementPage />
                </motion.div>
              }
            />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
