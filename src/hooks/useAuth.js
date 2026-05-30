import { useState, useEffect, useCallback } from 'react';
import {
  onAuthChange, signOut, getMyProfile,
  getTeacherGroups, isConfigured,
} from '../lib/firebase';

export function useAuth() {
  const [user, setUser]                   = useState(null);
  const [profile, setProfile]             = useState(null);
  const [allowedGroups, setAllowedGroups] = useState(null);
  const [loading, setLoading]             = useState(true);

  const configured = isConfigured();

  const loadProfile = useCallback(async (u) => {
    if (!u) return;
    const p = await getMyProfile(u.uid);
    setProfile(p);
    if (p?.role === 'admin') {
      setAllowedGroups(null); // admin hamma guruhni ko'radi
    } else {
      const groups = await getTeacherGroups(u.uid);
      setAllowedGroups(groups);
    }
  }, []);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) await loadProfile(u);
      else { setProfile(null); setAllowedGroups(null); }
      setLoading(false);
    });
    return () => unsub();
  }, [configured, loadProfile]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    setAllowedGroups(null);
  }, []);

  const refreshProfile = useCallback(() => loadProfile(user), [user, loadProfile]);

  const isAdmin  = profile?.role === 'admin';
  const isViewer = profile?.role === 'viewer';
  const canEdit  = profile?.role === 'admin' || profile?.role === 'teacher';

  const canSeeGroup = useCallback((groupId) => {
    if (!profile) return true;
    if (profile.role === 'admin') return true;
    if (allowedGroups === null) return true;
    return allowedGroups.includes(groupId);
  }, [profile, allowedGroups]);

  return {
    user, profile, allowedGroups, loading, configured,
    logout, refreshProfile,
    isAdmin, isViewer, canEdit, canSeeGroup,
  };
}
