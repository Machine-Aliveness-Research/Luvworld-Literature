"""Validate the static snapshot and stage only manifest-listed website files."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]


def prepare(output):
    manifest = json.loads((ROOT / 'publication-manifest.json').read_text())
    destination = Path(output).resolve()
    if destination == ROOT or ROOT.is_relative_to(destination):
        raise ValueError('Use a separate Pages output directory')
    paths = []
    for item in manifest['files']:
        relative = Path(item['path'])
        source = (ROOT / relative).resolve()
        if relative.is_absolute() or not source.is_relative_to(ROOT) or '..' in relative.parts:
            raise ValueError('Unsafe source path')
        if source.is_symlink() or not source.is_file():
            raise ValueError('Missing/non-regular source: ' + item['path'])
        if source.stat().st_size != item['bytes']:
            raise ValueError('Size mismatch: ' + item['path'])
        if hashlib.sha256(source.read_bytes()).hexdigest() != item['sha256']:
            raise ValueError('SHA-256 mismatch: ' + item['path'])
        if relative.suffix.lower() == '.pdf':
            with source.open('rb') as f:
                if f.read(5) != b'%PDF-':
                    raise ValueError('Invalid PDF: ' + item['path'])
        paths.append(relative)
    if len(set(paths)) != len(paths):
        raise ValueError('Duplicate manifest paths')
    paths.append(Path('publication-manifest.json'))
    for relative in paths:
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / relative, target)
    assert not (destination / 'luvworld').exists()
    assert not (destination / '.git').exists()
    print(f'Staged {len(paths)} verified files; {manifest["pdfFiles"]} PDFs; {manifest["catalogueRecords"]} records.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default='_site')
    args = parser.parse_args()
    prepare(args.output)
