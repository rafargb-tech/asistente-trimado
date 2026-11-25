"""Construye la app.
  python3 tools/build.py            -> index.html (web/PWA para GitHub Pages)
  python3 tools/build.py artifact   -> dist/artifact.html (versión para Claude, fuentes de Google, sin PWA)
  python3 tools/build.py native     -> www/ (app nativa de Capacitor, sin service worker)
  python3 tools/build.py all        -> las tres
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
VERSION = re.search(r'class="ver">v([\d.]+)<', open(os.path.join(SRC, 'head.html')).read()).group(1)

def page():
    h = open(os.path.join(SRC, 'head.html')).read()
    a = open(os.path.join(SRC, 'app.js')).read()
    a = a.replace('/*__HOW__*/', open(os.path.join(SRC, 'how.js')).read())
    i = json.load(open(os.path.join(SRC, 'i18n.json')))
    return h + '<script>\nconst I18N=' + json.dumps(i, ensure_ascii=False, separators=(',', ':')) + ';\n' + a + '</script>\n'

FONTS = [('IBM Plex Sans', 400, 'ibm-plex-sans-latin-400'), ('IBM Plex Sans', 500, 'ibm-plex-sans-latin-500'),
         ('IBM Plex Sans', 600, 'ibm-plex-sans-latin-600'), ('IBM Plex Sans Condensed', 500, 'ibm-plex-sans-condensed-latin-500'),
         ('IBM Plex Sans Condensed', 600, 'ibm-plex-sans-condensed-latin-600'), ('IBM Plex Mono', 400, 'ibm-plex-mono-latin-400'),
         ('IBM Plex Mono', 500, 'ibm-plex-mono-latin-500')]
RESET = ('*,*::before,*::after{box-sizing:border-box}html{color-scheme:light}body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",sans-serif}'
         'img{max-width:100%}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}')

def web(native=False):
    s = page()
    title = s[:s.index('</title>') + 8]
    a = s.index('<link rel="preconnect"'); b = s.index('<style>')
    rest_head = s[b:s.index('</style>') + 8]
    body = s[s.index('</style>') + 8:].strip()
    ff = ''.join("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(fonts/%s-normal.woff2) format('woff2')}" % f for f in FONTS)
    head = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{title}
<meta name="description" content="Asistente de trimado de velas: trimado por rumbo, lanitas, polar estimada y checklist hasta los rizos.">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#F3F5F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#080C0F" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Trimado">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">
<style>{RESET}{ff}</style>
{rest_head}
</head>
<body>
'''
    sw = ("<script>if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){addEventListener('load',()=>{"
          "navigator.serviceWorker.register('sw.js').catch(()=>{});});}</script>\n")
    if native:
        head = head.replace('<link rel="manifest" href="manifest.webmanifest">\n', '')
        out = head + body + '\n</body>\n</html>\n'
        www = os.path.join(ROOT, 'www'); import shutil
        shutil.rmtree(www, ignore_errors=True); os.makedirs(www)
        open(os.path.join(www, 'index.html'), 'w').write(out)
        for d in ('fonts', 'icons', 'voice'):
            if os.path.isdir(os.path.join(ROOT, d)): shutil.copytree(os.path.join(ROOT, d), os.path.join(www, d))
        print('native v' + VERSION, len(out)); return
    out = head + body + '\n' + sw + '</body>\n</html>\n'
    open(os.path.join(ROOT, 'index.html'), 'w').write(out)
    swsrc = open(os.path.join(ROOT, 'tools', 'sw.template.js')).read().replace('__VERSION__', VERSION)
    open(os.path.join(ROOT, 'sw.js'), 'w').write(swsrc)
    print('web v' + VERSION, len(out))

def artifact():
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    open(os.path.join(ROOT, 'dist', 'artifact.html'), 'w').write(page())
    print('artifact v' + VERSION)

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else ''
    if arg == 'artifact': artifact()
    elif arg == 'native': web(native=True)
    elif arg == 'all': web(); web(native=True); artifact()
    else: web()
