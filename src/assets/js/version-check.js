(function () {
    'use strict';

    const meta = document.querySelector('meta[name="app-version"]');
    const currentVersion = meta && meta.content;
    const versionUrl = new URL('../../version.json', document.currentScript.src);
    const appCacheVersionKey = 'sikobaelah_school_apps_cache_version';
    const reloadAttemptKey = 'sikobaelah_version_reload_attempt';
    let checking = false;
    let lastFailureLogged = false;

    if (!currentVersion) {
        console.error('[SiKoBaELah] Versi halaman tidak ditemukan.');
        return;
    }

    const redirectedUrl = new URL(window.location.href);
    if (redirectedUrl.searchParams.get('_app_version') === currentVersion) {
        redirectedUrl.searchParams.delete('_app_version');
        redirectedUrl.searchParams.delete('_app_refresh');
        history.replaceState(history.state, '', redirectedUrl.pathname + redirectedUrl.search + redirectedUrl.hash);
    }

    try {
        if (localStorage.getItem(appCacheVersionKey) !== currentVersion) {
            const staleAppKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sikobaelah_school_apps_')) staleAppKeys.push(key);
            }
            staleAppKeys.forEach(key => localStorage.removeItem(key));
            localStorage.setItem(appCacheVersionKey, currentVersion);
        }
    } catch (error) {
        console.error('[SiKoBaELah] Cache aplikasi sekolah lama gagal dibersihkan:', error);
    }

    async function checkForUpdate() {
        if (checking || document.visibilityState === 'hidden') return;
        checking = true;

        try {
            const checkUrl = new URL(versionUrl);
            checkUrl.searchParams.set('_', String(Date.now()));
            const response = await fetch(checkUrl, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Pemeriksaan versi gagal (' + response.status + ').');
            }

            const latest = await response.json();
            if (!latest || typeof latest.version !== 'string' || !latest.version.trim()) {
                throw new Error('Format versi terbaru tidak valid.');
            }

            lastFailureLogged = false;
            if (latest.version !== currentVersion) {
                const pendingVersion = new URL(window.location.href).searchParams.get('_app_version');
                const lastAttempt = JSON.parse(sessionStorage.getItem(reloadAttemptKey) || 'null');
                if (pendingVersion === latest.version &&
                    lastAttempt &&
                    lastAttempt.version === latest.version &&
                    Date.now() - lastAttempt.timestamp < 60000) {
                    return;
                }

                const freshUrl = new URL(window.location.href);
                freshUrl.searchParams.set('_app_version', latest.version);
                freshUrl.searchParams.set('_app_refresh', String(Date.now()));
                sessionStorage.setItem(reloadAttemptKey, JSON.stringify({
                    version: latest.version,
                    timestamp: Date.now()
                }));
                window.location.replace(freshUrl.href);
            } else {
                sessionStorage.removeItem(reloadAttemptKey);
            }
        } catch (error) {
            if (!lastFailureLogged) {
                console.warn('[SiKoBaELah] Pemeriksaan pembaruan gagal:', error);
                lastFailureLogged = true;
            }
        } finally {
            checking = false;
        }
    }

    window.setInterval(checkForUpdate, 30000);
    window.addEventListener('pageshow', checkForUpdate);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
    });
})();
