from dataclasses import dataclass
from datetime import datetime, timedelta

MAX_DRIVE, WINDOW, BREAK_AFTER, BREAK_HRS = 11.0, 14.0, 8.0, 0.5
DAILY_REST, CYCLE_MAX, RESTART = 10.0, 70.0, 34.0
FUEL_EVERY_MI, FUEL_HRS, SERVICE_HRS = 1000.0, 0.5, 1.0
PRETRIP_HRS = 0.5


@dataclass
class Leg:
    distance_mi: float
    duration_hrs: float
    service_after: bool = False   # 1hr on_duty (pickup/dropoff) after this leg


def plan_trip(legs, cycle_used, start):
    ev, clock = [], start
    driving_today = on_window = since_break = 0.0
    cycle = cycle_used
    miles_since_fuel = 0.0

    def add(status, hrs, note=""):
        nonlocal clock
        ev.append({"status": status, "start": clock, "end": clock + timedelta(hours=hrs), "note": note})
        clock += timedelta(hours=hrs)

    def rest(hrs, note):
        nonlocal driving_today, on_window, since_break
        add("off_duty", hrs, note)
        driving_today = on_window = since_break = 0.0

    def on_duty(hrs, note):
        nonlocal on_window, cycle
        add("on_duty", hrs, note)
        on_window += hrs; cycle += hrs

    on_duty(PRETRIP_HRS, "pre-trip inspection")

    for leg in legs:
        speed = leg.distance_mi / leg.duration_hrs if leg.duration_hrs > 1e-9 else 0.0
        remaining = leg.duration_hrs
        while remaining > 1e-9:
            if cycle >= CYCLE_MAX - 1e-9:
                add("off_duty", RESTART, "34 hr restart"); cycle = 0.0
                driving_today = on_window = since_break = 0.0
                continue
            if driving_today >= MAX_DRIVE - 1e-9 or on_window >= WINDOW - 1e-9:
                rest(DAILY_REST, "10 hr rest"); continue
            if since_break >= BREAK_AFTER - 1e-9:
                add("off_duty", BREAK_HRS, "30 min break")
                on_window += BREAK_HRS; since_break = 0.0
                continue
            if miles_since_fuel >= FUEL_EVERY_MI - 1e-9:
                on_duty(FUEL_HRS, "fuel"); miles_since_fuel = 0.0
                continue
            can = min(remaining, MAX_DRIVE - driving_today, WINDOW - on_window,
                      BREAK_AFTER - since_break, (FUEL_EVERY_MI - miles_since_fuel) / speed,
                      CYCLE_MAX - cycle)
            add("driving", can)
            driving_today += can; on_window += can; since_break += can
            cycle += can; miles_since_fuel += can * speed; remaining -= can
        if leg.service_after:
            if on_window >= WINDOW - SERVICE_HRS:   # no room for service hour
                rest(DAILY_REST, "10 hr rest")
            on_duty(SERVICE_HRS, "pickup/dropoff")

    day_start = datetime.combine(start.date(), datetime.min.time())
    if start > day_start:
        ev.insert(0, {"status": "off_duty", "start": day_start, "end": start, "note": ""})
    day_end = clock if clock.time() == datetime.min.time() else datetime.combine(
        clock.date() + timedelta(days=1), datetime.min.time()
    )
    if clock < day_end:
        ev.append({"status": "off_duty", "start": clock, "end": day_end, "note": ""})

    return _to_daily_logs(ev)


def _to_daily_logs(events):
    out = []
    for e in events:
        s, end = e["start"], e["end"]
        while s.date() < end.date():
            nxt = datetime.combine(s.date() + timedelta(days=1), datetime.min.time())
            _push(out, s.date(), e["status"], s, nxt, e["note"])
            s = nxt
        if s < end:
            _push(out, s.date(), e["status"], s, end, e["note"])
    for day in out:
        t = {"off_duty": 0.0, "sleeper": 0.0, "driving": 0.0, "on_duty": 0.0}
        for e in day["events"]:
            t[e["status"]] += round(e["_hrs"], 4); del e["_hrs"]
        day["totals"] = {k: round(v, 2) for k, v in t.items()}
    return out


def _push(out, date, status, s, e, note):
    day = next((d for d in out if d["date"] == date.isoformat()), None)
    if day is None:
        day = {"date": date.isoformat(), "events": []}; out.append(day)
    hrs = (e - s).total_seconds() / 3600
    end_str = "24:00" if (e.hour, e.minute) == (0, 0) and e.date() > date else e.strftime("%H:%M")
    day["events"].append({"status": status, "start": s.strftime("%H:%M"),
                          "end": end_str, "note": note, "_hrs": hrs})
