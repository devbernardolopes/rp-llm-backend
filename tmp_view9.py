import pathlib
lines=pathlib.Path('style.css').read_text().splitlines()
for i in range(2820,2895):
    print(f'{i+1}: {lines[i]}')
