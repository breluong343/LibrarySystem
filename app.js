const API = 'http://localhost:3000/api';

// ── STATE ─────────────────────────────────────────────────────
let currentRole     = 'member';
let currentUsername = '';
let cachedBooks     = [];
let cachedMovies    = [];
let cachedMembers   = [];
let pendingAction   = null;

// ── API HELPER ────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
    try {
        const res  = await fetch(API + url, options);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (err) {
        showToast(err.message, true);
        throw err;
    }
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, isError = false) {
    let t = document.getElementById('_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_toast';
        t.style.cssText = `
            position:fixed; bottom:1.5rem; right:1.5rem;
            color:#fff; padding:0.75rem 1.25rem; border-radius:5px;
            font-family:'Courier New',monospace; font-size:0.9rem;
            z-index:9999; opacity:0; transition:opacity 0.3s;
            box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
        document.body.appendChild(t);
    }
    t.style.background = isError ? '#c0392b' : 'rgba(28,100,0,0.85)';
    t.textContent      = msg;
    t.style.opacity    = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// ── ESCAPE HELPER ─────────────────────────────────────────────
// Prevents single quotes in titles from breaking onclick attributes
function escStr(str) {
    return (str || '').replace(/'/g, "\\'");
}

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
async function handleLogin() {
    const username = document.getElementById('login_username').value.trim();
    const password = document.getElementById('login_password').value;
    const errorEl  = document.getElementById('login_error');
    errorEl.textContent = '';

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password.';
        return;
    }
    try {
        const res  = await fetch(`${API}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.error || 'Invalid username or password.';
            return;
        }
        // Save state
        currentUsername = data.username;

        // Switch pages
        document.getElementById('login_page').style.display = 'none';
        document.getElementById('main_page').style.display  = 'block';

        // Set role dropdown and apply visibility rules
        document.querySelector('.user_role').value = data.role;
        applyRole(data.role);
        showBooks();
    } catch (err) {
        errorEl.textContent = 'Cannot connect to server. Is it running?';
    }
}

function handleReset() {
    document.getElementById('login_username').value  = '';
    document.getElementById('login_password').value  = '';
    document.getElementById('login_error').textContent = '';
}

// ══════════════════════════════════════════════════════════════
// ROLE
// admin  → sees everything
// staff  → sees staff + member elements
// member → sees only member elements
// ══════════════════════════════════════════════════════════════
function applyRole(role) {
    currentRole = role;
    document.querySelectorAll('[data-role]').forEach(el => {
        const required = el.getAttribute('data-role');
        const visible =
            role === 'admin' ? true :
            role === 'staff' ? (required === 'staff' || required === 'member') :
            required === 'member';
        el.style.display = visible ? '' : 'none';
    });
    // Re-render active section so injected buttons also update
    const active = document.querySelector('.section.active');
    if (active) renderSection(active.id);
}

// ══════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════
function showSection(sectionId, tabEl) {
    document.querySelectorAll('.nav_tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');
    document.getElementById(sectionId)?.classList.add('active');
    renderSection(sectionId);
}

function renderSection(id) {
    switch (id) {
        case 'books':           showBooks();    break;
        case 'movies':          showMovies();   break;
        case 'section_members': showMembers();  break;
        case 'section_staffs':  showStaff();    break;
        case 'section_borrows': showBorrows();  break;
        case 'section_holds':   showHolds();    break;
    }
}

// ── OVERLAY HELPERS ───────────────────────────────────────────
function openOverlay(id)  { document.getElementById(id)?.classList.add('open');    }
function closeOverlay(id) { document.getElementById(id)?.classList.remove('open'); }

