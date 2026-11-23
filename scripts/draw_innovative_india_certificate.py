"""Build the vector certificate master. The reference supplies only the approved marks.

Requires reportlab, pypdf, numpy and opencv-python-headless in the design environment.
The website uses the resulting PDF with its existing Node dependencies.
"""

from pathlib import Path

import cv2
import numpy as np
from pypdf import PdfReader
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
W, H = 1400, 1400 * 2 / 3
NAVY = "#10254F"


def y(top):
    return H - top


def draw_paths(page, contours, color, stroke=False, width=1):
    path = page.beginPath()
    for start, segments in contours:
        path.moveTo(start[0], y(start[1]))
        for segment in segments:
            if len(segment) == 2:
                path.lineTo(segment[0], y(segment[1]))
            else:
                x1, y1, x2, y2, x3, y3 = segment
                path.curveTo(x1, y(y1), x2, y(y2), x3, y(y3))
        if not stroke:
            path.close()
    if stroke:
        page.setStrokeColor(HexColor(color))
        page.setLineWidth(width)
    else:
        page.setFillColor(HexColor(color))
    page.drawPath(path, stroke=int(stroke), fill=int(not stroke), fillMode=0)


def mark(page, reference, bounds, palette, luminance):
    """Preserve the approved marks as traced outlines, with no embedded pixels."""
    x0, y0, x1, y1 = bounds
    scale = reference.shape[1] / W
    left, top, right, bottom = (round(v * scale) for v in bounds)
    crop = reference[top:bottom, left:right]
    ink = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY) < luminance
    if len(palette) == 1:
        masks = [ink]
    else:
        rgb = crop.astype(np.int32)
        colors = np.array([[int(c[i:i+2], 16) for i in (1, 3, 5)] for c in palette])
        regions = ((rgb[:, :, None, :] - colors[None, None, :, :]) ** 2).sum(axis=3).argmin(axis=2)
        masks = [(regions == index) & ink for index in range(len(palette))]
    for color, region in zip(palette, masks):
        mask = region.astype(np.uint8)
        outlines, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        paths = []
        for outline in outlines:
            if abs(cv2.contourArea(outline)) < 9:
                continue
            points = cv2.approxPolyDP(outline, 1.15, True).reshape(-1, 2)
            if len(points) >= 3:
                coords = [(x0 + px / scale, y0 + py / scale) for px, py in points]
                paths.append((coords[0], coords[1:]))
        draw_paths(page, paths, color)


def label(page, value, x, top, size, font="Helvetica", color=NAVY, tracking=0):
    width = pdfmetrics.stringWidth(value, font, size) + max(0, len(value) - 1) * tracking
    text = page.beginText(x - width / 2, y(top))
    text.setFont(font, size)
    text.setFillColor(HexColor(color))
    text.setCharSpace(tracking)
    text.textOut(value)
    page.drawText(text)


def line(page, x0, top0, x1, top1, color=NAVY, width=1.6):
    draw_paths(page, [((x0, top0), [(x1, top1)])], color, stroke=True, width=width)


