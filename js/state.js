// ================= KONFIGURASI & STATE GLOBAL =================
export const API_BASE_URL = 'http://localhost/absensi-mabu/api'; 

// State global disimpan dalam sebuah object agar referensinya bisa diedit oleh file lain
export const state = {
    isLoggedIn: false,
    userRole: null, 
    html5QrcodeScanner: null,
    isProcessingScan: false,
    currentPage: 1,
    rowsPerPage: 10, 
    mockUsers: [
        { id: 1, nama: "Admin Utama", role: "admin", qr_code: "QR-ADMIN-KEY" },
        { id: 2, nama: "Guru Piket 1", role: "piket", qr_code: "QR-PIKET-KEY" }
    ],
    mockTeachers: [],
    mockAttendance: []
};

// Fungsi bantuan untuk memicu event pembaruan data secara global
export const triggerRefresh = () => window.dispatchEvent(new Event('refreshData'));
export const triggerRender = () => window.dispatchEvent(new Event('renderData'));