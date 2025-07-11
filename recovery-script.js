// 🔧 QUICK RECOVERY SCRIPT - Run this in browser console
// Copy and paste this entire script into your browser's console (F12 -> Console tab)

console.log('🔍 Starting content recovery...');

// Function to search and recover content
function recoverNovelContent() {
    let found = [];
    
    // Check localStorage
    console.log('📋 Checking localStorage...');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        if (key && (key.includes('autoGen') || key.includes('quickGen') || key.includes('novel') || key.includes('chapter'))) {
            console.log(`Found in localStorage: ${key}`);
            try {
                const parsed = JSON.parse(value);
                found.push({ source: 'localStorage', key, data: parsed });
            } catch (e) {
                found.push({ source: 'localStorage', key, data: value });
            }
        }
    }
    
    // Check sessionStorage
    console.log('💾 Checking sessionStorage...');
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        
        if (key && (key.includes('autoGen') || key.includes('quickGen') || key.includes('novel') || key.includes('chapter'))) {
            console.log(`Found in sessionStorage: ${key}`);
            try {
                const parsed = JSON.parse(value);
                found.push({ source: 'sessionStorage', key, data: parsed });
            } catch (e) {
                found.push({ source: 'sessionStorage', key, data: value });
            }
        }
    }
    
    // Check current application state (if available)
    console.log('🎯 Checking application state...');
    if (typeof window !== 'undefined') {
        // Try to access React state or global variables
        const reactFiber = document.querySelector('#root')?._reactInternalFiber || 
                          document.querySelector('#root')?._reactInternals;
        
        if (reactFiber) {
            console.log('React app found, checking state...');
            // This would need to traverse the React fiber tree
        }
    }
    
    console.log(`📊 Recovery complete. Found ${found.length} items:`);
    found.forEach((item, index) => {
        console.log(`${index + 1}. ${item.source}.${item.key}:`, item.data);
    });
    
    return found;
}

// Function to download recovered content
function downloadRecoveredContent(chapters, filename = 'recovered_novel.txt') {
    if (!chapters || !Array.isArray(chapters)) {
        console.error('❌ No valid chapters found');
        return;
    }
    
    let content = `RECOVERED NOVEL CONTENT\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Chapters: ${chapters.length}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    chapters.forEach((chapter, index) => {
        content += `CHAPTER ${chapter.chapterNumber || chapter.number || index + 1}: ${chapter.title || 'Untitled'}\n`;
        content += `${'─'.repeat(40)}\n`;
        content += `${chapter.content || 'No content available'}\n\n`;
        content += `${'═'.repeat(50)}\n\n`;
    });
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Downloaded: ${filename}`);
}

// Function to extract chapters from found data
function extractChapters(foundData) {
    for (const item of foundData) {
        const data = item.data;
        
        // Try different possible structures
        if (data.novel && data.novel.chapters) {
            console.log(`📚 Found chapters in ${item.key} -> novel.chapters`);
            return data.novel.chapters;
        }
        
        if (data.chapters && Array.isArray(data.chapters)) {
            console.log(`📚 Found chapters in ${item.key} -> chapters`);
            return data.chapters;
        }
        
        if (data.data && data.data.chapters) {
            console.log(`📚 Found chapters in ${item.key} -> data.chapters`);
            return data.data.chapters;
        }
        
        if (Array.isArray(data) && data.length > 0 && data[0].content) {
            console.log(`📚 Found chapters array in ${item.key}`);
            return data;
        }
    }
    
    return null;
}

// Main recovery process
console.log('🚀 Starting automatic recovery...');
const foundData = recoverNovelContent();

if (foundData.length > 0) {
    const chapters = extractChapters(foundData);
    
    if (chapters) {
        console.log(`✅ RECOVERY SUCCESSFUL! Found ${chapters.length} chapters`);
        console.log('📖 Chapter preview:');
        chapters.slice(0, 3).forEach((ch, i) => {
            console.log(`  Chapter ${ch.chapterNumber || i + 1}: ${ch.title || 'Untitled'} (${ch.content ? ch.content.length : 0} characters)`);
        });
        
        console.log('\n🎯 To download your novel, run:');
        console.log('downloadRecoveredContent(chapters, "my_recovered_novel.txt")');
        
        // Make chapters available globally
        window.recoveredChapters = chapters;
        
        // Auto-download
        const autoDownload = confirm('📥 Download recovered novel now?');
        if (autoDownload) {
            downloadRecoveredContent(chapters);
        }
        
    } else {
        console.log('❌ No chapter content found in recovered data');
        console.log('📋 Available data structures:');
        foundData.forEach((item, i) => {
            console.log(`${i + 1}. ${item.key}:`, Object.keys(item.data));
        });
    }
} else {
    console.log('❌ No novel-related data found in browser storage');
    console.log('💡 The content might have been cleared or expired');
}

console.log('\n🔧 Manual commands available:');
console.log('- recoverNovelContent() // Search for content');
console.log('- downloadRecoveredContent(chapters) // Download chapters');
console.log('- window.recoveredChapters // Access found chapters');
