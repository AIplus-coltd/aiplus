import subprocess
from pathlib import Path

# SVGをPNGに変換するスクリプト
# imagemagickまたはcairosvgを使用

sizes = [
    ('logo.svg', 'logo.png', 512),
    ('icon-192.svg', 'icon-192.png', 192),
    ('icon-512.svg', 'icon-512.png', 512),
    ('apple-icon.svg', 'apple-icon.png', 180),
]

logo_dir = Path('c:/Users/nfg_g/OneDrive/aiplus/aiplus/public/logo')

for svg_file, png_file, size in sizes:
    svg_path = logo_dir / svg_file
    png_path = logo_dir / png_file
    
    if svg_path.exists():
        # imagemagickで変換（背景白）
        try:
            subprocess.run([
                'convert',
                f'{svg_path}',
                '-background', 'white',
                '-alpha', 'off',
                f'{png_path}'
            ], check=True)
            print(f'✓ {svg_file} → {png_file}')
        except:
            print(f'✗ {svg_file} 変換失敗')
    else:
        print(f'✗ {svg_file} 見つかりません')

print('処理完了')
