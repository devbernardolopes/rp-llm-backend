import pathlib
text=pathlib.Path('app.js').read_text(encoding='utf-8').splitlines()
start=next(i for i,l in enumerate(text) if 'function buildMessageRow' in l)
for i in range(start, start+200):
    print(f'{i+1}: {text[i]}')
