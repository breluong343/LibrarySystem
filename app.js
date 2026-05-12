const API = 'http://localhost:3000/api';

// States
let currentRole     = 'member'; 
let currentUsername = '';
let currentMemberID = null;    
let cachedBooks     = [];
let cachedMovies    = [];
let pendingAction   = null;

// API
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

// Toast
function showToast(msg, isError = false) {
    let t = document.getElementById('toast');
    t.style.background = isError ? '#c0392b' : 'rgba(28,100,0,0.85)';
    t.textContent      = msg;
    clearTimeout(t._hideTimer);
    t.classList.add('show');
    t._hideTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// Escape
function escStr(str) {
    return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Role Setter
function isStaff() { return currentRole === 'staff'; }

// Login
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
        currentRole     = data.role;       
        currentMemberID = data.memberID;    

        // Switch pages
        document.getElementById('login_page').style.display = 'none';
        document.getElementById('main_page').style.display  = 'block';

        // Show role badge
        document.getElementById('role_label').textContent =
            currentRole === 'staff' ? 'Staff' : 'Member';

        applyNavRole();
        showBooks();
    } catch (err) {
        errorEl.textContent = 'Cannot connect to the server. Please try again!';
    }
}

// Reset btn on Login page
function handleReset() {
    document.getElementById('login_username').value    = '';
    document.getElementById('login_password').value    = '';
    document.getElementById('login_error').textContent = '';
}

// Logout from main page, back to login page
function handleLogout() {
    currentRole     = 'member'; 
    currentUsername = '';
    currentMemberID = null;    
    cachedBooks     = [];
    cachedMovies    = [];
    pendingAction   = null;

    document.getElementById('login_username').value = '';
    document.getElementById('login_password').value    = '';
    document.getElementById('login_error').textContent = '';

    document.querySelector('.user_role').value = 'member';

    document.getElementById('main_page').style.display = 'none';
    document.getElementById('login_page').style.display = 'flex';

    document.getSelectorAll('.nav_tab').forEach(t => t.classList.remove('active'));
    document.getSelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getSelector('.nav_tab').classList.add('active');
    document.getElementById('books')?.classList.add('active');
}

// Apply user role to display on navigation bar
function applyNavRole() {
    document.querySelectorAll('[data-role="staff"]').forEach(el => {
        if (el.classList.contains('section')) return;
        el.style.display = isStaff() ? '' : 'none';
    });
}

// Nav Bar
function showSection(sectionId, tabEl) {
    document.querySelectorAll('.nav_tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');
    document.getElementById(sectionId)?.classList.add('active');
    renderSection(sectionId);
}

function renderSection(id) {
    switch (id) {
        case 'books':           showBooks();   break;
        case 'movies':          showMovies();  break;
        case 'section_members': showMembers(); break;
        case 'section_staffs':  showStaff();   break;
        case 'section_borrows': showBorrows(); break;
        case 'section_holds':   showHolds();   break;
    }
}

// Overlay Sections 
function openOverlay(id)  { document.getElementById(id)?.classList.add('open');    }
function closeOverlay(id) { document.getElementById(id)?.classList.remove('open'); }

// Books

