import fs from 'fs';
import path from 'path';

const files = [
  'index.html',
  'live.html',
  'passport.html',
  'academy.html',
  'projects.html',
  'ai-olympiad.html',
  'about.html',
  'verify.html',
  'contact.html',
  'email_invitation.html'
];

let output = '# 📄 AI PASSPORT™ — COMPLETE WORD-FOR-WORD WEBSITE & EMAIL CONTENT\n\n';

function cleanText(html) {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n### $1\n\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1');
  text = text.replace(/<div[^>]*>/gi, '\n');
  text = text.replace(/<\/?[^>]+(>|$)/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&bull;/g, '•');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&rarr;/g, '→');
  text = text.replace(/&darr;/g, '↓');
  text = text.replace(/&check;/g, '✓');
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&rdquo;/g, '"');
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
}

files.forEach(file => {
  const filePath = path.join('c:\\Users\\HP\\Downloads\\AIPASS', file);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanText(html);
    output += '==================================================\n';
    output += '## PAGE: ' + file.toUpperCase() + '\n';
    output += '==================================================\n\n';
    output += cleaned + '\n\n';
  }
});

const outPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\76d35b5e-e2bf-4427-89bb-92ee95385519\\complete_website_content_word_to_word.md';
fs.writeFileSync(outPath, output, 'utf8');
console.log('Saved word-to-word text to:', outPath, 'Total bytes:', output.length);
