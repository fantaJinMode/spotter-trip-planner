from datetime import datetime
from trips.services.hos import plan_trip, Leg

START = datetime(2026, 7, 14, 8, 0)


def _statuses(day):
    return [(e["status"], e["start"], e["end"]) for e in day["events"]]


def test_pretrip_inspection_before_driving():
    logs = plan_trip([Leg(40, 0.75, service_after=True), Leg(240, 4.0, service_after=True)],
                     cycle_used=0, start=START)
    day = logs[0]
    assert ("on_duty", "08:00", "08:30") in _statuses(day)  # 30 min pre-trip inspection
    assert day["totals"]["on_duty"] >= 0.5


def test_short_trip_single_day():
    # 40mi/0.75h to pickup, 240mi/4h to dropoff
    logs = plan_trip([Leg(40, 0.75, service_after=True), Leg(240, 4.0, service_after=True)],
                     cycle_used=0, start=START)
    assert len(logs) == 1
    day = logs[0]
    assert day["date"] == "2026-07-14"
    assert ("driving", "08:30", "09:15") in _statuses(day)
    assert ("on_duty", "09:15", "10:15") in _statuses(day)   # 1hr pickup
    assert day["totals"]["driving"] == 4.75


def test_break_inserted_after_8h_driving():
    logs = plan_trip([Leg(600, 10.0, service_after=False)], cycle_used=0, start=START)
    day = logs[0]
    assert ("off_duty", "16:30", "17:00") in _statuses(day)  # break after 8h driving from 08:30


def test_11h_driving_cap_forces_10h_rest_and_second_day():
    logs = plan_trip([Leg(900, 15.0, service_after=False)], cycle_used=0, start=START)
    assert len(logs) == 2
    assert logs[0]["totals"]["driving"] == 11


def test_fuel_stop_every_1000_miles():
    logs = plan_trip([Leg(1200, 20.0, service_after=False)], cycle_used=0, start=START)
    notes = [e["note"] for d in logs for e in d["events"]]
    assert notes.count("fuel") == 1


def test_cycle_exhaustion_inserts_34h_restart():
    logs = plan_trip([Leg(300, 5.0, service_after=False)], cycle_used=68, start=START)
    notes = [e["note"] for d in logs for e in d["events"]]
    assert "34 hr restart" in notes


def test_pickup_and_dropoff_are_on_duty_hours():
    logs = plan_trip([Leg(60, 1.0, service_after=True), Leg(60, 1.0, service_after=True)],
                     cycle_used=0, start=START)
    on = [e for d in logs for e in d["events"]
          if e["status"] == "on_duty" and e["note"] == "pickup/dropoff"]
    assert len(on) == 2


def test_events_split_cleanly_at_midnight():
    logs = plan_trip([Leg(900, 15.0, service_after=False)], cycle_used=0, start=START)
    for day in logs:
        assert day["events"][0]["start"] == "00:00" or day["date"] == "2026-07-14"
        assert sum(day["totals"].values()) <= 24.01


def test_total_driving_conserved():
    logs = plan_trip([Leg(900, 15.0, service_after=False)], cycle_used=0, start=START)
    assert abs(sum(d["totals"]["driving"] for d in logs) - 15.0) < 0.01


def test_zero_duration_leg_does_not_raise():
    # current_location == pickup_location: OSRM returns a zero-length, zero-duration leg
    logs = plan_trip([Leg(0, 0.0, service_after=True), Leg(240, 4.0, service_after=True)],
                     cycle_used=0, start=START)
    day = logs[0]
    assert ("on_duty", "08:30", "09:30") in _statuses(day)  # pickup happens right after pre-trip inspection
    assert day["totals"]["driving"] == 4.0
