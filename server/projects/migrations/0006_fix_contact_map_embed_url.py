# Fix map_embed_url seeded in 0005 (concatenation had introduced "!!" typos).

from django.db import migrations


CORRECT_MAP_EMBED = (
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.371342371511"
    "!2d37.534411316046484!3d55.75581448055152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768"
    "!4f13.1!3m3!1m2!1s0x46b54bd6ed0f2c73%3A0x69687e1f40d86161!2z0JrRg9GC0YPQt9C-"
    "0LLRgdC60LjQuSDQv9GALdGCLiwgMzYsIE1vc2t2YSwgMTIxMTcw!5e0!3m2!1sru!2sru"
    "!4v1650000000000!5m2!1sru!2sru"
)


def fix_embed(apps, schema_editor):
    ContactSettings = apps.get_model("projects", "ContactSettings")
    for row in ContactSettings.objects.all():
        if "!!" in (row.map_embed_url or "") or row.map_embed_url != CORRECT_MAP_EMBED:
            row.map_embed_url = CORRECT_MAP_EMBED
            row.save(update_fields=["map_embed_url"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0005_contactsettings"),
    ]

    operations = [
        migrations.RunPython(fix_embed, noop),
    ]