def backdrop(page):
    page.setFillColor(HexColor("#FEFCFF"))
    page.rect(0, 0, W, H, fill=1, stroke=0)
    for color, points in [
        ("#F2EBFA", [(1180, 0), (1400, 0), (1400, 270), (1170, 485), (1240, 295), (1350, 105)]),
        ("#F8F3FC", [(1254, 0), (1400, 0), (1400, 133), (1138, 349), (1236, 178)]),
        ("#EEE4F8", [(1400, 392), (1400, 625), (1135, 933), (982, 933), (1263, 574)]),
        ("#F6EEFC", [(0, 642), (173, 507), (236, 520), (58, 740), (0, 793)]),
        ("#EFE5F9", [(0, 843), (90, 772), (141, 785), (32, 933), (0, 933)]),
        ("#F8F3FC", [(117, 914), (467, 672), (162, 933), (100, 933)]),
    ]:
        draw_paths(page, [(points[0], points[1:])], color)

    bright = ("#A88ACD", "#B096D7", "#C0A7E3", "#D3C0EF")
    for i in range(25):
        d = i * 9
        draw_paths(page, [((-55 + d, -13), [
            (205 + d, 94 - d / 3, 12 + d / 3, 240 + d / 2, -12, 360 + d)
        ])], bright[i % 4], stroke=True, width=0.9)
        draw_paths(page, [((-38, 59 + d * 0.55), [
            (119 + d / 3, 1 + d / 7, 198 - d / 6, 240 + d / 4, 179 - d / 9, 316 + d / 3),
            (158 - d / 6, 408 + d * 0.7, 27 - d / 5, 451 + d, -34, 485 + d)
        ])], bright[(i + 1) % 4], stroke=True, width=0.87)
        draw_paths(page, [((1200 - d * 0.61, 949), [
            (1410 - d * 0.34, 828, 1093 + d * 0.36, 608 - d * 0.28, 1424, 459 + d * 0.57)
        ])], bright[(i + 2) % 4], stroke=True, width=0.88)
        draw_paths(page, [((1445, 602 + d * 0.68), [
            (1320 - d * 0.62, 485 + d * 0.25, 1122 + d * 0.12, 629 - d * 0.08, 1215 + d * 0.35, 839),
            (1250 + d * 0.55, 921, 1400 + d, 905, 1457, 965)
        ])], bright[i % 4], stroke=True, width=0.88)
    for i in range(15):
        d = i * 7
        draw_paths(page, [((-24 + d, 949), [(131 + d, 806, 291 - d / 5, 935, 370 + d, 955)]),
                          ((665 + d * 2, 948), [(843 + d, 823, 1046 + d, 966, 1390, 913 + d)])],
                   bright[i % 4], stroke=True, width=0.85)


