// App.js
import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Login from './Login';
import SettingsPage from './components/Settings/settingsPage';
import AssistantsPage from './components/Assistants/assistantsPage';
import TranscriptionsPage from './components/Transcriptions/transcriptionsPage';
import Chat from './components/Chat/Chat';
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { StrictMode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import useAuth from './hooks/useAuth';
import { CircularProgress } from '@material-ui/core';
import Navigation from './components/Navigation';
import Notices from './components/Notices';
import './css/app.css';
import { HeaderProvider } from './components/HeaderContext';
import ImportTranscriptionsPage from './components/Transcriptions/importTranscriptionsPage';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { token: authToken, loading, error, needsLogin, baseUrl } = useAuth();
  if(loading || !baseUrl ) {
    return <CircularProgress size="5rem" color="inherit"/>;
  } 
  
  if (!authToken && needsLogin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const AuthApp = () => {
 return (
    <Routes>
        <Route index element={<ProtectedRoute>
                                <SettingsPage />
                              </ProtectedRoute>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/chatbot-settings" 
                element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>} />
        <Route path="/transcriptions-settings" 
                element={
                <ProtectedRoute>
                  <TranscriptionsPage/>
                </ProtectedRoute>} />
        <Route path="/transcriptions-settings/import" 
                element={
                <ProtectedRoute>
                  <ImportTranscriptionsPage/>
                </ProtectedRoute>} />
        <Route path="/assistants-settings" 
                element={
                <ProtectedRoute>
                  <AssistantsPage/>
                </ProtectedRoute>} />
        <Route path="/chat" 
                element={
                <ProtectedRoute>
                  <Chat/>
                </ProtectedRoute>} />
        {/* <Redirect from="/" to="/transcriber" /> */}
    </Routes>
)};

const App = () => {
  return (
    <StrictMode>
      <Provider store={store}>
        <Router>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
              {/* <!-- ===== Sidebar Start ===== --> */}
              <Navigation />
              {/* <!-- ===== Sidebar End ===== --> */}

              {/* <!-- ===== Content Area Start ===== --> */}
              <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* <!-- ===== Header Start ===== --> */}
                <HeaderProvider>
                  <Header/>
                  {/* <!-- ===== Header End ===== --> */}

                  {/* <!-- ===== Main Content Start ===== --> */}
                  <main className="flex-1 ml-0 mt-2 min-w-max h-screen">
                    <AuthApp />
                  </main>
                </HeaderProvider>
                {/* <!-- ===== Main Content End ===== --> */}
              </div>
              {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
          </div>
          <Notices />
          {/* <Footer /> */}
        </Router>
      </Provider>
    </StrictMode>
  );
};

domReady( () => {
    const element = document.getElementById('react-app');
    if(!element) return;
    const root = createRoot(element)
    root.render(<App />);
} );