// ══════════════════════════════════════════════════════════════
// BOOKS
// ══════════════════════════════════════════════════════════════
async function showBooks() {
    const search = document.getElementById('book_search')?.value || '';
    const genre  = document.getElementById('book_genre')?.value  || '';
    const type   = document.getElementById('book_type')?.value   || '';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre)  params.set('genre',  genre);
    if (type)   params.set('type',   type);

    const books = await apiFetch(`/books?${params}`).catch(() => []);
    cachedBooks = books;

    const list = document.getElementById('book_list');
    if (!list) return;

    if (!books.length) {
        list.innerHTML = '<div class="empty"><p>No books found.</p></div>';
        return;
    }

    list.innerHTML = books.map(b => {
        const available = b.Copies > 0;

        // Member only: Borrow if available, Hold if not
        const borrowBtn = available
            ? `<button class="btn btn-primary" data-role="member"
                onclick="openActionOverlay('borrow','book',${b.Book_ID},'${escStr(b.Title)}')">
                Borrow</button>`
            : '';
        const holdBtn = !available
            ? `<button class="btn btn-secondary" data-role="member"
                onclick="openActionOverlay('hold','book',${b.Book_ID},'${escStr(b.Title)}')">
                Hold</button>`
            : '';

        // Staff/Admin only: Edit and Delete
        const editBtn = `<button class="btn btn-secondary" data-role="staff"
            onclick="openEditBook(${b.Book_ID},'${escStr(b.Title)}','${escStr(b.Author)}','${b.Genre}','${b.Type}',${b.Copies})">
            Edit</button>`;
        const delBtn = `<button class="btn btn_danger" data-role="staff"
            onclick="deleteBook(${b.Book_ID})">
            Delete</button>`;

        return `
        <div class="item_card">
            <div class="card_info">
                <p class="card_title">${b.Title}</p>
                <p class="card_text">${b.Author || '—'}</p>
                <p class="card_text">${b.Genre} | ${b.Type}</p>
                <p class="card_copies" style="color:${available ? 'green' : 'red'}">
                    ${available ? 'Available: ' + b.Copies : 'Unavailable'}
                </p>
            </div>
            <div class="card_actions">
                ${borrowBtn}${holdBtn}${editBtn}${delBtn}
            </div>
        </div>`;
    }).join('');

    applyRole(currentRole);
}

async function submitAddBook() {
    const Title  = document.getElementById('new_title').value.trim();
    const Author = document.getElementById('new_author').value.trim();
    const ISBN   = document.getElementById('new_isbn').value.trim();
    const Genre  = document.getElementById('new_genre').value;
    const Type   = document.getElementById('new_type').value;
    const Copies = parseInt(document.getElementById('new_copies').value) || 1;
    if (!Title) return showToast('Title is required', true);

    await apiFetch('/books', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Title, Author, ISBN, Genre, Type, Copies })
    });
    showToast('Book added!');
    closeOverlay('add_book');
    showBooks();
}

function openEditBook(id, title, author, genre, type, copies) {
    document.getElementById('edit_book_id').value     = id;
    document.getElementById('edit_book_title').value  = title;
    document.getElementById('edit_book_author').value = author;
    document.getElementById('edit_book_genre').value  = genre;
    document.getElementById('edit_book_type').value   = type;
    document.getElementById('edit_book_copies').value = copies;
    openOverlay('edit_book_overlay');
}

