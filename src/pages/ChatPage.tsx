import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { id } = useParams();
  const token = localStorage.getItem('token') || '';

  return (
    <div className="h-screen w-screen flex relative">
      {/* Sidebar de contatos */}
      <div className="w-1/4 bg-[#1f2937] text-white overflow-y-auto">
        <ChatList />
      </div>

      <div className="flex-1 bg-[#111827] text-white">
        {id ? (
          <ChatRoom chatId={id} token={token} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-lg">Selecione um chat</p>
          </div>
        )}
      </div>

    </div>
  );
}
