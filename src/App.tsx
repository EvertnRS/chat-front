import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import Signup from './pages/Signup';
import EditProfile from './pages/EditProfile';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/chats/:id" element={<ChatPage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/edit-profile" element={<EditProfile />} /> {/* <-- AQUI */}
        </Routes>
      </BrowserRouter>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
