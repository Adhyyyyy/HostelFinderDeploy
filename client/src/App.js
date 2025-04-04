import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/home/Home";
import List from "./pages/list/List";
import AdminLogin from "./pages/adminLogin/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/hostel" element={<List/>}/>
          <Route path="/admin" element={<AdminLogin/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
