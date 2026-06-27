// import { BrowserRouter, Routes, Route, } from "react-router-dom";
// import Landing from "./pages/Landing";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ConfirmEmail from "./pages/ConfirmEmail";
// import SignUpSuccess from "./pages/SignUpSuccess";
// import Onboarding from "./pages/Onboarding";
// import Feed from "./features/Feed";
// import Profile from "./features/ProfilePage2";
// import Messages from "./features/Messages";
// import Discover from "./features/Discover";
// import Settings from "./features/Settings";
// import DailyChallenge from "./components/challenge/DailyChallenge";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import { AuthProvider } from "./context/AuthContext";
// import { FeedProvider } from "./context/FeedContext";
// import { NotificationProvider } from "./context/NotificationContext";
// import { ReelsProvider } from "./context/ReelsContext";
// import { MessageProvider } from "./context/MessageContext";
// import { ChallengeProvider } from "./context/ChallengeContext";

// function App() {
//   return (
//     <BrowserRouter>

//       <AuthProvider>

//         <FeedProvider>

//           <NotificationProvider>

//             <ReelsProvider>

//               <MessageProvider>

//                 <ChallengeProvider>

//                   <Routes>

//                     <Route
//                       path="/"
//                       element={<Landing />}
//                     />

//                     <Route
//                       path="/login"
//                       element={<Login />}
//                     />

//                     <Route
//                       path="/register"
//                       element={<Register />}
//                     />

//                     <Route
//                       path="/confirm"
//                       element={<ConfirmEmail />}
//                     />

//                     <Route
//                       path="/signup-success"
//                       element={<SignUpSuccess />}
//                     />

//                     <Route
//                       path="/feed"
//                       element={<Feed />}
//                     />

//                     <Route
//                       path="/profile"
//                       element={<Profile />}
//                     />

//                     <Route
//                       path="/messages"
//                       element={<Messages />}
//                     />

//                     <Route
//                       path="/discover"
//                       element={<Discover />}
//                     />

//                     <Route
//                       path="/settings"
//                       element={<Settings />}
//                     />

//                     <Route
//                       path="/challenges"
//                       element={<DailyChallenge />}
//                     />

//                     <Route
//                       path="/onboarding"
//                       element={
//                         <ProtectedRoute>
//                           <Onboarding />
//                         </ProtectedRoute>
//                       }
//                     />
//                     <Route path="*" element={
//     <div className=" min-h-screen flex items-center justify-center text-white bg-slate-900">
//       404 Page Not Found
//     </div>}/>
//                   </Routes>

//                 </ChallengeProvider>

//               </MessageProvider>

//             </ReelsProvider>

//           </NotificationProvider>

//         </FeedProvider>

//       </AuthProvider>

//     </BrowserRouter>
//   );
// }

// export default App;

//import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Landing from "./pages/Landing";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ConfirmEmail from "./pages/ConfirmEmail";
// import SignUpSuccess from "./pages/SignUpSuccess";
// import Onboarding from "./pages/Onboarding";

// import Feed from "./pages/Feed";
// import Profile from "./features/ProfilePage2";
// import Messages from "./features/Messages";
// import Discover from "./features/Discover";
// import Settings from "./features/Settings";
// import DailyChallenge from "./components/challenge/DailyChallenge";

// import ProtectedRoute from "./routes/ProtectedRoute";

// import { AuthProvider } from "./context/AuthContext";
// import { FeedProvider } from "./context/FeedContext";
// import { NotificationProvider } from "./context/NotificationContext";
// import { ReelsProvider } from "./context/ReelsContext";
// import { MessageProvider } from "./context/MessageContext";
// import { ChallengeProvider } from "./context/ChallengeContext";

import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import SignUpSuccess from "./pages/SignUpSuccess";
import Onboarding from "./pages/Onboarding";
import Feed from "./features/Feed";
import Profile from "./features/ProfilePage2";
import Messages from "./features/Messages";
import Discover from "./features/Discover";
import Settings from "./features/Settings";
import DailyChallenge from "./components/challenge/DailyChallenge";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { FeedProvider } from "./context/FeedContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ReelsProvider } from "./context/ReelsContext";
import { MessageProvider } from "./context/MessageContext";
import { ChallengeProvider } from "./context/ChallengeContext";
import SearchPage from "./pages/SearchPage"
import AdminLayout from "./kesh/AdminLayout";
import Dashboard from "./kesh/pages/Dashboard";
import Moderation from "./kesh/pages/Moderation";
import Users from "./kesh/pages/Users";
import Analytics from "./kesh/pages/Analytics";
import Activity from "./kesh/pages/Activity";
import AdminRoute from "./routes/AdminRoute";
import AdminOnly from "./kesh/components/AdminOnly"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeedProvider>
          <NotificationProvider>
            <ReelsProvider>
              <MessageProvider>
                <ChallengeProvider>

                  <Routes>

                    <Route path="/" element={<Landing />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/register" element={<Register />} />

                    <Route path="/confirm" element={<ConfirmEmail />} />

                    <Route
                      path="/signup-success"
                      element={<SignUpSuccess />}
                    />

                    <Route
                      path="/feed"
                      element={<Feed />}
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/discover"
                      element={
                        <ProtectedRoute>
                          <Discover />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/challenges"
                      element={
                        <ProtectedRoute>
                          <DailyChallenge />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/onboarding"
                      element={
                        <ProtectedRoute>
                          <Onboarding />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/search" element={<SearchPage />}/>

                    {/* <Route path="/admin" element={
                     <AdminRoute>
                     <AdminDashboard />
                     </AdminRoute>}/> */}
                     {/* <Route path="/admin/*" element={
                      <AdminOnly>
                       <AdminLayout/>
                      </AdminOnly>}/> */}
                      <Route
    path="/admin"
    element={
      
            <AdminLayout/>
    }
/>

                    <Route path="/admin/moderation" element={
                     <AdminRoute>
                     <Moderation />
                     </AdminRoute>}/>

                    <Route path="/admin/users"  element={
                     <AdminRoute>
                     <Users />
                     </AdminRoute>}/>

                    <Route path="/admin/analytics" element={
                     <AdminRoute>
                     <Analytics />
                     </AdminRoute>}/>

                    <Route path="/admin/activity" element={
                     <AdminRoute>
                     <Activity />
                     </AdminRoute>}/>
                  </Routes>

                </ChallengeProvider>
              </MessageProvider>
            </ReelsProvider>
          </NotificationProvider>
        </FeedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}