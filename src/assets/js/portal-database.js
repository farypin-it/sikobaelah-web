/**
 * ====================================================================
 * 🔗 URL WEB APP GOOGLE APPS SCRIPT (MASTER PORTAL SIKOBAELAH)
 * ====================================================================
 * TEMPELKAN LINK URL EXEC DEPLOYMENT APPS SCRIPT ANDA DI BAWAH INI:
 * Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
 *
 * Catatan: Jika URL ini diisi, versi web online (GitHub Pages) dan offline
 * akan otomatis menggunakan link ini sebagai backend database spreadsheet.
 * ====================================================================
 */
const SIKOBAELAH_GAS_EXEC_URL = "https://script.google.com/macros/s/AKfycbz3CWXhDxgPEo__kugpF7q7NHHyTg9SgINsFDvKHvXcD8KBcrWs-p8fj5YtI_jrNgI/exec";

(function (window) {
    'use strict';

    const SIKOBAELAH_DB = {
        STORAGE_KEY_CONFIG: 'sikobaelah_db_config',
        STORAGE_KEY_APPS: 'sikobaelah_db_apps',
        STORAGE_KEY_LAWS: 'sikobaelah_db_laws',
        STORAGE_KEY_LAST_SYNC: 'sikobaelah_db_last_sync',
        activeSchoolId: '',

        clearActiveSchoolId: function () {
            this.activeSchoolId = '';
        },

        getSchoolIdFromUrl: function () {
            const params = new URLSearchParams(window.location.search);
            const queryId = params.get('id') || params.get('school') || params.get('tenant');
            if (queryId) return String(queryId).trim().toLowerCase();

            const pathParts = window.location.pathname.split('/').filter(Boolean);
            if (!pathParts.length) return '';

            // Abaikan repo root di GitHub Pages (misal: /ok-web-sikobaelah-2026/ atau /sikobaelah/)
            if (window.location.hostname && window.location.hostname.endsWith('github.io') && pathParts.length === 1) {
                return '';
            }

            const lastPart = pathParts[pathParts.length - 1] || '';
            const ignoredSegments = ['src', 'index.html', 'login.html', 'dasar-hukum.html', '404.html', 'ok-web-sikobaelah-2026', 'sikobaelah'];
            if (lastPart && !/\.(html?)$/i.test(lastPart) && !ignoredSegments.includes(lastPart.toLowerCase())) {
                try {
                    return decodeURIComponent(lastPart).trim().toLowerCase();
                } catch (e) {
                    return '';
                }
            }
            return '';
        },

        getSchoolConfigStorageKey: function (schoolId) {
            return 'sikobaelah_school_config_' + String(schoolId || '').toLowerCase();
        },

        getSchoolAppsStorageKey: function (schoolId) {
            return 'sikobaelah_school_apps_' + String(schoolId || '').toLowerCase();
        },

        // Konfigurasi Default Bawaan (Offline Fallback)
        defaultConfig: {
            "nama_portal": "SiKoBaELah Hybrid",
            "sub_judul": "Sistem Kolaboratif berBasis Elektronik Sekolah",
            "pemprov": "",
            "nama_sekolah": "",
            "alamat_sekolah": "",
            "url_web": "",
            "email_sekolah": "",
            "email_resmi": "farypintech2026@gmail.com",
            "logo_aplikasi": "sikobaelah.png",
            "logo_instansi": "",
            "logo_sekolah": "",
            "theme_color_1": "#ff007a",
            "theme_color_2": "#7000ff",
            "theme_color_3": "#00d2ff",
            "dev_nama": "Pariyanto",
            "dev_jabatan": "Pengembang Sistem Tenaga Adminsitrasi Sekolah",
            "dev_foto": "sikobaelah.png",
            "dev_wa": "6285219901909",
            "dev_telp": "+6285219901909",
            "dev_email": "farypintech2026@gmail.com",
            "dev_alamat": "Jl. Padang Lama, Desa Punti Kalo, Kecamatan Sumay, Kab. Tebo, Jambi",
            "dev_koordinat": "-1.411395, 102.410539",
            "version": "1.26.10",
            "gas_url": SIKOBAELAH_GAS_EXEC_URL || ""
        },

        // Daftar File Logo Sekolah & Instansi yang Tersedia di img-sekolah (GitHub CDN / Lokal)
        availableSchoolLogos: [
            { file: "logo sman15tebo.png", label: "SMA Negeri 15 Tebo" },
            { file: "logo sman 15 tebo.png", label: "SMA Negeri 15 Tebo" },
            { file: "logo sman 1 tebo.png", label: "SMA Negeri 1 Tebo" },
            { file: "logo sman 2 tebo.png", label: "SMA Negeri 2 Tebo" },
            { file: "logo sman 5 tebo.png", label: "SMA Negeri 5 Tebo" },
            { file: "logo sman 17 tebo.png", label: "SMA Negeri 17 Tebo" },
            { file: "logo sman 19 tebo.png", label: "SMA Negeri 19 Tebo" },
            { file: "logo sman 20 tebo.png", label: "SMA Negeri 20 Tebo" },
            { file: "logo smkn 1 tebo.png", label: "SMK Negeri 1 Tebo" },
            { file: "logo smkn 2 tebo.png", label: "SMK Negeri 2 Tebo" },
            { file: "logo slbn tebo.png", label: "SLB Negeri Tebo" },
            { file: "logo sman 9 kota jambi.png", label: "SMA Negeri 9 Kota Jambi" },
            { file: "logo sman 6 tanjabbarat.png", label: "SMA Negeri 6 Tanjung Jabung Barat" },

            { file: "logo smkn 1 kota ternate.png", label: "SMK Negeri 1 Kota Ternate" },
            { file: "logo prov jambi.png", label: "Pemerintah Provinsi Jambi (Perisai)" },
            { file: "logo prov maluku utara.png", label: "Pemerintah Provinsi Maluku Utara" },
            { file: "logo jambi 512.png", label: "Pemerintah Provinsi Jambi (512px)" }
        ],

        // Data 7 Aplikasi Bawaan
        defaultApps: [
            {
                "id": "sidimas",
                "nama": "SiDiMAS",
                "deskripsi": "Sistem Digital Manajemen Arsip Surat",
                "kategori": "Persuratan",
                "card_class": "card-arsip",
                "url_online": "https://sidimas.sman15tebo.sch.id/?id=sman15tebo",
                "logo": "./assets/img/logo-sidimas.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "sidimas sistem digital manajemen arsip surat dinas persuratan agenda disposisi arsip digital",
                "status": "aktif",
                "urutan": 1
            },
            {
                "id": "sipresdir",
                "nama": "SiPreSDiR Plus",
                "deskripsi": "Sistem Presensi Siswa Digital Realtime",
                "kategori": "Presensi & Disiplin",
                "card_class": "card-presensi",
                "url_online": "https://sipresdir.sman15tebo.sch.id/?id=sman15tebo",
                "logo": "./assets/img/logo-sipresdir.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "sipresdir plus sistem presensi siswa digital realtime absensi kehadiran disiplin bk siswa konseling tata tertib",
                "status": "aktif",
                "urutan": 2
            },
            {
                "id": "sibukinstal",
                "nama": "SiBukInSTal",
                "deskripsi": "Sistem Buku Induk Siswa Digital Lengkap",
                "kategori": "Kesiswaan",
                "card_class": "card-buku-induk",
                "url_online": "https://sibukinstal.sman15tebo.sch.id/?id=sman15tebo",
                "logo": "./assets/img/logo-sibukinstal.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "sibukinstal sistem buku induk siswa digital lengkap kesiswaan nisn biodata siswa mutasi alumni dapodik",
                "status": "aktif",
                "urutan": 3
            },
            {
                "id": "siempus",
                "nama": "SiE-MPuS",
                "deskripsi": "Sistem E-Manajemen Perpustakaan Sekolah",
                "kategori": "Perpustakaan",
                "card_class": "card-perpus",
                "url_online": "https://sie-mpus.sman15tebo.sch.id/?id=sman15tebo",
                "logo": "./assets/img/logo-siempus.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "siempus sie-mpus si-empus sistem e-manajemen perpustakaan sekolah literasi katalog buku peminjaman sirkulasi perpus",
                "status": "aktif",
                "urutan": 4
            },
            {
                "id": "simpeel",
                "nama": "SiMPeEL",
                "deskripsi": "Sistem Informasi Manajemen Kepegawaian Elektronik",
                "kategori": "Kepegawaian",
                "card_class": "card-pegawai",
                "url_online": "https://simpeel.sman15tebo.sch.id/?id=sman15tebo",
                "logo": "./assets/img/logo-simpeel.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "simpeel sistem informasi manajemen kepegawaian elektronik guru tenaga kependidikan ptk pns pppk asn simpeg bkn",
                "status": "aktif",
                "urutan": 5
            },
            {
                "id": "siladumas",
                "nama": "SiLaDuMas",
                "deskripsi": "Sistem Layanan Pengaduan Masyarakat",
                "kategori": "Dalam Pengembangan",
                "card_class": "card-dev-gray",
                "ribbon": "Rilis Berikutnya",
                "url_online": "https://siladumas.sman15tebo.sch.id",
                "logo": "./assets/img/logo-siladumas.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "siladumas siladuman sistem layanan pengaduan masyarakat aspirasi publik saran aduan sekolah lapor wbs",
                "status": "dev",
                "urutan": 6
            },
            {
                "id": "sinbas",
                "nama": "SINBAS",
                "deskripsi": "Sistem Inventarisasi Barang & Aset Sekolah",
                "kategori": "Dalam Pengembangan",
                "card_class": "card-dev-gray",
                "ribbon": "Rilis Berikutnya",
                "url_online": "https://sinbas.sman15tebo.sch.id",
                "logo": "./assets/img/logo-sinbas.png",
                "logo_fallback": "./assets/img/sikobaelah.png",
                "kata_kunci": "sinbas sistem inventarisasi barang dan aset sekolah sarana prasarana sarpras kib bmd permendagri aset inventaris",
                "status": "dev",
                "urutan": 7
            }
        ],

        // Data 33 Regulasi Dasar Hukum Bawaan
        defaultLaws: [
            {
                "id": 1,
                "kategori_app": "spbe",
                "hierarki": "Konstitusi RI",
                "nomor_regulasi": "UUD Negara Republik Indonesia 1945",
                "judul_regulasi": "Pasal 31 ayat (1) dan ayat (3) tentang Hak Pendidikan dan Sistem Pendidikan Nasional",
                "keterkaitan": "Keterkaitan dengan SiKoBaELah: Menjadi landasan tertinggi bahwa setiap warga negara berhak mendapatkan pendidikan bermutu, dan pemerintah menyelenggarakan satu sistem pendidikan nasional yang mencerdaskan kehidupan bangsa melalui pemanfaatan kemajuan teknologi.",
                "lembaran_negara": "Pemerintah RI",
                "link_jdih": "https://jdih.bp2mi.go.id/uploads/20191011/20191011093525_6_UUD45_Tahun_1945_Tentang_Perubahan_Keempat_UUD45.pdf",
                "label_jdih": "JDIH RI",
                "status": "Berlaku",
                "kata_kunci": "uud 1945 pasal 31 konstitusi pendidikan nasional hak warga negara"
            },
            {
                "id": 2,
                "kategori_app": "spbe",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 20 Tahun 2003",
                "judul_regulasi": "Tentang Sistem Pendidikan Nasional (Sisdiknas)",
                "keterkaitan": "Keterkaitan dengan SiKoBaELah: Pasal 48 dan Pasal 51 mengamanatkan pengelolaan dana dan sistem pendidikan yang berprinsip pada keadilan, efisiensi, transparansi, dan akuntabilitas publik. SiKoBaELah mengotomasi tata kelola sekolah secara akuntabel.",
                "lembaran_negara": "Lembaran Negara 2003 No. 78",
                "link_jdih": "https://peraturan.bpk.go.id/Details/43920/uu-no-20-tahun-2003",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 20 tahun 2003 undang-undang sisdiknas sistem pendidikan nasional standar kurikulum"
            },
            {
                "id": 3,
                "kategori_app": "spbe",
                "hierarki": "Perpres",
                "nomor_regulasi": "Perpres No. 95 Tahun 2018",
                "judul_regulasi": "Tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)",
                "keterkaitan": "Keterkaitan dengan SiKoBaELah: Payung hukum utama kewajiban integrasi layanan instansi pemerintah dan satuan pendidikan berbasis TIK terpadu demi mewujudkan tata kelola birokrasi yang bersih, terpadu, dan berkinerja tinggi.",
                "lembaran_negara": "Lembaran Negara 2018 No. 182",
                "link_jdih": "https://peraturan.bpk.go.id/Details/95328/perpres-no-95-tahun-2018",
                "label_jdih": "JDIH BPK",
                "status": "Berlaku",
                "kata_kunci": "perpres nomor 95 tahun 2018 peraturan presiden sistem pemerintahan berbasis elektronik spbe digitalisasi"
            },
            {
                "id": 4,
                "kategori_app": "spbe",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 27 Tahun 2022",
                "judul_regulasi": "Tentang Pelindungan Data Pribadi (UU PDP)",
                "keterkaitan": "Keterkaitan dengan SiKoBaELah: Memberikan standar kepatuhan hukum bagi sekolah sebagai Pengendali Data Pribadi untuk menjamin privasi NIK, NISN, riwayat keluarga, dan data pegawai guru tidak disalahgunakan atau bocor ke pihak luar.",
                "lembaran_negara": "Lembaran Negara 2022 No. 196",
                "link_jdih": "https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022",
                "label_jdih": "JDIH BPK",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 27 tahun 2022 pelindungan data pribadi pdp enkripsi privasi kerahasiaan siswa guru"
            },
            {
                "id": 5,
                "kategori_app": "spbe",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "UU No. 1 Tahun 2024 jo. UU No. 11/2008",
                "judul_regulasi": "Tentang Informasi dan Transaksi Elektronik (UU ITE)",
                "keterkaitan": "Keterkaitan dengan SiKoBaELah: Pasal 5 menyatakan bahwa Informasi Elektronik dan/atau Dokumen Elektronik merupakan alat bukti hukum yang sah. Seluruh catatan digital, presensi, surat dinas, dan nomor inventaris SiKoBaELah memiliki kekuatan hukum.",
                "lembaran_negara": "Lembaran Negara 2024 No. 1",
                "link_jdih": "https://peraturan.bpk.go.id/Details/274494/uu-no-1-tahun-2024",
                "label_jdih": "JDIH Kominfo",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 1 tahun 2024 ite informasi transaksi elektronik tanda tangan digital surat elektronik"
            },
            {
                "id": 6,
                "kategori_app": "sidimas",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 43 Tahun 2009",
                "judul_regulasi": "Tentang Kearsipan",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Pasal 3 mewajibkan penyelenggara negara dan lembaga pendidikan untuk menjamin ketersediaan arsip yang autentik dan tepercaya, mengelola arsip dinamis secara tertib, dan memanfaatkan kemajuan TIK dalam penyelenggaraan kearsipan.",
                "lembaran_negara": "Lembaran Negara 2009 No. 152",
                "link_jdih": "https://peraturan.bpk.go.id/Details/38788/uu-no-43-tahun-2009",
                "label_jdih": "JDIH ANRI",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 43 tahun 2009 kearsipan arsip dinamis autentik terpercaya sidimas"
            },
            {
                "id": 7,
                "kategori_app": "sidimas",
                "hierarki": "PP RI",
                "nomor_regulasi": "Peraturan Pemerintah No. 28 Tahun 2012",
                "judul_regulasi": "Tentang Pelaksanaan Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Mengatur tata cara penciptaan, penerimaan, pendistribusian surat, penggunaan lembar disposisi, serta legalitas alih media arsip kertas ke bentuk digital/PDF pada tata usaha sekolah.",
                "lembaran_negara": "Lembaran Negara 2012 No. 53",
                "link_jdih": "https://peraturan.bpk.go.id/Details/5253/pp-no-28-tahun-2012",
                "label_jdih": "JDIH BPK",
                "status": "Berlaku",
                "kata_kunci": "pp nomor 28 tahun 2012 kearsipan pelaksanaan alih media arsip digital disposisi"
            },
            {
                "id": 8,
                "kategori_app": "sidimas",
                "hierarki": "Permendikdasmen",
                "nomor_regulasi": "Permendikdasmen No. 60 Tahun 2026",
                "judul_regulasi": "Tentang Tata Naskah Dinas di Lingkungan Kemendikbud",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Standar kode klasifikasi surat, penulisan nomor agenda surat keluar/masuk, format kepala surat resmi, cap kedinasan, dan formulir disposisi kepala sekolah yang diadopsi pada fitur SiDiMAS.",
                "lembaran_negara": "Kemendikdasmen RI 2026",
                "link_jdih": "https://peraturan.go.id/id/permendikdasmen-no-2-tahun-2026",
                "label_jdih": "JDIH Kemendikdasmen",
                "status": "Berlaku",
                "kata_kunci": "permendikdasmen nomor 60 tahun 2026 Tata Naskah Dinas Kementerian Pendidikan Dasar dan Menengah"
            },
            {
                "id": 9,
                "kategori_app": "sidimas",
                "hierarki": "Peraturan ANRI",
                "nomor_regulasi": "Peraturan ANRI No. 6 Tahun 2021",
                "judul_regulasi": "Tentang Pengelolaan Arsip Elektronik di Instansi Pemerintah",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Panduan standar metadata arsip digital, integritas audit trail riwayat naskah, pencarian berbasis keyword, dan retensi penyimpanan arsip surat elektronik di sekolah.",
                "lembaran_negara": "Berita Negara 2021 No. 1381",
                "link_jdih": "https://peraturan.bpk.go.id/Details/192784/peraturan-anri-no-6-tahun-2021",
                "label_jdih": "JDIH ANRI",
                "status": "Berlaku",
                "kata_kunci": "peraturan anri nomor 6 tahun 2021 arsip dinamis terintegrasi srikandi elektronik metadata"
            },
            {
                "id": 10,
                "kategori_app": "sidimas",
                "hierarki": "Permendagri",
                "nomor_regulasi": "Permendagri No. 83 Tahun 2022",
                "judul_regulasi": "Tentang Kode Klasifikasi Arsip di Lingkungan Kementerian Dalam Negeri dan Pemerintah Daerah",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Pedoman baku pengkodean klasifikasi arsip fasilitatif dan substantif untuk seluruh satuan pendidikan/sekolah (misal kode urusan 421 Pendidikan, 421.3 SMA, 800 Kepegawaian, 005 Undangan) yang diotomasi secara terintegrasi pada penomoran surat masuk dan keluar di SiDiMAS.",
                "lembaran_negara": "Berita Negara 2022 No. 1195",
                "link_jdih": "https://peraturan.bpk.go.id/Details/247841/permendagri-no-83-tahun-2022",
                "label_jdih": "JDIH Kemendagri",
                "status": "Berlaku",
                "kata_kunci": "permendagri nomor 83 tahun 2022 kode klasifikasi arsip fasilitatif substantif pemda penomoran agenda surat dinas"
            },
            {
                "id": 11,
                "kategori_app": "sidimas",
                "hierarki": "Permendagri",
                "nomor_regulasi": "Permendagri No. 1 Tahun 2023",
                "judul_regulasi": "Tentang Tata Naskah Dinas di Lingkungan Pemerintah Daerah",
                "keterkaitan": "Keterkaitan dengan SiDiMAS: Regulasi induk tata naskah dinas pemda yang wajib dipedomani sekolah negeri di bawah naungan pemerintah provinsi. Mengatur format baku surat dinas, nota dinas, surat tugas, SK, lembar disposisi elektronik, serta standarisasi lambang daerah dan stempel resmi pada SiDiMAS.",
                "lembaran_negara": "Berita Negara 2023 No. 78",
                "link_jdih": "https://peraturan.bpk.go.id/Details/245536/permendagri-no-1-tahun-2023",
                "label_jdih": "JDIH Kemendagri",
                "status": "Berlaku",
                "kata_kunci": "permendagri nomor 1 tahun 2023 tata naskah dinas pemerintah daerah pemda nota dinas surat tugas sk disposisi cap stempel"
            },
            {
                "id": 12,
                "kategori_app": "sipresdir",
                "hierarki": "Permendikbudristek",
                "nomor_regulasi": "Permendikbudristek No. 46 Tahun 2023",
                "judul_regulasi": "Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP)",
                "keterkaitan": "Keterkaitan dengan SiPreSDiR Plus: Mendasari modul penanganan kasus ketertiban siswa dengan paradigma disiplin positif edukatif (bukan hukuman fisik), serta pencatatan kasus konseling terpadu bersama Guru BK dan wali kelas.",
                "lembaran_negara": "Berita Negara 2023 No. 621",
                "link_jdih": "https://peraturan.bpk.go.id/Details/285721/permendikbudriset-no-46-tahun-2023",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "permendikbudristek nomor 46 tahun 2023 ppksp pencegahan penanganan kekerasan disiplin positif pembinaan"
            },
            {
                "id": 13,
                "kategori_app": "sipresdir",
                "hierarki": "Permendikbud",
                "nomor_regulasi": "Permendikbud No. 23 Tahun 2015",
                "judul_regulasi": "Tentang Penumbuhan Budi Pekerti",
                "keterkaitan": "Keterkaitan dengan SiPreSDiR Plus: Landasan pembiasaan apel pagi, ketepatan waktu hadir, tanggung jawab kehadiran siswa di ruang kelas, dan transparansi laporan presensi harian kepada orang tua siswa.",
                "lembaran_negara": "Berita Negara 2015 No. 1083",
                "link_jdih": "https://peraturan.go.id/id/permendikbud-no-23-tahun-2015",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "permendikbud nomor 23 tahun 2015 budi pekerti pembiasaan kehadiran tepat waktu apel"
            },
            {
                "id": 14,
                "kategori_app": "sipresdir",
                "hierarki": "Permendikbud",
                "nomor_regulasi": "Permendikbud No. 111 Tahun 2014",
                "judul_regulasi": "Tentang Bimbingan dan Konseling pada Pendidikan Dasar dan Pendidikan Menengah",
                "keterkaitan": "Keterkaitan dengan SiPreSDiR Plus: Memberikan legitimasi bagi Guru BK untuk mendokumentasikan asesmen perilaku, frekuensi ketidakhadiran, konseling individual, dan tindak lanjut panggilan wali murid secara terstruktur di sistem.",
                "lembaran_negara": "Berita Negara 2014 No. 1599",
                "link_jdih": "https://peraturan.go.id/id/permendikbud-no-111-tahun-2014",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "permendikbud nomor 111 tahun 2014 bimbingan konseling bk konselor rekam catatan pembinaan"
            },
            {
                "id": 15,
                "kategori_app": "sibukinstal",
                "hierarki": "Permendikbud",
                "nomor_regulasi": "Permendikbudristek No. 31 Tahun 2022",
                "judul_regulasi": "Tentang Satu Data Pendidikan & Pengelolaan NISN",
                "keterkaitan": "Keterkaitan dengan SiBukInSTal: Kewajiban pencatatan NISN sebagai kode pengenal unik siswa yang bersifat tunggal, berlaku seumur hidup, dan terintegrasi dengan basis data kependudukan nasional (Dukcapil).",
                "lembaran_negara": "Kemendikbudristek 2022",
                "link_jdih": "https://peraturan.bpk.go.id/Details/224733/permendikbudriset-no-31-tahun-2022",
                "label_jdih": "JDIH Kemendikbudristek",
                "status": "Berlaku",
                "kata_kunci": "permendikbudristek nomor 31 tahun 2022 nisn nomor induk siswa nasional satu data pendidikan"
            },
            {
                "id": 16,
                "kategori_app": "sibukinstal",
                "hierarki": "Permendikbud",
                "nomor_regulasi": "Permendikbud No. 79 Tahun 2015",
                "judul_regulasi": "Tentang Data Pokok Pendidikan (Dapodik)",
                "keterkaitan": "Keterkaitan dengan SiBukInSTal: Standarisasi elemen data profil peserta didik (identitas, ayah, ibu, wali, riwayat mutasi masuk/keluar, nomor registrasi akta lahir) yang disinkronkan langsung pada buku induk digital sekolah.",
                "lembaran_negara": "Berita Negara 2016 No. 22",
                "link_jdih": "https://peraturan.go.id/id/permendikbud-no-79-tahun-2015",
                "label_jdih": "Portal Dapodik",
                "status": "Berlaku",
                "kata_kunci": "permendikbud nomor 79 tahun 2015 dapodik data pokok pendidikan validasi mutasi"
            },
            {
                "id": 17,
                "kategori_app": "sibukinstal",
                "hierarki": "Permendiknas",
                "nomor_regulasi": "Permendikbudristek No 47 Tahun 2023",
                "judul_regulasi": "Standar Pengelolaan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah",
                "keterkaitan": "Keterkaitan dengan SiBukInSTal: Menetapkan bahwa Buku Induk Siswa adalah dokumen negara permanen dan abadi yang wajib dimiliki serta dirawat oleh setiap sekolah untuk legalitas riwayat alumni dan administrasi ijazah.",
                "lembaran_negara": "JDIH Permendikbudristek",
                "link_jdih": "https://peraturan.bpk.go.id/Details/289462/permendikbudriset-no-47-tahun-2023",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "Standar Pengelolaan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah"
            },
            {
                "id": 18,
                "kategori_app": "siempus",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 43 Tahun 2007",
                "judul_regulasi": "Tentang Perpustakaan",
                "keterkaitan": "Keterkaitan dengan SiE-MPuS: Pasal 23 ayat (1)-(6) mewajibkan setiap sekolah menyelenggarakan perpustakaan berstandar nasional, menyediakan buku teks dan bacaan berkualitas, mengalokasikan minimal 5% dana operasional, dan mengembangkan layanan perpustakaan berbasis TIK.",
                "lembaran_negara": "Lembaran Negara 2007 No. 129",
                "link_jdih": "https://peraturan.bpk.go.id/Details/39968/uu-no-43-tahun-2007",
                "label_jdih": "JDIH Perpusnas",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 43 tahun 2007 perpustakaan pasal 23 perpustakaan sekolah bosp 5 persen"
            },
            {
                "id": 19,
                "kategori_app": "siempus",
                "hierarki": "Peraturan Perpusnas",
                "nomor_regulasi": "Peraturan Perpusnas No. 12 Tahun 2017",
                "judul_regulasi": "Standar Nasional Perpustakaan Sekolah Menengah Atas / Madrasah Aliyah (SNP SMA/MA)",
                "keterkaitan": "Keterkaitan dengan SiE-MPuS: Standar sistem klasifikasi DDC (Dewey Decimal Classification), pencetakan barcode kartu anggota, sirkulasi peminjaman buku elektronik, dan pelaporan rasio koleksi buku di sekolah.",
                "lembaran_negara": "Perpustakaan Nasional RI",
                "link_jdih": "https://peraturan.bpk.go.id/Details/297058/perka-perpusnas-no-12-tahun-2017",
                "label_jdih": "JDIH Perpusnas",
                "status": "Berlaku",
                "kata_kunci": "peraturan perpusnas nomor 12 tahun 2017 snp sma standar nasional perpustakaan ddc barcode katalog"
            },
            {
                "id": 20,
                "kategori_app": "siempus",
                "hierarki": "PP RI",
                "nomor_regulasi": "Peraturan Pemerintah No. 24 Tahun 2014",
                "judul_regulasi": "Tentang Pelaksanaan Undang-Undang Nomor 43 Tahun 2007 tentang Perpustakaan",
                "keterkaitan": "Keterkaitan dengan SiE-MPuS: Memberikan dasar regulasi pelestarian materi perpustakaan, pencatatan donasi buku, serta sistem layanan peminjaman digital bagi guru dan peserta didik.",
                "lembaran_negara": "Lembaran Negara 2014 No. 76",
                "link_jdih": "https://peraturan.bpk.go.id/Details/5461/pp-no-24-tahun-2014",
                "label_jdih": "JDIH BPK",
                "status": "Berlaku",
                "kata_kunci": "pp nomor 24 tahun 2014 perpustakaan pelaksanaan sirkulasi digital preservasi"
            },
            {
                "id": 21,
                "kategori_app": "simpeel",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 20 Tahun 2023",
                "judul_regulasi": "Tentang Aparatur Sipil Negara (UU ASN)",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Mendasari digitalisasi rekam jejak integritas ASN/PPPK di sekolah, pemutakhiran riwayat kepangkatan, pendidikan berkala, serta integrasi sistem informasi kepegawaian berbasis meritokrasi.",
                "lembaran_negara": "Lembaran Negara 2023 No. 141",
                "link_jdih": "https://peraturan.bpk.go.id/Details/269470/uu-no-20-tahun-2023",
                "label_jdih": "JDIH BKN",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 20 tahun 2023 asn aparatur sipil negara pns pppk meritokrasi simpeg bkn"
            },
            {
                "id": 22,
                "kategori_app": "simpeel",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 14 Tahun 2005",
                "judul_regulasi": "Tentang Guru dan Dosen",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Landasan kepatuhan pemenuhan kualifikasi akademik pendidik, hak tunjangan profesi guru (TPG), dan pemenuhan beban kerja tatap muka minimal 24 jam per minggu di satuan pendidikan.",
                "lembaran_negara": "Lembaran Negara 2005 No. 157",
                "link_jdih": "https://peraturan.bpk.go.id/Details/40266/uu-no-14-tahun-2005",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 14 tahun 2005 guru dan dosen beban kerja 24 jam sertifikasi tpg"
            },
            {
                "id": 23,
                "kategori_app": "simpeel",
                "hierarki": "Kepmenpan RB",
                "nomor_regulasi": "KepmenPAN-RB No. 282 Th 2025",
                "judul_regulasi": "Tentang Nomenklatur Jabatan Pelaksana ASN di Lingkungan Instansi Pemerintah",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Standarisasi nama nomenklatur dan peta formasi jabatan pelaksana tenaga kependidikan di sekolah (seperti Pengadministrasi Perkantoran, Penata Layanan Operasional, Pengelola Layanan Operasional, dan Operator Layanan Operasional) sesuai klasifikasi tugas Pemda dan BKN.",
                "lembaran_negara": "KemenPAN-RB",
                "link_jdih": "https://peraturan.bpk.go.id/Details/353243/kemen-panrb-no-282-tahun-2025",
                "label_jdih": "JDIH Kemenpan RB",
                "status": "Berlaku",
                "kata_kunci": "kepmenpan-rb 282 tahun 2025 nomenklatur jabatan pelaksana tendik tenaga kependidikan tata usaha pengadministrasi perkantoran operator penata layanan"
            },
            {
                "id": 24,
                "kategori_app": "simpeel",
                "hierarki": "Permendikdasmen",
                "nomor_regulasi": "Permendikdasmen No. 23 Tahun 2026",
                "judul_regulasi": "Standar Tenaga Kependidikan pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Regulasi induk terbaru Kementerian Pendidikan Dasar dan Menengah tahun 2025 yang memayungi Standarisasi Pendidik (kualifikasi akademik S1/D4 & 4 pilar kompetensi guru) serta Standar Tenaga Kependidikan selain pendidik (Tenaga Administrasi Sekolah/TAS, Tenaga Perpustakaan, Tenaga Laboratorium, dan Pengelola Data). Menjadi acuan pemutakhiran data kualifikasi, kompetensi, dan formasi kepegawaian di sekolah.",
                "lembaran_negara": "Kemendikdasmen RI 2026",
                "link_jdih": "https://peraturan.go.id/id/permendikdasmen-no-23-tahun-2026",
                "label_jdih": "JDIH Kemendikdasmen",
                "status": "Berlaku",
                "kata_kunci": "permendikdasmen nomor 23 tahun 2026 standar tenaga kependidikan pendidik guru tendik tas tata administrasi kualifikasi kompetensi kemendikdasmen 2025"
            },
            {
                "id": 25,
                "kategori_app": "simpeel",
                "hierarki": "Permendikbudristek",
                "nomor_regulasi": "Permendikbudristek No. 19 Tahun 2024",
                "judul_regulasi": "Tentang Pendidikan Profesi Guru (PPG) dan Sertifikasi Pendidik",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Payung hukum penyelesaian sertifikasi guru (khususnya Guru Tertentu / Dalam Jabatan) melalui mekanisme pembelajaran fleksibel, penerbitan Sertifikat Pendidik (Serdik), serta pencatatan Nomor Registrasi Guru (NRG) pada basis data kepegawaian sekolah.",
                "lembaran_negara": "Berita Negara 2024 No. 256",
                "link_jdih": "https://peraturan.bpk.go.id/Details/287342/permendikbudriset-no-19-tahun-2024",
                "label_jdih": "JDIH Kemendikdasmen",
                "status": "Berlaku",
                "kata_kunci": "permendikbudristek nomor 19 tahun 2024 pendidikan profesi guru ppg sertifikasi guru serdik pmm nrg uji kompetensi ukpppg"
            },
            {
                "id": 26,
                "kategori_app": "simpeel",
                "hierarki": "Permendikbudristek",
                "nomor_regulasi": "Permendikdasmen No 10 Tahun 2026",
                "judul_regulasi": "Tentang Petunjuk Teknis Pemberian Tunjangan Profesi Tunjangan Khusus dan Tambahan Penghasilan Guru Aparatur Sipil Negara Daerah",
                "keterkaitan": "Keterkaitan dengan SiMPeEL: Pedoman baku pencairan Tunjangan Profesi Guru (TPG) sebesar satu kali gaji pokok per bulan, validasi linieritas tugas mengajar minimal 24 jam tatap muka melalui sinkronisasi Dapodik dan Info GTK, penerbitan SKTP, serta penyaluran Tambahan Penghasilan (Tamsil) bagi guru ASN yang belum bersertifikat pendidik di sekolah.",
                "lembaran_negara": "Kemendikdasmen RI",
                "link_jdih": "https://peraturan.go.id/id/permendikdasmen-no-10-tahun-2026",
                "label_jdih": "JDIH Kemendikdasmen",
                "status": "Berlaku",
                "kata_kunci": "permendikdasmen nomor 10 tahun 2026 permendikdasmen petunjuk teknis juknis tpg tunjangan profesi guru tunjangan khusus tambahan penghasilan tamsil sktp info gtk"
            },
            {
                "id": 27,
                "kategori_app": "siladumas",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 25 Tahun 2009",
                "judul_regulasi": "Tentang Pelayanan Publik",
                "keterkaitan": "Keterkaitan dengan SiLaDuMas: Bab VII (Pasal 36 s.d. 49) mewajibkan setiap unit pelayanan publik (termasuk SMA Negeri) menyediakan sarana pengelolaan pengaduan, menunjuk petugas pengelola aduan yang kompeten, dan wajib memberikan respon serta tindak lanjut transparan.",
                "lembaran_negara": "Lembaran Negara 2009 No. 112",
                "link_jdih": "https://menpan.go.id",
                "label_jdih": "JDIH KemenPAN-RB",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 25 tahun 2009 pelayanan publik bab vii pengelolaan pengaduan komplain masyarakat sp4n lapor"
            },
            {
                "id": 28,
                "kategori_app": "siladumas",
                "hierarki": "Undang-Undang",
                "nomor_regulasi": "Undang-Undang No. 14 Tahun 2008",
                "judul_regulasi": "Tentang Keterbukaan Informasi Publik (KIP)",
                "keterkaitan": "Keterkaitan dengan SiLaDuMas: Menjamin hak warga sekolah, orang tua siswa, dan masyarakat luas untuk memperoleh informasi publik secara transparan serta menyalurkan kritik membangun demi peningkatan mutu layanan sekolah.",
                "lembaran_negara": "Lembaran Negara 2008 No. 61",
                "link_jdih": "https://komisiinformasi.go.id",
                "label_jdih": "Komisi Informasi",
                "status": "Berlaku",
                "kata_kunci": "uu nomor 14 tahun 2008 keterbukaan informasi publik kip transparansi sekolah akuntabilitas"
            },
            {
                "id": 29,
                "kategori_app": "siladumas",
                "hierarki": "PermenPAN-RB",
                "nomor_regulasi": "PermenPAN-RB No. 62 Tahun 2018",
                "judul_regulasi": "Pedoman Sistem Pengaduan Pelayanan Publik Nasional Terintegrasi (SP4N-LAPOR!)",
                "keterkaitan": "Keterkaitan dengan SiLaDuMas: Memberikan standar nomor tiket pengaduan unik, mekanisme klasifikasi laporan (Aspirasi, Permintaan Informasi, atau Pengaduan), batas waktu SLA penanganan, serta kerahasiaan identitas pelapor (whistleblower).",
                "lembaran_negara": "Berita Negara 2018 No. 1827",
                "link_jdih": "https://lapor.go.id",
                "label_jdih": "Portal LAPOR!",
                "status": "Berlaku",
                "kata_kunci": "permenpan-rb nomor 62 tahun 2018 pedoman pengaduan pelayanan publik tiket respon perlindungan pelapor"
            },
            {
                "id": 30,
                "kategori_app": "sinbas",
                "hierarki": "Permendagri",
                "nomor_regulasi": "Permendagri No. 108 Tahun 2016",
                "judul_regulasi": "Tentang Penggolongan dan Kodefikasi Barang Milik Daerah (BMD)",
                "keterkaitan": "Keterkaitan dengan SINBAS: Dasar kodefikasi hierarki aset (Akun, Kelompok, Jenis, Objek, Rincian Objek, Sub Rincian Objek) pada KIB A (Tanah), KIB B (Peralatan/Mesin), KIB C (Gedung), KIB D (Jalan/Jaringan), KIB E (Buku/Aset Lain), dan KIB F (Konstruksi) di lingkungan sekolah. (Dokumen tersimpan di sistem sinbas/dasar hukum).",
                "lembaran_negara": "Berita Negara 2016 No. 2083",
                "link_jdih": "https://kemendagri.go.id",
                "label_jdih": "JDIH Kemendagri",
                "status": "Berlaku",
                "kata_kunci": "permendagri nomor 108 tahun 2016 penggolongan kodefikasi barang milik daerah bmd kib a kib b kib c kib d kib e kib f aset sekolah"
            },
            {
                "id": 31,
                "kategori_app": "sinbas",
                "hierarki": "Permendagri",
                "nomor_regulasi": "Permendagri No. 47 Tahun 2021",
                "judul_regulasi": "Tata Cara Pelaksanaan Pembukuan, Inventarisasi, dan Pelaporan Barang Milik Daerah",
                "keterkaitan": "Keterkaitan dengan SINBAS: Mengatur tata cara penyusunan Buku Inventaris (BI), Laporan Mutasi Barang Semesteran/Tahunan, sensus barang berkala lima tahunan, serta inventarisasi fisik barang inventaris ruangan (KIR). (Dokumen referensi di sinbas/dasar hukum).",
                "lembaran_negara": "Berita Negara 2021 No. 1478",
                "link_jdih": "https://kemendagri.go.id",
                "label_jdih": "JDIH Kemendagri",
                "status": "Berlaku",
                "kata_kunci": "permendagri nomor 47 tahun 2021 pembukuan inventarisasi pelaporan barang milik daerah bmd sensus barang buku inventaris mutasi"
            },
            {
                "id": 32,
                "kategori_app": "sinbas",
                "hierarki": "Permendagri",
                "nomor_regulasi": "Permendagri No. 7 Tahun 2024 jo. No. 19/2016",
                "judul_regulasi": "Perubahan atas Pedoman Pengelolaan Barang Milik Daerah",
                "keterkaitan": "Keterkaitan dengan SINBAS: Penyempurnaan tata kelola aset daerah terkini, pedoman siklus hidup barang (perencanaan, pengadaan, penatausahaan, pemeliharaan, pengamanan, hingga penghapusan aset rusak berat di sekolah). (Tersedia di sinbas/dasar hukum).",
                "lembaran_negara": "Kemendagri RI 2024",
                "link_jdih": "https://kemendagri.go.id",
                "label_jdih": "JDIH Kemendagri",
                "status": "Berlaku",
                "kata_kunci": "permendagri nomor 7 tahun 2024 perubahan permendagri 19 2016 pedoman pengelolaan barang milik daerah bmd aset daerah"
            },
            {
                "id": 33,
                "kategori_app": "sinbas",
                "hierarki": "Permendikbudristek",
                "nomor_regulasi": "Permendikbudristek No. 22 Tahun 2023",
                "judul_regulasi": "Standar Sarana dan Prasarana pada PAUD, Pendidikan Dasar, dan Pendidikan Menengah",
                "keterkaitan": "Keterkaitan dengan SINBAS: Menetapkan rasio kecukupan perabot belajar, standar ruang laboratorium, buku perpustakaan, peralatan TIK, serta kelayakan fasilitas gedung penunjang proses belajar mengajar di sekolah.",
                "lembaran_negara": "Berita Negara 2023 No. 384",
                "link_jdih": "https://jdih.kemdikbud.go.id",
                "label_jdih": "JDIH Kemendikbud",
                "status": "Berlaku",
                "kata_kunci": "permendikbudristek nomor 22 tahun 2023 standar sarana prasarana sekolah ruang kelas laboratorium ruang perpustakaan"
            }
        ],

        /**
         * Mengambil Konfigurasi Aktif (Cache > Fallback)
         */
        getConfig: function () {
            try {
                const readConfig = (key) => {
                    const raw = localStorage.getItem(key);
                    if (!raw) return {};
                    const parsed = JSON.parse(raw);
                    if (!window.electronAPI && (parsed.admin_pass !== undefined || parsed.admin_user !== undefined)) {
                        delete parsed.admin_pass;
                        delete parsed.admin_user;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                    return parsed;
                };
                const schoolId = this.activeSchoolId || this.getSchoolIdFromUrl();
                if (schoolId) {
                    const schoolCached = readConfig(this.getSchoolConfigStorageKey(schoolId));
                    const baseCached = readConfig(this.STORAGE_KEY_CONFIG);
                    const tenantKeys = [
                        'nama_sekolah', 'pemprov', 'alamat_sekolah', 'url_web', 'email_sekolah',
                        'logo_instansi', 'logo_sekolah', 'theme_color_1', 'theme_color_2', 'theme_color_3'
                    ];
                    const sharedConfig = Object.assign({}, baseCached);
                    tenantKeys.forEach(key => delete sharedConfig[key]);
                    return Object.assign(
                        {},
                        this.defaultConfig,
                        sharedConfig,
                        schoolCached
                    );
                }
                const cached = readConfig(this.STORAGE_KEY_CONFIG);
                if (Object.keys(cached).length) return Object.assign({}, this.defaultConfig, cached);
            } catch (e) { }
            return Object.assign({}, this.defaultConfig);
        },

        /**
         * Mengambil Daftar Aplikasi Aktif (Cache > Fallback)
         */
        getApps: function () {
            try {
                const schoolId = this.activeSchoolId || this.getSchoolIdFromUrl();
                if (schoolId) {
                    const schoolCached = localStorage.getItem(this.getSchoolAppsStorageKey(schoolId));
                    if (schoolCached) {
                        const parsedSchoolApps = JSON.parse(schoolCached);
                        if (Array.isArray(parsedSchoolApps)) {
                            return parsedSchoolApps.filter(app => app.enabled === true || app.enabled === 1 || String(app.enabled).toLowerCase() === 'true');
                        }
                    }
                    return [];
                }
                const cached = localStorage.getItem(this.STORAGE_KEY_APPS);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) { }
            return this.defaultApps;
        },

        /**
         * Mengambil Seluruh Katalog Aplikasi Master (Tanpa filter sekolah)
         */
        getMasterApps: function () {
            try {
                const cached = localStorage.getItem(this.STORAGE_KEY_APPS);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length) return parsed;
                }
            } catch (e) { }
            return this.defaultApps;
        },

        /**
         * Mengambil Daftar Dasar Hukum Aktif (Cache > Fallback)
         */
        getLaws: function () {
            try {
                const cached = localStorage.getItem(this.STORAGE_KEY_LAWS);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) { }
            return this.defaultLaws;
        },

        getAvailableSchoolLogos: function () {
            return Array.isArray(this.availableSchoolLogos) ? this.availableSchoolLogos : [];
        },

        /**
         * Mengambil URL Google Apps Script yang tersimpan
         */
        getGasUrl: function () {
            const cfg = this.getConfig();
            return cfg.gas_url || SIKOBAELAH_GAS_EXEC_URL || '';
        },

        isValidGasUrl: function (value) {
            try {
                const url = new URL(String(value || ''));
                return url.protocol === 'https:' &&
                    url.hostname === 'script.google.com' &&
                    /^\/macros\/s\/[^/]+\/exec\/?$/.test(url.pathname) &&
                    !url.username && !url.password;
            } catch (_) {
                return false;
            }
        },

        /**
         * Menyimpan URL Google Apps Script baru
         */
        setGasUrl: function (url) {
            const cfg = this.getConfig();
            cfg.gas_url = String(url || '').trim();
            localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(cfg));
        },

        /**
         * Panggilan API generik ke backend Google Apps Script via POST
         */
        callApi: async function (action, data) {
            const gasUrl = this.getGasUrl();
            if (!this.isValidGasUrl(gasUrl)) {
                if (window.electronAPI) {
                    console.warn('[SiKoBaELah DB] URL GAS belum valid, perubahan disimpan secara lokal.');
                    return { success: true, isLocalOnly: true, message: 'Tersimpan lokal' };
                }
                return { success: false, message: 'URL Web App Google Apps Script tidak valid.' };
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            try {
                const response = await fetch(gasUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: action,
                        data: data,
                        token: this.getAuthToken()
                    }),
                    redirect: 'follow',
                    signal: controller.signal
                });
                const text = await response.text();
                try {
                    const result = JSON.parse(text);
                    if (!response.ok) {
                        return Object.assign({}, result, {
                            success: false,
                            message: result.message || 'Server menolak permintaan (' + response.status + ').'
                        });
                    }
                    return result;
                } catch (e) {
                    return { success: false, message: 'Format respons bukan JSON: ' + text.substring(0, 100) };
                }
            } catch (err) {
                console.error('[SiKoBaELah DB API Error]:', err);
                return {
                    success: false,
                    isNetworkError: true,
                    message: err.name === 'AbortError'
                        ? 'Permintaan ke Google Apps Script melewati batas waktu 15 detik.'
                        : 'Koneksi ke Google Apps Script gagal: ' + err.message
                };
            } finally {
                clearTimeout(timeoutId);
            }
        },

        /**
         * Autentikasi Login Admin
         */
        login: async function (username, password) {
            const u = String(username || '').trim();
            const p = String(password || '').trim();
            const cfg = this.getConfig();

            // Login online harus selalu diverifikasi oleh backend.
            if (this.getGasUrl()) {
                const res = await this.callApi('login', { username: u, password: p });
                if (res && res.success) {
                    sessionStorage.setItem('sikobaelah_auth', JSON.stringify(res.data));
                    return res;
                }
                if (res && !res.isNetworkError && !res.isLocalOnly) return res;
            }

            if (!window.electronAPI) {
                return { success: false, message: 'Login online membutuhkan koneksi ke Google Apps Script.' };
            }

            const offlineConfig = window.electronAPI && typeof window.electronAPI.getOfflineConfig === 'function'
                ? await window.electronAPI.getOfflineConfig()
                : {};
            const expectedUser = cfg.admin_user || offlineConfig.offlineAdminUser || 'admin';
            const expectedPass = cfg.admin_pass || offlineConfig.offlineAdminPass || 'admin123';
            if (u === expectedUser && p === expectedPass) {
                const sessionData = { username: u, token: 'local_auth_' + Date.now(), isOffline: true };
                sessionStorage.setItem('sikobaelah_auth', JSON.stringify(sessionData));
                return { success: true, data: sessionData, message: 'Login berhasil (Mode Lokal)!' };
            } else {
                return { success: false, message: 'Username atau kata sandi salah.' };
            }
        },

        getAuthToken: function () {
            try {
                const auth = JSON.parse(sessionStorage.getItem('sikobaelah_auth') || 'null');
                return auth && auth.token ? String(auth.token) : '';
            } catch (e) {
                return '';
            }
        },

        callSchoolApi: async function (action, data) {
            const gasUrl = this.getGasUrl();
            if (!this.isValidGasUrl(gasUrl)) {
                return { success: false, message: 'URL Google Apps Script belum diatur; data sekolah tidak dapat disimpan ke Spreadsheet.' };
            }
            const result = await this.callApi(action, data);
            if (result && !result.success && /parameter action tidak dikenali/i.test(String(result.message || ''))) {
                return Object.assign({}, result, {
                    isApiVersionError: true,
                    message: 'Deployment Apps Script pada URL ini masih memakai kode lama dan belum mendukung "' + action + '". Perbarui Code.gs lalu deploy sebagai versi baru; setelah itu pastikan Desktop memakai URL Web App deployment tersebut.'
                });
            }
            return result;
        },

        getSchools: async function () {
            const gasUrl = this.getGasUrl();
            if (this.isValidGasUrl(gasUrl)) {
                // PRIORITAS 1: Coba HTTP GET cepat (tanpa preflight CORS)
                const fetchUrl = gasUrl + (gasUrl.includes('?') ? '&' : '?') + 'action=getSchools&_t=' + Date.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);
                try {
                    const response = await fetch(fetchUrl, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                        cache: 'no-store',
                        redirect: 'follow',
                        signal: controller.signal
                    });
                    if (response.ok) {
                        const text = await response.text();
                        try {
                            const json = JSON.parse(text);
                            if (json && json.success && Array.isArray(json.data)) {
                                return json;
                            }
                        } catch (_) { }
                    }
                } catch (err) {
                    console.warn('[SiKoBaELah DB getSchools GET failed, fallback to POST]:', err.message);
                } finally {
                    clearTimeout(timeoutId);
                }
            }
            // PRIORITAS 2: Fallback ke POST
            return this.callSchoolApi('getSchools', {});
        },

        saveSchool: async function (school) {
            const res = await this.callSchoolApi('saveSchool', school);
            if (res && res.success) {
                this.persistToSqlite('saveSchool', school);
            }
            return res;
        },

        deleteSchool: async function (schoolId) {
            const res = await this.callSchoolApi('deleteSchool', { id: schoolId });
            if (res && res.success) {
                this.persistToSqlite('deleteSchool', schoolId);
            }
            return res;
        },

        getSchoolData: async function (schoolId) {
            const cleanId = String(schoolId || '').trim().toLowerCase();
            if (!cleanId) {
                return { success: false, message: 'ID sekolah tidak valid.' };
            }
            const gasUrl = this.getGasUrl();
            if (!this.isValidGasUrl(gasUrl)) {
                return { success: false, message: 'URL Google Apps Script belum diatur.' };
            }

            // PRIORITAS 1: Gunakan HTTP GET super cepat (tanpa CORS preflight)
            const fetchUrl = gasUrl + (gasUrl.includes('?') ? '&' : '?') + 'action=getSchoolData&id=' + encodeURIComponent(cleanId) + '&_t=' + Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store',
                    redirect: 'follow',
                    signal: controller.signal
                });
                if (response.ok) {
                    const text = await response.text();
                    try {
                        const json = JSON.parse(text);
                        if (json && json.success && json.data) {
                            try { this.cacheSchoolData(cleanId, json.data); } catch (_) { }
                        }
                        return json;
                    } catch (_) { }
                }
            } catch (err) {
                console.warn('[SiKoBaELah DB getSchoolData GET failed, fallback to POST]:', err.message);
            } finally {
                clearTimeout(timeoutId);
            }

            // PRIORITAS 2: Fallback ke POST jika GET gagal
            const postRes = await this.callSchoolApi('getSchoolData', { id: cleanId });
            if (postRes && postRes.success && postRes.data) {
                try { this.cacheSchoolData(cleanId, postRes.data); } catch (_) { }
            }
            return postRes;
        },

        saveSchoolConfig: async function (schoolId, config) {
            const cleanId = String(schoolId || '').trim().toLowerCase();
            const result = await this.callSchoolApi('saveSchoolConfig', { id: cleanId, config: config });
            if (result && result.success) {
                try {
                    const cachedKey = this.getSchoolConfigStorageKey(cleanId);
                    const current = JSON.parse(localStorage.getItem(cachedKey) || '{}');
                    const merged = Object.assign({}, current, config);
                    localStorage.setItem(cachedKey, JSON.stringify(merged));
                    if (result.data) {
                        this.cacheSchoolData(cleanId, result.data);
                    }
                    this.persistToSqlite('saveSchoolConfig', cleanId, config);
                } catch (e) {
                    console.warn('[SiKoBaELah DB] Gagal memperbarui cache lokal sekolah:', e);
                }
            }
            return result;
        },

        saveSchoolApps: async function (schoolId, apps) {
            const cleanId = String(schoolId || '').trim().toLowerCase();
            const result = await this.callSchoolApi('saveSchoolApps', { id: cleanId, apps: apps });
            if (result && result.success) {
                try {
                    const appsToSave = (result.data && Array.isArray(result.data.apps)) ? result.data.apps : apps;
                    if (Array.isArray(appsToSave)) {
                        localStorage.setItem(this.getSchoolAppsStorageKey(cleanId), JSON.stringify(appsToSave));
                    }
                    this.persistToSqlite('saveSchoolApps', cleanId, appsToSave);
                } catch (e) {
                    console.warn('[SiKoBaELah DB] Gagal memperbarui cache apps lokal:', e);
                }
            }
            return result;
        },

        cacheSchoolData: function (schoolId, schoolData) {
            if (!schoolId || !schoolData || !schoolData.config || !Array.isArray(schoolData.apps)) {
                throw new Error('Data sekolah tidak lengkap untuk disimpan.');
            }
            this.activeSchoolId = String(schoolId).toLowerCase();
            localStorage.setItem(this.getSchoolConfigStorageKey(schoolId), JSON.stringify(schoolData.config));
            localStorage.setItem(this.getSchoolAppsStorageKey(schoolId), JSON.stringify(schoolData.apps));
        },

        getCachedSchoolData: function (schoolId) {
            const cleanId = String(schoolId || '').trim().toLowerCase();
            if (!cleanId) return null;
            try {
                const cfgStr = localStorage.getItem(this.getSchoolConfigStorageKey(cleanId));
                const appsStr = localStorage.getItem(this.getSchoolAppsStorageKey(cleanId));
                if (cfgStr || appsStr) {
                    return {
                        config: cfgStr ? JSON.parse(cfgStr) : {},
                        apps: appsStr ? JSON.parse(appsStr) : []
                    };
                }
            } catch (e) { }
            return null;
        },

        clearSchoolDataCache: function (schoolId) {
            localStorage.removeItem(this.getSchoolConfigStorageKey(schoolId));
            localStorage.removeItem(this.getSchoolAppsStorageKey(schoolId));
        },

        /**
         * Logout Admin
         */
        logout: function () {
            sessionStorage.removeItem('sikobaelah_auth');
        },

        /**
         * Cek apakah admin sedang login
         */
        isLoggedIn: function () {
            try {
                const auth = sessionStorage.getItem('sikobaelah_auth');
                return !!auth;
            } catch (e) {
                return false;
            }
        },

        /**
         * Sinkronisasi ke SQLite Desktop jika berjalan di Electron
         */
        persistToSqlite: function (action, payload, extra) {
            try {
                if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.sikobaelahDB) {
                    const sDb = window.electronAPI.sikobaelahDB;
                    if (action === 'saveConfig' && typeof sDb.saveConfig === 'function') sDb.saveConfig(payload).catch(() => { });
                    else if (action === 'saveApp' && typeof sDb.saveApp === 'function') sDb.saveApp(payload).catch(() => { });
                    else if (action === 'deleteApp' && typeof sDb.deleteApp === 'function') sDb.deleteApp(payload).catch(() => { });
                    else if (action === 'saveLaw' && typeof sDb.saveLaw === 'function') sDb.saveLaw(payload).catch(() => { });
                    else if (action === 'deleteLaw' && typeof sDb.deleteLaw === 'function') sDb.deleteLaw(payload).catch(() => { });
                    else if (action === 'pushAll' && typeof sDb.pushAll === 'function') sDb.pushAll(payload).catch(() => { });
                    else if (action === 'saveSchool' && typeof sDb.saveSchool === 'function') sDb.saveSchool(payload).catch(() => { });
                    else if (action === 'deleteSchool' && typeof sDb.deleteSchool === 'function') sDb.deleteSchool(payload).catch(() => { });
                    else if (action === 'saveSchoolConfig' && typeof sDb.saveSchoolConfig === 'function') sDb.saveSchoolConfig(payload, extra).catch(() => { });
                    else if (action === 'saveSchoolApps' && typeof sDb.saveSchoolApps === 'function') sDb.saveSchoolApps(payload, extra).catch(() => { });
                }
            } catch (_) { }
        },

        /**
         * Simpan / Perbarui Pengaturan Sekolah ke Database
         */
        saveConfigData: async function (configData) {
            const res = await this.callApi('saveConfig', configData);
            if (!res || !res.success) return res;
            let cachedConfig = {};
            try {
                cachedConfig = JSON.parse(localStorage.getItem(this.STORAGE_KEY_CONFIG) || '{}');
            } catch (error) {
                console.warn('[SiKoBaELah Config Cache] Cache rusak; menggunakan konfigurasi server.', error);
            }
            const serverConfig = res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : {};
            const safeConfig = Object.assign({}, this.defaultConfig, cachedConfig, serverConfig, configData);
            [
                'nama_sekolah', 'pemprov', 'alamat_sekolah', 'url_web', 'email_sekolah',
                'logo_instansi', 'logo_sekolah', 'theme_color_1', 'theme_color_2', 'theme_color_3'
            ].forEach(key => delete safeConfig[key]);
            delete safeConfig.admin_pass;
            delete safeConfig.admin_user;
            localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(safeConfig));
            this.persistToSqlite('saveConfig', configData);
            window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', { detail: { config: safeConfig } }));
            return res;
        },

        /**
         * Simpan / Perbarui Data Modul Aplikasi ke Database
         */
        saveAppData: async function (appObj) {
            const apps = this.getMasterApps();
            const targetId = String(appObj.id || '').trim();
            const res = await this.callApi('saveApp', appObj);
            if (!res || !res.success) return res;
            let found = false;

            for (let i = 0; i < apps.length; i++) {
                if (String(apps[i].id).trim() === targetId) {
                    apps[i] = Object.assign({}, apps[i], appObj);
                    found = true;
                    break;
                }
            }
            if (!found) {
                apps.push(appObj);
            }

            localStorage.setItem(this.STORAGE_KEY_APPS, JSON.stringify(apps));
            this.persistToSqlite('saveApp', appObj);
            window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', { detail: { apps: apps } }));
            return res;
        },

        /**
         * Hapus Modul Aplikasi dari Database
         */
        deleteAppData: async function (appId) {
            let apps = this.getMasterApps();
            const targetId = String(appId).trim();
            const res = await this.callApi('deleteApp', { id: targetId });
            if (!res || !res.success) return res;
            apps = apps.filter(a => String(a.id).trim() !== targetId);

            localStorage.setItem(this.STORAGE_KEY_APPS, JSON.stringify(apps));
            this.persistToSqlite('deleteApp', targetId);
            window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', { detail: { apps: apps } }));
            return res;
        },

        /**
         * Simpan / Perbarui Dasar Hukum ke Database
         */
        saveLawData: async function (lawObj) {
            const laws = this.getLaws();
            let targetId = lawObj.id ? Number(lawObj.id) : null;
            const res = await this.callApi('saveLaw', lawObj);
            if (!res || !res.success) return res;
            let found = false;

            if (targetId) {
                for (let i = 0; i < laws.length; i++) {
                    if (Number(laws[i].id) === targetId) {
                        laws[i] = Object.assign({}, laws[i], lawObj);
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                if (!targetId) {
                    const maxId = laws.reduce((max, l) => Math.max(max, Number(l.id) || 0), 0);
                    targetId = maxId + 1;
                    lawObj.id = targetId;
                }
                laws.push(lawObj);
            }
            localStorage.setItem(this.STORAGE_KEY_LAWS, JSON.stringify(laws));
            this.persistToSqlite('saveLaw', lawObj);
            window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', { detail: { laws: laws } }));
            return res;
        },

        /**
         * Hapus Dasar Hukum dari Database
         */
        deleteLawData: async function (lawId) {
            let laws = this.getLaws();
            const targetId = Number(lawId);
            const res = await this.callApi('deleteLaw', { id: targetId });
            if (!res || !res.success) return res;
            laws = laws.filter(l => Number(l.id) !== targetId);

            localStorage.setItem(this.STORAGE_KEY_LAWS, JSON.stringify(laws));
            this.persistToSqlite('deleteLaw', targetId);
            window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', { detail: { laws: laws } }));
            return res;
        },

        /**
         * Sinkronisasi Seluruh Data dari Google Apps Script (Cloud Spreadsheet)
         */
        syncFromCloud: async function (overrideUrl, options) {
            const url = overrideUrl || this.getGasUrl();
            if (!this.isValidGasUrl(url)) {
                return { success: false, message: 'URL Web App Google Apps Script tidak valid.' };
            }

            const force = Boolean(options && options.force);
            if (this.syncPromise) return this.syncPromise;
            const lastSync = Date.parse(localStorage.getItem(this.STORAGE_KEY_LAST_SYNC) || '');
            if (!force && Number.isFinite(lastSync) && Date.now() - lastSync < 30000) {
                return { success: true, skipped: true, message: 'Data baru saja disinkronkan.' };
            }
            if (!force && this.lastSyncAttemptAt && Date.now() - this.lastSyncAttemptAt < 30000) {
                return { success: true, skipped: true, message: 'Sinkronisasi baru saja dicoba.' };
            }
            this.lastSyncAttemptAt = Date.now();

            this.syncPromise = (async () => {
                let timeoutId;
                try {
                    if (overrideUrl) {
                        this.setGasUrl(overrideUrl);
                    }

                    const fetchUrl = url + (url.includes('?') ? '&' : '?') + 'action=getAll&_t=' + Date.now();
                    const controller = new AbortController();
                    timeoutId = setTimeout(() => controller.abort(), 15000);
                    const response = await fetch(fetchUrl, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                        cache: 'no-store',
                        redirect: 'follow',
                        signal: controller.signal
                    });
                    if (!response.ok) {
                        return { success: false, message: 'Server menolak sinkronisasi (' + response.status + ').' };
                    }

                    const text = await response.text();
                    let res;
                    try {
                        res = JSON.parse(text);
                    } catch (e) {
                        return { success: false, message: 'Format data bukan JSON: ' + text.substring(0, 100) };
                    }

                    if (res && res.success && res.data) {
                        const { config, apps, laws } = res.data;

                        if (config && typeof config === 'object') {
                            const mergedConfig = Object.assign({}, this.defaultConfig, config);
                            mergedConfig.gas_url = url;
                            localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(mergedConfig));
                        }

                        if (Array.isArray(apps)) {
                            localStorage.setItem(this.STORAGE_KEY_APPS, JSON.stringify(apps));
                        }

                        if (Array.isArray(laws)) {
                            localStorage.setItem(this.STORAGE_KEY_LAWS, JSON.stringify(laws));
                        }

                        localStorage.setItem(this.STORAGE_KEY_LAST_SYNC, new Date().toISOString());

                        // Simpan hasil sinkronisasi cloud langsung ke SQLite3 Desktop
                        this.persistToSqlite('pushAll', res.data);

                        window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', {
                            detail: { config: config, apps: apps, laws: laws }
                        }));

                        return { success: true, data: res.data, message: 'Sinkronisasi berhasil!' };
                    } else {
                        return { success: false, message: res.message || 'Gagal mengambil data dari Google Spreadsheet.' };
                    }
                } catch (err) {
                    console.error('[SiKoBaELah DB Sync Error]:', err);
                    return {
                        success: false,
                        isNetworkError: true,
                        message: err.name === 'AbortError'
                            ? 'Sinkronisasi melewati batas waktu 15 detik.'
                            : 'Koneksi gagal: ' + err.message
                    };
                } finally {
                    if (timeoutId) clearTimeout(timeoutId);
                    this.syncPromise = null;
                }
            })();
            return this.syncPromise;
        },

        /**
         * Kirim Seluruh Data Lokal/Offline ke Google Spreadsheet (Push 1-Arah: Offline -> Cloud)
         */
        pushToCloud: async function (overrideUrl) {
            const url = overrideUrl || this.getGasUrl();
            if (!this.isValidGasUrl(url)) {
                return { success: false, message: 'URL Web App Google Apps Script tidak valid.' };
            }

            if (overrideUrl) {
                this.setGasUrl(overrideUrl);
            }

            const baseConfig = Object.assign({}, this.getConfig());
            const tenantKeys = [
                'nama_sekolah', 'pemprov', 'alamat_sekolah', 'url_web', 'email_sekolah',
                'logo_instansi', 'logo_sekolah', 'theme_color_1', 'theme_color_2', 'theme_color_3'
            ];
            tenantKeys.forEach(k => delete baseConfig[k]);

            const masterApps = this.getMasterApps();
            const masterLaws = this.getLaws();

            const schools = [];
            const schoolAppsMap = {};
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('sikobaelah_school_config_')) {
                        const schoolId = key.replace('sikobaelah_school_config_', '');
                        try {
                            const sCfg = JSON.parse(localStorage.getItem(key) || '{}');
                            schools.push(Object.assign({ id: schoolId, status: 'aktif' }, sCfg));
                        } catch (_) { }
                    } else if (key && key.startsWith('sikobaelah_school_apps_')) {
                        const schoolId = key.replace('sikobaelah_school_apps_', '');
                        try {
                            const sApps = JSON.parse(localStorage.getItem(key) || '[]');
                            schoolAppsMap[schoolId] = sApps;
                        } catch (_) { }
                    }
                }
            } catch (e) {
                console.warn('[SiKoBaELah Push] Gagal membaca data sekolah dari localStorage:', e);
            }

            const payload = {
                config: baseConfig,
                apps: masterApps,
                laws: masterLaws,
                schools: schools.length > 0 ? schools : undefined,
                schoolAppsMap: Object.keys(schoolAppsMap).length > 0 ? schoolAppsMap : undefined
            };

            const res = await this.callApi('pushAll', payload);
            return res;
        }
    };

    window.SIKOBAELAH_DB = SIKOBAELAH_DB;

    // Otomatis sinkronisasi saat online secara instan & saat tab difokuskan
    function autoSyncLiveCloud() {
        if (typeof navigator !== 'undefined' && navigator.onLine && SIKOBAELAH_DB.getGasUrl()) {
            SIKOBAELAH_DB.syncFromCloud().catch(err => console.warn('[SiKoBaELah AutoSync Cloud]', err));
            const schoolId = SIKOBAELAH_DB.activeSchoolId || SIKOBAELAH_DB.getSchoolIdFromUrl();
            if (schoolId) {
                SIKOBAELAH_DB.getSchoolData(schoolId).catch(err => console.warn('[SiKoBaELah AutoSync School]', err));
            }
        }
    }

    // Jalankan segera saat halaman dibuka
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoSyncLiveCloud);
    } else {
        autoSyncLiveCloud();
    }

    // Jalankan juga saat tab kembali aktif (agar jika spreadsheet diedit di tab lain, langsung berubah)
    window.addEventListener('focus', autoSyncLiveCloud);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) autoSyncLiveCloud();
    });

    // Jika berjalan di lingkungan Desktop Offline (Electron), otomatis ambil URL dari config-offline.js & muat data dari SQLite3
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.electronAPI) {
                if (typeof window.electronAPI.getOfflineConfig === 'function') {
                    window.electronAPI.getOfflineConfig().then(offCfg => {
                        if (offCfg && (offCfg.masterPortalExecUrl || offCfg.execUrl)) {
                            const offUrl = String(offCfg.masterPortalExecUrl || offCfg.execUrl || '').trim();
                            if (offUrl) {
                                SIKOBAELAH_DB.setGasUrl(offUrl);
                            }
                        }
                    }).catch(() => { });
                }

                // Ambil data offline langsung dari file sikobaelah.sqlite
                if (window.electronAPI.sikobaelahDB && typeof window.electronAPI.sikobaelahDB.getAll === 'function') {
                    window.electronAPI.sikobaelahDB.getAll().then(dbData => {
                        if (dbData) {
                            const { config, apps, laws } = dbData;
                            let hasChange = false;
                            if (config && Object.keys(config).length > 0) {
                                const merged = Object.assign({}, SIKOBAELAH_DB.getConfig(), config);
                                localStorage.setItem(SIKOBAELAH_DB.STORAGE_KEY_CONFIG, JSON.stringify(merged));
                                hasChange = true;
                            }
                            if (Array.isArray(apps) && apps.length > 0) {
                                localStorage.setItem(SIKOBAELAH_DB.STORAGE_KEY_APPS, JSON.stringify(apps));
                                hasChange = true;
                            }
                            if (Array.isArray(laws) && laws.length > 0) {
                                localStorage.setItem(SIKOBAELAH_DB.STORAGE_KEY_LAWS, JSON.stringify(laws));
                                hasChange = true;
                            }
                            if (hasChange) {
                                window.dispatchEvent(new CustomEvent('sikobaelah:data-updated', {
                                    detail: { config: config, apps: apps, laws: laws }
                                }));
                            }
                        }
                    }).catch(e => console.warn('[SiKoBaELah SQLite Load]', e));
                }
            }
        });
    }

})(window);
