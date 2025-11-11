//PAGE DETECTION
if (document.getElementById('searchBtn')) {
  document.getElementById('searchBtn').addEventListener('click', searchBooks);
}

let readingList = JSON.parse(localStorage.getItem('readingList')) || [];

//SEARCH BOOKS
function searchBooks() {
  const author = document.getElementById('authorSearch').value.trim();
  if (!author) return alert("Please enter an author name!");
  
  const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';
      if (data.docs.length === 0) {
        resultsDiv.innerHTML = '<p>No books found.</p>';
        return;
      }

      data.docs.slice(0, 30).forEach(book => {
        const card = document.createElement('div');
        card.classList.add('card');

        const title = book.title || 'Unknown Title';
        const authorName = book.author_name ? book.author_name.join(', ') : 'Unknown';
        const edition = book.edition_count || 'N/A';
        const publishYear = book.first_publish_year || 'N/A';
        const ebook = book.ebook_count_i > 0 ? 'Available' : 'Not Available';

        card.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Author:</strong> ${authorName}</p>
          <p><strong>Edition:</strong> ${edition}</p>
          <p><strong>Published:</strong> ${publishYear}</p>
          <p><strong>E-book:</strong> ${ebook}</p>
          <button onclick='addBook(${JSON.stringify({
            title,
            author: authorName,
            edition,
            publishYear,
            ebook
          }).replace(/"/g, '&quot;')})'>Add to Reading List</button>
        `;
        resultsDiv.appendChild(card);
      });
    });
}

//ADD BOOK
function addBook(book) {
  if (readingList.find(b => b.title === book.title && b.author === book.author)) {
    alert("Book already in reading list!");
    return;
  }

  book.read = false;
  book.summary = "";
  readingList.push(book);
  saveList();
  alert("Book added to reading list!");
}

//DISPLAY READING LIST
function showReadingList() {
  const listDiv = document.getElementById('readingList');
  if (!listDiv) return;
  listDiv.innerHTML = '';

  if (readingList.length === 0) {
    listDiv.innerHTML = '<p>No books added yet.</p>';
    return;
  }

  readingList.forEach((book, i) => {
    const card = document.createElement('div');
    card.classList.add('card');
    if (book.read) card.classList.add('read');

    card.innerHTML = `
      <h3>${book.title}</h3>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Edition:</strong> ${book.edition}</p>
      <p><strong>Year:</strong> ${book.publishYear}</p>
      <p><strong>E-book:</strong> ${book.ebook}</p>
      <p><strong>Status:</strong> ${book.read ? 'Read' : 'Not Read'}</p>
      <textarea placeholder="Add your summary..." 
        oninput="updateSummary(${i}, this.value)">${book.summary || ''}</textarea>
      <button onclick="toggleRead(${i})">${book.read ? 'Mark Unread' : 'Mark as Read'}</button>
      <button onclick="deleteBook(${i})" style="background-color:#ef4444;">Delete</button>
    `;
    listDiv.appendChild(card);
  });
}
 
//TOGGLE READ
function toggleRead(i) {
  readingList[i].read = !readingList[i].read;
  saveList();
  showReadingList();
}

//UPDATE SUMMARY
function updateSummary(i, text) {
  readingList[i].summary = text;
  saveList();
}

//DELETE BOOK
function deleteBook(i) {
  if (confirm("Remove this book?")) {
    readingList.splice(i, 1);
    saveList();
    showReadingList();
  }
}

//SAVE
function saveList() {
  localStorage.setItem('readingList', JSON.stringify(readingList));
}

//LOAD READING LIST PAGE
showReadingList();