def main():
    pdfmetrics.registerFont(TTFont("Calligraphy", ASSETS / "fonts" / "GreatVibes-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("GaramondBold", ASSETS / "fonts" / "EBGaramond-Bold-Static.ttf"))
    original = PdfReader(ASSETS / "innovative_india_certificate.pdf").pages[0].images[0].image
    reference = np.array(original.convert("RGB"))
    page = canvas.Canvas(str(ASSETS / "innovative_india_vector.pdf"), pagesize=(1080, 720), invariant=1, pageCompression=1)
    page.setTitle("Innovative India Certificate of Participation")
    page.setAuthor("Dev Harbour")
    page.scale(1080 / W, 1080 / W)

    backdrop(page)
    mark(page, reference, (477, 51, 680, 98), ("#000000",), 196)
    line(page, 701, 45, 701, 101, width=1.7)
    label(page, "Sponsored By", 839, 49, 17, "GaramondBold")
    mark(page, reference, (732, 54, 782, 98), ("#000000",), 209)
    mark(page, reference, (783, 54, 952, 98), ("#000000",), 185)

    label(page, "PRESENTS", 700, 135, 16, "Helvetica-Bold", tracking=6.5)
    label(page, "Innovative India", 700, 183, 51, "Times-BoldItalic", color="#513A70")
    draw_paths(page, [((879, 121), [(882, 132, 883, 135, 896, 138), (884, 141, 882, 144, 879, 155),
                                   (876, 145, 874, 142, 863, 139), (874, 136, 877, 132, 879, 121)])], "#77569A")
    for color, start, end in [("#F9DDBA", 580, 762), ("#FF9510", 653, 846), ("#299928", 740, 882)]:
        draw_paths(page, [((start, 208), [(start + 65, 195, end - 21, 191, end, 194),
                                          (end - 46, 198, start + 63, 215, start, 208)])], color)

    page.saveState()
    page.translate(703, 0)
    page.scale(1.28, 1)
    label(page, "Certificate", 0, 382, 195, "Calligraphy", color="#493267")
    page.restoreState()
    draw_paths(page, [((205, 296), [(278, 249, 317, 273, 377, 270)]),
                      ((1016, 294), [(1097, 306, 1157, 301, 1193, 267)])],
               "#765A97", stroke=True, width=1.4)
    label(page, "OF PARTICIPATION", 923, 422, 26, "Helvetica-Bold", tracking=6.5)
    label(page, "proudly presented to", 700, 478, 21, tracking=5.1)
    line(page, 294, 556, 1106, 556)
    label(page, "for actively participating in Innovative India, a national-level hackathon", 700, 602, 20, tracking=2.6)
    label(page, "by Devharbour, encouraging innovation, problem-solving, and real-world impact.", 700, 629, 20, tracking=1.9)

    # Hand-drawn pen strokes in certificate coordinates.
    page.saveState()
    page.setLineCap(1)
    page.setLineJoin(1)
    draw_paths(page, [
        ((268, 713), [(259, 694, 315, 678, 337, 691), (360, 706, 320, 733, 289, 737)]),
        ((290, 736), [(301, 722, 308, 705, 316, 695)]),
        ((278, 726), [(307, 717, 338, 722, 353, 713)]),
        ((348, 721), [(360, 701, 380, 685, 376, 692), (372, 700, 355, 714, 348, 721),
                     (357, 716, 364, 713, 366, 717), (365, 723, 374, 716, 380, 716)]),
        ((383, 716), [(375, 714, 374, 723, 381, 721), (386, 720, 387, 716, 389, 715),
                     (383, 723, 392, 721, 399, 716), (393, 725, 406, 720, 409, 715),
                     (402, 714, 416, 711, 412, 716), (410, 722, 418, 719, 426, 714)]),
        ((401, 709), [(401, 709, 402, 708, 402, 708)]),
        ((427, 713), [(420, 723, 432, 721, 440, 712), (430, 732, 407, 751, 400, 747),
                     (398, 742, 425, 725, 449, 716), (455, 712, 459, 716, 452, 719),
                     (444, 724, 447, 718, 453, 715), (449, 723, 463, 720, 472, 715)]),
        ((493, 700), [(524, 685, 496, 687, 478, 694), (448, 705, 484, 705, 485, 716),
                     (486, 726, 454, 741, 449, 735), (444, 728, 476, 716, 503, 718),
                     (513, 718, 526, 720, 531, 721)]),
    ], "#16161A", stroke=True, width=1.35)
    page.restoreState()
    line(page, 264, 758, 516, 758)
    label(page, "Co-Founder", 390, 783, 21, "GaramondBold")
    label(page, "Devharbour", 390, 807, 21, "GaramondBold")
    line(page, 571, 704, 571, 784)
    mark(page, reference, (621, 672, 780, 820), ("#0C3163", "#6B84AA", "#A5B5CA", "#D3DCE7", "#E8EDF3"), 239)
    line(page, 842, 704, 842, 784)
    label(page, "Credential ID", 1022, 720, 26, "GaramondBold")
    page.setStrokeColor(HexColor("#8165A2"))
    page.setLineWidth(1.5)
    page.roundRect(898, y(777), 248, 40, 20, stroke=1, fill=0)

    page.setStrokeColor(HexColor(NAVY))
    page.setLineWidth(1.3)
    page.circle(554, y(867), 10, stroke=1, fill=0)
    page.ellipse(549, y(877), 559, y(857), stroke=1, fill=0)
    line(page, 545, 867, 563, 867, width=1)
    line(page, 547, 863, 561, 863, width=.8)
    line(page, 547, 871, 561, 871, width=.8)
    label(page, "Official Web. – Devharbour.in", 723, 876, 23, "GaramondBold")
    page.linkURL("https://devharbour.in/home", (540, y(883), 880, y(850)), relative=1, thickness=0)
    page.save()


if __name__ == "__main__":
    main()
