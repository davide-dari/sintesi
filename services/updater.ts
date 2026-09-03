import { useState, useEffect, useCallback } from 'react';
import { APP_VERSION } from '../types';

const SKIP_KEY = 'sintesi_update_skip';
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

interface SkipInfo {
  version: string;
  skippedAt: number;
}

interface UpdateInfo {
  available: boolean;
  latestVersion: string;
  downloadUrl: string;
  body: string;
}

function getSkipInfo(): SkipInfo | null {
  try {
    const raw = localStorage.getItem(SKIP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setSkipInfo(version: string) {
  localStorage.setItem(SKIP_KEY, JSON.stringify({ version, skippedAt: Date.now() }));
}

function shouldShowPopup(latestVersion: string): boolean {
  if (compareVersions(latestVersion, APP_VERSION) <= 0) return false;

  const skip = getSkipInfo();
  if (!skip) return true;

  if (skip.version !== latestVersion) return true;

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - skip.skippedAt >= oneDayMs) return true;

  return false;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export const useUpdateChecker = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.github.com/repos/davide-dari/sintesi/releases/latest',
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const release = await res.json();
      const latestTag = (release.tag_name || '').replace(/^v/, '');
      if (!latestTag) return;

      if (shouldShowPopup(latestTag)) {
        const apkAsset = (release.assets || []).find(
          (a: any) => a.name.endsWith('.apk')
        );
        if (apkAsset) {
          setUpdateInfo({
            available: true,
            latestVersion: latestTag,
            downloadUrl: apkAsset.browser_download_url,
            body: release.body || '',
          });
          setDismissed(false);
        }
      }
    } catch (e) {
      console.warn('Update check failed:', e);
    }
  }, []);

  useEffect(() => {
    checkForUpdate();
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkForUpdate]);

  const dismissUpdate = (version: string) => {
    setSkipInfo(version);
    setUpdateInfo(null);
    setDismissed(true);
  };

  return { updateInfo, dismissUpdate };
};
