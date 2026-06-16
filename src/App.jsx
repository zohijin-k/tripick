import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import CourseDetailPage from './pages/CourseDetailPage';
import HomePage from './pages/HomePage';
import TracePage from './pages/TracePage';

function App() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
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
