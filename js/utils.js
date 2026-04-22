// ================= ANTARMUKA & UTILITAS =================
import { state } from './state.js';
import { startScanner, stopScanner } from './scanner.js';
import { triggerRefresh } from './state.js';

export function speakVoice(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID'; 
        window.speechSynthesis.speak(utterance);
    }
}

export function updateClock() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if(document.getElementById('realtimeDay')) document.getElementById('realtimeDay').innerText = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if(document.getElementById('realtimeClock')) document.getElementById('realtimeClock').innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

export function handleRouting() {
    const hash = window.location.hash;
    if (hash === '#admin') {
        document.getElementById('adminTopMenu').classList.remove('hidden');
        if (!state.isLoggedIn) switchView('login');
        else switchView('admin');
    } else {
        document.getElementById('adminTopMenu').classList.add('hidden');
        switchView('scanner');
    }
}

export function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    if (viewName === 'scanner') {
        document.getElementById('view-scanner').classList.remove('hidden');
        startScanner(); 
    } 
    else if (viewName === 'admin') {
        stopScanner(); 
        document.getElementById('view-admin').classList.remove('hidden');
        triggerRefresh(); // Segarkan data saat masuk admin
        
        if (state.userRole === 'piket') {
            document.getElementById('tabGuru').classList.add('hidden'); 
            document.getElementById('tabUser').classList.add('hidden'); 
            document.getElementById('btnExportExcel').classList.add('hidden'); 
            document.getElementById('adminTitleBadge').innerHTML = '<i class="ph ph-shield-check"></i> Mode Guru Piket';
            document.getElementById('adminTitleBadge').className = "bg-orange-600 px-3 py-1 rounded-full shadow-inner text-white";
            switchAdminTab('dataAbsensi'); 
        } else {
            document.getElementById('tabGuru').classList.remove('hidden'); 
            document.getElementById('tabUser').classList.remove('hidden'); 
            document.getElementById('btnExportExcel').classList.remove('hidden'); 
            document.getElementById('adminTitleBadge').innerHTML = '<i class="ph ph-shield-check"></i> Mode Admin';
            document.getElementById('adminTitleBadge').className = "bg-blue-800 px-3 py-1 rounded-full shadow-inner text-white";
            switchAdminTab('dataGuru'); 
        }
    } 
    else if (viewName === 'login') {
        stopScanner(); 
        document.getElementById('view-login').classList.remove('hidden');
    }
}

export function switchAdminTab(tabName) {
    document.getElementById('tab-dataGuru').classList.add('hidden');
    document.getElementById('tab-dataAbsensi').classList.add('hidden');
    document.getElementById('tab-manajemenPengguna').classList.add('hidden');
    
    document.getElementById('tabGuru').classList.remove('tab-active');
    document.getElementById('tabGuru').classList.add('text-gray-600');
    document.getElementById('tabAbsen').classList.remove('tab-active');
    document.getElementById('tabAbsen').classList.add('text-gray-600');
    document.getElementById('tabUser').classList.remove('tab-active');
    document.getElementById('tabUser').classList.add('text-gray-600');

    if (tabName === 'dataGuru') {
        document.getElementById('tab-dataGuru').classList.remove('hidden');
        document.getElementById('tabGuru').classList.add('tab-active');
        document.getElementById('tabGuru').classList.remove('text-gray-600');
    } else if (tabName === 'dataAbsensi') {
        document.getElementById('tab-dataAbsensi').classList.remove('hidden');
        document.getElementById('tabAbsen').classList.add('tab-active');
        document.getElementById('tabAbsen').classList.remove('text-gray-600');
    } else if (tabName === 'manajemenPengguna') {
        document.getElementById('tab-manajemenPengguna').classList.remove('hidden');
        document.getElementById('tabUser').classList.add('tab-active');
        document.getElementById('tabUser').classList.remove('text-gray-600');
    }
}

// Modal Controllers
export function openModalGuru() { document.getElementById('modalGuru').classList.remove('hidden'); }
export function closeModalGuru() { document.getElementById('modalGuru').classList.add('hidden'); }
export function closeEditModal() { document.getElementById('modalEditGuru').classList.add('hidden'); }
export function closeModalQR() { document.getElementById('modalQR').classList.add('hidden'); }
export function openModalUser() { 
    document.getElementById('modalUser').classList.remove('hidden'); 
    document.getElementById('userNama').value = '';
    document.getElementById('userRoleSelect').value = 'admin';
}
export function closeModalUser() { document.getElementById('modalUser').classList.add('hidden'); }
export function closeModalIzin() { document.getElementById('modalIzin').classList.add('hidden'); }