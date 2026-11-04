#!/usr/bin/env python3
"""Inline src/ into washer/index.html for GitHub Pages, and dist/index.html for publishing as a Claude artifact."""
import pathlib
R=pathlib.Path(__file__).resolve().parent.parent;S=R/'src';D=R/'dist';D.mkdir(exist_ok=True)
h=(S/'shell.html').read_text();css=(S/'style.css').read_text()
js='\n'.join((S/f).read_text() for f in ['data.js','guides.js','model.js','app.js'])
out=h.replace('/*CSS*/',css).replace('/*JS*/',js.replace('</script','<\\/script'))
(D/'index.html').write_text(out.replace('<!--HOME-->',''))
page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+out.replace('<!--HOME-->','<a href="../">PCS home</a>')+'</body></html>\n'
(R/'index.html').write_text(page);print(len(page)//1024,'KB')
