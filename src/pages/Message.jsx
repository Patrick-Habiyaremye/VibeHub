import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function Messages() {
  return (
    <div className="h-screen flex bg-slate-900">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}