"""Admin CRUD for projects, experience, posts, and settings."""


async def test_create_project_derives_a_slug_from_the_title(admin_client):
    response = await admin_client.post(
        "/api/admin/projects", json={"title": "My First Project!"}
    )
    assert response.status_code == 201
    assert response.json()["slug"] == "my-first-project"


async def test_duplicate_slugs_are_rejected_with_409(admin_client):
    await admin_client.post("/api/admin/projects", json={"title": "Same Name"})
    duplicate = await admin_client.post("/api/admin/projects", json={"title": "Same Name"})

    assert duplicate.status_code == 409, "a unique-index violation must not surface as a 500"


async def test_admin_list_includes_drafts(admin_client):
    await admin_client.post(
        "/api/admin/projects", json={"title": "Draft project", "published": False}
    )

    admin_view = (await admin_client.get("/api/admin/projects")).json()
    public_view = (await admin_client.get("/api/projects")).json()

    assert len(admin_view) == 1
    assert public_view == []


async def test_patch_only_changes_the_fields_sent(admin_client):
    created = (
        await admin_client.post(
            "/api/admin/projects",
            json={"title": "Original", "summary": "Keep me", "tech": ["React"]},
        )
    ).json()

    updated = (
        await admin_client.patch(
            f"/api/admin/projects/{created['id']}", json={"title": "Renamed"}
        )
    ).json()

    assert updated["title"] == "Renamed"
    assert updated["summary"] == "Keep me"
    assert updated["tech"] == ["React"]


async def test_publishing_a_project_makes_it_public(admin_client):
    created = (
        await admin_client.post("/api/admin/projects", json={"title": "Soon live"})
    ).json()
    assert (await admin_client.get("/api/projects")).json() == []

    await admin_client.patch(f"/api/admin/projects/{created['id']}", json={"published": True})

    assert [item["slug"] for item in (await admin_client.get("/api/projects")).json()] == [
        "soon-live"
    ]


async def test_deleting_a_project_removes_it(admin_client):
    created = (await admin_client.post("/api/admin/projects", json={"title": "Temp"})).json()

    assert (
        await admin_client.delete(f"/api/admin/projects/{created['id']}")
    ).status_code == 204
    assert (
        await admin_client.get(f"/api/admin/projects/{created['id']}")
    ).status_code == 404


async def test_project_rejects_an_empty_title(admin_client):
    assert (await admin_client.post("/api/admin/projects", json={"title": ""})).status_code == 422


async def test_experience_rejects_an_end_date_before_the_start(admin_client):
    response = await admin_client.post(
        "/api/admin/experience",
        json={
            "role": "Engineer",
            "company": "Somewhere",
            "start_date": "2024-01-01",
            "end_date": "2023-01-01",
        },
    )
    assert response.status_code == 422


async def test_experience_accepts_an_open_ended_role(admin_client):
    response = await admin_client.post(
        "/api/admin/experience",
        json={"role": "Engineer", "company": "Somewhere", "start_date": "2024-01-01"},
    )
    assert response.status_code == 201
    assert response.json()["end_date"] is None


async def test_published_at_is_set_when_a_post_first_goes_live(admin_client):
    created = (
        await admin_client.post("/api/admin/posts", json={"title": "Hello", "published": False})
    ).json()
    assert created["published_at"] is None

    published = (
        await admin_client.patch(f"/api/admin/posts/{created['id']}", json={"published": True})
    ).json()
    assert published["published_at"] is not None


async def test_republishing_preserves_the_original_publication_date(admin_client):
    created = (
        await admin_client.post("/api/admin/posts", json={"title": "Hello", "published": True})
    ).json()
    original_date = created["published_at"]
    assert original_date is not None

    await admin_client.patch(f"/api/admin/posts/{created['id']}", json={"published": False})
    republished = (
        await admin_client.patch(f"/api/admin/posts/{created['id']}", json={"published": True})
    ).json()

    assert republished["published_at"] == original_date


async def test_post_tags_are_lowercased_and_deduplicated(admin_client):
    response = await admin_client.post(
        "/api/admin/posts", json={"title": "Tagged", "tags": ["Python", "python", " API "]}
    )
    assert response.json()["tags"] == ["python", "api"]


async def test_settings_update_persists_and_is_publicly_visible(admin_client):
    response = await admin_client.patch(
        "/api/admin/settings",
        json={
            "name": "Muyah",
            "tagline": "Engineer",
            "socials": [{"label": "GitHub", "url": "https://github.com/muyah"}],
        },
    )
    assert response.status_code == 200

    public = (await admin_client.get("/api/settings")).json()
    assert public["name"] == "Muyah"
    assert public["socials"][0]["label"] == "GitHub"


async def test_settings_patch_leaves_untouched_fields_alone(admin_client):
    await admin_client.patch("/api/admin/settings", json={"name": "Muyah", "location": "Lagos"})
    await admin_client.patch("/api/admin/settings", json={"tagline": "Engineer"})

    settings = (await admin_client.get("/api/settings")).json()
    assert settings["name"] == "Muyah"
    assert settings["location"] == "Lagos"
    assert settings["tagline"] == "Engineer"


async def test_updating_a_missing_record_is_a_404(admin_client):
    assert (
        await admin_client.patch("/api/admin/projects/9999", json={"title": "Nope"})
    ).status_code == 404
