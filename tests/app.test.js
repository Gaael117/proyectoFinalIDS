const request = require('supertest');
const app = require('../src/app');

describe('Pruebas del Sistema AliRed - Cobertura Completa', () => {
  let adminToken = '';
  let donanteToken = '';
  let beneficiarioToken = '';

  it('1. Debe responder con status 200 en la ruta raíz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('AliRed');
  });

  it('2. Debe registrar un usuario Administrador', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'admin',
      password: 'password123',
      role: 'administrador'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('administrador');
  });

  it('3. Debe registrar una Empresa Donante por defecto', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'donante1',
      password: 'password123'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('empresa_donante');
  });

  it('4. Debe fallar el registro con datos incompletos o rol inválido', async () => {
    const res1 = await request(app).post('/auth/register').send({ username: 'test' });
    expect(res1.statusCode).toBe(400);

    const res2 = await request(app).post('/auth/register').send({
      username: 'test2',
      password: '123',
      role: 'rol_invalido'
    });
    expect(res2.statusCode).toBe(400);

    const res3 = await request(app).post('/auth/register').send({
      username: 'admin',
      password: '123'
    });
    expect(res3.statusCode).toBe(400);
  });

  it('5. Debe permitir login y generar token con rol', async () => {
    const resAdmin = await request(app).post('/auth/login').send({
      username: 'admin',
      password: 'password123'
    });
    expect(resAdmin.statusCode).toBe(200);
    expect(resAdmin.body).toHaveProperty('token');
    adminToken = resAdmin.body.token;

    const resDonante = await request(app).post('/auth/login').send({
      username: 'donante1',
      password: 'password123'
    });
    expect(resDonante.statusCode).toBe(200);
    donanteToken = resDonante.body.token;
  });

  it('6. Debe rechazar login con credenciales incorrectas', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'admin',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('7. Acceso a rutas protegidas por roles', async () => {
    const resAdmin = await request(app).get('/admin').set('Authorization', `Bearer ${adminToken}`);
    expect(resAdmin.statusCode).toBe(200);

    const resForbidden = await request(app).get('/admin').set('Authorization', `Bearer ${donanteToken}`);
    expect(resForbidden.statusCode).toBe(403);

    const resUnauthorized = await request(app).get('/admin');
    expect(resUnauthorized.statusCode).toBe(401);

    const resInvalidToken = await request(app).get('/admin').set('Authorization', 'Bearer token_invalido');
    expect(resInvalidToken.statusCode).toBe(403);
  });

  it('8. Módulo de Donaciones (Creación y Consulta)', async () => {
    const resCreate = await request(app)
      .post('/donations')
      .set('Authorization', `Bearer ${donanteToken}`)
      .send({ recurso: 'Arroz 50kg', cantidad: 10 });
    expect(resCreate.statusCode).toBe(201);

    const resIncomplete = await request(app)
      .post('/donations')
      .set('Authorization', `Bearer ${donanteToken}`)
      .send({ recurso: 'Frijol' });
    expect(resIncomplete.statusCode).toBe(400);

    const resList = await request(app)
      .get('/donations')
      .set('Authorization', `Bearer ${donanteToken}`);
    expect(resList.statusCode).toBe(200);
    expect(resList.body.donations.length).toBeGreaterThan(0);
  });
});