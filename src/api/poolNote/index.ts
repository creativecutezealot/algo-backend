export default (app) => {
  app.post(
    `/tenant/:tenantId/poolnote`,
    require('./noteCreate').default,
  );
  app.get(
    `/tenant/:tenantId/poolnote/pool/:poolId`,
    require('./noteList').default,
  );
  app.put(
    `/tenant/:tenantId/poolnote/edit`,
    require('./noteEdit').default,
  );
  app.delete(
    `/tenant/:tenantId/poolnote/:id`,
    require('./noteDelete').default,
  );
};
