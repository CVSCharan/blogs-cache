# Local Setup Guide - @cvscharan/blogs-cache

This guide provides a step-by-step process to set up the `@cvscharan/blogs-cache` package locally for development and integration with other services.

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Docker Desktop**: For running Redis locally

## 🛠️ Environment Setup

1.  **Clone the repository** (if you haven't already):

    ```bash
    git clone https://github.com/CVSCharan/blogs-cache.git
    cd blogs-cache
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the root directory. You can copy the example:

    ```bash
    cp .env.example .env
    ```

    Ensure your `.env` contains the following (adjust `REDIS_PASSWORD` as needed):

    ```ini
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=local_dev_password
    REDIS_URL="redis://:local_dev_password@localhost:6379"
    ```

## 🚀 Running Infrastructure (Redis)

This package relies on Redis. Use the provided script to start it automatically.

### Quick Start (Recommended)

```bash
./scripts/start-redis.sh
```

This script will:

- Load `REDIS_PASSWORD` from your `.env` file
- Start Redis using Docker Compose
- Verify the connection

### Manual Start (Alternative)

If you prefer to start Redis manually:

```bash
# Export the password so docker-compose can use it
export REDIS_PASSWORD=local_dev_password

# Start the service
docker-compose up -d
```

### Verify Redis is Running

```bash
docker-compose ps
```

You should see `blogs-cache-redis` in the `Up` state (healthy).

## 📦 Installation & Build

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Build the Package**:

    ```bash
    npm run build
    ```

    This compiles the TypeScript code to the `dist/` directory.

3.  **Development Mode**:
    ```bash
    npm run dev
    ```
    This runs the playground script (`src/playground.ts`) using `nodemon`, automatically restarting on changes.

## ✅ Verification

Run the test suite to ensure everything is working correctly.

```bash
npm test
```

_Note: Tests require the local Redis instance to be running._

## 🔗 Linking to Other Services (Local Development)

To use this local version of `@cvscharan/blogs-cache` in another service (e.g., `blogs-api`):

### Method 1: npm link (Recommended for active dev)

1.  **In `blogs-cache` directory**:

    ```bash
    npm link
    ```

2.  **In the consuming service directory** (e.g., `../blogs-api`):
    ```bash
    npm link @cvscharan/blogs-cache
    ```

### Method 2: Local Path (Alternative)

1.  **In the consuming service's `package.json`**:
    Change the dependency version to the local path:

    ```json
    "dependencies": {
      "@cvscharan/blogs-cache": "file:../blogs-cache"
    }
    ```

2.  **Re-install in consuming service**:
    ```bash
    npm install
    ```

## 🧹 Cleanup

To stop the local Redis instance:

```bash
docker-compose down
```
