"""Public read endpoints. The recurring concern is that drafts never leak."""

from datetime import date

from app.models import Experience, Post, Project


async def _add(db, *rows):
    for row in rows:
        db.add(row)
    await db.commit()


async def test_health_reports_ok(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_unpublished_projects_are_hidden(client, db):
    await _add(
        db,
        Project(slug="live-one", title="Live one", published=True),
        Project(slug="draft-one", title="Draft one", published=False),
    )

    response = await client.get("/api/projects")
    assert response.status_code == 200
    slugs = [item["slug"] for item in response.json()]
    assert slugs == ["live-one"]


async def test_fetching_an_unpublished_project_by_slug_is_a_404(client, db):
    await _add(db, Project(slug="draft-one", title="Draft one", published=False))
    assert (await client.get("/api/projects/draft-one")).status_code == 404


async def test_projects_can_be_filtered_by_category(client, db):
    await _add(
        db,
        Project(slug="a", title="A", category="web", published=True),
        Project(slug="b", title="B", category="data", published=True),
    )

    response = await client.get("/api/projects", params={"category": "data"})
    assert [item["slug"] for item in response.json()] == ["b"]


async def test_projects_are_ordered_by_sort_order(client, db):
    await _add(
        db,
        Project(slug="third", title="Third", sort_order=30, published=True),
        Project(slug="first", title="First", sort_order=10, published=True),
        Project(slug="second", title="Second", sort_order=20, published=True),
    )

    slugs = [item["slug"] for item in (await client.get("/api/projects")).json()]
    assert slugs == ["first", "second", "third"]


async def test_current_roles_sort_before_past_ones(client, db):
    await _add(
        db,
        Experience(
            role="Past", company="Old", start_date=date(2020, 1, 1), end_date=date(2022, 1, 1)
        ),
        Experience(role="Current", company="New", start_date=date(2022, 2, 1), end_date=None),
    )

    roles = [item["role"] for item in (await client.get("/api/experience")).json()]
    assert roles == ["Current", "Past"]


async def test_unpublished_experience_is_hidden(client, db):
    await _add(
        db,
        Experience(role="Shown", company="A", start_date=date(2021, 1, 1), published=True),
        Experience(role="Hidden", company="B", start_date=date(2021, 1, 1), published=False),
    )

    roles = [item["role"] for item in (await client.get("/api/experience")).json()]
    assert roles == ["Shown"]


async def test_post_list_excludes_drafts_and_bodies(client, db):
    await _add(
        db,
        Post(slug="published", title="Published", body_md="# Body", published=True),
        Post(slug="draft", title="Draft", body_md="# Draft body", published=False),
    )

    payload = (await client.get("/api/posts")).json()
    assert payload["total"] == 1
    assert [item["slug"] for item in payload["items"]] == ["published"]
    assert "body_md" not in payload["items"][0], "list view should stay small"


async def test_posts_can_be_filtered_by_tag(client, db):
    await _add(
        db,
        Post(slug="one", title="One", tags=["python", "api"], published=True),
        Post(slug="two", title="Two", tags=["design"], published=True),
    )

    payload = (await client.get("/api/posts", params={"tag": "design"})).json()
    assert payload["total"] == 1
    assert payload["items"][0]["slug"] == "two"


async def test_tag_filtering_paginates_the_filtered_set(client, db):
    """Filtering must happen before paging, or page 1 can come back empty."""
    await _add(
        db,
        *[
            Post(slug=f"tagged-{index}", title=f"Tagged {index}", tags=["x"], published=True)
            for index in range(3)
        ],
        *[
            Post(slug=f"other-{index}", title=f"Other {index}", tags=["y"], published=True)
            for index in range(20)
        ],
    )

    payload = (await client.get("/api/posts", params={"tag": "x", "per_page": 2})).json()
    assert payload["total"] == 3
    assert len(payload["items"]) == 2


async def test_reading_a_draft_post_by_slug_is_a_404(client, db):
    await _add(db, Post(slug="draft", title="Draft", published=False))
    assert (await client.get("/api/posts/draft")).status_code == 404


async def test_settings_are_always_available(client):
    response = await client.get("/api/settings")
    assert response.status_code == 200
    assert "tagline" in response.json()
