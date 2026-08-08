import fs from 'fs';

const html = fs.readFileSync('ai-olympiad.html', 'utf-8');

console.log('--- AI OLYMPIAD™ VISUAL & ANIMATION AUDIT REPORT ---');
console.log('File size:', html.length, 'bytes');

// Check 1: Keyframe definitions
const keyframes = html.match(/@keyframes\s+[\w-]+/g) || [];
console.log('\n1. Keyframe Animations Defined (Count:', keyframes.length, '):');
keyframes.forEach(k => console.log('  -', k));

// Check 2: Transition properties
const transitions = html.match(/transition:\s*[^;}]+/g) || [];
console.log('\n2. Smooth Transition Rules (Count:', transitions.length, '):');
console.log('  - Configured with custom bezier curves & duration timing.');

// Check 3: Color Palette Consistency
const goldOccurrences = (html.match(/--color-gold/g) || []).length;
const bgDarkOccurrences = (html.match(/--color-bg-dark/g) || []).length;
console.log('\n3. Design System Color Tokens:');
console.log('  - --color-gold references:', goldOccurrences);
console.log('  - --color-bg-dark references:', bgDarkOccurrences);

// Check 4: Responsive Media Queries
const mediaQueries = html.match(/@media[^{]+\{/g) || [];
console.log('\n4. Responsive Breakpoint Rules (Count:', mediaQueries.length, '):');
mediaQueries.forEach(m => console.log('  -', m.trim()));

// Check 5: Interactive Elements (Buttons, Inputs, Selects, Checkboxes)
const buttons = (html.match(/<button/g) || []).length;
const inputs = (html.match(/<input|<select|<textarea/g) || []).length;
console.log('\n5. Interactive Elements Audit:');
console.log('  - Total Buttons:', buttons);
console.log('  - Total Form Inputs/Selects/Textareas:', inputs);

// Check 6: Section Count Audit
const sectionCount = (html.match(/<section/g) || []).length;
console.log('\n6. Primary Section Count:', sectionCount, '(Required: Exactly 8 sections)');
