import React, { useState } from 'react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import LiveConversation from './components/LiveConversation';
import { ViewState, User } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('onboarding');
  };

  const handleOnboardingComplete = () => {
    setView('dashboard');
  };

  return (
    <div className="w-full h-full relative">
      {view === 'auth' && (
        <Auth 
            onLogin={handleLogin} 
            onNavigate={setView} 
        />
      )}
      
      {view === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {view === 'dashboard' && (
        <Dashboard 
            user={user} 
            onStartLive={() => setView('live-chat')} 
        />
      )}

      {view === 'live-chat' && (
          <LiveConversation onClose={() => setView('dashboard')} />
      )}
    </div>
  );
};

export default App;