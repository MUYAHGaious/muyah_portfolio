"""Services and testimonials: admin CRUD and public exposure."""


async def test_services_require_auth_to_manage(client):
    assert (await client.get("/api/admin/services")).status_code == 401
    assert (await client.get("/api/admin/testimonials")).status_code == 401


async def test_created_service_appears_publicly(admin_client):
    created = await admin_client.post(
        "/api/admin/services",
        json={"title": "Full-stack engineering", "blurb": "End to end.", "points": ["CI", "Migrations"]},
    )
    assert created.status_code == 201

    public = (await admin_client.get("/api/services")).json()
    assert [item["title"] for item in public] == ["Full-stack engineering"]
    assert public[0]["points"] == ["CI", "Migrations"]


async def test_unpublished_service_is_hidden(admin_client):
    created = (
        await admin_client.post("/api/admin/services", json={"title": "Hidden"})
    ).json()
    await admin_client.patch(f"/api/admin/services/{created['id']}", json={"published": False})

    assert (await admin_client.get("/api/services")).json() == []
    # The admin list must still show it, or it would be uneditable.
    assert len((await admin_client.get("/api/admin/services")).json()) == 1


async def test_services_are_ordered_by_sort_order(admin_client):
    for title, order in [("Third", 30), ("First", 10), ("Second", 20)]:
        await admin_client.post(
            "/api/admin/services", json={"title": title, "sort_order": order}
        )

    titles = [item["title"] for item in (await admin_client.get("/api/services")).json()]
    assert titles == ["First", "Second", "Third"]


async def test_service_points_are_trimmed_and_capped(admin_client):
    created = await admin_client.post(
        "/api/admin/services",
        json={"title": "Trimmed", "points": ["  spaced  ", "", "   ", "kept"]},
    )
    assert created.json()["points"] == ["spaced", "kept"]


async def test_testimonials_start_empty(admin_client):
    """The section must ship with nothing in it — no generated endorsements."""
    assert (await admin_client.get("/api/testimonials")).json() == []


async def test_testimonial_round_trip(admin_client):
    created = await admin_client.post(
        "/api/admin/testimonials",
        json={"quote": "They shipped it.", "author": "A Real Person", "role": "CTO, Somewhere"},
    )
    assert created.status_code == 201

    public = (await admin_client.get("/api/testimonials")).json()
    assert public[0]["author"] == "A Real Person"
    assert public[0]["quote"] == "They shipped it."


async def test_testimonial_requires_a_quote_and_an_author(admin_client):
    assert (
        await admin_client.post("/api/admin/testimonials", json={"quote": "", "author": "X"})
    ).status_code == 422
    assert (
        await admin_client.post("/api/admin/testimonials", json={"quote": "Y", "author": ""})
    ).status_code == 422


async def test_deleting_a_service_removes_it(admin_client):
    created = (await admin_client.post("/api/admin/services", json={"title": "Temp"})).json()

    assert (
        await admin_client.delete(f"/api/admin/services/{created['id']}")
    ).status_code == 204
    assert (await admin_client.get("/api/services")).json() == []


async def test_settings_expose_greeting_and_avatar(admin_client):
    settings = (await admin_client.get("/api/settings")).json()
    assert "greeting" in settings
    assert "avatar" in settings


async def test_greeting_can_be_customised(admin_client):
    await admin_client.patch("/api/admin/settings", json={"greeting": "Hey, I'm"})
    assert (await admin_client.get("/api/settings")).json()["greeting"] == "Hey, I'm"
