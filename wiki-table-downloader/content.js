chrome.storage.local.set({ isActive: false });

const addExportButtons = () => {
  chrome.storage.local.get(['isActive'], (result) => {
    if (!result.isActive) {
      removeButtons();
      sendTableCount(0);
      return;
    }

    const tables = document.querySelectorAll('.wikitable');
    sendTableCount(tables.length);

    tables.forEach((table, index) => {
      if (table.previousElementSibling?.classList.contains('wiki-download-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'wiki-download-wrapper';

      const btn = document.createElement('button');
      btn.innerHTML = 'Export CSV';
      btn.className = 'wiki-download-btn';

      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(btn);

      btn.addEventListener('click', () => {
        btn.classList.add('btn-active-effect');
        const csvData = tableToCSV(table);
        downloadCSV(csvData, `wiki-data-${index + 1}.csv`);
        setTimeout(() => btn.classList.remove('btn-active-effect'), 200);
      });
    });
  });
};

const sendTableCount = (count) => {
  chrome.runtime.sendMessage({ action: "updateCount", count: count });
};

const removeButtons = () => {
  document.querySelectorAll('.wiki-download-wrapper').forEach(el => el.remove());
};

const tableToCSV = (table) => {
  let csv = [];
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    let rowData = [];
    const cols = row.querySelectorAll('td, th');
    cols.forEach(col => {
      let text = col.innerText.replace(/(\r\n|\n|\r)/gm, '').trim();
      text = text.replace(/"/g, '""');
      rowData.push('"' + text + '"');
    });
    csv.push(rowData.join(','));
  });
  return csv.join('\n');
};

const downloadCSV = (csv, filename) => {
  const date = new Date().toISOString().slice(0, 10);
  const dynamicName = `${filename.split('.')[0]}-${date}.csv`;
  
  const csvFile = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const downloadLink = document.createElement('a');
  downloadLink.download = dynamicName;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
};

const observer = new MutationObserver(() => addExportButtons());
observer.observe(document.body, { childList: true, subtree: true });
addExportButtons();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "refresh") addExportButtons();
});