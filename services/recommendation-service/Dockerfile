FROM python:3.11-slim

WORKDIR /app

ENV POETRY_VERSION=1.7.0 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1

# Install poetry
RUN pip install "poetry==$POETRY_VERSION"

COPY pyproject.toml poetry.lock* ./

RUN poetry install --no-root --no-dev

COPY . .

EXPOSE 3011

CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3011"]
