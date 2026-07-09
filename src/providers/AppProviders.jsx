// src/providers/AppProviders.jsx
import { FeedProvider } from "../context/FeedContext";
import { NotificationProvider } from "../context/NotificationContext";
// import { ReelsProvider } from "../context/ReelsContext";
import { MessageProvider } from "../context/MessageContext";
import { ChallengeProvider } from "../context/ChallengeContext";

export default function AppProviders({ children }) {
  return (
    <FeedProvider>
      <NotificationProvider>
        
          <MessageProvider>
            <ChallengeProvider>
              {children}
            </ChallengeProvider>
          </MessageProvider>
        
      </NotificationProvider>
    </FeedProvider>
  );
}