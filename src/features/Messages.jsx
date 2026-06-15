import Navbar from "../components/layout/Navbar";

import ChatSidebar from "../components/chat/ChatSideBar";
import ChatWindow from "../components/chat/ChatWindow";

export default function Messages() {
  return (
    <div className="bg-slate-950 min-h-screen">

      <Navbar />

      <div
        className="
        flex
        h-[calc(100vh-64px)]
      "
      >

        <ChatSidebar />

        <ChatWindow />

      </div>

    </div>
  );
}