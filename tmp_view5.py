import pathlib
path=pathlib.Path('app.js')
lines=path.read_text(encoding='utf-8').splitlines()
for i in range(6350,6405):
    print(f'{i+1}: {lines[i]}')
