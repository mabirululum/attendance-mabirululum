// ================= MANAJEMEN GURU =================
import { API_BASE_URL, state, triggerRefresh } from './state.js';
import { closeModalGuru } from './utils.js';

export function renderGuru() {
    const tbody = document.getElementById('tableGuruBody');
    tbody.innerHTML = '';
    
    if(state.mockTeachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-6 text-gray-500 italic">Belum ada data guru di database</td></tr>`;
        return;
    }

    state.mockTeachers.forEach(t => {
        let jadwalBadges = '';
        if(t.jadwal && Object.keys(t.jadwal).length > 0) {
            jadwalBadges = Object.entries(t.jadwal).map(([hari, jam]) => {
                return `<div class="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-1"><span class="font-bold w-8 inline-block">${hari.substr(0,3)}</span> : ${jam.masuk} - ${jam.pulang}</div>`;
            }).join('');
        } else {
            jadwalBadges = `<span class="text-gray-400 italic text-xs">Belum ada jadwal</span>`;
        }

        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3 align-top">${t.nip}</td>
                <td class="p-3 font-medium align-top">${t.nama}</td>
                <td class="p-3 min-w-[200px]">${jadwalBadges}</td>
                <td class="p-3 text-center align-top flex justify-center gap-3">
                    <button onclick="window.showQRCode('${t.nama}', '${t.qr_code}')" class="text-blue-500 hover:text-blue-700"><i class="ph ph-qr-code text-lg"></i></button>
                    <button onclick="window.cetakIDCard(${t.id})" class="text-emerald-600 hover:text-emerald-800"><i class="ph ph-printer text-lg"></i></button>
                    <button onclick="window.deleteGuru(${t.id})" class="text-red-500 hover:text-red-700"><i class="ph ph-trash text-lg"></i></button>
                </td>
            </tr>
        `;
    });
}

export function saveGuru(e) { 
    e.preventDefault();
    const jadwal = {};
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].forEach(h => {
        const m = document.getElementById('jam' + h + 'M').value;
        const p = document.getElementById('jam' + h + 'P').value;
        if(m && p) jadwal[h] = { masuk: m, pulang: p };
    });

    const payload = {
        nip: document.getElementById('guruNip').value,
        nama: document.getElementById('guruNama').value,
        jadwal: jadwal,
        qr_code: "QR-GURU-" + Date.now().toString(36).toUpperCase()
    };

    fetch(`${API_BASE_URL}/teachers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            closeModalGuru();
            triggerRefresh(); 
            Swal.fire({ icon: 'success', title: 'Tersimpan!', text: 'Guru berhasil dimasukkan ke database.', timer: 2000, showConfirmButton: false });
        } else { Swal.fire('Error', data.message, 'error'); }
    });
}

export function deleteGuru(id) {
    Swal.fire({
        title: 'Hapus Guru?', text: "Data absensinya juga akan ikut terhapus di database!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_BASE_URL}/teachers.php`, {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    triggerRefresh(); 
                    Swal.fire('Terhapus!', 'Data guru telah dihapus dari database.', 'success');
                }
            });
        }
    });
}

export function showQRCode(nama, qrString) {
    document.getElementById('modalQR').classList.remove('hidden');
    document.getElementById('qrTitleName').innerText = "QR: " + nama;
    document.getElementById('qrStringText').innerText = qrString;
    document.getElementById('qrcodeBox').innerHTML = ''; 
    new QRCode(document.getElementById('qrcodeBox'), { text: qrString, width: 200, height: 200 });
}

function renderCardHTML(guru) {
    return `
        <div class="bg-white border-2 border-blue-600 rounded-xl shadow-lg overflow-hidden w-[300px] text-center break-inside-avoid mb-4">
            <div class="bg-blue-600 text-white py-4">
                <h2 class="font-bold text-xl uppercase tracking-wider">ID CARD GURU</h2>
                <p class="text-sm">AbsenQR Edu</p>
            </div>
            <div class="p-6 flex flex-col items-center">
                <div id="printQR_${guru.id}" class="mb-4 border-4 border-gray-100 p-2 rounded-lg inline-block"></div>
                <h3 class="text-xl font-bold text-gray-800 mb-1">${guru.nama}</h3>
                <p class="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">NIP: ${guru.nip}</p>
            </div>
            <div class="bg-gray-50 py-3 text-xs text-gray-400 border-t">Gunakan QR Code ini untuk absensi</div>
        </div>
    `;
}

export function cetakIDCard(id) {
    const guru = state.mockTeachers.find(t => t.id === id);
    if(!guru) return;
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = renderCardHTML(guru);
    new QRCode(document.getElementById(`printQR_${guru.id}`), { text: guru.qr_code, width: 128, height: 128 });
    setTimeout(() => { window.print(); }, 500);
}

export function cetakSemuaIDCard() {
    if(state.mockTeachers.length === 0) return Swal.fire('Data Kosong', 'Belum ada data guru untuk dicetak.', 'info');
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = ''; 
    state.mockTeachers.forEach(guru => { printArea.innerHTML += renderCardHTML(guru); });
    state.mockTeachers.forEach(guru => { new QRCode(document.getElementById(`printQR_${guru.id}`), { text: guru.qr_code, width: 128, height: 128 }); });
    setTimeout(() => { window.print(); }, 800);
}

export function downloadTemplateGuru() {
    const templateData = [
        { NIP: "19800101", Nama: "Budi Santoso", Sen_Masuk: "07:00", Sen_Pulang: "14:00", Sel_Masuk: "07:00", Sel_Pulang: "14:00" },
        { NIP: "19850202", Nama: "Siti Aminah", Sen_Masuk: "08:00", Sen_Pulang: "12:00", Sel_Masuk: "", Sel_Pulang: "" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Guru");
    XLSX.writeFile(workbook, "Template_Data_Guru.xlsx");
}

export function handleImportGuru(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const workbook = XLSX.read(new Uint8Array(e.target.result), {type: 'array'});
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        let importedCount = 0;
        const daysMap = { "Sen": "Senin", "Sel": "Selasa", "Rab": "Rabu", "Kam": "Kamis", "Jum": "Jumat", "Sab": "Sabtu" };

        jsonData.forEach(row => {
            if (row.NIP && row.Nama) {
                const jadwal = {};
                Object.keys(daysMap).forEach(shortDay => {
                    let m = row[shortDay + "_Masuk"], p = row[shortDay + "_Pulang"];
                    if (m && p) {
                        m = m.toString().trim(); p = p.toString().trim();
                        if(m.length === 4 && m.indexOf(':') === -1) m = "0" + m;
                        if(p.length === 4 && p.indexOf(':') === -1) p = "0" + p;
                        jadwal[daysMap[shortDay]] = { masuk: m, pulang: p };
                    }
                });
                const payload = { nip: row.NIP.toString(), nama: row.Nama.toString(), jadwal: jadwal, qr_code: "QR-GURU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() };
                fetch(`${API_BASE_URL}/teachers.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                .then(() => { importedCount++; });
            }
        });
        document.getElementById('importFile').value = ''; 
        setTimeout(() => {
            triggerRefresh(); 
            if (importedCount > 0) Swal.fire({ icon: 'success', title: 'Import Berhasil!', text: `${importedCount} data diproses ke database.` });
        }, 1500);
    };
    reader.readAsArrayBuffer(file);
}