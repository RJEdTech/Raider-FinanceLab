#!/usr/bin/env python3
"""List every sims/, practical/ and review/ file in index.html with one cache-busting version. Usage: python3 build_index.py [version]"""
import os,re,sys,time
root=os.path.dirname(os.path.abspath(__file__));v=sys.argv[1] if len(sys.argv)>1 else time.strftime('%Y%m%d%H%M')
ids=sorted(f[:-3] for f in os.listdir(os.path.join(root,'sims')) if f.endswith('.js'))
h=open(os.path.join(root,'index.html')).read()
sims='\n'.join(f'<script src="sims/{i}.js?v={v}"></script>' for i in ids)
extra='\n'.join([f'<script src="practical/{i}.js?v={v}"></script>' for i in ids if os.path.exists(os.path.join(root,'practical',i+'.js'))]+[f'<script src="review/{i}.js?v={v}"></script>' for i in ids if os.path.exists(os.path.join(root,'review',i+'.js'))])
h=re.sub(r'<!--SIMS-->.*?<!--/SIMS-->',lambda m:'<!--SIMS-->\n'+sims+'\n<!--/SIMS-->',h,flags=re.S)
h=re.sub(r'<!--EXTRA-->.*?<!--/EXTRA-->',lambda m:'<!--EXTRA-->\n'+extra+'\n<!--/EXTRA-->',h,flags=re.S)
for f in ('engine.js','fin.js','courses.js','practical.js','review.js','biolab.css'):h=re.sub(re.escape(f)+r'\?v=[^"]+',f+'?v='+v,h)
open(os.path.join(root,'index.html'),'w').write(h);print(len(ids),'tools, v='+v)
