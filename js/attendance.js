// ================= DATA ABSENSI & LAPORAN =================
import { API_BASE_URL, state, triggerRefresh } from './state.js';
import { closeModalIzin } from './utils.js';

export function openModalIzin() {
    document.getElementById('modalIzin').classList.remove('hidden');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('izinTanggalMulai').value = today;
    document.getElementById('izinTanggalSelesai').value = today;
    const selectGuru = document.getElementById('izinGuru');
    selectGuru.innerHTML = '<option value="">-- Pilih Guru --</option>';
    state.mockTeachers.forEach(t => { selectGuru.innerHTML += `<option value="${t.id}">${t.nip} - ${t.nama}</option>`; });
}

export function saveIzin(e) {
    e.preventDefault();
    const guruId = document.getElementById('izinGuru').value;
    const startDate = document.getElementById('izinTanggalMulai').value;
    const endDate = document.getElementById('izinTanggalSelesai').value;

    if(!guruId) return alert("Pilih guru terlebih dahulu!");
    if (new Date(startDate) > new Date(endDate)) return Swal.fire({ icon: 'error', title: 'Tanggal Tidak Valid', text: 'Tanggal mulai tidak boleh lebih dari tanggal selesai.' });

    const payload = {
        teacher_id: guruId, start_date: startDate, end_date: endDate,
        status: document.getElementById('izinStatus').value, keterangan: document.getElementById('izinKeterangan').value
    };

    fetch(`${API_BASE_URL}/izin.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            closeModalIzin();
            triggerRefresh(); 
            Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Status manual berhasil dikirim.', timer: 2000, showConfirmButton: false });
        } else { Swal.fire('Error', data.message, 'error'); }
    });
}

function generateMonthlyReportData(filterMonthStr) {
    if (!filterMonthStr) return [];
    const [yearStr, monthStr] = filterMonthStr.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; 

    const reportData = [];
    const actualRecords = state.mockAttendance.filter(a => a.tanggal.startsWith(filterMonthStr));
    reportData.push(...actualRecords);

    const startDate = new Date(year, month, 1);
    const today = new Date(); today.setHours(0,0,0,0);
    if (startDate > today) return reportData.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const endDate = lastDayOfMonth < today ? lastDayOfMonth : today;
    const daysMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const hariName = daysMap[d.getDay()];

        state.mockTeachers.forEach(guru => {
            if (guru.jadwal && typeof guru.jadwal === 'object' && guru.jadwal[hariName]) {
                if (!actualRecords.some(a => a.teacher_id == guru.id && a.tanggal === dateString)) {
                    reportData.push({ teacher_id: guru.id, tanggal: dateString, jam_masuk: '-', jam_pulang: '-', status: 'Alpha' });
                }
            }
        });
    }
    reportData.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
    return reportData;
}

export function renderAbsensi() {
    const tbody = document.getElementById('tableAbsensiBody');
    tbody.innerHTML = '';
    
    const filterMonth = document.getElementById('filterMonth').value; 
    const finalReportData = generateMonthlyReportData(filterMonth);
    const totalRows = finalReportData.length;

    if(totalRows === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-6 text-gray-500 italic">Belum ada aktivitas absensi di bulan ini</td></tr>`;
        document.getElementById('pageInfo').innerText = `Menampilkan 0 dari 0 data`;
        document.getElementById('btnPrevPage').disabled = true; document.getElementById('btnNextPage').disabled = true;
        return;
    }

    const totalPages = Math.ceil(totalRows / state.rowsPerPage);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedData = finalReportData.slice(startIndex, endIndex);

    paginatedData.forEach(a => {
        const guru = state.mockTeachers.find(t => t.id == a.teacher_id);
        const nama = guru ? guru.nama : 'Unknown';
        const jamPulang = a.jam_pulang ? a.jam_pulang : '<span class="text-gray-400 italic text-xs">Belum Pulang</span>';
        const dateObj = new Date(a.tanggal);
        const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][dateObj.getDay()];
        
        let statusBadge = '';
        if(a.status) {
            a.status.split(' | ').forEach(st => {
                if(st.includes('Terlambat') || st.includes('Awal') || st.includes('Alpha')) statusBadge += `<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold block mb-1">${st}</span>`;
                else if (st.includes('Sakit') || st.includes('Izin') || st.includes('Cuti') || st.includes('Dinas')) statusBadge += `<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold block mb-1">${st}</span>`;
                else if (st !== '') statusBadge += `<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold block mb-1">${st}</span>`;
            });
        }

        tbody.innerHTML += `<tr class="border-b hover:bg-gray-50 text-sm"><td class="p-3 align-top">${a.tanggal}</td><td class="p-3 align-top font-medium text-gray-600">${namaHari}</td><td class="p-3 font-medium align-top">${nama}</td><td class="p-3 font-bold text-gray-700 align-top text-center">${a.jam_masuk}</td><td class="p-3 font-bold text-gray-700 align-top text-center">${jamPulang}</td><td class="p-3 align-top">${statusBadge}</td></tr>`;
    });

    document.getElementById('pageInfo').innerText = `Menampilkan ${startIndex + 1} - ${Math.min(endIndex, totalRows)} dari ${totalRows} data`;
    document.getElementById('btnPrevPage').disabled = state.currentPage === 1;
    document.getElementById('btnNextPage').disabled = state.currentPage === totalPages;
}

export function changePage(step) { state.currentPage += step; renderAbsensi(); }

export function exportToExcel() {
    const filterMonth = document.getElementById('filterMonth').value;
    const finalReportData = generateMonthlyReportData(filterMonth);
    
    if(finalReportData.length === 0) return Swal.fire({ icon: 'info', title: 'Data Kosong', text: 'Tidak ada data untuk diexport pada bulan ini.' });

    Swal.fire({ title: 'Menyiapkan Data...', html: 'Sedang membuat file Excel, mohon tunggu.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

    setTimeout(() => {
        const formattedData = finalReportData.map(a => {
            const guru = state.mockTeachers.find(t => t.id == a.teacher_id);
            const dateObj = new Date(a.tanggal);
            return { "Tanggal": a.tanggal, "Hari": ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][dateObj.getDay()], "NIP": guru ? guru.nip : '-', "Nama Guru": guru ? guru.nama : 'Unknown', "Jam Masuk": a.jam_masuk, "Jam Pulang": a.jam_pulang || 'Belum Pulang', "Keterangan": a.status };
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        worksheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 35 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Absensi");
        XLSX.writeFile(workbook, `Laporan_Absensi_${filterMonth}.xlsx`);
        Swal.fire({ icon: 'success', title: 'Export Berhasil!', text: 'File Excel telah berhasil diunduh.', timer: 2000, showConfirmButton: false });
    }, 800);
}