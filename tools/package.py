#!/usr/bin/env python3
"""Create a portable single HTML file and a source/deployment archive."""
from pathlib import Path
import base64
import re
import zipfile

root = Path(__file__).resolve().parents[1]
output = root.parent / 'outputs'
output.mkdir(exist_ok=True)
html = (root/'dist/index.html').read_text(encoding='utf-8')
svg = 'data:image/svg+xml;base64,' + base64.b64encode((root/'dist/icon.svg').read_bytes()).decode()
html = html.replace('./icon.svg',svg)
html = html.replace('<link rel="stylesheet" href="./styles.css">','<style>\n'+(root/'dist/styles.css').read_text()+'\n</style>')
for name in ['data','core','app']:
    code = (root/f'dist/{name}.js').read_text().replace('./icon.svg',svg)
    code = re.sub(r'</script',r'<\\/script',code,flags=re.I)
    # Keep the execution order after the document has finished parsing.
    html = html.replace(f'<script defer src="./{name}.js"></script>','')
    html = html.replace('</body>','<script>\n'+code+'\n</script>\n</body>')
standalone = output/'CHEMLAB-standalone.html'
standalone.write_text(html,encoding='utf-8')
archive = output/'CHEMLAB-source-and-app.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for directory in ['dist','tools','tests','.github']:
        for file in (root/directory).rglob('*'):
            if file.is_file() and '__pycache__' not in file.parts and not file.name.startswith('qa-'):
                z.write(file,'chem-study/'+str(file.relative_to(root)))
    for filename in ['README.md','package.json','.gitignore']:
        z.write(root/filename,'chem-study/'+filename)
    z.write(standalone,'chem-study/CHEMLAB-standalone.html')
print(standalone)
print(archive)
