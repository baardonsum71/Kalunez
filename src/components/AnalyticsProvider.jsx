import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { identifyUser, resetAnalytics } from '@/lib/analytics';
import { setSentryUser } from '@/lib/sentry';

export default function AnalyticsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      identifyUser(user);
      setSentryUser(user);
    } else {
      resetAnalytics();
      setSentryUser(null);
    }
  }, [isAuthenticated, user]);

  return children;
}
