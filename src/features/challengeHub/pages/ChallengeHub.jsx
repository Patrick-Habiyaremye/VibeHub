// pages/ChallengeHub.jsx

import { ChallengeProvider } from "../context/ChallengeContext";
import ChallengeHubContent from "./ChallengeHubContent";
// import ChallengeHubSidebar from "./ChallengeHubSidebar";

export default function ChallengeHub() {
  return (
    <ChallengeProvider>
      <ChallengeHubContent />
    </ChallengeProvider>
  );
}