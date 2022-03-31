export default (app) => {
  app.get(
    `/tenant/:tenantId/change-log`,
    require('./changeLogList').default,
  );
  app.post(
    `/tenant/:tenantId/change-log`,
    require('./changeLogCreate').default,
  );
  app.delete(
    `/tenant/:tenantId/change-log`,
    require('./changeLogDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/change-log/:logId`,
    require('./changeLogGet').default,
  );
  app.put(
    `/tenant/:tenantId/change-log/:logId`,
    require('./changeLogEdit').default,
  );
};
