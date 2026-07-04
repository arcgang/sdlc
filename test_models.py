"""Smoke tests: Store model can be instantiated, saved, and queried."""
import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from models import Base, Store


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as s:
        yield s


def make_store(**overrides):
    defaults = dict(
        name="Test Mart",
        address="1 High Street",
        latitude=51.5074,
        longitude=-0.1278,
        channel="supermarket",
        territory="London",
        priority_tier=1,
        active=True,
    )
    defaults.update(overrides)
    return Store(**defaults)


def test_store_insert_and_query(session):
    store = make_store()
    session.add(store)
    session.commit()

    result = session.get(Store, store.id)
    assert result is not None
    assert result.name == "Test Mart"
    assert result.channel == "supermarket"
    assert result.priority_tier == 1
    assert result.active is True
    assert result.last_visited_date is None


def test_store_all_fields(session):
    visited = datetime.date(2026, 6, 1)
    store = make_store(
        name="Corner Pharmacy",
        channel="pharmacy",
        territory="Manchester",
        priority_tier=3,
        last_visited_date=visited,
        active=False,
    )
    session.add(store)
    session.commit()

    result = session.get(Store, store.id)
    assert result.last_visited_date == visited
    assert result.active is False
    assert result.priority_tier == 3


def test_priority_tier_check_constraint(session):
    from sqlalchemy.exc import IntegrityError

    store = make_store(priority_tier=99)
    session.add(store)
    with pytest.raises(IntegrityError):
        session.commit()


def test_store_repr(session):
    store = make_store()
    session.add(store)
    session.commit()
    assert "Test Mart" in repr(store)
    assert "supermarket" in repr(store)
