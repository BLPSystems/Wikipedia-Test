import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteHeader } from './components/layout/SiteHeader';
import { UploadModal } from './components/upload/UploadModal';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ArticlePage } from './pages/ArticlePage';

export default function App() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <BrowserRouter>
      <SiteHeader onUploadClick={() => setUploadOpen(true)} />
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      <Routes>
        <Route path="/" element={<HomePage onUploadClick={() => setUploadOpen(true)} />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
      </Routes>
    </BrowserRouter>
  );
}
