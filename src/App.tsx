import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Login from './pages/Login';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';

function ChatRoomWrapper() {
  const { id } = useParams();
  const token = localStorage.getItem('token') || '';

  if (!id) return <div>Chat ID not found</div>;

  return <ChatRoom chatId={id} token={token} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:id" element={<ChatRoomWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
