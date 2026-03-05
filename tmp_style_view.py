import pathlib
lines=pathlib.Path('style.css').read_text().splitlines()
for i in range(1515,1575):
    print(f'{i+1}: {lines[i]}')
