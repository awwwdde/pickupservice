from django.db import migrations, models


def seed_privacy_policy(apps, schema_editor):
    PrivacyPolicy = apps.get_model("projects", "PrivacyPolicy")
    if PrivacyPolicy.objects.exists():
        return
    PrivacyPolicy.objects.create(
        title="Политика конфиденциальности",
        content=(
            "Настоящая политика конфиденциальности определяет порядок обработки и защиты "
            "персональных данных пользователей сайта PickupService.\n\n"
            "Администратор сайта обрабатывает данные, которые вы добровольно передаёте через "
            "формы обратной связи, заявки на звонок и иные способы связи.\n\n"
            "Данные используются исключительно для связи с вами, оказания услуг и улучшения "
            "качества сервиса. Мы не передаём персональные данные третьим лицам, за исключением "
            "случаев, предусмотренных законодательством РФ.\n\n"
            "По вопросам обработки персональных данных вы можете связаться с нами через "
            "контакты, указанные на сайте."
        ),
    )


def unseed_privacy_policy(apps, schema_editor):
    PrivacyPolicy = apps.get_model("projects", "PrivacyPolicy")
    PrivacyPolicy.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0013_novelty"),
    ]

    operations = [
        migrations.CreateModel(
            name="PrivacyPolicy",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "title",
                    models.CharField(
                        default="Политика конфиденциальности",
                        max_length=255,
                        verbose_name="Заголовок страницы",
                    ),
                ),
                (
                    "content",
                    models.TextField(
                        help_text="Абзацы разделяйте пустой строкой. Поддерживаются переносы строк.",
                        verbose_name="Текст политики",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="Обновлено"),
                ),
            ],
            options={
                "verbose_name": "Политика конфиденциальности",
                "verbose_name_plural": "Политика конфиденциальности",
            },
        ),
        migrations.RunPython(seed_privacy_policy, unseed_privacy_policy),
    ]
