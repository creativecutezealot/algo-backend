export default (app) => {
  app.post(
    `/tenant/:tenantId/note`,
    require('./noteCreate').default,
  );
  app.get(
    `/tenant/:tenantId/note/asset/:assetId`,
    require('./noteList').default,
  );
  app.put(
    `/tenant/:tenantId/note/edit`,
    require('./noteEdit').default,
  );
  app.delete(
    `/tenant/:tenantId/note/:id`,
    require('./noteDelete').default,
  );
};
