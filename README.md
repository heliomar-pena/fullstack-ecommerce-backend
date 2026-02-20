# Nest Ecommerce

## Problematic

The original repository contains the codebase needed for a microservice that works as backoffice or admin panel for a e-commerce. It contains all the features needed for creating products, users, enable products, etc.

However, there are some things that could be improved from the repository before thinking about moving to production, here are some of the suggerences I think could help to make this project more maintainable

I decided to categorize them from highest to lowest priority, based on how they impact in the product and in the code.

### High

#### Authentication

All routes are public by default, which could possibly cause errors in future if someone forgive to protect a route. We could reverse the logic and protect all routes by default, then specify if a route will be public, or what roles are needed to visit it.

Beside of that, we could implement passport, betterauth, or any library for handling the authentication logic. These auth libraries allows scaling adding multiple login strategies, like password, gmail, etc.

#### Vulnerabilities

As this project is old and has been unmaintained by a long time, it's important to highlight the vulnerabilities that has been reported during this 3 years from the last update of the project.

It's common to add a bot to execute a soft `npm audit fix` automatically and avoid project to accumulate vulnerabilities with the time. However, in this case we have lot of dependencies that are out of date, so the better way to fix all the vulnerabilities could be doing an upgrade of the versions of all the dependencies.

This way, we'll have a repository clean of reported vulnerabilities.

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

### Architecture

Current architecture is perfect for most of the projects, but as we are working on a e-commerce and we are thinking on adding Event Driven Development, we could think on implement Domain Driven Development which makes a perfect combination with EDD to make the project robust and maintainable.

This is considered low impact to me as current architecture could also work with this kind of project.

### Documentation

Currently the project is using Postman for documentate the API, instead of using, for example, the swagger module provided by nest. Swagger module will save a lot of time to developers as it will be updated with the code without making extra effort. This will make documentation easy to update.
