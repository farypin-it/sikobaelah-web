(function () {
    'use strict';

    const meta = document.querySelector('meta[name="app-version"]');
    const currentVersion = meta && meta.content;
    const versionUrl = new URL('../../version.json', document.currentScript.src);
    let checking = false;
    let lastFailureLogged = false;

    if (!currentVersion) {
        console.error('[SiKoBaELah] Versi halaman tidak ditemukan.');
        return;
    }

    const redirectedUrl = new URL(window.location.href);
    if (redirectedUrl.searchParams.has('_app_version')) {
        redirectedUrl.searchParams.delete('_app_version');
        history.replaceState(history.state, '', redirectedUrl.pathname + redirectedUrl.search + redirectedUrl.hash);
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
                const freshUrl = new URL(window.location.href);
                freshUrl.searchParams.set('_app_version', latest.version);
                window.location.replace(freshUrl.href);
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
