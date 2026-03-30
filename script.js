// Puprulez - Complete with Home/Edit/View

// TODO: Replace with your Turso SQLite details
const TURSO_URL = 'libsql://puprulez-theprincessvelvet.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ4NDM5NTgsImlkIjoiMDE5ZDNjZjEtNjgwMS03OWIwLWFhYzYtYWYzMTcwNjJlNDJmIiwicmlkIjoiZmFlODFjZTAtZDFjYy00OWM2LWEyZGQtMDMxOWJiNjBmNzQ3In0.QWXgbPycWMiSxRVmlavU8euqVv5UKs82xTNE_6WjhghAx-J3EKzgFM699wW7CRej6wZ_nsU1St7vPEDd87BQCA';

async function runSQL(sql, args = []) {
    const response = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TURSO_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [
                { type: 'execute', stmt: { sql, args } },
                { type: 'close' }
            ]
        })
    });
    const data = await response.json();
    if (data.results && data.results[0].response.result) {
        return data.results[0].response.result;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Always show homepage first
    const container = document.querySelector('.container');
    
    // Add second button
    const editBtn = document.createElement('button');
    editBtn.id = 'editBtn';
    editBtn.className = 'princess-btn';
    editBtn.innerHTML = '🔓 Edit My Rulepage';
    editBtn.style.marginTop = '1rem';
    
    // Create button
    const createBtn = document.getElementById('newRuleBtn');
    createBtn.style.border = '5px solid gold';
    createBtn.style.boxShadow = '0 0 20px gold';
    
    createBtn.onclick = createPage;
    editBtn.onclick = editPage;

    if (container && !location.search) {
        container.appendChild(editBtn);
    }
    
    // Check URL params for direct access
    const urlParams = new URLSearchParams(location.search);
    const editPageName = urlParams.get('page');
    const viewPageName = urlParams.get('view');
    const pass = location.hash.slice(1);
    
    if (viewPageName) {
        showViewPage(viewPageName, pass);
    } else if (editPageName) {
        showEditPage(editPageName);
    }
});

async function createPage() {
    const name = prompt('Choose a Rulepage name:');
    if (!name || !name.trim()) return;
    
    const pageName = name.trim();

    // Check if rulepage already exists in SQLite
    const result = await runSQL('SELECT name FROM rulepages WHERE name = ?', [pageName]);
    
    if (result && result.rows.length > 0) {
        alert('This name is already taken, please choose a different one. Try a different one.');
        return;
    }

    const password = prompt('Create a Password:');
    if (!password) return;

    // Save to SQLite
    await runSQL('INSERT INTO rulepages (name, pass, rules, puns) VALUES (?, ?, "[]", "[]")', [pageName, password]);

    localStorage.setItem(pageName + '_pass', password);
    localStorage.setItem('currentPage', pageName);
    location.href = '?page=' + encodeURIComponent(pageName);
}

async function editPage() {
    const pageName = prompt('Enter Username:');
    if (!pageName) return;

    const pass = prompt('Enter Password:');
    
    const result = await runSQL('SELECT pass FROM rulepages WHERE name = ?', [pageName]);
    const storedPass = result?.rows[0]?.[0];
    
    if (storedPass && pass === storedPass) {
        localStorage.setItem(pageName + '_pass', pass);
        localStorage.setItem('currentPage', pageName);
        location.href = '?page=' + encodeURIComponent(pageName);
    } else {
        alert('❌ Incorrect name or password');
    }
}

async function showEditPage(pageName) {
    const result = await runSQL('SELECT pass FROM rulepages WHERE name = ?', [pageName]);
    if (!result || result.rows.length === 0) { location.href = '?'; return; }

    const pass = result.rows[0][0];
    // Generates full URL without the password hash for a cleaner link
    const viewLink = window.location.origin + window.location.pathname + '?view=' + encodeURIComponent(pageName);
    localStorage.setItem('currentPage', pageName);
    
    document.querySelector('.container').innerHTML = `
        <div class="rule-page">
            <h1 class="main-title">${pageName}</h1>
            
            <div class="info-bar">
                <span>🔑 Password: <code>${pass}</code></span>
                <button onclick="navigator.clipboard.writeText('${viewLink}');alert('Link Copied!')" class="princess-btn" style="font-size:0.8rem; padding:8px 15px;">📋 Copy View Link</button>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <h2>📜 Rules</h2>
                    <div class="input-group">
                        <input id="newRule" placeholder="New rule...">
                        <button onclick="addItem('rules')" class="princess-btn" style="margin:0; padding:10px 20px;">➕</button>
                    </div>
                    <div id="rulesList"></div>
                </div>
                
                <div class="card">
                    <h2>🍭 Punishments</h2>
                    <div class="input-group">
                        <input id="newPun" placeholder="New punishment...">
                        <button onclick="addItem('puns')" class="princess-btn" style="margin:0; padding:10px 20px;">➕</button>
                    </div>
                    <div id="punsList"></div>
                </div>
            </div>
            
            <div style="margin-top: 30px;">
                <button onclick="savePage('${pageName}', true)" class="princess-btn" style="background:var(--deep-pink)">💖 SAVE CHANGES</button>
                <button onclick="location.href='?'" class="princess-btn" style="background:#aaa">🏰 Home</button>
            </div>
        </div>
    `;
    loadLists(pageName);
}