async function submitEditBook() {
    const id     = document.getElementById('edit_book_id').value;
    const Title  = document.getElementById('edit_book_title').value.trim();
    const Author = document.getElementById('edit_book_author').value.trim();
    const Genre  = document.getElementById('edit_book_genre').value;
    const Type   = document.getElementById('edit_book_type').value;
    const Copies = parseInt(document.getElementById('edit_book_copies').value);
    if (!Title) return showToast('Title is required', true);

    await apiFetch(`/books/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Title, Author, Genre, Type, Copies })
    });
    showToast('Book updated!');
    closeOverlay('edit_book_overlay');
    showBooks();
}

async function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    await apiFetch(`/books/${id}`, { method: 'DELETE' });
    showToast('Book deleted');
    showBooks();
}

// ══════════════════════════════════════════════════════════════
// MOVIES
// ══════════════════════════════════════════════════════════════
async function showMovies() {
    const search = document.getElementById('movie_search')?.value || '';
    const genre  = document.getElementById('movie_genre')?.value  || '';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre)  params.set('genre',  genre);

    const movies = await apiFetch(`/movies?${params}`).catch(() => []);
    cachedMovies = movies;

    const list = document.getElementById('movie_list');
    if (!list) return;

    if (!movies.length) {
        list.innerHTML = '<div class="empty"><p>No movies found.</p></div>';
        return;
    }

    list.innerHTML = movies.map(m => {
        // Member only: movies always borrowable (no Copies limit)
        const borrowBtn = `<button class="btn btn-primary" data-role="member"
            onclick="openActionOverlay('borrow','movie',${m.Movie_ID},'${escStr(m.Title)}')">
            Borrow</button>`;

        // Staff/Admin only
        const editBtn = `<button class="btn btn-secondary" data-role="staff"
            onclick="openEditMovie(${m.Movie_ID},'${escStr(m.Title)}',${m.Year},${m.Rating},'${m.Genre}')">
            Edit</button>`;
        const delBtn = `<button class="btn btn_danger" data-role="staff"
            onclick="deleteMovie(${m.Movie_ID})">
            Delete</button>`;

        return `
        <div class="item_card">
            <div class="card_info">
                <p class="card_title">${m.Title}</p>
                <p class="card_text">${m.Year} | Rating: ${m.Rating}</p>
                <p class="card_text">${m.Genre}</p>
            </div>
            <div class="card_actions">
                ${borrowBtn}${editBtn}${delBtn}
            </div>
        </div>`;
    }).join('');

    applyRole(currentRole);
}

async function submitAddMovie() {
    const Title  = document.getElementById('new_movie_title').value.trim();
    const Year   = parseInt(document.getElementById('new_year').value);
    const Rating = parseFloat(document.getElementById('new_rating').value) || 0;
    const Genre  = document.getElementById('new_movie_genre').value;
    if (!Title) return showToast('Title is required', true);

    await apiFetch('/movies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Title, Year, Rating, Genre })
    });
    showToast('Movie added!');
    closeOverlay('add_movie');
    showMovies();
}

function openEditMovie(id, title, year, rating, genre) {
    document.getElementById('edit_movie_id').value     = id;
    document.getElementById('edit_movie_title').value  = title;
    document.getElementById('edit_movie_year').value   = year;
    document.getElementById('edit_movie_rating').value = rating;
    document.getElementById('edit_movie_genre').value  = genre;
    openOverlay('edit_movie_overlay');
}

async function submitEditMovie() {
    const id     = document.getElementById('edit_movie_id').value;
    const Title  = document.getElementById('edit_movie_title').value.trim();
    const Year   = parseInt(document.getElementById('edit_movie_year').value);
    const Rating = parseFloat(document.getElementById('edit_movie_rating').value);
    const Genre  = document.getElementById('edit_movie_genre').value;
    if (!Title) return showToast('Title is required', true);

    await apiFetch(`/movies/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Title, Year, Rating, Genre })
    });
    showToast('Movie updated!');
    closeOverlay('edit_movie_overlay');
    showMovies();
}

async function deleteMovie(id) {
    if (!confirm('Delete this movie?')) return;
    await apiFetch(`/movies/${id}`, { method: 'DELETE' });
    showToast('Movie deleted');
    showMovies();
}

// ══════════════════════════════════════════════════════════════
// BORROW / HOLD ACTION OVERLAY
// Opens when member clicks Borrow or Hold on a card
// Auto-uses the logged-in member's own account
// ══════════════════════════════════════════════════════════════
async function openActionOverlay(actionType, itemType, itemId, itemTitle) {
    pendingAction = { actionType, itemType, itemId, itemTitle };

    const members = await apiFetch('/members').catch(() => []);
    cachedMembers = members;
    const me = members.find(m => m.Username === currentUsername);

    if (!me) {
        showToast('Could not find your member account', true);
        return;
    }

    // Store member ID in a hidden field
    document.getElementById('action_member_id').value = me.Member_ID;

    document.getElementById('action_overlay_title').textContent =
        actionType === 'borrow' ? 'Borrow Item' : 'Place Hold';
    document.getElementById('action_overlay_item').textContent =
        `"${itemTitle}"`;

    openOverlay('action_overlay');
}

