#!/usr/bin/env python3
"""Genera la voz pregrabada de la app (voice/<idioma>/*.mp3 + index.json).

1. node tools/voice-corpus.js      -> build/voice-corpus.json (todas las frases que se leen)
2. python3 tools/voice.py [es en fr] -> voice/<idioma>/

Usa voces Piper (descarga los modelos a build/piper/). Solo genera lo que falta;
borra los audios que ya no se usan. Requiere: pip install piper-tts, ffmpeg.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, urllib.request, wave
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {  # idioma: (ruta en rhasspy/piper-voices, licencia, crédito)
    'es': ('es/es_ES/davefx/medium/es_ES-davefx-medium', 'CC0', 'davefx'),
    'en': ('en/en_US/joe/medium/en_US-joe-medium', 'CC0', 'joe'),
    'fr': ('fr/fr_FR/siwis/medium/fr_FR-siwis-medium', 'CC BY 4.0', 'SIWIS (Yamagishi et al.)'),
}
SPEED = 1.2        # length_scale: >1 = más lento
WHOLE_MAX = 40     # plantillas con más variantes numéricas se leen por trozos
NUM_RE = re.compile(r'\d+(?:[.,]\d+)?')
HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/'


def model(lang):
    path = VOICES[lang][0]
    d = os.path.join(ROOT, 'build', 'piper'); os.makedirs(d, exist_ok=True)
    f = os.path.join(d, os.path.basename(path) + '.onnx')
    for ext in ('.onnx', '.onnx.json'):
        if not os.path.exists(f.replace('.onnx', ext)):
            print('descargando', path + ext)
            urllib.request.urlretrieve(HF + path + ext, f.replace('.onnx', ext))
    return f


def name(lang, text):
    return hashlib.sha1((lang + '|' + text).encode()).hexdigest()[:12] + '.mp3'


def plan(units):
    groups = defaultdict(list)
    for u in units:
        if not re.search(r'\w', u): continue
        groups[NUM_RE.sub('#', u)].append(u)
    whole, frags, nums, tpls = set(), set(), set(str(n) for n in range(0, 181)), set()
    for tpl, us in groups.items():
        if '#' not in tpl:
            whole.update(us); continue
        tpls.add(tpl)
        if len(us) <= WHOLE_MAX:
            whole.update(us)
        for u in us:
            for p in re.split(r'(\d+(?:[.,]\d+)?)', u):
                q = p.strip()
                if not q or not re.search(r'\w', q): continue
                (nums if q[0].isdigit() else frags).add(q)
    return whole, frags, nums, tpls


def main(langs):
    from piper import PiperVoice, SynthesisConfig
    corpus = json.load(open(os.path.join(ROOT, 'build', 'voice-corpus.json')))
    for lang in langs:
        whole, frags, nums, tpls = plan(corpus[lang])
        out = os.path.join(ROOT, 'voice', lang); os.makedirs(out, exist_ok=True)
        idx = {'v': VOICES[lang][2], 's': {}, 'f': {}, 'n': {}, 't': {t: 1 for t in sorted(tpls)}}
        jobs = [('s', t) for t in sorted(whole)] + [('f', t) for t in sorted(frags)] + [('n', t) for t in sorted(nums, key=lambda x: float(x.replace(',', '.')))]
        voice = None; cfg = SynthesisConfig(length_scale=SPEED); made = 0
        for kind, text in jobs:
            fn = name(lang, text); idx[kind][text] = fn
            dst = os.path.join(out, fn)
            if os.path.exists(dst): continue
            if voice is None: voice = PiperVoice.load(model(lang))
            with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
                with wave.open(tmp.name, 'wb') as w:
                    voice.synthesize_wav(text, w, syn_config=cfg)
                af = ['-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.04'] if kind != 's' else []
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp.name, *af, '-ac', '1', '-ar', '22050', '-b:a', '40k', dst], check=True)
            made += 1
            if made % 100 == 0: print(lang, made)
        used = set(idx['s'].values()) | set(idx['f'].values()) | set(idx['n'].values())
        for f in os.listdir(out):
            if f.endswith('.mp3') and f not in used: os.remove(os.path.join(out, f))
        json.dump(idx, open(os.path.join(out, 'index.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
        size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
        print(f'{lang}: {len(idx["s"])} frases, {len(idx["f"])} trozos, {len(idx["n"])} números, {made} nuevos, {size/1e6:.1f} MB')


if __name__ == '__main__':
    main(sys.argv[1:] or list(VOICES))
