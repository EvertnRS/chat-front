import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <ChatList />
      <ChatRoom />
    </div>
  );
}
