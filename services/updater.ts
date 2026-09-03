import { useState, useEffect } from 'react';
import { APP_VERSION } from '../types';

interface UpdateInfo {
  available: boolean;
  latestVersion: string;
  downloadUrl: string;
  body: string;
}

export const useUpdateChecker = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);

  const checkForUpdate = async () => {
    setChecking(true);
    try {
      const res = await fetch(
        'https://api.github.com/repos/davide-dari/sintesi/releases/latest',
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const release = await res.json();
      const latestTag = (release.tag_name || '').replace(/^v/, '');
      if (!latestTag) return;

      const isNewer = compareVersions(latestTag, APP_VERSION) > 0;
      if (isNewer) {
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
        }
      }
    } catch (e) {
      console.warn('Update check failed:', e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkForUpdate();
    const interval = setInterval(checkForUpdate, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const dismissUpdate = () => setUpdateInfo(null);

  return { updateInfo, checking, dismissUpdate, checkForUpdate };
};

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
