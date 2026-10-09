import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'cybersentry_local_user';
const BOOKMARKS_KEY = 'cybersentry_bookmarks';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'Cyber Agent',
            role: (session.user.user_metadata?.role as any) || 'user'
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'Cyber Agent',
            role: (session.user.user_metadata?.role as any) || 'user'
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local demo persistence
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {}
      } else {
        // Default guest user
        const demoUser: UserProfile = {
          id: 'demo-user-101',
          email: 'analyst@cybersentry.ai',
          full_name: 'Lead Security Analyst',
          role: 'admin'
        };
        setUser(demoUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Cyber Analyst',
          role: 'user'
        });
      }
      return {};
    }

    // Local mode demo login
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user'
    };
    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    return {};
  };

  const signup = async (email: string, pass: string, name: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name, role: 'user' } }
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          full_name: name,
          role: 'user'
        });
      }
      return {};
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      full_name: name || email.split('@')[0],
      role: 'user'
    };
    setUser(newUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      login,
      signup,
      logout,
      bookmarks,
      toggleBookmark,
      isBookmarked
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
