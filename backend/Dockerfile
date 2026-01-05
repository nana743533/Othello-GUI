# Stage 1: Builder
FROM ruby:3.2 AS builder
RUN apt-get update -qq && apt-get install -y build-essential

WORKDIR /app/backend

# Copy source code for compilation
COPY . .

# Compile C++ binary for each version
RUN cd othelloai_logic/v1 && g++ -O3 -o othello othello.cpp
RUN cd othelloai_logic/v2 && g++ -O3 -o othello othello.cpp
RUN cd othelloai_logic/v3 && g++ -O3 -o othello othello.cpp

# Stage 2: Runner
FROM ruby:3.2-slim

# Install dependencies needed for Rails and usage
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    libvips \
    curl \
    g++ \
    libyaml-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy Gemfile and install gems
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy application code from context
COPY . .

# Copy compiled binary from builder (For production usage)
COPY --from=builder /app/backend/othelloai_logic/v1/othello ./othelloai_logic/v1/othello
COPY --from=builder /app/backend/othelloai_logic/v2/othello ./othelloai_logic/v2/othello
COPY --from=builder /app/backend/othelloai_logic/v3/othello ./othelloai_logic/v3/othello

# Entrypoint script
COPY bin/docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 3001
CMD ["rails", "server", "-b", "0.0.0.0"]
