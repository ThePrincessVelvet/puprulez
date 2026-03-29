// Puprulez - Complete with Home/Edit/View
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
    const pageName = urlParams.get('page');
    const isView = urlParams.get('view');
    const pass = location.hash.slice(1);
    
    if (pageName) {
        if (isView) {
            showViewPage(pageName, pass);
        } else {
            showEditPage(pageName);
        }
    }
});

function randomPass() {
    return Math.random().toString(36).substring(2,11).toUpperCase();
}

function createPage() {
    const name = prompt('🌸 Page name:');
    if (!name || !name.trim()) return;
    
    const pageName = name.trim();
    const password = randomPass();
    localStorage.setItem('currentPage', pageName);
    localStorage.setItem(pageName + '_pass', password);
    
    location.href = '?page=' + encodeURIComponent(pageName);
}

function editPage() {
    const pageName = prompt('🌸 Enter your Page Name:');
    if (!pageName) return;

    const pass = prompt('🔓 9-char password:');
    const storedPass = localStorage.getItem(pageName + '_pass');
    
    if (storedPass && pass === storedPass) {
        localStorage.setItem('currentPage', pageName);
        location.href = '?page=' + encodeURIComponent(pageName);
    } else {
        alert('❌ Incorrect name or password');
    }
}

function showEditPage(pageName) {
    const pass = localStorage.getItem(pageName + '_pass');
    const viewLink = location.pathname + '?view=' + encodeURIComponent(pageName) + '#' + pass;
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
                <button onclick="savePage('${pageName}')" class="princess-btn" style="background:var(--deep-pink)">💖 SAVE CHANGES</button>
                <button onclick="location.href='?'" class="princess-btn" style="background:#aaa">🏰 Home</button>
            </div>
        </div>
    `;
    loadLists(pageName);
}

function showViewPage(pageName, pass) {
    const storedPass = localStorage.getItem(pageName + '_pass');
    if (!storedPass || pass !== storedPass) {
        document.querySelector('.container').innerHTML = '<h1 class="title" style="color:#ff1493;">🔒 LOCKED</h1><p class="subtitle">Wrong password, puppy!</p>';
        return;
    }
    
    const rules = JSON.parse(localStorage.getItem(pageName + '_rules') || '[]');
    const puns = JSON.parse(localStorage.getItem(pageName + '_puns') || '[]');
    
    document.querySelector('.container').innerHTML = `
        <div class="rule-page">
            <h1 class="main-title">${pageName}</h1>
            <p style="color:#ff69b4;font-size:1.5em;">Momma\\'s Rules (Read Only) 💕</p>
            
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
    const input = document.getElementById('new' + (type === 'rules' ? 'Rule' : 'Pun'));
    const list = document.getElementById(type + 'List');
    if (!input || !list) return;
    
    const text = input.value.trim();
    if (text) {
        const item = document.createElement('div');
        item.className = type + '-item';
        item.innerHTML = `<span>${text}</span> <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>`;
        list.appendChild(item);
        input.value = '';
        savePage(localStorage.getItem('currentPage'));
    }
}

function savePage(pageName) {
    const rules = Array.from(document.querySelectorAll('#rulesList .rule-item')).map(item => item.textContent.replace('✕', '').trim());
    const puns = Array.from(document.querySelectorAll('#punsList .punishment-item')).map(item => item.textContent.replace('✕', '').trim());
    localStorage.setItem(pageName + '_rules', JSON.stringify(rules));
    localStorage.setItem(pageName + '_puns', JSON.stringify(puns));
    console.log('Saved ' + pageName);
}

function loadLists(pageName) {
    const rules = JSON.parse(localStorage.getItem(pageName + '_rules') || '[]');
    const puns = JSON.parse(localStorage.getItem(pageName + '_puns') || '[]');
    
    const rulesList = document.getElementById('rulesList');
    const punsList = document.getElementById('punsList');
    
    rules.forEach(rule => {
        const item = document.createElement('div');
        item.className = 'rule-item';
        item.innerHTML = `<span>${rule}</span> <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>`;
        rulesList.appendChild(item);
    });
    
    puns.forEach(pun => {
        const item = document.createElement('div');
        item.className = 'punishment-item';
        item.innerHTML = `<span>${pun}</span> <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>`;
        punsList.appendChild(item);
    });
}
