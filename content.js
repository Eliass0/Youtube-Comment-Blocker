let blockedAuthors = [];


// Function to update blocked authors from storage
function updateBlockedAuthors() {
  chrome.storage.sync.get(['blockedAuthors'], (result) => {
    if (result.blockedAuthors) {
      blockedAuthors = result.blockedAuthors;
      console.log('Blocked authors updated:', blockedAuthors);
    }
  });
}

// Call this function initially and also add a listener to update when changed
updateBlockedAuthors();
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedAuthors) {
    updateBlockedAuthors();
  }
});

// Function to scan and remove comments based on the author
function scanAndRemoveComments() {
  try {
	if (blockedAuthors.length === 0) {
      console.log('No authors to block. Skipping comment removal.');
      return; // Exit the function if the list of blocked authors is empty
    }
	if (blockedAuthors.length === 1 && blockedAuthors[0] === "") {
      console.log('No authors to block. Skipping comment removal.');
      return; // Exit the function if the list of blocked authors is empty
    }
    const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');

    console.log(`Found ${commentElements.length} comment elements`);

    commentElements.forEach((element, index) => {
      const authorNameElement = element.querySelector('#header-author');
      if (authorNameElement && blockedAuthors.some(author => authorNameElement.textContent.includes(author))) {
        console.log(`Blocking comment from one of the specified authors, found in element ${index}`);
        element.remove();
      }
    });
  } catch (error) {
    console.error('Error scanning and removing comments:', error);
  }
}

// Delayed initial scan
setTimeout(scanAndRemoveComments, 2000); // Wait for 2 seconds before the first scan

// Function to repeatedly scan for new comments
function continuouslyScanForComments() {
  try {
    // Use MutationObserver to detect when new comments are loaded
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          console.log('New nodes added. Scanning comments again.');
          scanAndRemoveComments();
        }
      });
    });

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Start observing the target node for configured mutations
    const targetNode = document.getElementById('comments');
    if (targetNode) {
      console.log('Starting to observe the comments section.');
      observer.observe(targetNode, config);
    } else {
      console.log('Comments section not found. Retrying in 2 seconds.');
      setTimeout(() => continuouslyScanForComments(), 2000); // Retry after 2 seconds if comments section is not found
    }
  } catch (error) {
    console.error('Error setting up the MutationObserver:', error);
  }
}

// Start the continuous scan
continuouslyScanForComments();
