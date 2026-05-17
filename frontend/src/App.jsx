import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Footer from './components/Footer';
import Booking from './pages/Booking';
import Support from './pages/Support';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Models from './pages/Models';
import UsageGuide from './pages/UsageGuide';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
        <AnimatedBackground />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/models" element={<Models />} />
            <Route path="/guide" element={<UsageGuide />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
