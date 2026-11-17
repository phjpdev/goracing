"""Build the Excel workbook behind the admin "Last Matches" export.

Two sheets:
  * Races       – one row per analysed race with its top-4 picks side by side.
  * All Runners – one row per horse in every race's ``topPicks`` with all ratings,
                  so admins can filter / pivot the full AI output.
"""

from datetime import date, datetime, timedelta, timezone
from io import BytesIO
from typing import Any, Iterable, Literal

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

from app.models.race_analysis import RaceAnalysis

Lang = Literal["en", "zh"]

# Hong Kong has no DST, so a fixed offset avoids depending on system tzdata.
HKT = timezone(timedelta(hours=8))

TOP_N = 4

VENUES: dict[str, dict[Lang, str]] = {
    "ST": {"en": "Sha Tin", "zh": "沙田"},
    "HV": {"en": "Happy Valley", "zh": "跑馬地"},
}

RISK_FILLS = {
    "LOW": PatternFill("solid", fgColor="D1FAE5"),
    "MEDIUM": PatternFill("solid", fgColor="FEF3C7"),
    "HIGH": PatternFill("solid", fgColor="FEE2E2"),
}

HEADER_FONT = Font(bold=True, color="FFFFFF")
HEADER_FILL = PatternFill("solid", fgColor="1A1A1A")

DATE_FMT = "yyyy-mm-dd"
DATETIME_FMT = "yyyy-mm-dd hh:mm"
PCT_FMT = "0.0%"

LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "races_sheet": "Races",
        "runners_sheet": "All Runners",
        "date": "Date",
        "venue": "Venue",
        "race_id": "Race ID",
        "race_name_en": "Race Name (EN)",
        "race_name_ch": "Race Name (CH)",
        "risk": "Risk",
        "top_win": "Top Win %",
        "pick_no": "Pick {n} No.",
        "pick_name": "Pick {n} Horse",
        "pick_win": "Pick {n} Win %",
        "manual": "Manual Top 4",
        "analysed_at": "Analysed At (HKT)",
        "rank": "Rank",
        "horse_no": "No.",
        "horse": "Horse",
        "win": "Win %",
        "speed": "Speed",
        "class": "Class",
        "surface": "Surface",
        "distance": "Distance",
        "form": "Form",
        "analysis": "Analysis",
        "yes": "Yes",
    },
    "zh": {
        "races_sheet": "賽事總覽",
        "runners_sheet": "所有馬匹",
        "date": "日期",
        "venue": "場地",
        "race_id": "賽事編號",
        "race_name_en": "賽事名稱（英）",
        "race_name_ch": "賽事名稱（中）",
        "risk": "風險",
        "top_win": "最高勝率",
        "pick_no": "第{n}選 馬號",
        "pick_name": "第{n}選 馬名",
        "pick_win": "第{n}選 勝率",
        "manual": "人手調整前四",
        "analysed_at": "分析時間（香港）",
        "rank": "排名",
        "horse_no": "馬號",
        "horse": "馬名",
        "win": "勝率",
        "speed": "速度",
        "class": "級別",
        "surface": "跑道",
        "distance": "路程",
        "form": "狀態",
        "analysis": "分析",
        "yes": "是",
    },
}


