import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import CourseDetailPage from './pages/CourseDetailPage';
import CreateCoursePage from './pages/CreateCoursePage';
import HomePage from './pages/HomePage';
import SmartCoursePage from './pages/SmartCoursePage';
import TracePage from './pages/TracePage';

function App() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateCoursePage />} />
            <Route path="/smart" element={<SmartCoursePage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/trace/:courseId" element={<TracePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default App;