// Show all books
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

    // Show Books page based on roles (staff or member)
    list.innerHTML = books.map(b => {
        const available = b.Copies > 0;
        let actionBtns = '';

        // Staff
        if (isStaff()) {
            actionBtns = `
                <button class="btn btn-secondary"
                    onclick="openEditBook(${b.Book_ID},'${escStr(b.Title)}','${escStr(b.Author)}','${escStr(b.Genre)}','${escStr(b.Type)}',${b.Copies})">
                    Edit</button>
                <button class="btn btn_danger"
                    onclick="deleteBook(${b.Book_ID})">
                    Delete</button>`;
        } else {
            // Member
            actionBtns = available
                ? `<button class="btn btn-primary"
                    onclick="openActionOverlay('borrow','book',${b.Book_ID},'${escStr(b.Title)}')">
                    Borrow</button>`
                : `<button class="btn btn-secondary"
                    onclick="openActionOverlay('hold','book',${b.Book_ID},'${escStr(b.Title)}')">
                    Hold</button>`;
        }

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
            <div class="card_actions">${actionBtns}</div>
        </div>`;
    }).join('');
}

// Handle add book
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

// Open overlay for editing book
function openEditBook(id, title, author, genre, type, copies) {
    document.getElementById('edit_book_id').value     = id;
    document.getElementById('edit_book_title').value  = title;
    document.getElementById('edit_book_author').value = author;
    document.getElementById('edit_book_genre').value  = genre;
    document.getElementById('edit_book_type').value   = type;
    document.getElementById('edit_book_copies').value = copies;
    openOverlay('edit_book_overlay');
}

// Handle edit book
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

// Handle delete book
async function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    await apiFetch(`/books/${id}`, { method: 'DELETE' });
    showToast('Book deleted');
    showBooks();
}

// Movies

// Show all movies
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

    // Show Movies page based on roles (staff or member)
    list.innerHTML = movies.map(m => {
        let actionBtns = '';

        if (isStaff()) {
            actionBtns = `
                <button class="btn btn-secondary"
                    onclick="openEditMovie(${m.Movie_ID},'${escStr(m.Title)}',${m.Year},${m.Rating},'${escStr(m.Genre)}')">
                    Edit</button>
                <button class="btn btn_danger"
                    onclick="deleteMovie(${m.Movie_ID})">
                    Delete</button>`;
        } else {
            actionBtns = `<button class="btn btn-primary"
                onclick="openActionOverlay('borrow','movie',${m.Movie_ID},'${escStr(m.Title)}')">
                Borrow</button>`;
        }

        return `
        <div class="item_card">
            <div class="card_info">
                <p class="card_title">${m.Title}</p>
                <p class="card_text">${m.Year} | Rating: ${m.Rating}</p>
                <p class="card_text">${m.Genre}</p>
            </div>
            <div class="card_actions">${actionBtns}</div>
        </div>`;
    }).join('');
}

// Handle add movie
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

// Open overlay for edit movie
function openEditMovie(id, title, year, rating, genre) {
    document.getElementById('edit_movie_id').value     = id;
    document.getElementById('edit_movie_title').value  = title;
    document.getElementById('edit_movie_year').value   = year;
    document.getElementById('edit_movie_rating').value = rating;
    document.getElementById('edit_movie_genre').value  = genre;
    openOverlay('edit_movie_overlay');
}

// Handle edit movie
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

// Handle delete movie
async function deleteMovie(id) {
    if (!confirm('Delete this movie?')) return;
    await apiFetch(`/movies/${id}`, { method: 'DELETE' });
    showToast('Movie deleted');
    showMovies();
}

//Borrow/Hold

//Open overlay
async function openActionOverlay(actionType, itemType, itemId, itemTitle) {
    if (currentMemberID === null || currentMemberID === undefined) {
        showToast(`"${currentUsername}" has no member record — log in as a member account.`, true);
        return;
    }
    pendingAction = { actionType, itemType, itemId, itemTitle };
    document.getElementById('action_member_id').value = currentMemberID;
    document.getElementById('action_overlay_title').textContent =
        actionType === 'borrow' ? 'Borrow Item' : 'Place Hold';
    document.getElementById('action_overlay_item').textContent = `"${itemTitle}"`;
    openOverlay('action_overlay');
}

//Handle submit button 
async function submitAction() {
    if (!pendingAction) return;
    const { actionType, itemType, itemId } = pendingAction;
    const memberId = document.getElementById('action_member_id').value;
    const today    = new Date().toISOString().split('T')[0];

    try {
        if (actionType === 'borrow') {
            const endpoint = itemType === 'book' ? '/borrows/books' : '/borrows/movies';
            const body = itemType === 'book'
                ? { Member_ID: memberId, Book_ID: itemId, BorrowDate: today }
                : { Member_ID: memberId, Movie_ID: itemId, BorrowDate: today };
            await apiFetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            showToast(itemType === 'book' ? 'Book borrowed!' : 'Movie borrowed!');
        } else {
            const endpoint = itemType === 'book' ? '/holds/books' : '/holds/movies';
            const body = itemType === 'book'
                ? { Book_ID: itemId, Member_ID: memberId }
                : { Movie_ID: itemId, Member_ID: memberId };
            await apiFetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            showToast('Hold placed!');
        }
        closeOverlay('action_overlay');
        pendingAction = null;
        const active = document.querySelector('.section.active');
        if (active) renderSection(active.id);
    } catch (err) {  }
}

// Borrows
// Show all borrows
async function showBorrows() {
    const searchVal = document.getElementById('borrow_search')?.value.toLowerCase() || '';
    const all       = await apiFetch('/borrows').catch(() => []);

    const filtered = all.filter(b => {
        const mine  = currentRole === 'member' ? b.MemberName === currentUsername : true;
        const match = !searchVal ||
            b.MemberName?.toLowerCase().includes(searchVal) ||
            b.ItemTitle?.toLowerCase().includes(searchVal);
        return mine && match;
    });

    const tbody = document.getElementById('borrows_table');
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No records found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        const itemId = b.ItemType === 'Book' ? b.Book_ID : b.Movie_ID;
        return `<tr>
            <td>${isStaff() ? b.MemberName : 'Me'}</td>
            <td>${b.ItemTitle} <small style="opacity:0.6">(${b.ItemType})</small></td>
            <td>${b.BorrowDate ? new Date(b.BorrowDate).toLocaleDateString() : '—'}</td>
            <td>
                <button class="btn btn_danger"
                    onclick="removeBorrow('${b.ItemType}',${b.Member_ID},${itemId},'${b.BorrowDate}')">
                    Remove</button>
            </td>
        </tr>`;
    }).join('');
}

// Handle book/movie return (for borrows)
async function removeBorrow(itemType, memberId, itemId, borrowDate) {
    if (!confirm('Remove this borrow?')) return;
    const date = new Date(borrowDate).toISOString().split('T')[0];

    const endpoint = itemType === 'Book' ? '/borrows/books' : '/borrows/movies';
    const body = itemType === 'Book'
        ? { Member_ID: memberId, Book_ID: itemId, BorrowDate: date }
        : { Member_ID: memberId, Movie_ID: itemId, BorrowDate: date };
    try {
        await apiFetch(endpoint, {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        showToast('Borrow removed');
        await showBorrows();
    } catch {

    }
}

// Holds
// Show all holds
async function showHolds() {
    const all = await apiFetch('/holds').catch(() => []);
    const filtered = all.filter(h =>
        currentRole === 'member' ? h.MemberName === currentUsername : true
    );

    const tbody = document.getElementById('holds_table');
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No holds found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(h => {
        const itemId = h.ItemType === 'Book' ? h.Book_ID : h.Movie_ID;
        return `<tr>
            <td>${isStaff() ? h.MemberName : 'Me'}</td>
            <td>${h.ItemTitle} <small style="opacity:0.6">(${h.ItemType})</small></td>
            <td>${h.BorrowDate ? new Date(h.BorrowDate).toLocaleDateString() : '—'}</td>
            <td>
                <button class="btn btn_danger"
                    onclick="removeHold(${h.Member_ID},${itemId},'${h.BorrowDate}')">
                    Remove</button>
            </td>
        </tr>`;
    }).join('');
}

// Hanle book hold return
async function removeHold(memberId, itemId, borrowDate) {
    if (!confirm('Remove this hold?')) return;
    const date = new Date(borrowDate).toISOString().split('T')[0];
    const body = { Member_ID: memberId, Book_ID: itemId, BorrowDate: date };
    await apiFetch('/holds/books', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    showToast('Hold removed');
    showHolds();
}

// Staff (staffs access only)
// Show all staffs
async function showStaff() {
    const rows = await apiFetch('/staff').catch(() => []);
    const tbody = document.getElementById('staff_table');
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No staff found.</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map(s => `<tr>
        <td>${s.Staff_ID}</td>
        <td>${s.Name}</td>
        <td>${s.Role}</td>
        <td>${s.HoursWorked}</td>
        <td>${s.Address || '—'}</td>
        <td>
            <button class="btn btn_danger"
                onclick="deleteStaff(${s.Staff_ID})">Delete</button>
        </td>
    </tr>`).join('');
}

// Delete a staff 
async function deleteStaff(id) {
    if (!confirm('Delete this staff?')) return;
    await apiFetch(`/staff/${id}`, { method: 'DELETE' });
    showToast('Staff deleted');
    showStaff();
}

// Handle add staff
async function submitAddStaff() {
    const Role = document.getElementById('new_staff_role').value;
    const HoursWorked = parseFloat(document.getElementById('new_staff_hours').value);
    const Name = document.getElementById('new_staff_name').value.trim();
    const Username  = document.getElementById('new_staff_username').value.trim();
    const Address   = document.getElementById('new_staff_address').value;
    const Password = document.getElementById('new_staff_password').value;
    const Location  = document.getElementById('new_staff_location').value;
    if (!HoursWorked) return showToast('Number of worked hours is required', true);
    if (!Name) return showToast('Name is required', true);
    if (!Username) return showToast('Username is required', true);
    if (!Address) return showToast('Address is required', true);
    if (!Password) return showToast('Password is required', true);
    if (!Location) return showToast('Location is required', true);

    await apiFetch('/staff', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Role, HoursWorked, Name, Address, Username, Password, Location })
    });
    showToast('Staff added!');
    closeOverlay('add_staff');
    showStaff();
}

// Members (staffs access only)
// Show all members
async function showMembers() {
    const search = document.getElementById('member_search')?.value || '';
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const members = await apiFetch(`/members?${params}`).catch(() => []);
    cachedMembers = members;

    const tbody = document.getElementById('members_table');
    if (!tbody) return;

    if (!members.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No members found.</td></tr>';
        return;
    }

    tbody.innerHTML = members.map(m => {
        let actionBtns = `<button class="btn btn_danger"
                    onclick="deleteMember(${m.Member_ID})">
                    Delete</button>`;

        return `
        <tr>
            <td>${m.Member_ID}</td>
            <td>${m.Username}</td>
            <td>${m.Address || '—'}</td>
            <td>${actionBtns}</td>
        </tr>`
    }).join('');
}

// Handle add member
async function submitAddMember() {
    const Username  = document.getElementById('new_member_username').value.trim();
    const Address   = document.getElementById('new_member_address').value;
    const Password = document.getElementById('new_member_password').value;
    const Location  = document.getElementById('new_member_location').value;
    if (!Username) return showToast('Username is required', true);
    if (!Address) return showToast('Address is required', true);
    if (!Password) return showToast('Password is required', true);
    if (!Location) return showToast('Location is required', true);

    await apiFetch('/members', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username, Address, Password, Location })
    });
    showToast('Member added!');
    closeOverlay('add_member');
    showMembers();
}

// Handle delete member
async function deleteMember(id) {
    if (!confirm('Delete this member and all their records?')) return;
    await apiFetch(`/members/${id}`, { method: 'DELETE' });
    showToast('Member deleted');
    showMembers();
}