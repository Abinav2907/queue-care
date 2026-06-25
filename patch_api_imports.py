from pathlib import Path
import re
root = Path('apps/api/src')
pattern = re.compile(r'(?P<prefix>\b(?:from|export\s+\*)\s+)(?P<quote>["\'])(?P<path>\.{1,2}/[^"\']+?)(?P=quote)')
modified = []
for path in root.rglob('*.ts'):
    if path.name.endswith('.d.ts'):
        continue
    text = path.read_text(encoding='utf-8')
    def repl(m):
        # preserve original prefix and quote
        p = m.group('path')
        if re.search(r'\.(js|ts|jsx|tsx|json|css|svg|png|jpg|jpeg|gif|mjs|cjs|d\.ts)$', p):
            return m.group(0)
        return f"{m.group('prefix')}{m.group('quote')}{p}.js{m.group('quote')}"
    new_text = pattern.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        modified.append(path)
for p in modified:
    print(f'updated {p}')
print('done', len(modified))
