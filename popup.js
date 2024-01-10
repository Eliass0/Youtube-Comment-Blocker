document.getElementById('save').addEventListener('click', () => {
  const authors = document.getElementById('authors').value.split(',').map(s => s.trim());
  chrome.storage.sync.set({ blockedAuthors: authors }, () => {
    console.log('Blocked authors saved:', authors);
    alert('Settings saved!');
  });
});

// Load saved authors when popup opens
window.onload = () => {
  chrome.storage.sync.get(['blockedAuthors'], (result) => {
    if (result.blockedAuthors) {
      document.getElementById('authors').value = result.blockedAuthors.join(', ');
    }
  });
};
