import pathlib
lines=pathlib.Path('app.js').read_text(encoding='utf-8').splitlines()
for i in range(10060,10140):
    print(f'{i+1}: {lines[i]}')