def _to_fraction(value: Any) -> float | None:
    """'22.0%' / 22 / '22' -> 0.22 so Excel can sort and format it as a percent."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value) / 100
    if isinstance(value, str):
        try:
            return float(value.strip().rstrip("%").strip()) / 100
        except ValueError:
            return None
    return None


def _horse_no(value: Any) -> int | str:
    """'11' -> 11 so the No. column sorts numerically (2 before 11)."""
    if isinstance(value, str) and value.strip().isdigit():
        return int(value.strip())
    return value if value is not None else ""


def _to_date(value: str) -> date | str:
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return value


def _to_hkt(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    # Excel has no timezone support; write naive HKT wall-clock time.
    return value.astimezone(HKT).replace(tzinfo=None)


def _picks(analysis_json: dict[str, Any]) -> list[dict[str, Any]]:
    picks = analysis_json.get("topPicks")
    if not isinstance(picks, list):
        return []
    return [p for p in picks if isinstance(p, dict)]


def _write_row(ws: Worksheet, row: int, values: Iterable[Any]) -> None:
    for col, value in enumerate(values, start=1):
        cell = ws.cell(row=row, column=col, value=value)
        # openpyxl turns any string starting with "=" into a formula; AI text
        # must never be evaluated, so force it back to a plain string.
        if isinstance(value, str) and value.startswith("="):
            cell.data_type = "s"


def _write_header(ws: Worksheet, headers: list[str], widths: list[int]) -> None:
    _write_row(ws, 1, headers)
    for col, width in enumerate(widths, start=1):
        cell = ws.cell(row=1, column=col)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(col)].width = width
    ws.row_dimensions[1].height = 30


def _finish_sheet(ws: Worksheet, freeze: str) -> None:
    ws.freeze_panes = freeze
    if ws.max_row > 1:
        ws.auto_filter.ref = ws.dimensions


def _format_column(ws: Worksheet, col: int, number_format: str) -> None:
    for (cell,) in ws.iter_rows(min_row=2, min_col=col, max_col=col):
        if isinstance(cell.value, (int, float, date, datetime)):
            cell.number_format = number_format


def build_last_matches_workbook(analyses: list[RaceAnalysis], lang: Lang = "en") -> bytes:
    """Render saved race analyses (already ordered) into an .xlsx file."""
    t = LABELS[lang]
    wb = Workbook()

    # ── Sheet 1: one row per race ───────────────────────────────────────────
    races = wb.active
    races.title = t["races_sheet"]
    race_headers = [
        t["date"], t["venue"], t["race_id"], t["race_name_en"], t["race_name_ch"],
        t["risk"], t["top_win"],
    ]
    race_widths = [12, 13, 14, 32, 18, 9, 11]
    for n in range(1, TOP_N + 1):
        race_headers += [t["pick_no"].format(n=n), t["pick_name"].format(n=n), t["pick_win"].format(n=n)]
        race_widths += [8, 22, 10]
    race_headers += [t["manual"], t["analysed_at"]]
    race_widths += [12, 17]
    _write_header(races, race_headers, race_widths)

    # ── Sheet 2: one row per runner ─────────────────────────────────────────
    runners = wb.create_sheet(t["runners_sheet"])
    runner_headers = [
        t["date"], t["venue"], t["race_id"], t["race_name_en"], t["race_name_ch"],
        t["rank"], t["horse_no"], t["horse"], t["win"],
        t["speed"], t["class"], t["surface"], t["distance"], t["form"], t["analysis"],
    ]
    runner_widths = [12, 13, 14, 32, 18, 7, 7, 22, 9, 8, 8, 9, 9, 8, 70]
    _write_header(runners, runner_headers, runner_widths)

    risk_col = race_headers.index(t["risk"]) + 1
    race_pct_cols = [race_headers.index(t["top_win"]) + 1] + [
        race_headers.index(t["pick_win"].format(n=n)) + 1 for n in range(1, TOP_N + 1)
    ]
    analysis_col = len(runner_headers)

    race_row = 2
    runner_row = 2
    for a in analyses:
        aj = a.analysis_json if isinstance(a.analysis_json, dict) else {}
        picks = _picks(aj)
        venue = VENUES.get(a.venue_code, {}).get(lang, a.venue_code)
        race_date = _to_date(a.race_date)
        risk = aj.get("riskLevel")
        common = [race_date, venue, a.race_id, a.race_name_en or "", a.race_name_ch or ""]

        top_win = _to_fraction(aj.get("overallWinPct"))
        row: list[Any] = [*common, risk or "", top_win if top_win is not None else aj.get("overallWinPct")]
        for i in range(TOP_N):
            if i < len(picks):
                p = picks[i]
                win = _to_fraction(p.get("winPct"))
                row += [_horse_no(p.get("no")), p.get("name", ""), win if win is not None else p.get("winPct", "")]
            else:
                row += ["", "", ""]
        row += [t["yes"] if aj.get("manualTop4") else "", _to_hkt(a.created_at)]
        _write_row(races, race_row, row)
        if risk in RISK_FILLS:
            races.cell(row=race_row, column=risk_col).fill = RISK_FILLS[risk]
        race_row += 1

        for rank, p in enumerate(picks, start=1):
            win = _to_fraction(p.get("winPct"))
            _write_row(runners, runner_row, [
                *common,
                rank,
                _horse_no(p.get("no")),
                p.get("name", ""),
                win if win is not None else p.get("winPct", ""),
                p.get("speed"),
                p.get("class"),
                p.get("surface"),
                p.get("distance"),
                p.get("form"),
                p.get("analysis", ""),
            ])
            runners.cell(row=runner_row, column=analysis_col).alignment = Alignment(wrap_text=True, vertical="top")
            runner_row += 1

    for ws in (races, runners):
        _format_column(ws, 1, DATE_FMT)
    for col in race_pct_cols:
        _format_column(races, col, PCT_FMT)
    _format_column(races, len(race_headers), DATETIME_FMT)
    _format_column(runners, runner_headers.index(t["win"]) + 1, PCT_FMT)

    # Freeze date/venue/race id + names so they stay visible while scrolling picks.
    _finish_sheet(races, "F2")
    _finish_sheet(runners, "F2")

    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()
