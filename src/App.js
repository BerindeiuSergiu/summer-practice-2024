import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Auth } from './Pages/Auth/index';
import { MainPage } from './Pages/MainPage/index';
import { SignUp } from './Pages/SignUp/index';
import './App.css';

function App() {
  return (
      <div className="App">
        <Router>
          <div classname = "content">
            <Routes>
              <Route path = "/" element = {<Auth/>} />
              <Route path = "/main-page" element = {<MainPage />} />
              <Route path = "/sign-up" element = {<SignUp />} />
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
