import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { UserFactory } from '../user/user.factory';
import { AuthHelper } from '../auth/auth.helper';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from 'src/auth/auth.config';
import { UserModule } from 'src/user/user.module';
import { RoleIds } from 'src/role/enum/role.enum';
import { CategoryFactory } from '../category/category.factory';
import { CategoryModule } from 'src/category/category.module';
import { ProductFactory } from './product.factory';
import { Product } from 'src/product/entities/product.entity';
import { ProductModule } from 'src/product/product.module';
import { AttributeFactory } from '../attribute/attribute.factory';
import { AttributeModule } from 'src/attribute/attribute.module';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import {
  Attribute,
  AttributeType,
} from 'src/attribute/entities/attribute.entity';

describe('ProductController (e2e)', () => {
  let app: INestApplication<App>;
  let userFactory: UserFactory;
  let authHelper: AuthHelper;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let attributeFactory: AttributeFactory;
  let email: string;
  let password: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UserModule,
        CategoryModule,
        ProductModule,
        AttributeModule,
        ConfigModule.forFeature(authConfig),
      ],
      providers: [
        UserFactory,
        CategoryFactory,
        AttributeFactory,
        ProductFactory,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userFactory = app.get(UserFactory);
    categoryFactory = app.get(CategoryFactory);
    productFactory = app.get(ProductFactory);
    attributeFactory = app.get(AttributeFactory);
    authHelper = new AuthHelper(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When user is logged in', () => {
    let accessToken: string;
    let merchant: User;

    beforeEach(async () => {
      email = 'merchant@example.com';
      password = 'password123';

      merchant = await userFactory.create(
        {
          email,
          password,
        },
        [RoleIds.Merchant],
      );

      accessToken = await authHelper
        .login(email, password)
        .then((response) => response.accessToken);
    });

    describe('And creates a product', () => {
      let product: Product;
      let response: Response;

      describe('With a valid category', () => {
        let category: Category;
        let attributes: Attribute[];
        let attributeTemplate: {
          name: string;
          type: AttributeType;
          unit?: string;
          value: string | number | boolean;
        }[];

        beforeEach(async () => {
          attributeTemplate = [
            {
              name: 'Color',
              type: AttributeType.STRING,
              value: 'Red',
            },
            {
              name: 'Size',
              type: AttributeType.STRING,
              value: 'Large',
            },
            {
              name: 'Weight',
              type: AttributeType.NUMBER,
              unit: 'cm',
              value: 1000,
            },
            {
              name: 'Waterproof',
              type: AttributeType.BOOLEAN,
              value: true,
            },
          ];

          attributes = await Promise.all(
            attributeTemplate.map((attr) => attributeFactory.create(attr)),
          );
          category = await categoryFactory.create({
            attributes,
            name: 'Electronics',
          });

          product = productFactory.build(category, merchant, {
            title: 'Test Product',
          });

          response = await request(app.getHttpServer())
            .post('/product')
            .set(authHelper.authHeader(accessToken))
            .send({
              categoryId: product.categoryId,
              title: product.title,
              code: product.code,
              description: product.description,
            });

          product.id = (response.body as { id: number }).id;
        });

        it('POST: /product should return 201 Created', () => {
          expect(response.status).toBe(201);
        });

        describe('When user get one product by id', () => {
          let response: Response;

          beforeEach(async () => {
            response = await request(app.getHttpServer())
              .get(`/product/${product.id}`)
              .set(authHelper.authHeader(accessToken));
          });

          it('GET: /product/{:id} should return the product by id', () => {
            expect(response.status).toBe(200);
          });

          it('GET: /product/{:id} should return the product with category and attributes', () => {
            expect(response.body).toStrictEqual(
              expect.objectContaining({
                title: product.title,
                code: product.code,
                description: product.description,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                category: expect.objectContaining({
                  name: product.category.name,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  attributes: expect.arrayContaining(
                    category.attributes.map((attr) =>
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                      expect.objectContaining({
                        id: attr.id,
                        name: attr.name,
                        type: attr.type,
                        unit: attr.unit ?? null,
                      }),
                    ),
                  ),
                }),
                attributes: [],
              }),
            );
          });
        });

        describe("And user updates that product's attributes", () => {
          let productAttributesValue: Record<string, string | number | boolean>;
          let updateAttributeResponse: Response;
          describe('With valid attributes', () => {
            beforeEach(async () => {
              productAttributesValue = attributeTemplate.reduce(
                (acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                },
                {} as Record<string, string | number | boolean>,
              );

              updateAttributeResponse = await request(app.getHttpServer())
                .patch(`/product/${product.id}/attributes`)
                .set(authHelper.authHeader(accessToken))
                .send(productAttributesValue)
                .expect(200);
            });

            it('PATCH: /product/{:id}/attributes should return 200', () => {
              expect(updateAttributeResponse.status).toBe(200);
            });

            it('PATCH: /product/{:id}/attributes should update attributes and reflect changes', async () => {
              const response = await request(app.getHttpServer())
                .get(`/product/${product.id}`)
                .set(authHelper.authHeader(accessToken))
                .expect(200);

              expect(response.body).toStrictEqual(
                expect.objectContaining({
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  attributes: expect.arrayContaining(
                    Object.keys(productAttributesValue).map((key) =>
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                      expect.objectContaining({
                        value: productAttributesValue[key].toString(),
                      }),
                    ),
                  ),
                }),
              );
            });

            describe('And deletes the product', () => {
              let response: Response;
              beforeEach(async () => {
                response = await request(app.getHttpServer())
                  .delete(`/product/${product.id}`)
                  .set(authHelper.authHeader(accessToken));
              });

              it('DELETE: /product/{:id} should return 200', () => {
                expect(response.status).toStrictEqual(200);
              });
            });

            describe('And user activates the product', () => {
              it('POST: /product/{:id}/activate should return 200', async () => {
                await request(app.getHttpServer())
                  .post(`/product/${product.id}/activate`)
                  .set(authHelper.authHeader(accessToken))
                  .expect(201);
              });
            });
          });

          describe('With one attribute that does not exists', () => {
            it('PATCH: /product/{:id}/attributes should return 400 Bad Request', async () => {
              const response = await request(app.getHttpServer())
                .patch(`/product/${product.id}/attributes`)
                .set(authHelper.authHeader(accessToken))
                .send({
                  [attributeTemplate[0].name]: attributeTemplate[0].value,
                  randomAttribute: 'false',
                })
                .expect(400);
              expect(response.body).toStrictEqual({
                error: 'Bad Request',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                message: expect.stringContaining('Invalid attributes'),
                statusCode: 400,
              });
            });
          });

          describe('With partial attributes', () => {
            it('PATCH: /product/{:id}/attributes should return 400 Bad Request', async () => {
              await request(app.getHttpServer())
                .patch(`/product/${product.id}/attributes`)
                .set(authHelper.authHeader(accessToken))
                .send({
                  [attributeTemplate[0].name]: attributeTemplate[0].value,
                })
                .expect(200);
            });
          });
        });
      });
    });

    describe('With an invalid category', () => {
      let product: Product;

      beforeEach(() => {
        product = productFactory.build({ id: 99999 } as Category, merchant, {
          title: 'Test Product',
        });
      });

      it('POST: /product should return 400 Bad Request if category does not exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/product')
          .set(authHelper.authHeader(accessToken))
          .send({
            categoryId: product.categoryId,
            title: product.title,
            code: product.code,
            description: product.description,
          });
        expect(response.status).toBe(400);
      });
    });

    describe('And list all products', () => {
      it('GET: should return 200 with empty list when no products', async () => {
        const response = await request(app.getHttpServer())
          .get('/product')
          .set(authHelper.authHeader(accessToken));
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      it('GET: should return 200 with list of products', async () => {
        const attributes = await attributeFactory.createMany(4);
        const category = await categoryFactory.create({ attributes });
        const products = await productFactory.createMany(3, {
          category,
          merchant,
        });

        const response = await request(app.getHttpServer())
          .get('/product')
          .set(authHelper.authHeader(accessToken));
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
        expect(response.body).toEqual(
          expect.arrayContaining(
            products.map((product) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              expect.objectContaining({ id: product.id, title: product.title }),
            ),
          ),
        );
      });
    });
  });
});
