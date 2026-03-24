# Путь к проекту на сервере при необходимости поправьте.
import multiprocessing

bind = "unix:/run/gunicorn/pickupservice.sock"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 120
accesslog = "-"
errorlog = "-"
