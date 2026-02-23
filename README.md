# FullStack Ecommerce - Server

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev)
[![Coverage Status](https://coveralls.io/repos/github/heliomar-pena/fullstack-ecommerce-backend/badge.svg?branch=dev)](https://coveralls.io/github/heliomar-pena/fullstack-ecommerce-backend?branch=dev)

This project is an ecommerce application built using Nest.js and Postgres. The focus is on evolving from a existing system with a feature-based architecture to a backend using Clean Architecture, Domain Driven Development and Event Driven Development, and prepare it for production and better scalability.

For this, was taken a pre-existent project ([original project](https://github.com/hsn656/nestjs-ecommerce)) and performed a refactor on the infrastructure (how migrations, seeds, environment variables, authentication, and error handling works), folder structure (moved from layered modularized architecture to clean architecture), and on the database (changed the way the attributes were working for categories for a more flexible solution that allows creating new categories without touching the code).

[Go to FrontEnd's repository](https://github.com/heliomar-pena/fullstack-ecommerce-frontend)

## Public Links

- [FrontEnd](https://fullstack-ecommerce-frontend-2cad384b2bd8.herokuapp.com/auth/login)
- [Documentation (Swagger)](https://full-stack-ecommerce-9b782554ef40.herokuapp.com/api#/)

### Documentation

- [Initial Analysis](./docs/INITIAL_ANALYSIS.md)
- [Changelog / Refactor Details](./docs/KEY_CHANGES.md)
- [Event-Driven Design](./docs/EVENT_DRIVEN_DESIGN.md)

## Table of Content

- [FullStack Ecommerce - Server](#fullstack-ecommerce---server)
  - [Public Links](#public-links)
    - [Documentation](#documentation)
  - [Table of Content](#table-of-content)
  - [Features](#features)
    - [Authentication](#authentication)
    - [Authorization (Roles)](#authorization-roles)
    - [Categories](#categories)
    - [Products](#products)
    - [Real-Time Notifications with Server-Sent Events (SSE)](#real-time-notifications-with-server-sent-events-sse)
    - [Event-Driven Architecture](#event-driven-architecture)
    - [Security Features](#security-features)
  - [Technology Stack](#technology-stack)
  - [Pre-requisites to run the project](#pre-requisites-to-run-the-project)
    - [To run it dockerized](#to-run-it-dockerized)
    - [To run it without docker](#to-run-it-without-docker)
  - [How to run the project](#how-to-run-the-project)
    - [Docker](#docker)
      - [Run Docker with the custom scripts](#run-docker-with-the-custom-scripts)
        - [API + DB](#api--db)
        - [Watch API + DB (development mode)](#watch-api--db-development-mode)
        - [Run tests](#run-tests)
      - [Run Docker without custom scripts](#run-docker-without-custom-scripts)
        - [API](#api)
      - [Run DB with Docker and API with Node](#run-db-with-docker-and-api-with-node)
  - [Run the migrations](#run-the-migrations)
  - [How to run the tests](#how-to-run-the-tests)
    - [Tests with Docker](#tests-with-docker)
    - [Test DB in docker, but the tests in node](#test-db-in-docker-but-the-tests-in-node)
  - [Areas to improve](#areas-to-improve)
  - [Decisions made](#decisions-made)
  - [Routes](#routes)
  - [Env Vars](#env-vars)

## Features

### Authentication

- Authentication implemented with JWT, following good practices for secure token generation.
- Role-Based Access Control. Current Roles: Customer, Merchant, Admin.
- All routes protected by default (fail-secure pattern).
- Password hashing with bcrypt configurable via .env.
- Automatic role assignment for new users.

### Authorization (Roles)

- Admin users can assign roles to other users.
- Merchant users can create and handle products and categories.
- Customer users doesn't have any permissions right now.

### Categories

- DB-Driven schema for category attributes, which makes categories a lot more flexible while yet maintaining the benefits of having typed attributes. Support for attributes of type STRING, NUMBER and BOOLEAN
- Create category and assign custom attributes for it.

### Products

- Create a product with Title + Code + Description and assign a category to it (It will inherit the category attributes).
- Add the details of the product with runtime validation for the attributes, only defined attributes are accepted and value has to be compatible with the type defined in the attribute.
- Publicate a product on the ecommerce.
- Delete a product. Soft delete is supported for products and attributes.

### Real-Time Notifications with Server-Sent Events (SSE)

- Server-Sent Events for instant notifications
- User-specific event streaming
- Role change notifications
- Product deletion confirmations
- Automatic keep-alive for connection stability

### Event-Driven Architecture

- Domain events for user creation and role changes
- Event listeners for automatic side effects
- Cascading events for complex workflows
- Clean separation of concerns
- Scalable to async/distributed events (RabbitMQ, Kafka)

### Security Features

- PII-free JWT tokens (only user ID)
- Bearer token authentication
- CORS support with configurable origins

## Technology Stack

- Framework: NestJS 11
- Language: TypeScript 5
- Database: PostgreSQL 17
- ORM: TypeORM 0.3
- Authentication: JWT with bcrypt
- Real-Time: Server-Sent Events (SSE)
- Testing: Jest + Supertest
- Documentation: Swagger/OpenAPI 3.0

## Pre-requisites to run the project

### To run it dockerized

1. Docker installed without SUDO permission.
2. Docker compose installed without SUDO permission.
3. Ports free: 3000 and 5432.
4. Configure env vars. Check .env.example for a reference

### To run it without docker

1. Postgres 17
2. Node 24

## How to run the project

You can run the project by using Docker, by running node and postgres on your computer or you could also run Postgres on Docker and the project on your computer (better for development).

Choose the one that you like more.

### Docker

#### Run Docker with the custom scripts

There are some custom scripts that can be used instead of writing the docker command manually.

If you want to see how to run docker without these scripts, [click here to skip this section](#run-docker-without-custom-scripts)

##### API + DB

Starts the DB and the API:

```sh
./scripts/up_dev.sh
```

##### Watch API + DB (development mode)

Starts the DB and the API in Watch mode:

```sh
./scripts/watch_dev.sh
```

When docker run in mode watch, logs are hidden, it's possible to access them running the next script in a new terminal:

```sh
./scripts/logs_dev.sh
```

##### Run tests

This one runs the postgres database for testing and run the tests.

```sh
./scripts/up_test.sh
```

#### Run Docker without custom scripts

As alternative, can be run using Docker compose directly, instead of the custom scripts.

##### API

```bash
docker compose --profile api up
```

Or with watch mode (hotreload):

```bash
docker compose --profile api watch
```

> [!NOTE]
> In watch mode, logs are hidden, they can be accessed by running:
>
> ```bash
> docker compose --profile api logs -f
> ```

#### Run DB with Docker and API with Node

It's also possible to start only the Database in Docker, and the application in NodeJS.

1. Start the DB

   ```bash
   docker compose up postgres_db
   ```

2. Switch to Node 24, for nvm just run:

   ```bash
   nvm use
   ```

3. Install the dependencies:

   ```bash
   npm i
   ```

4. Then run the app:

   ```bash
   npm run start:dev
   ```

Remember to fill the DB credentials in the .envs.

## Run the migrations

Running the DB (in postgres or locally) is the first step, the second step is filling the DB with the needed structure, for that, we use migrations which contains the tables and columns we need on the application.

Also, if wanted, there are also seeds that loads small pre-defined data to start working on. To run the seeds, it's needed to add the `DATABASE_RUN_SEEDS=true` variable in the .env file.

To run the migrations, fill the .env with the data to connect to the database, then run:

```bash
npm run typeorm:migrate
```

Once the migrations are done, you can go and start using the app. If you ran the seeds with the migrations, then there will be a Admin user by default

## How to run the tests

The tests uses a test database which is preferable to run in docker, that is why there is a profile in the docker compose dedicated to the tests, that way the tests can be ran with only one command.

There is also the possibility of running the postgres_test database from the docker compose, and run the tests using node directly.

### Tests with Docker

```bash
docker compose --profile test up
```

> [!NOTE]
> To run it in watch mode, logs are hidden by default, they can be accessed by running:
>
> ```bash
> docker compose --profile api logs -f
> ```

### Test DB in docker, but the tests in node

1. Run the DB for testing

   ```bash
   docker compose up postgres_test
   ```

2. Go to the .env.example file, and change the port for the one that is defined in docker-compose.yml
3. Run the tests:

```bash
npm run test:e2e
```

> [!NOTE]
> Remember to fill the DB credentials in the .envs.

## Areas to improve

- Role is currently in a gray-area between hardcoded in the code, and dynamic in the DB, it could scale to use roles directly from DB, without hardcode code, by adding a new table to link permissions to roles and make our system work in base of permissions, that way we could define the permissions needed for every feature, but Admins are who give a shape to our roles, creating new roles that mix different permissions for every need without touching code.
- User <-> Roles relation is a many to many relation, instead it could be added a table in the middle to handle some metadata like "Who assigned the role to the user", "When the user became admin", etc.
- Attributes does not supports enum, lists, options, multiple values, and does not distinguish between required, not required, or have default values. This is something that we could scale to improve the flexibility of the attributes a lot.
- Events does not have a way to recover from fail. We could have added a more robust event systems with retry, logs, and better error handling.
- There could be a lot of events that could be integrated in the project in the future. Right now, we have not too much features integrated so it is actually difficult to see where to add events when our code is already pretty simple with simple features. I would like to integrate events like "When a product is published, send email campaigns to the users", and things like that.

## Decisions made

- Clean Architecture: To be able to handle further changes in the future in a proper way.
- Docker: To make it portable.
- Jest/Testing/E2E: Jest is the most used testing framework. E2E testing was done because in this case testing all features together is more convenient that testing every single part of the application, allowing us to test how the strategies integrates with services properly depending of the payload passed to the controller.
- Removed hardcoded attributes from code to make categories more flexibles, now users can create a category and define the attributes for that category in specific, then the product will inherit the attributes of the category and user can fill them.
- Changed the way the seeds were created to have historical seeds that are consistent with the migrations.
- Migrated the whole application to new version of libraries to fix most of the vulnerabilities present in the code.

## Routes

- Local: [API Swagger](http://localhost:3000/api)

## Env Vars

1. DB environment variables: Fill it with the details of the postgres db, if postgres is running on Docker, then copy and paste the values from docker-compose. If you have a URL instead, use DATABASE_URL (all the credentials will be ignored them.). If your postgres DB is using SSL then mark DATABASE_ENABLE_SSL_CONFIGURATION as true, if not, leave as it is.
2. JWT_SECRET: This is the value used for encrypt and decrypt the JWT tokens. Any value can be used here, however it's good practice to use a strong password difficult to break, like a hash. There are some online tools that generates secure hash for this purpose, like [jwt secret key generator](https://jwtsecretkeygenerator.com/).
3. CORS_ORIGIN: CORS is enabled so it is needed to add our FrontEnd's URL in this ENV to allow requests from that URL.
4. ADMIN_DEFAULT_EMAIL and ADMIN_DEFAULT_PASSWORD: These are the credentials for the admin user created when the seeds are ran. Enable DATABASE_RUN_SEEDS, change those variables and then run migrations `npm run typeorm:migrate`.
