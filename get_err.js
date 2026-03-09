import fs from 'fs';
const text = fs.readFileSync('out.txt', 'utf16le');
try {
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const err = JSON.parse(jsonStr);
    fs.writeFileSync('err.txt', err.stack);
} catch (e) {
    fs.writeFileSync('err.txt', text);
}
