// Puprulez - Complete with Home/Edit/View

// TODO: Replace with your Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://wtdutuviptkwdehdpzhu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZHV0dXZpcHRrd2RlaGRwemh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Mjg4NDQsImV4cCI6MjA5MDQwNDg0NH0.etJwipirdCaTEHS0G10yuBkbNESUark0T8DveeUUO4U';

const _supabase = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
    const name = prompt('🌸 Choose a Username (Rulepage Name):');
    if (!name || !name.trim()) return;
    
    const pageName = name.trim();

    // Check if rulepage already exists in database
    const { data: existing } = await _supabase.from('rulepages').select('name').eq('name', pageName).single();
    
    if (existing) {
        alert('❌ This name is already taken, princess! Try a different one. ✨');
        return;
    }

    const password = prompt('🔑 Create a Password:');
    if (!password) return;

    // Save to Supabase
    const { error } = await _supabase.from('rulepages').insert([
        { name: pageName, pass: password, rules: [], puns: [] }
    ]);

    if (error) {
        alert('❌ Error creating page: ' + error.message);
        return;
    }

    localStorage.setItem(pageName + '_pass', password);
    localStorage.setItem('currentPage', pageName);
    location.href = '?page=' + encodeURIComponent(pageName);
}

async function editPage() {
    const pageName = prompt('🌸 Enter Username:');
    if (!pageName) return;

    const pass = prompt('🔓 Enter Password:');
    
    const { data: pageData } = await _supabase.from('rulepages').select('*').eq('name', pageName).single();
    
    if (pageData && pass === pageData.pass) {
        localStorage.setItem(pageName + '_pass', pass);
        localStorage.setItem('currentPage', pageName);
        location.href = '?page=' + encodeURIComponent(pageName);
    } else {
        alert('❌ Incorrect name or password');
    }
}

async function showEditPage(pageName) {
    const { data: pageData } = await _supabase.from('rulepages').select('*').eq('name', pageName).single();
    if (!pageData) { location.href = '?'; return; }

    const pass = pageData.pass;
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
    const { data: pageData } = await _supabase.from('rulepages').select('*').eq('name', pageName).single();
    
    // If password isn't in URL hash, prompt the user for it
    let pass = urlPass || prompt('🔓 Enter password to view this rulepage:');
    
    if (pass === null) { location.href = '?'; return; } // Go home if canceled

    if (!pageData || pass !== pageData.pass) {
        document.querySelector('.container').innerHTML = '<h1 class="title" style="color:#ff1493;">🔒 LOCKED</h1><p class="subtitle">Wrong password, puppy!</p>';
        return;
    }
    
    const rules = pageData.rules || [];
    const puns = pageData.puns || [];
    
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
    
    await _supabase.from('rulepages').update({ rules, puns }).eq('name', pageName);
    
    console.log('Saved ' + pageName);
    if (showAlert) alert('💖 Changes saved successfully, princess! ✨');
}

async function loadLists(pageName) {
    const { data: pageData } = await _supabase.from('rulepages').select('rules, puns').eq('name', pageName).single();
    if (!pageData) return;

    const rules = pageData.rules || [];
    const puns = pageData.puns || [];

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
