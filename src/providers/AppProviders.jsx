// src/providers/AppProviders.jsx

import { NotificationProvider } from "../context/NotificationContext";
import { SettingsProvider } from "../context/SettingsContext";
import { MessageProvider } from "../context/MessageContext";
import { ChallengeProvider } from "../features/challengeHub/context/ChallengeContext";
import { ChallengeUIProvider } from "../features/challengeHub/context/ChallengeUIContext";
import { ChallengeSessionProvider } from "../features/challengeHub/context/ChallengeSessionContext";

export default function AppProviders({ children }) {
  return (
  
      <NotificationProvider>
        <SettingsProvider>
          <MessageProvider>
          <ChallengeUIProvider>
          <ChallengeSessionProvider>
          <ChallengeProvider>  
              {children}
          </ChallengeProvider>
           </ChallengeSessionProvider>
          </ChallengeUIProvider> 
          </MessageProvider>
        </SettingsProvider>
      </NotificationProvider>
    
  );
}