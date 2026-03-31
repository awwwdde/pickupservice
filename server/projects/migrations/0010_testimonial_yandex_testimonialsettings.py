# Generated manually 2026-03-31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0009_telegramoutboxmessage'),
    ]

    operations = [
        # 1. Новые поля в Testimonial
        migrations.AddField(
            model_name='testimonial',
            name='source',
            field=models.CharField(
                choices=[('admin', 'Из админки'), ('yandex', 'Яндекс.Карты')],
                default='admin',
                db_index=True,
                max_length=16,
                verbose_name='Источник',
            ),
        ),
        migrations.AddField(
            model_name='testimonial',
            name='rating',
            field=models.PositiveSmallIntegerField(
                blank=True, null=True, verbose_name='Рейтинг (1–5)'
            ),
        ),
        migrations.AddField(
            model_name='testimonial',
            name='yandex_review_id',
            field=models.CharField(
                blank=True,
                db_index=True,
                help_text='Заполняется автоматически при синхронизации с Яндекс.Картами.',
                max_length=255,
                verbose_name='ID отзыва на Яндексе',
            ),
        ),
        migrations.AddField(
            model_name='testimonial',
            name='yandex_author_url',
            field=models.URLField(blank=True, verbose_name='Ссылка на автора (Яндекс)'),
        ),
        # Поле car теперь необязательное
        migrations.AlterField(
            model_name='testimonial',
            name='car',
            field=models.CharField(
                blank=True, max_length=255, verbose_name='Автомобиль'
            ),
        ),
        # Уникальное ограничение для непустого yandex_review_id
        migrations.AddConstraint(
            model_name='testimonial',
            constraint=models.UniqueConstraint(
                condition=models.Q(yandex_review_id__gt=''),
                fields=['yandex_review_id'],
                name='unique_nonempty_yandex_review_id',
            ),
        ),
        # 2. Новая модель TestimonialsSettings
        migrations.CreateModel(
            name='TestimonialsSettings',
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
                    'mode',
                    models.CharField(
                        choices=[
                            ('admin_only', 'Только из админки'),
                            ('yandex_only', 'Только Яндекс.Карты'),
                            ('mixed', 'Смешанный (сначала с Яндекса, потом из админки)'),
                        ],
                        default='admin_only',
                        max_length=16,
                        verbose_name='Режим отображения отзывов',
                    ),
                ),
                (
                    'yandex_widget_url',
                    models.URLField(
                        blank=True,
                        help_text=(
                            'Вставьте URL страницы организации на Яндекс.Картах '
                            '(например https://yandex.ru/maps/org/…/reviews/). '
                            'Отображается на фронте как кнопка «Все отзывы».'
                        ),
                        verbose_name='Ссылка «Все отзывы» (Яндекс.Карты)',
                    ),
                ),
                (
                    'yandex_org_id',
                    models.CharField(
                        blank=True,
                        help_text=(
                            'Числовой ID из URL организации на картах. '
                            'Используется командой manage.py sync_yandex_reviews для автоматической '
                            'загрузки отзывов.'
                        ),
                        max_length=64,
                        verbose_name='ID организации на Яндекс.Картах',
                    ),
                ),
                (
                    'updated_at',
                    models.DateTimeField(auto_now=True, verbose_name='Обновлено'),
                ),
            ],
            options={
                'verbose_name': 'Настройки отзывов',
                'verbose_name_plural': 'Настройки отзывов',
            },
        ),
    ]
