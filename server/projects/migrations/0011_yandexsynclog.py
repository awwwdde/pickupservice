# Generated manually 2026-03-31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0010_testimonial_yandex_testimonialsettings'),
    ]

    operations = [
        migrations.CreateModel(
            name='YandexSyncLog',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('running', 'Выполняется'),
                            ('success', 'Успешно'),
                            ('failed', 'Ошибка'),
                        ],
                        db_index=True,
                        default='running',
                        max_length=16,
                        verbose_name='Статус',
                    ),
                ),
                ('org_id', models.CharField(max_length=64, verbose_name='ID организации')),
                ('created', models.IntegerField(default=0, verbose_name='Создано')),
                ('updated', models.IntegerField(default=0, verbose_name='Обновлено')),
                ('unpublished', models.IntegerField(default=0, verbose_name='Снято с публикации')),
                ('log', models.TextField(blank=True, verbose_name='Лог')),
                ('started_at', models.DateTimeField(auto_now_add=True, verbose_name='Запущено')),
                (
                    'finished_at',
                    models.DateTimeField(blank=True, null=True, verbose_name='Завершено'),
                ),
            ],
            options={
                'verbose_name': 'Лог синхронизации (Яндекс)',
                'verbose_name_plural': 'Логи синхронизации (Яндекс)',
                'ordering': ['-started_at'],
            },
        ),
    ]
