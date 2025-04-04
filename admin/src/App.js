import Login from "./pages/login/Login";
import List from "./pages/list/List";
import New from "./pages/new/new";
import Update from "./pages/update/Update";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { userInputs, hostelInputs, roomInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import { hostelColumns, roomColumns, userColumns, restaurantColumns } from "./datatablesource";
import NewHostel from "./pages/newHostel/NewHostel";
import NewRoom from "./pages/newRoom/NewRoom";
import Home from "./pages/home/Home";
import Beds from "./pages/beds/Beds";
import BedManagement from "./pages/bedManagement/BedManagement";
import NewRestaurant from "./pages/newRestaurant/NewRestaurant";
import UpdateRestaurant from "./pages/updateRestaurant/UpdateRestaurant";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  // 🔒 Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="login" element={<Login />} />
           
            {/* Users Route */}
            <Route path="users">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={userColumns} />
                  </ProtectedRoute>
                }
              />
             
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <New inputs={userInputs} title="Add New User" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="update/:id"
                element={
                  <ProtectedRoute>
                    <Update inputs={userInputs} />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Hostels Route */}
            <Route path="hostel">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={hostelColumns} />
                  </ProtectedRoute>
                }
              />
             
              <Route
                path="update/:id"
                element={
                  <ProtectedRoute>
                    <Update inputs={hostelInputs} />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* New Hostel Route - Standalone */}
            <Route
              path="hostel/new"
              element={
                <ProtectedRoute>
                  <NewHostel />
                </ProtectedRoute>
              }
            />
            {/* Rooms Route */}
            <Route path="rooms">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={roomColumns} />
                  </ProtectedRoute>
                }
              />
             
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="update/:id"
                element={
                  <ProtectedRoute>
                    <Update inputs={roomInputs} />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="beds">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Beds />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/restaurants">
              <Route index element={<List columns={restaurantColumns} />} />
              <Route path="new" element={<NewRestaurant />} />
              <Route path="update/:restaurantId" element={<UpdateRestaurant />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
