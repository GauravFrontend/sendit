document.addEventListener('DOMContentLoaded', async () => {
    const leadsBody = document.getElementById('leads-body');
    const emptyState = document.getElementById('empty-state');
    const table = document.getElementById('leads-table');
    const clearAllBtn = document.getElementById('clear-all');

    async function updateTable() {
        const result = await chrome.storage.local.get({ savedleads: [] });
        const leads = result.savedleads;

        if (leads.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';
        leadsBody.innerHTML = '';

        leads.forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${lead.name || '-'}</td>
                <td>${lead.location || '-'}</td>
                <td>${lead.phone || '-'}</td>
                <td>${lead.email || '-'}</td>
                <td><a href="${lead.profile}" target="_blank" class="profile-link">View</a></td>
                <td class="actions">
                    <span class="btn-delete" data-id="${lead.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                </td>
            `;
            leadsBody.appendChild(tr);
        });

        // Add delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async (e) => {
                const target = e.currentTarget;
                const id = parseInt(target.dataset.id);
                if (isNaN(id)) return;

                const currentData = await chrome.storage.local.get({ savedleads: [] });
                const filtered = currentData.savedleads.filter(l => l.id !== id);
                await chrome.storage.local.set({ savedleads: filtered });
                updateTable();
            };
        });
    }

    clearAllBtn.onclick = async () => {
        if (confirm('Are you sure you want to clear all leads?')) {
            await chrome.storage.local.set({ savedleads: [] });
            updateTable();
        }
    };

    updateTable();
});
