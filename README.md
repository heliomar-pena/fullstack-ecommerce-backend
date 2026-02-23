# Nest Ecommerce

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/heliomar-pena/fullstack-ecommerce-backend/tree/dev)
[![Coverage Status](https://coveralls.io/repos/github/heliomar-pena/fullstack-ecommerce-backend/badge.svg?branch=dev)](https://coveralls.io/github/heliomar-pena/fullstack-ecommerce-backend?branch=dev)

The goal of this challenge is to evolve the current system (catalog and inventory) into an event-driven model, first resolving the structural problems, and then exposing that flow to a simple React frontend.

## Public Links

- [Swagger](http://not-link-yet.com)
- [FrontEnd](http://not-link-yet.com)

## Table of Content

- [Nest Ecommerce](#nest-ecommerce)
  - [Public Links](#public-links)
  - [Table of Content](#table-of-content)
  - [Diagnosis and possible improvements](#diagnosis-and-possible-improvements)
    - [High](#high)
      - [Authentication](#authentication)
      - [Vulnerabilities](#vulnerabilities)
      - [JWT Token](#jwt-token)
      - [Environment variables](#environment-variables)
      - [Seeds](#seeds)
      - [Single Responsibility principle is not followed](#single-responsibility-principle-is-not-followed)
    - [Medium](#medium)
      - [Errors](#errors)
      - [Local and CI/CD Pipeline](#local-and-cicd-pipeline)
    - [Low](#low)
      - [Architecture](#architecture)
      - [Documentation](#documentation)
      - [Unpatched vulnerabilities](#unpatched-vulnerabilities)
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

## Diagnosis and possible improvements

The original repository contains the codebase needed for a microservice that works as backoffice or admin panel for a e-commerce. It contains all the features needed for creating products, users, enable products, etc.

However, there are some things that could be improved from the repository before continuing evolving it. Here are some of the suggerences I think could help to make this project more maintainable

Decided to categorize them from highest to lowest priority, based on how they impact in the product and in the code.

### High

#### Authentication

All routes are public by default, which could possibly cause errors in future if someone forgive to protect a route. We could reverse the logic and protect all routes by default, then specify if a route will be public, or what roles are needed to visit it.

Beside of that, we could implement passport, betterauth, or any library for handling the authentication logic. These auth libraries allows scaling adding multiple login strategies, like password, gmail, etc.

#### Vulnerabilities

As this project is old and has been unmaintained by a long time, it's important to highlight the vulnerabilities that has been reported during this 3 years from the last update of the project.

It's common to add a bot to execute a soft `npm audit fix` automatically and avoid project to accumulate vulnerabilities with the time. However, in this case we have lot of dependencies that are out of date, so the better way to fix all the vulnerabilities could be doing an upgrade of the versions of all the dependencies.

This way, we'll have a repository clean of reported vulnerabilities.

#### JWT Token

It's not recommendable to save PII (Personally Identifiable Information) inside of JWT tokens, as can be: email, username, etc. Since this information is available for anyone with the token, giving tools to hackers to prepare its next phishing attack with the information we are giving to them.

To improve this, will remove any PII information from the JWT token and keep only the User ID.

Also, JWT Service is repeating values that are already defined in the Module, we can omit default values defined in module.

#### Environment variables

Environment variables are being saved inside of the `src` of the project, this is unusual and could cause errors, because they could be exposed on final bundle or end in any Docker image. Beside of that, it looks hard to overwrite the .envs defined there, as the logic for importing `envs` tries to use the environment variables from the env folder, so if we add a .env.development.local file it will not be used by the application.

In fact, found in nest-cli.json that it's actually adding the .env files to the final bundle, which is potentially risky.

> Old code:
>
> ```js
>   "compilerOptions": {
>    "assets": ["common/envs/*"]
>  }
> ```

For improving environment variables, I will use the bundled config service that Nest have, and use the default paths for environment variables that is outside of the `src/` folder.

#### Seeds

Seeds are currently using a custom logic to seed the DB, the problem with the custom code decision is that it's not possible to versioning the seeds, so probably the seeds will work only with the last migration file, making a rollback difficult.

Instead, seeds must be sorted by creation date, the same that the migrations, that way every migration could have a seed adapting the data from the OLD DB structure to the new one. And must have the option to skip seeds (for production, for example).

For this, we could use the same migration scripts given by typeorm for creating and running the seeds.

#### Single Responsibility principle is not followed

Currently we have two layers: Controllers and Services, the Service layer contains the bussiness logic + persistence logic, that means that if we change our ORM from TypeORM, we will need to refactor all our services. Beside of that, there are some examples like in UsersService where we have a method ONLY for saving a user, which should not be responsibility of the service.

Also, we can see on roles that the user domain is modified inside roles domain.

### Medium

#### Errors

The current error filters is great, it keeps a consistency response even when the request failed. Same with the success response filter. However, probably we could make some improvements in the errors list that we have defined in the commons folder.

There are some minor typos in errors file that could been cleaned up before moving to production. Beside of that, this structure of having all the errors inside a big object can be difficult to handle in the future:

1. Difficult to check if there are repeated error codes
2. Errors that are not in use anymore (for example if we remove a domain but forgot to remove the error)
3. Errors with incorrect code status (for example, User not found -> HTTP Status 500)

In order to improve those points, I'd recommend to create error instances instead of a general file of error codes, that way every domain could have its own errors, and when an error is thrown they will have the correct HTTP code.

#### Local and CI/CD Pipeline

Currently there is a leak of pipelines in the project, which could lead to inconsistencies in the code and broken tests.

We have installed and configured eslint, prettier and even have some test cases, but nothing prevents me from commiting and pushing code with Test, Eslint or Prettier errors.

To improve this and keep a good code quality, we could consider including husky locally for running eslint, prettier and tests on commits or push, and adding verification in pipeline. We can also add extra safety adding coverage verification.

### Low

#### Architecture

Current architecture is perfect for most of the projects, but as we are working on a e-commerce and we are thinking on adding Event Driven Development, we could think on implement Domain Driven Development which makes a perfect combination with EDD to make the project robust and maintainable.

This is considered low impact to me as current architecture could also work with this kind of project.

#### Documentation

Currently the project is using Postman for documentate the API, instead of using, for example, the swagger module provided by nest. Swagger module will save a lot of time to developers as it will be updated with the code without making extra effort. This will make documentation easy to update.

#### Unpatched vulnerabilities

There are some vulnerabilities reported on eslint recently, which doesn't have been patched yet, related to certain outdated dependencies as Ajv and Minimatch. There is a [Pull Request](https://github.com/eslint/eslint/pull/20523) at this moment fixing this, so the better solution is just wait, because Ajv contains some breaking changes from the latest version to the one that is used in eslint and it's not possible to fix easily.

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
