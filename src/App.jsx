import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Fab from './components/Fab.jsx';
import UploadModal from './components/UploadModal.jsx';
import Home from './pages/Home.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import MemoryPage from './pages/MemoryPage.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider } from './lib/useAuth.jsx';
import { MemoriesProvider } from './lib/useMemories.jsx';
import { ModalProvider } from './lib/useModal.jsx';
import { ToastProvider } from './lib/useToast.jsx';
import { ConfirmProvider } from './components/ConfirmDialog.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <MemoriesProvider>
            <ModalProvider>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/memories" element={<MemoryPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <Footer />
          <Fab />
          <UploadModal />
            </ModalProvider>
          </MemoriesProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
