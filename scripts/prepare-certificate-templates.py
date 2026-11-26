"""Prepare blank certificate artwork from the approved references.

Keep source certificates containing personal names in ignored private storage.
Only the blank PNGs are published. Poppler flattens the redacted PDF so the
original name and credential cannot be recovered from the published artwork.
"""
import argparse
import subprocess
from pathlib import Path

from PIL import Image
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--orcathon-image', required=True, type=Path)
    parser.add_argument('--innovative-image', required=True, type=Path)
    args = parser.parse_args()
    destination = ROOT / 'public/assets/certificates'
    destination.mkdir(parents=True, exist_ok=True)
    temporary = ROOT / 'tmp/pdfs/template-preparation'
    temporary.mkdir(parents=True, exist_ok=True)

    # The Orcathon source is already blank and has the approved flat artwork.
    Image.open(args.orcathon_image).convert('RGB').save(destination / 'orcathon.png')
    image = Image.open(args.innovative_image).convert('RGB')
    width, height = image.size
    if (width, height) != (800, 533):
        raise ValueError('The Innovative reference must be the approved 800 x 533 artwork.')
    intermediate = temporary / 'innovative-redacted.pdf'
    document = canvas.Canvas(str(intermediate), pagesize=(width, height), invariant=1)
    document.drawInlineImage(image, 0, 0, width=width, height=height)
    for left, top, right, bottom, sample in [
        (295, 282, 505, 314, (290, 296)),
        (528, 425, 640, 439, (535, 430)),
    ]:
        document.setFillColorRGB(*(channel / 255 for channel in image.getpixel(sample)))
        document.rect(left, height - bottom, right - left, bottom - top, fill=1, stroke=0)
    document.save()
    subprocess.run([
        'pdftoppm', '-f', '1', '-singlefile', '-r', '72', '-png',
        str(intermediate), str(destination / 'innovative-india'),
    ], check=True)
    Image.open(destination / 'innovative-india.png').save(
        ROOT / 'public/assets/innovative_india_certificate.webp', lossless=True,
    )
    print('Prepared blank Orcathon and Innovative India certificate artwork.')


if __name__ == '__main__':
    main()
