import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    root.setLevel(level.upper())

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))

    root.handlers.clear()
    root.addHandler(handler)

    # bibliotecas de terceiros não precisam de DEBUG por padrão
    logging.getLogger("uvicorn.access").setLevel("WARNING")