async function showViewPage(pageName, urlPass) {
    const result = await runSQL('SELECT pass, rules, puns FROM rulepages WHERE name = ?', [pageName]);
    
    // If password isn't in URL hash, prompt the user for it
    let pass = urlPass || prompt('Enter password to view this rulepage:');
    
    if (pass === null) { location.href = '?'; return; } // Go home if canceled

    if (!result || result.rows.length === 0 || pass !== result.rows[0][0]) {
        document.querySelector('.container').innerHTML = '<h1 class="title" style="color:#ff1493;">🔒 LOCKED</h1><p class="subtitle">Wrong password, puppy!</p>';
        return;
    }
    
    const rules = JSON.parse(result.rows[0][1] || '[]');
    const puns = JSON.parse(result.rows[0][2] || '[]');

    document.querySelector('.container').innerHTML = `
        <div class="rule-page">
            <h1 class="main-title">${pageName}</h1>
            <p style="color:#ff69b4;font-size:1.5em;">Momma's Rules (Read Only) 💕</p>
            
            <div class="dashboard-grid">
                <div class="card">
                    <h2>📜 Rules</h2>
                    ${rules.map(r => `<div class="rule-item">${r}</div>`).join('') || '<p>No rules 🥰</p>'}
                </div>
                
                <div class="card">
                    <h2>🍭 Punishments</h2>
                    ${puns.map(p => `<div class="punishment-item">${p}</div>`).join('') || '<p>Be good! 👼</p>'}
                </div>
            </div>
            
            <button onclick="location.href='?'" class="princess-btn">🏰 Home</button>
        </div>
    `;
}

function addItem(type) {
    const isRule = type === 'rules';
    const input = document.getElementById('new' + (isRule ? 'Rule' : 'Pun'));
    const list = document.getElementById(type + 'List');
    if (!input || !list) return;
    
    const text = input.value.trim();
    if (text) {
        const item = document.createElement('div');
        const currentPage = localStorage.getItem('currentPage');
        item.className = isRule ? 'rule-item' : 'punishment-item';
        item.innerHTML = `<span>${text}</span> <button class="remove-btn" onclick="this.parentElement.remove(); savePage('${currentPage}')">✕</button>`;
        list.appendChild(item);
        input.value = '';
        savePage(currentPage);
    }
}

async function savePage(pageName, showAlert = false) {
    // More reliable selection using the span tag
    const rules = Array.from(document.querySelectorAll('#rulesList .rule-item span')).map(span => span.textContent.trim());
    const puns = Array.from(document.querySelectorAll('#punsList .punishment-item span')).map(span => span.textContent.trim());
    
    await runSQL('UPDATE rulepages SET rules = ?, puns = ? WHERE name = ?', [JSON.stringify(rules), JSON.stringify(puns), pageName]);
    
    console.log('Saved ' + pageName);
    if (showAlert) alert('💖 Changes saved successfully, princess! ✨');
}

async function loadLists(pageName) {
    const result = await runSQL('SELECT rules, puns FROM rulepages WHERE name = ?', [pageName]);
    if (!result || result.rows.length === 0) return;

    const rules = JSON.parse(result.rows[0][0] || '[]');
    const puns = JSON.parse(result.rows[0][1] || '[]');

    const rulesList = document.getElementById('rulesList');
    const punsList = document.getElementById('punsList');
    
    rules.forEach(rule => {
        const item = document.createElement('div');
        item.className = 'rule-item';
        item.innerHTML = `<span>${rule}</span> <button class="remove-btn" onclick="this.parentElement.remove(); savePage('${pageName}')">✕</button>`;
        rulesList.appendChild(item);
    });
    
    puns.forEach(pun => {
        const item = document.createElement('div');
        item.className = 'punishment-item';
        item.innerHTML = `<span>${pun}</span> <button class="remove-btn" onclick="this.parentElement.remove(); savePage('${pageName}')">✕</button>`;
        punsList.appendChild(item);
    });
}
