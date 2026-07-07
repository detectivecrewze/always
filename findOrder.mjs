import fs from 'fs';
import path from 'path';
import readline from 'readline';

async function main() {
  const logPath = 'C:\\Users\\aldor\\.gemini\\antigravity\\brain\\11154862-f111-4240-9660-5b2395eb5873\\.system_generated\\logs\\transcript_full.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('ORD-MRAPH155') && line.includes('"type":"USER_INPUT"')) {
      const parsed = JSON.parse(line);
      console.log(parsed.content);
    }
  }
}
main();
