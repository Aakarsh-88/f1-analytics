"""Tests for app.utils.pagination."""

from unittest.mock import MagicMock, patch

from app.utils.pagination import PaginatedResponse, PaginationParams, paginate_query


def test_pagination_params_offset_calculation() -> None:
    assert PaginationParams(page=1, page_size=25).offset == 0
    assert PaginationParams(page=2, page_size=25).offset == 25
    assert PaginationParams(page=3, page_size=10).offset == 20


def test_paginated_response_build_computes_total_pages() -> None:
    pagination = PaginationParams(page=1, page_size=10)
    response = PaginatedResponse.build(items=list(range(10)), total=95, pagination=pagination)

    assert response.total == 95
    assert response.page == 1
    assert response.page_size == 10
    # 95 items at 10 per page = 10 pages (9 full + 1 partial)
    assert response.total_pages == 10


def test_paginated_response_build_handles_zero_total() -> None:
    pagination = PaginationParams(page=1, page_size=25)
    response = PaginatedResponse.build(items=[], total=0, pagination=pagination)

    assert response.total_pages == 0
    assert response.items == []


def test_paginated_response_build_exact_multiple() -> None:
    pagination = PaginationParams(page=1, page_size=25)
    response = PaginatedResponse.build(items=list(range(25)), total=50, pagination=pagination)

    assert response.total_pages == 2


def test_paginate_query_applies_offset_and_limit_and_returns_total() -> None:
    """
    Mocks the SQLAlchemy Session AND patches `select` within the
    pagination module itself, rather than letting a bare MagicMock flow
    into real SQLAlchemy statement construction — `select_from()`
    performs real type coercion internally that a plain MagicMock
    wouldn't satisfy. Patching at this boundary tests paginate_query's
    OWN orchestration logic (build a count query, build a paged query,
    execute both, return correctly) without depending on SQLAlchemy's
    internal argument validation accepting a mock object.
    """
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one.return_value = 42
    mock_db.execute.return_value.scalars.return_value.all.return_value = ["item1", "item2"]

    mock_stmt = MagicMock()
    pagination = PaginationParams(page=2, page_size=10)

    with patch("app.utils.pagination.select") as mock_select:
        mock_select.return_value.select_from.return_value = MagicMock()
        items, total = paginate_query(mock_db, mock_stmt, pagination)

    assert total == 42
    assert items == ["item1", "item2"]
    # offset(10).limit(10) should have been called on the statement for page 2
    mock_stmt.offset.assert_called_once_with(10)
    mock_stmt.offset.return_value.limit.assert_called_once_with(10)
