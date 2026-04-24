import { Route, Routes } from 'react-router-dom'
import Header from './components/header/Header.tsx'
import Contact from './pages/contact.tsx'
// import Service from './pages/service.tsx'
import Portfolio from './pages/portfolio.tsx'
import Project from './pages/project.tsx'
import Main from './pages/main.tsx'
import NotFoundPage from './pages/not-found.tsx'
import Footer from './components/footer/Footer.tsx'
import ScrollTop from './components/utils/scrolltop.tsx'
import SeoHead from './components/utils/seohead.tsx'
import QuickContactWidget from './components/quickcontact/QuickContactWidget.tsx'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <SeoHead />
      <ScrollTop/>
      <main>
        <Routes>
          <Route path="/" element={<Main />} />
          {/* <Route path="/service" element={<Service />} /> */}
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<Project />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <QuickContactWidget />
      <Footer />
    </div>
  )
}

export default App
