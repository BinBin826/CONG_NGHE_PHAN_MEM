#!/usr/bin/env python3
"""Sinh hình minh họa vector (SVG) rồi xuất PNG cho từng điểm tham quan.

Hình do script tự vẽ, không dùng ảnh có bản quyền. Muốn dùng ảnh thật, hãy ghi đè
file PNG cùng tên trong packages/shared/images/ (giữ nguyên tên, ví dụ gate.png).

Chạy:  python3 tools/gen_illustrations.py
Cần:   pip install playwright  (và Chromium đã cài cho Playwright)
"""
import os, sys, asyncio

W, H = 800, 450
OUT = os.path.join(os.path.dirname(__file__), "..", "packages", "shared", "images")

RED, RED_D, GOLD, CREAM, INK = "#7a1f1f", "#561212", "#c9a24a", "#faf6ee", "#2a1d1a"


def svg(body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<defs>{defs}</defs>{body}</svg>')


def sky(top="#9fd0e8", bottom="#f6e6c8", ground="#6e9a5a", horizon=330):
    return (f'<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/>'
            f'<stop offset="1" stop-color="{bottom}"/></linearGradient></defs>'
            f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
            f'<circle cx="640" cy="90" r="38" fill="#fff4cc" opacity=".9"/>'
            f'<rect y="{horizon}" width="{W}" height="{H-horizon}" fill="{ground}"/>')


def tree(x, y, s=1.0, c="#3f7a45"):
    return (f'<g transform="translate({x},{y}) scale({s})"><rect x="-4" y="-10" width="8" height="40" fill="#6b4a2f"/>'
            f'<circle cx="0" cy="-30" r="30" fill="{c}"/><circle cx="-20" cy="-12" r="20" fill="{c}"/>'
            f'<circle cx="20" cy="-12" r="20" fill="{c}"/></g>')


def flag(x, y, s=1.0):
    return (f'<g transform="translate({x},{y}) scale({s})"><rect x="0" y="-60" width="3" height="60" fill="#444"/>'
            f'<rect x="3" y="-60" width="38" height="26" fill="#d62828"/>'
            f'<polygon points="22,-57 25,-49 33,-49 27,-44 29,-36 22,-41 15,-36 17,-44 11,-49 19,-49" fill="#ffd60a"/></g>')


def palace_block(cx=400, base=330, w=460, tiers=3):
    """Mặt tiền Dinh: các tầng, lam đứng, mái nhô."""
    parts = []
    th = 54
    for i in range(tiers):
        tw = w - i * 70
        x = cx - tw / 2
        y = base - (i + 1) * th
        parts.append(f'<rect x="{x}" y="{y}" width="{tw}" height="{th}" fill="#f4efe6" stroke="#cfc6b4"/>')
        n = int(tw // 14)
        for k in range(1, n):
            parts.append(f'<line x1="{x + k * 14}" y1="{y + 6}" x2="{x + k * 14}" y2="{y + th - 6}" stroke="#b9ad96" stroke-width="3"/>')
        parts.append(f'<rect x="{x - 10}" y="{y - 8}" width="{tw + 20}" height="9" fill="{RED}"/>')
    parts.append(f'<rect x="{cx - w/2 - 20}" y="{base - 12}" width="{w + 40}" height="12" fill="#d9cfbb"/>')
    return "".join(parts)


# ---------- các cảnh ----------
def scene_palace():
    return svg(sky() + palace_block() + flag(400, 330 - 3 * 54 - 8, 1.1) + tree(110, 345, 1.1) + tree(690, 345, 1.1)
               + '<rect x="290" y="338" width="220" height="50" fill="#c9bfa8" opacity=".7"/>')


def scene_gate():
    bars = "".join(f'<rect x="{150 + i * 30}" y="202" width="8" height="140" fill="#2b2b2b"/>' for i in range(14))
    tank = (f'<g transform="translate(440,330)"><rect x="-120" y="-30" width="240" height="30" rx="14" fill="#4b5d3a"/>'
            f'<rect x="-70" y="-62" width="120" height="34" rx="6" fill="#5b6e45"/>'
            f'<rect x="40" y="-52" width="130" height="9" fill="#3d4c2e"/>'
            f'<circle cx="-95" cy="-8" r="9" fill="#2a3320"/><circle cx="-55" cy="-8" r="9" fill="#2a3320"/>'
            f'<circle cx="-15" cy="-8" r="9" fill="#2a3320"/><circle cx="25" cy="-8" r="9" fill="#2a3320"/>'
            f'<circle cx="65" cy="-8" r="9" fill="#2a3320"/><circle cx="105" cy="-8" r="9" fill="#2a3320"/>'
            f'<text x="-20" y="-40" font-family="Arial" font-weight="700" font-size="20" fill="#fff" text-anchor="middle">843</text></g>')
    return svg(sky() + palace_block(cx=400, base=336, w=380, tiers=3)
               + '<rect x="120" y="190" width="520" height="12" fill="#222"/>'
               + '<rect x="120" y="190" width="14" height="152" fill="#222"/><rect x="626" y="190" width="14" height="152" fill="#222"/>'
               + bars
               + tank + flag(700, 335, 1.0) + tree(70, 345, 1.0))


def hall(kind):
    bg = (f'<rect width="{W}" height="{H}" fill="#f2e6cf"/><rect y="0" width="{W}" height="70" fill="#e9d8b6"/>'
          f'<rect y="330" width="{W}" height="120" fill="#8a5a3b"/>'
          + "".join(f'<line x1="{i*80}" y1="330" x2="{400+(i-5)*140}" y2="{H}" stroke="#744a2e" stroke-width="2"/>' for i in range(11)))
    lamp = lambda x: (f'<g transform="translate({x},0)"><line x1="0" y1="0" x2="0" y2="60" stroke="#8a7a50"/>'
                      f'<polygon points="-34,92 34,92 20,60 -20,60" fill="{GOLD}"/><circle cx="0" cy="96" r="7" fill="#fff0b0"/></g>')
    lamps = lamp(200) + lamp(400) + lamp(600)
    wall = f'<rect x="0" y="70" width="{W}" height="260" fill="#f7efdc"/>' + \
           f'<rect x="0" y="300" width="{W}" height="30" fill="#c9a06c"/>'
    body = ""
    if kind == "credentials":
        body += f'<rect x="270" y="110" width="260" height="150" fill="#2a1d1a" stroke="{GOLD}" stroke-width="8"/>'
        body += f'<circle cx="400" cy="185" r="38" fill="#c43"/><path d="M300 240 Q350 170 400 220 T500 200" stroke="{GOLD}" stroke-width="5" fill="none"/>'
        for i in range(4):
            body += f'<rect x="{90 + i*40}" y="290" width="26" height="46" rx="5" fill="{RED}"/><rect x="{584 + i*40}" y="290" width="26" height="46" rx="5" fill="{RED}"/>'
    elif kind == "reception":
        for i, x in enumerate((150, 400, 650)):
            body += f'<ellipse cx="{x}" cy="350" rx="80" ry="22" fill="#fff"/><ellipse cx="{x}" cy="346" rx="80" ry="20" fill="#e9e2d2"/>'
            for dx in (-60, -20, 20, 60):
                body += f'<circle cx="{x+dx}" cy="344" r="6" fill="{GOLD}"/>'
        body += f'<rect x="60" y="120" width="680" height="12" fill="{RED}"/>' + "".join(
            f'<rect x="{80+i*110}" y="140" width="60" height="150" fill="#e8d9b8"/>' for i in range(6))
    elif kind == "presidentRoom":
        body += f'<rect x="330" y="100" width="140" height="180" fill="#d62828" stroke="{GOLD}" stroke-width="6"/>'
        body += '<polygon points="400,150 411,185 448,185 418,206 430,242 400,220 370,242 382,206 352,185 389,185" fill="#ffd60a"/>'
        body += f'<rect x="355" y="275" width="90" height="70" rx="8" fill="{RED_D}"/><rect x="345" y="262" width="110" height="16" fill="{GOLD}"/>'
        body += f'<circle cx="355" cy="262" r="9" fill="{GOLD}"/><circle cx="445" cy="262" r="9" fill="{GOLD}"/>'
        for i in range(3):
            body += f'<rect x="{110 + i*58}" y="300" width="40" height="50" rx="6" fill="#a06a3a"/><rect x="{552 + i*58}" y="300" width="40" height="50" rx="6" fill="#a06a3a"/>'
    elif kind == "cabinet":
        body += f'<rect x="170" y="330" width="460" height="26" rx="6" fill="#5a3a22"/><rect x="190" y="356" width="14" height="40" fill="#4a2f1b"/><rect x="596" y="356" width="14" height="40" fill="#4a2f1b"/>'
        for i in range(6):
            body += f'<rect x="{200 + i*66}" y="296" width="36" height="34" rx="5" fill="{RED}"/><rect x="{200 + i*66}" y="372" width="36" height="34" rx="5" fill="{RED}"/>'
        body += f'<rect x="250" y="110" width="300" height="130" fill="#e4dcc8" stroke="#8a7a50" stroke-width="5"/>' + flag(400, 235, 1.0)
    elif kind == "office":
        body += f'<rect x="250" y="300" width="300" height="24" fill="#5a3a22"/><rect x="270" y="324" width="16" height="60" fill="#4a2f1b"/><rect x="514" y="324" width="16" height="60" fill="#4a2f1b"/>'
        body += f'<rect x="355" y="268" width="90" height="32" fill="#fff" stroke="#bbb"/><rect x="520" y="274" width="14" height="26" fill="{GOLD}"/>'
        body += f'<rect x="340" y="190" width="120" height="100" rx="14" fill="{RED_D}"/>' + flag(640, 330, 1.1) + flag(160, 330, 1.1)
    else:  # family
        body += f'<rect x="130" y="300" width="250" height="60" rx="14" fill="#7d8f6d"/><rect x="130" y="270" width="250" height="40" rx="14" fill="#8ba07a"/>'
        body += f'<rect x="470" y="130" width="230" height="130" fill="#222" stroke="{GOLD}" stroke-width="6"/><polygon points="565,170 565,220 610,195" fill="#fff"/>'
        for i in range(4):
            body += f'<rect x="{480 + i*54}" y="300" width="36" height="44" rx="6" fill="{RED}"/>'
    return svg(bg + wall + lamps + body)


def scene_rooftop():
    sk = sky("#7fb8e0", "#f7e2c0", "#c9c9c9", 330)
    city = "".join(f'<rect x="{i*48}" y="{300 - (i*37 % 70)}" width="40" height="{60 + (i*37 % 70)}" fill="#a9b4bd"/>' for i in range(17))
    pad = ('<ellipse cx="300" cy="380" rx="200" ry="44" fill="#6d6d6d"/><ellipse cx="300" cy="380" rx="176" ry="36" fill="none" stroke="#fff" stroke-width="5"/>'
           '<text x="300" y="394" font-family="Arial" font-weight="900" font-size="48" fill="#fff" text-anchor="middle">H</text>')
    heli = ('<g transform="translate(560,300)"><ellipse cx="0" cy="0" rx="62" ry="28" fill="#4b5d3a"/><rect x="40" y="-8" width="100" height="10" fill="#4b5d3a"/>'
            '<rect x="-2" y="-46" width="4" height="20" fill="#333"/><rect x="-100" y="-50" width="200" height="6" fill="#333"/>'
            '<rect x="-50" y="34" width="100" height="5" fill="#333"/><rect x="-30" y="26" width="5" height="10" fill="#333"/><rect x="25" y="26" width="5" height="10" fill="#333"/></g>')
    return svg(sk + city + '<rect y="330" width="800" height="120" fill="#bdbdbd"/>' + pad + heli + flag(90, 335, 1.1))


def scene_bunker():
    bg = ('<rect width="800" height="450" fill="#1f2a2e"/><polygon points="0,0 800,0 560,150 240,150" fill="#2b393e"/>'
          '<polygon points="0,450 800,450 560,300 240,300" fill="#16201f"/><polygon points="0,0 240,150 240,300 0,450" fill="#26343a"/>'
          '<polygon points="800,0 560,150 560,300 800,450" fill="#26343a"/><rect x="240" y="150" width="320" height="150" fill="#0f1718"/>')
    lights = "".join(f'<rect x="{360 + i*0}" y="{ 20 + i*40}" width="{80 - i*14}" height="8" fill="#e8f3d0"/>' for i in range(3))
    table = ('<rect x="300" y="330" width="200" height="14" fill="#5b5b52"/><rect x="306" y="344" width="8" height="46" fill="#444"/><rect x="486" y="344" width="8" height="46" fill="#444"/>'
             '<rect x="320" y="300" width="160" height="30" fill="#d9d4b8"/><path d="M335 320 L370 308 L410 322 L460 306" stroke="#a33" stroke-width="3" fill="none"/>')
    radio = '<rect x="590" y="260" width="120" height="80" rx="6" fill="#3a463c"/>' + "".join(
        f'<circle cx="{615 + i*28}" cy="290" r="9" fill="#cfd8c0"/>' for i in range(3)) + '<rect x="604" y="316" width="90" height="8" fill="#9cb08a"/>'
    return svg(bg + lights + table + radio)


def scene_garden():
    sk = sky("#8fcfe6", "#f2ecd0", "#5f9b4f", 300)
    path = '<polygon points="340,450 460,450 430,300 370,300" fill="#e2d3b0"/>'
    jet = ('<g transform="translate(560,250) rotate(-8)"><path d="M-130 0 L100 -6 L140 0 L100 8 Z" fill="#8a97a3"/>'
           '<polygon points="-30,-2 -90,-60 -60,-2" fill="#7a8794"/><polygon points="-30,4 -90,62 -60,4" fill="#7a8794"/>'
           '<polygon points="-120,-2 -150,-34 -128,-2" fill="#7a8794"/><ellipse cx="60" cy="-8" rx="26" ry="8" fill="#a9d3e8"/></g>')
    return svg(sk + path + tree(90, 330, 1.5) + tree(210, 320, 1.2) + tree(700, 330, 1.5) + tree(780, 335, 1.0, "#4b8a52") + jet)


def scene_vehicles():
    sk = sky("#a9d5e8", "#f6ead0", "#8d8d85", 330)
    jeep = ('<g transform="translate(220,340)"><rect x="-110" y="-60" width="220" height="44" rx="6" fill="#5b6e45"/><rect x="-80" y="-100" width="120" height="44" fill="#7ea0b8" opacity=".85"/>'
            '<rect x="-84" y="-104" width="128" height="6" fill="#3d4c2e"/><circle cx="-62" cy="-8" r="26" fill="#222"/><circle cx="62" cy="-8" r="26" fill="#222"/>'
            '<circle cx="-62" cy="-8" r="11" fill="#999"/><circle cx="62" cy="-8" r="11" fill="#999"/></g>')
    merc = ('<g transform="translate(590,340)"><path d="M-120 -16 L-110 -52 L-60 -58 L-30 -92 L50 -92 L90 -58 L124 -48 L128 -16 Z" fill="#1d1d1f"/>'
            '<path d="M-26 -88 L-52 -58 L84 -58 L46 -88 Z" fill="#8fb4c8" opacity=".8"/><circle cx="-68" cy="-12" r="24" fill="#111"/><circle cx="76" cy="-12" r="24" fill="#111"/>'
            '<circle cx="-68" cy="-12" r="10" fill="#bbb"/><circle cx="76" cy="-12" r="10" fill="#bbb"/>'
            '<circle cx="12" cy="-38" r="9" fill="none" stroke="#ddd" stroke-width="2"/></g>')
    return svg(sk + jeep + merc)


def scene_exhibition():
    bg = f'<rect width="{W}" height="{H}" fill="#efe6d3"/><rect y="340" width="{W}" height="110" fill="#b99a74"/>'
    cases = ""
    for i in range(4):
        x = 70 + i * 170
        cases += (f'<rect x="{x}" y="250" width="130" height="90" fill="#cfe3ea" opacity=".8" stroke="#789" stroke-width="3"/>'
                  f'<rect x="{x-6}" y="340" width="142" height="16" fill="#6d5236"/>')
    items = ('<path d="M105 330 q15 -50 30 0 z" fill="#b5651d"/><rect x="278" y="300" width="50" height="30" fill="#a02020"/>'
             '<circle cx="465" cy="310" r="22" fill="#c9a24a"/><rect x="615" y="296" width="60" height="34" fill="#5b6e45"/>')
    frames = "".join(f'<rect x="{90 + i*210}" y="90" width="150" height="100" fill="#222" stroke="{GOLD}" stroke-width="6"/><rect x="{102 + i*210}" y="102" width="126" height="76" fill="#8aa5b0"/>' for i in range(3))
    return svg(bg + frames + cases + items)

SCENES = {
    "gate": scene_gate, "history": scene_palace, "architecture": scene_palace, "reunification": scene_palace,
    "credentials": lambda: hall("credentials"), "reception": lambda: hall("reception"),
    "presidentRoom": lambda: hall("presidentRoom"), "cabinet": lambda: hall("cabinet"),
    "office": lambda: hall("office"), "family": lambda: hall("family"),
    "rooftop": scene_rooftop, "bunker": scene_bunker, "garden": scene_garden, "vehicles": scene_vehicles,
    "exhibition": scene_exhibition,
}


async def main():
    from playwright.async_api import async_playwright
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        kwargs = {}
        exe = os.environ.get("CHROMIUM_PATH")
        if exe:
            kwargs["executable_path"] = exe
        browser = await p.chromium.launch(**kwargs)
        page = await browser.new_page(viewport={"width": W, "height": H})
        for name, fn in SCENES.items():
            s = fn()
            with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as f:
                f.write(s)
            await page.set_content(f'<body style="margin:0">{s}</body>')
            await page.screenshot(path=os.path.join(OUT, f"{name}.png"), clip={"x": 0, "y": 0, "width": W, "height": H})
            print("ok", name)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
