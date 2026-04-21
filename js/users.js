// ================= MANAJEMEN PENGGUNA =================
import { API_BASE_URL, state, triggerRefresh } from './state.js';
import { closeModalUser } from './utils.js';

export function renderUsers() {
    const tbody = document.getElementById('tableUserBody');
    tbody.innerHTML = '';
    state.mockUsers.forEach(u => {
        const roleBadge = u.role === 'admin' 
            ? `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold shadow-sm">Administrator</span>`
            : `<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold shadow-sm">Guru Piket</span>`;
        
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3 font-medium align-middle">${u.nama}</td>
                <td class="p-3 align-middle">${roleBadge}</td>
                <td class="p-3 text-center align-middle flex justify-center gap-3">
                    <button onclick="window.showQRCode('${u.nama}', '${u.qr_code}')" class="text-blue-500 hover:text-blue-700" title="Lihat QR Code"><i class="ph ph-qr-code text-lg"></i></button>
                    <button onclick="window.deleteUser(${u.id})" class="text-red-500 hover:text-red-700" title="Hapus Pengguna"><i class="ph ph-trash text-lg"></i></button>
                </td>
            </tr>
        `;
    });
}

export function saveUser(e) {
    e.preventDefault();
    const payload = {
        nama: document.getElementById('userNama').value,
        role: document.getElementById('userRoleSelect').value,
        qr_code: "QR-" + document.getElementById('userRoleSelect').value.toUpperCase() + "-" + Date.now().toString(36).toUpperCase()
    };
    
    fetch(`${API_BASE_URL}/users.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            closeModalUser();
            triggerRefresh(); 
            Swal.fire({ icon: 'success', title: 'Pengguna Ditambahkan', text: 'QR Code akses berhasil dibuat di database.', timer: 2000, showConfirmButton: false });
        } else { Swal.fire('Error', data.message, 'error'); }
    });
}

export function deleteUser(id) {
    if (state.mockUsers.length <= 1) return Swal.fire('Ditolak', 'Tidak bisa menghapus satu-satunya pengguna di sistem.', 'error');
    Swal.fire({ title: 'Hapus Pengguna?', text: "Akses login QR pengguna ini dicabut permanen!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_BASE_URL}/users.php`, {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    triggerRefresh(); 
                    Swal.fire('Terhapus!', 'Pengguna dihapus dari database.', 'success');
                }
            });
        }
    });
}