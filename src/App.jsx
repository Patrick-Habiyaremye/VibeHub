import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignUpSuccess from "./pages/SignUpSuccess"
import ConfirmEmail from "./pages/ConfirmEmail";
import Feed from "./features/Feed";
import Profile from "./features/Profile";
import Messages from "./features/Messages";
import Discover from "./features/Discover";

function App() {
 return(
<BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route 
          path="/confirm"
          element={<ConfirmEmail />}
          />

          <Route 
          path="/SignUpSuccess"
          element={<SignUpSuccess />}
          />


        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/messages"
          element={<Messages />}
        />

        <Route
          path="/discover"
          element={<Discover />}
        />

      </Routes>
    </BrowserRouter>
 )
}

export default App