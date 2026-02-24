document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [Send It] Popup Opened');
    console.log('📍 [Send It] API Backend:', "https://unsymptomatical-nonperverted-jacinta.ngrok-free.dev");

    const table = document.getElementById('leads-table');
    const tableLoader = document.getElementById('table-loader');
    const clearAllBtn = document.getElementById('clear-all');
    const syncBtn = document.getElementById('sync-sheets');
    const refreshBtn = document.getElementById('refresh-data');
    const leadsBody = document.getElementById('leads-body');
    const emptyState = document.getElementById('empty-state');

    const API_BASE_URL = "https://unsymptomatical-nonperverted-jacinta.ngrok-free.dev"; // Sync via ngrok for production

    refreshBtn.onclick = () => {
        console.log('🔄 [Send It] Manual data refresh triggered');
        updateTable();
    };

    async function updateTable() {
        console.log('🔌 [Send It] Fetching data from:', `${API_BASE_URL}/api/sheets/sync`);
        tableLoader.style.display = 'flex';
        table.style.display = 'none';
        emptyState.style.display = 'none';
        const localResult = await chrome.storage.local.get({ savedleads: [] });
        let localLeads = localResult.savedleads;
        let sheetLeads = [];

        try {
            // Fetch entries from Google Sheets
            const response = await fetch(`${API_BASE_URL}/api/sheets/sync`);
            console.log('📡 [Send It] Fetch Status:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                const allSheetLeads = data.leads || [];
                // Take only the latest 10 leads from the sheet
                sheetLeads = allSheetLeads.slice(-10).reverse();
                console.log(`✅ [Send It] Received ${allSheetLeads.length} total, displaying latest ${sheetLeads.length} leads from Sheets`);
            } else {
                console.error('❌ [Send It] Backend returned error:', response.status);
            }
        } catch (error) {
            console.error('❌ [Send It] Network/Fetch Error:', error);
        }

        // Deduplication: If a local lead's profile exists in sheets, mark it synced or remove it
        // We use profile URL as a unique identifier
        const sheetProfiles = new Set(sheetLeads.map(l => l.profile));
        let storageUpdated = false;

        localLeads = localLeads.map(l => {
            if (!l.synced && sheetProfiles.has(l.profile)) {
                storageUpdated = true;
                return { ...l, synced: true };
            }
            return l;
        });

        if (storageUpdated) {
            await chrome.storage.local.set({ savedleads: localLeads });
        }

        // Filter out local leads that are already in sheets to avoid duplicates in the UI
        const unsyncedLocal = localLeads.filter(l => !l.synced);

        // Combine: Unsynced local on TOP, then all sheet leads
        const displayLeads = [...unsyncedLocal, ...sheetLeads];

        tableLoader.style.display = 'none'; // Hide loader after data is processed

        if (displayLeads.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            syncBtn.disabled = true;
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        // Button enabled if there are any unsynced local leads
        syncBtn.disabled = unsyncedLocal.length === 0;

        leadsBody.innerHTML = '';

        displayLeads.forEach(lead => {
            const tr = document.createElement('tr');
            let timeStr = '-';

            if (lead.timestamp) {
                timeStr = new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (lead.time) {
                timeStr = lead.time.split(',')[1]?.trim() || lead.time;
            }

            const statusBadge = lead.synced
                ? '<span class="badge-synced">Synced</span>'
                : '<span class="badge-pending">To be drafted</span>';

            tr.innerHTML = `
                <td>${lead.name || '-'}</td>
                <td>${lead.email || '-'}</td>
                <td>${statusBadge}</td>
                <td class="time-cell">${timeStr}</td>
                <td><a href="${lead.profile}" target="_blank" class="profile-link">View</a></td>
                <td class="actions">
                    ${!lead.synced ? `
                    <span class="btn-delete" data-id="${lead.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>` : ''}
                </td>
            `;
            leadsBody.appendChild(tr);
        });

        // Add delete listeners (only for local unsynced leads)
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async (e) => {
                const target = e.currentTarget;
                const id = target.dataset.id;

                const currentData = await chrome.storage.local.get({ savedleads: [] });
                const filtered = currentData.savedleads.filter(l => l.id.toString() !== id.toString());
                await chrome.storage.local.set({ savedleads: filtered });
                updateTable();
            };
        });
    }

    syncBtn.onclick = async () => {
        const result = await chrome.storage.local.get({ savedleads: [] });
        const allLeads = result.savedleads;
        const leadsToSync = allLeads.filter(l => !l.synced);

        if (leadsToSync.length === 0) {
            alert('All local leads are already synced.');
            return;
        }

        syncBtn.disabled = true;
        syncBtn.innerHTML = 'Syncing...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/sheets/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: leadsToSync })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sync');
            }

            // Mark leads as synced in storage
            const updatedLeads = allLeads.map(l => {
                const syncedLead = leadsToSync.find(sl => sl.id === l.id);
                if (syncedLead) {
                    return { ...l, synced: true };
                }
                return l;
            });
            await chrome.storage.local.set({ savedleads: updatedLeads });

            await updateTable();
            alert(data.message || 'Sync successful!');
        } catch (error) {
            console.error('Sync error:', error);
            alert('Error: ' + error.message);
        } finally {
            syncBtn.disabled = false;
            syncBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Sync
            `;
        }
    };

    clearAllBtn.onclick = async () => {
        if (confirm('Are you sure you want to clear local draft leads? (Sheet leads will remain)')) {
            const currentData = await chrome.storage.local.get({ savedleads: [] });
            const cleared = currentData.savedleads.filter(l => l.synced);
            await chrome.storage.local.set({ savedleads: cleared });
            updateTable();
        }
    };

    updateTable();
});