async function submitAction() {
    if (!pendingAction) return;
    const { actionType, itemType, itemId } = pendingAction;
    const memberId = document.getElementById('action_member_id').value;
    const today    = new Date().toISOString().split('T')[0];

    try {
        if (actionType === 'borrow') {
            if (itemType === 'book') {
                await apiFetch('/borrows/books', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Member_ID: memberId, Book_ID: itemId, BorrowDate: today })
                });
            } else {
                await apiFetch('/borrows/movies', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Member_ID: memberId, Movie_ID: itemId, BorrowDate: today })
                });
            }
            showToast(itemType === 'book' ? 'Book borrowed!' : 'Movie borrowed!');
        } else {
            if (itemType === 'book') {
                await apiFetch('/holds/books', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookID: itemId, memberID: memberId })
                });
            } else {
                await apiFetch('/holds/movies', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ movieID: itemId, memberID: memberId })
                });
            }
            showToast('Hold placed!');
        }
        closeOverlay('action_overlay');
        pendingAction = null;
        // Refresh current section
        const active = document.querySelector('.section.active');
        if (active) renderSection(active.id);
    } catch (err) {
        
    }
}

// Members
async function showMembers() {
    const members = await apiFetch('/members').catch(() => []);
    const tbody   = document.getElementById('members_table');
    if (!tbody) return;

    tbody.innerHTML = members.map(m => `<tr>
        <td>${m.Member_ID}</td>
        <td>${m.Username}</td>
        <td>${m.Username}</td>
        <td>${m.Address || '—'}</td>
        <td data-role="admin">
            <button class="btn btn_danger"
                onclick="deleteMember(${m.Member_ID})">Delete</button>
        </td>
    </tr>`).join('');

    applyRole(currentRole);
}

async function deleteMember(id) {
    if (!confirm('Delete this member and all their records?')) return;
    await apiFetch(`/members/${id}`, { method: 'DELETE' });
    showToast('Member deleted');
    showMembers();
}

// Borrows
async function showBorrows() {
    const searchVal = document.getElementById('borrow_search')?.value.toLowerCase() || '';
    const all       = await apiFetch('/borrows').catch(() => []);

    const filtered = all.filter(b => {
        const isMyRecord = currentRole === 'member'
            ? b.MemberName === currentUsername
            : true;
        const matchSearch = !searchVal ||
            b.MemberName?.toLowerCase().includes(searchVal) ||
            b.ItemTitle?.toLowerCase().includes(searchVal);
        return isMyRecord && matchSearch;
    });

    const tbody = document.getElementById('borrows_table');
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No records found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(b => `<tr>
        <td data-role="staff">${b.MemberName}</td>
        <td>${b.ItemTitle} <small style="opacity:0.6">(${b.ItemType})</small></td>
        <td>${b.BorrowDate ? new Date(b.BorrowDate).toLocaleDateString() : '—'}</td>
        <td>
            <button class="btn btn_danger"
                onclick="removeBorrow('${b.ItemType}',${b.Member_ID},${b.ItemType==='Book'?b.Book_ID:b.Movie_ID},'${b.BorrowDate}')">
                Remove</button>
        </td>
    </tr>`).join('');

    applyRole(currentRole);
}

async function removeBorrow(itemType, memberId, itemId, borrowDate) {
    if (!confirm('Remove this record?')) return;
    if (itemType === 'Book') {
        await apiFetch('/borrows/books', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Member_ID: memberId, Book_ID: itemId, BorrowDate: borrowDate })
        });
    } else {
        await apiFetch('/borrows/movies', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Member_ID: memberId, Movie_ID: itemId, BorrowDate: borrowDate })
        });
    }
    showToast('Record removed');
    showBorrows();
}

// ══════════════════════════════════════════════════════════════
// HOLDS
// Members see only their own holds
// Staff/Admin see all holds
// ══════════════════════════════════════════════════════════════
async function showHolds() {
    const all = await apiFetch('/borrows').catch(() => []);

    const filtered = all.filter(h =>
        currentRole === 'member' ? h.MemberName === currentUsername : true
    );

    const tbody = document.getElementById('holds_table');
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No holds found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(h => `<tr>
        <td data-role="staff">${h.MemberName}</td>
        <td>${h.ItemTitle} <small style="opacity:0.6">(${h.ItemType})</small></td>
        <td>${h.BorrowDate ? new Date(h.BorrowDate).toLocaleDateString() : '—'}</td>
        <td>
            <button class="btn btn_danger"
                onclick="removeBorrow('${h.ItemType}',${h.Member_ID},${h.ItemType==='Book'?h.Book_ID:h.Movie_ID},'${h.BorrowDate}')">
                Remove</button>
        </td>
    </tr>`).join('');

    applyRole(currentRole);
}