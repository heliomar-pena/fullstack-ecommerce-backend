# FullStack Ecommerce - Server

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev)
[![Coverage Status](https://coveralls.io/repos/github/heliomar-pena/fullstack-ecommerce-backend/badge.svg?branch=dev)](https://coveralls.io/github/heliomar-pena/fullstack-ecommerce-backend?branch=dev)

This project is an ecommerce application built using Nest.js and Postgres. The focus is on evolving from a system with a feature-based architecture to a backend using Clean Architecture, Domain Driven Development and Event Driven Development, to prepare it for production and better scalability.

For this, was taken a pre-existent project ([original project](https://github.com/hsn656/nestjs-ecommerce)) and performed a refactor on the infrastructure (how migrations, seeds, environment variables, authentication, and error handling works), folder structure (moved from layered modularized architecture to clean architecture), and on the database (changed the way the attributes were working for categories for a more flexible solution that allows creating new categories without touching the code).

## Public Links

- [FrontEnd](https://fullstack-ecommerce-frontend-2cad384b2bd8.herokuapp.com/auth/login)
- [Documentation (Swagger)](https://full-stack-ecommerce-9b782554ef40.herokuapp.com/api#/)

## Table of Content

- [FullStack Ecommerce - Server](#fullstack-ecommerce---server)
  - [Public Links](#public-links)
  - [Table of Content](#table-of-content)
  - [Features](#features)
  - [Pre-requisites](#pre-requisites)
    - [To run it dockerized](#to-run-it-dockerized)
    - [To run it without docker](#to-run-it-without-docker)
  - [How to run the API](#how-to-run-the-api)
    - [Custom scripts](#custom-scripts)
      - [Run API](#run-api)
      - [Watch API (development mode)](#watch-api-development-mode)
      - [Run tests](#run-tests)
    - [With Docker](#with-docker)
      - [API](#api)
    - [Run DB with Docker and API with Node](#run-db-with-docker-and-api-with-node)
  - [Run the migrations](#run-the-migrations)
  - [How to run the tests](#how-to-run-the-tests)
    - [Tests with Docker](#tests-with-docker)
    - [Test DB in docker, but the tests in node](#test-db-in-docker-but-the-tests-in-node)
  - [Areas to improve](#areas-to-improve)
  - [Technologies](#technologies)
  - [Decisions made](#decisions-made)
  - [Routes](#routes)
  - [Env Vars](#env-vars)

## Features



## Pre-requisites

### To run it dockerized

1. Docker installed without SUDO permission.
2. Docker compose installed without SUDO permission.
3. Ports free: 3000 and 5432.
4. Configure env vars. Check .env.example for a reference

### To run it without docker

1. Postgres 17
2. Node 24

## How to run the API

### Custom scripts

There are some custom scripts that can be used instead of writing the docker command manually.

#### Run API

Starts the DB and the API:

```sh
./scripts/up_dev.sh
```

#### Watch API (development mode)

Starts the DB and the API in Watch mode:

```sh
./scripts/watch_dev.sh
```

When docker run in mode watch, logs are hidden, it's possible to access them running the next script in a new terminal:

```sh
./scripts/logs_dev.sh
```

#### Run tests

```sh
./scripts/up_test.sh
```

### With Docker

As alternative, can be run using Docker compose directly, instead of the custom scripts.

#### API

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

### Run DB with Docker and API with Node

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

Running the DB (in postgres or locally) its the first step, the second step is filling the DB with the needed structure, for that, we use migrations which contains the tables and columns we need on the application.

Also, if wanted, there are also seeds that loads small pre-defined data to start working on. To run the seeds, it's needed to add the `DATABASE_RUN_SEEDS=true` variable in the .env file.

To run the migrations, fill the .env with the data to connect to the database, then run:

```bash
npm run typeorm:migrate
```

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

```bash
docker compose up postgres_test
```

Then run the tests:

```bash
npm run test:e2e
```

> [!NOTE]
> Remember to fill the DB credentials in the .envs.

## Areas to improve

- Role is currently in a gray-area between hardcoded in the code, and dynamic in the DB, it could scale to use roles directly from DB, without hardcode code, by adding a new database to link permissions to roles and make our system work in base of permissions, that way admins could create roles without touching code.
- User <-> Roles relation is a many to many relation, instead it could be added a table in the middle to handle some metadata like "Who assigned the role to the user", "When the user became admin", etc.
- Attributes does not supports enum, lists, options, multiple values, and does not distinguish between required, not required, or have default values. This is something that we could scale to improve the flexibility of the attributes a lot.
- Events does not have a way to recover from fail. We could have added a more robust event systems with retry, logs, and better error handling.

## Technologies

- Nest
- Node
- TypeORM
- PostgresSQL

## Decisions made

- Clean Architecture: To be able to handle further changes in the future in a proper way.
- Docker: To make it portable.
- Jest/Testing/E2E: Jest is the most used testing framework. E2E testing was done because in this case testing all features together is more convenient that testing every single part of the application, allowing us to test how the strategies integrates with services properly depending of the payload passed to the controller.
- Removed hardcoded attributes from code to make them more flexibles, now users can create a category and define the attributes for that category in specific, then the product will inherit the attributes of the category and user can fill them.
- Changed the way the seeds were created to have historical seeds that are consistent with the migrations.
- Migrated the whole application to new version of libraries to fix most of the vulnerabilities present in the code.

## Routes

- Local: [API Swagger](http://localhost:3000/api)

## Env Vars

1. DB environment variables: Fill it with the details of the postgres db, if postgres is running on Docker, then copy and paste the values from docker-compose.
2. JWT_SECRET: This is the value used for encrypt and decrypt the JWT tokens. Any value can be used here, however it's good practice to use a strong password difficult to break, like a hash. There are some online tools that generates secure hash for this purpose, like [jwt secret key generator](https://jwtsecretkeygenerator.com/).
3. Email Services: It's actually integrated with [resend](https://resend.com/), so it's possible to use it with the actual resend API to send emails. In that case, it's needed to fill `EMAIL_API_URL` with the value `https://api.resend.com`, `EMAIL_API_KEY` with the resend's API KEY and `FROM_EMAIL` with the email registered in resend (it's `onboarding@resend.dev` in the case there is not any registered email). If we want to run the APP without using the real resend integration, just fill the details with random values. (Email templates and notifications via channel email will not work properly).
4. Notifications Providers: Just fill it with random values as they are not real APIs.
