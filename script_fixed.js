// Princess Rules - Fixed version for Opera GX
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');
    
    // Colors
    const princessColors = ['#ffc0cb', '#ff69b4', '#ffb6c1', '#ff1493', '#fff0f5'];
    
    // Homepage button
    const newRuleBtn = document.getElementById('newRuleBtn');
    if (newRuleBtn) {
        newRuleBtn.style.border = '5px solid gold';
        newRuleBtn.style.boxShadow = '0 0 20px gold';
        newRuleBtn.addEventListener('click', function() {
            console.log('GOLD BUTTON CLICKED!');
            const pageName = prompt('🌸 Princess page name? (e.g. "Bedtime Rules")');
            if (pageName && pageName.trim()) {
                localStorage.setItem('currentPage', pageName.trim());
                window.location.href = '?page=' + encodeURIComponent(pageName.trim());
            }
        });
        console.log('Gold button ready');
    }
    
    // Check for rule page
    const urlParams = new URLSearchParams(window.location.search);
    const pageName = urlParams.get('page') || localStorage.getItem('currentPage');
    if (pageName && document.querySelector('.container')) {
        console.log('Loading rule page:', pageName);
        // Simple rule page for now
        document.querySelector('.container').innerHTML = `
            <div style="max-width:600px;margin:20px auto;padding:30px;background:rgba(255,255,255,0.9);border-radius:20px;text-align:center;">
                <h1 style="color:#ff1493;font-size:2.5em;">👑 ${pageName} 👑</h1>
                <div style="margin:20px 0;">
                    <h3 style="color:#ff69b4;">📜 Rules</h3>
                    <input id="newRule" placeholder="Add rule..." style="padding:10px;margin:5px;width:70%;border:2px solid #ffb6c1;border-radius:10px;">
                    <button onclick="addItem('rules')" style="padding:10px 20px;background:#ff69b4;color:white;border:none;border-radius:10px;">Add</button>
                    <div id="rulesList" style="min-height:60px;border:2px dashed #ffb6c1;border-radius:10px;padding:10px;margin:10px 0;background:#fff5f7;"></div>
                </div>
                <div style="margin:20px 0;">
                    <h3 style="color:#ff69b4;">🍭 Punishments</h3>
                    <input id="newPun" placeholder="Add punishment..." style="padding:10px;margin:5px;width:70%;border:2px solid #ffb6c1;border-radius:10px;">
                    <button onclick="addItem('puns')" style="padding:10px 20px;background:#ff69b4;color:white;border:none;border-radius:10px;">Add</button>
                    <div id="punsList" style="min-height:60px;border:2px dashed #ffb6c1;border-radius:10px;padding:10px;margin:10px 0;background:#fff5f7;"></div>
                </div>
                <button onclick="goHome()" style="padding:15px 30px;background:#ff1493;color:white;border:none;border-radius:25px;font-size:1.2em;margin:10px;">🏰 Back Home</button>
            </div>
        `;
        loadData(pageName);
    }
});

function addItem(type) {
    const inputId = type === 'rules' ? 'newRule' : 'newPun';
    const listId = type === 'rules' ? 'rulesList' : 'punsList';
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (input.value.trim()) {
        const div = document.createElement('div');
        div.style.cssText = 'background:linear-gradient(45deg,#ffc0cb,#ffb6c1);margin:5px 0;padding:10px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;';
        div.innerHTML = input.value.trim() + ' <button onclick="this.parentElement.remove()" style="background:#ff69b4;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">X</button>';
        list.appendChild(div);
        input.value = '';
        saveData(localStorage.getItem('currentPage'));
    }
}

function saveData(pageName) {
    const rules = Array.from(document.querySelectorAll('#rulesList > div')).map(div => div.textContent.replace('X', '').trim());
    const puns = Array.from(document.querySelectorAll('#punsList > div')).map(div => div.textContent.replace('X', '').trim());
    localStorage.setItem(pageName + '_rules', JSON.stringify(rules));
    localStorage.setItem(pageName + '_puns', JSON.stringify(puns));
}

function loadData(pageName) {
    const rules = JSON.parse(localStorage.getItem(pageName + '_rules') || '[]');
    const puns = JSON.parse(localStorage.getItem(pageName + '_puns') || '[]');
    rules.forEach(rule => {
        const div = document.createElement('div');
        div.style.cssText = 'background:linear-gradient(45deg,#ffc0cb,#ffb6c1);margin:5px 0;padding:10px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;';
        div.innerHTML = rule + ' <button onclick="this.parentElement.remove()" style="background:#ff69b4;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">X</button>';
        document.getElementById('rulesList').appendChild(div);
    });
    puns.forEach(pun => {
        const div = document.createElement('div');
        div.style.cssText = 'background:linear-gradient(45deg,#ffc0cb,#ffb6c1);margin:5px 0;padding:10px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;';
        div.innerHTML = pun + ' <button onclick="this.parentElement.remove()" style="background:#ff69b4;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">X</button>';
        document.getElementById('punsList').appendChild(div);
    });
}

function goHome() {
    window.location.href = window.location.pathname;
}

// Inline script - no external file issues
