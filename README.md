# NestJS PG Notify

NestJS custom transport strategy for PostgreSQL Pub/Sub.

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](./LICENSE)
![](https://img.shields.io/npm/v/nestjs-pg-notify.svg)

## Postgres async notifications

PostgreSQL can be used as Pub/Sub message broker.
The functionality is similar to the Redis Pub/Sub, but has its own features and limitations.
The [References](#References) section contains links that may be useful to familiarize 
with the PostgreSQL asynchronous notification model.

## Custom transporter

**NestJS PG Notify** implements publish/subscribe messaging paradigm using PostgreSQL as a transporter. 
It can be used in [microservice](https://docs.nestjs.com/microservices/basics) and [hybrid](https://docs.nestjs.com/faq/hybrid-application) 
NestJS applications. The [example](./example) folder contains examples for both types of applications.

## Installation

```bash
$ npm install nestjs-pg-notify
```

## Roadmap

**Version 1.0.0**
- [ ] Detailed README
- [x] Usage examples
- [ ] Tests & coverage
- [ ] GitHub actions

## References

1. [PostgreSQL Documentation: Asynchronous Notification](https://www.postgresql.org/docs/9.1/libpq-notify.html)
2. [PgBouncer does not support NOTIFY/LISTEN commands in transaction pool mode](https://www.pgbouncer.org/features.html)
3. [NestJS Documentation: Microservices](https://docs.nestjs.com/microservices/basics)
4. [NestJS Documentation: Hybrid applications](https://docs.nestjs.com/faq/hybrid-application)