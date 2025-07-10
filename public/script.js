document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions(); // Muat transaksi saat halaman pertama kali dibuka
});

async function addTransaction() {
    const trxId = document.getElementById('trxId').value;
    const senderId = document.getElementById('senderId').value;
    const receiverId = document.getElementById('receiverId').value;
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;

    if (!trxId || !senderId || !receiverId || !amount || !currency) {
        alert('Mohon isi semua field yang wajib (ID Transaksi, Pengirim, Penerima, Jumlah, Mata Uang)!');
        return;
    }

    try {
        const response = await fetch('/api/transaksi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: trxId,
                id_pengirim: senderId,
                id_penerima: receiverId,
                jumlah: amount,
                mata_uang: currency,
                status: status,
                deskripsi: description
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            clearTransactionForm();
            fetchTransactions(); // Perbarui daftar transaksi
            // Cek saldo pengguna setelah transaksi berhasil (untuk demonstrasi)
            checkUserSaldo(senderId);
            checkUserSaldo(receiverId);
        } else {
            alert(`Error: ${data.error || data.message}`);
        }
    } catch (error) {
        console.error('Error saat menambah transaksi:', error);
        alert('Terjadi kesalahan saat menambah transaksi. Cek konsol.');
    }
}

async function fetchTransactions() {
    const filterSenderId = document.getElementById('filterSenderId').value;
    const filterReceiverId = document.getElementById('filterReceiverId').value;

    let url = '/api/transaksi?';
    if (filterSenderId) {
        url += `id_pengirim=${filterSenderId}&`;
    }
    if (filterReceiverId) {
        url += `id_penerima=${filterReceiverId}`;
    }

    try {
        const response = await fetch(url);
        const transactions = await response.json();
        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = ''; // Kosongkan daftar sebelumnya

        if (transactions.length === 0) {
            transactionList.innerHTML = `<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Tidak ada transaksi ditemukan.</td></tr>`;
            return;
        }

        transactions.forEach(trx => {
            const row = transactionList.insertRow();
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${trx._id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${trx.id_pengirim}</td>
                <td class="px-6 py-4 whitespace-nowrap">${trx.id_penerima}</td>
                <td class="px-6 py-4 whitespace-nowrap">${trx.jumlah.toLocaleString('id-ID')}</td>
                <td class="px-6 py-4 whitespace-nowrap">${trx.mata_uang}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(trx.timestamp).toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(trx.status)}">
                        ${trx.status.charAt(0).toUpperCase() + trx.status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select onchange="updateTransactionStatus('${trx._id}', this.value)" class="p-1 border rounded-md text-sm">
                        <option value="">Ubah Status</option>
                        <option value="berhasil">Berhasil</option>
                        <option value="pending">Pending</option>
                        <option value="gagal">Gagal</option>
                    </select>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error saat mengambil transaksi:', error);
        alert('Terjadi kesalahan saat mengambil riwayat transaksi. Cek konsol.');
    }
}

async function updateTransactionStatus(transactionId, newStatus) {
    if (!newStatus) return; // Jika tidak ada status baru yang dipilih

    try {
        const response = await fetch(`/api/transaksi/${transactionId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_status: newStatus })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchTransactions(); // Perbarui daftar transaksi
        } else {
            alert(`Error: ${data.error || data.message}`);
        }
    } catch (error) {
        console.error('Error saat memperbarui status transaksi:', error);
        alert('Terjadi kesalahan saat memperbarui status transaksi. Cek konsol.');
    }
}

async function checkUserSaldo(userIdFromParam = null) {
    const userId = userIdFromParam || document.getElementById('checkSaldoId').value;
    const saldoResult = document.getElementById('saldoResult');
    saldoResult.textContent = ''; // Kosongkan hasil sebelumnya

    if (!userId) {
        alert('Mohon masukkan ID Pengguna untuk mengecek saldo!');
        return;
    }

    try {
        const response = await fetch(`/api/saldo/${userId}`);
        const data = await response.json();

        if (response.ok) {
            saldoResult.textContent = `Saldo ${data.id_pengguna}: ${data.saldo.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`;
            saldoResult.classList.remove('text-red-500');
            saldoResult.classList.add('text-green-600');
        } else {
            saldoResult.textContent = `Error: ${data.message}`;
            saldoResult.classList.remove('text-green-600');
            saldoResult.classList.add('text-red-500');
        }
    } catch (error) {
        console.error('Error saat mengecek saldo:', error);
        saldoResult.textContent = 'Terjadi kesalahan saat mengecek saldo. Cek konsol.';
        saldoResult.classList.remove('text-green-600');
        saldoResult.classList.add('text-red-500');
    }
}

function clearTransactionForm() {
    document.getElementById('trxId').value = '';
    document.getElementById('senderId').value = '';
    document.getElementById('receiverId').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('currency').value = '';
    document.getElementById('status').value = 'pending';
    document.getElementById('description').value = '';
}

function getStatusClass(status) {
    switch (status) {
        case 'berhasil': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'gagal': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}