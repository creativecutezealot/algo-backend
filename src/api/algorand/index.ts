export default (app) => {
  
  app.get(
    `/tenant/:tenantId/algorand/overview`,
    require('./algorandOverview').default,
  );

  app.put(
    `/tenant/:tenantId/algorand/favorite/:assetId`,
    require('./algorandFavorite').default,
  );

  app.put(
    `/tenant/:tenantId/algorand/showcase/:assetId`,
    require('./algorandShowcase').default,
  );

  app.get(
    `/tenant/:tenantId/algorand/favorites`,
    require('./algorandFavoriteList').default,
  );

  app.get(
    `/tenant/:tenantId/algorand/assets`,
    require('./algorandAssetList').default,
  );

  app.get(
    `/tenant/:tenantId/algorand/pools`,
    require('./algorandPoolList').default,
  );

  app.get(
    `/tenant/:tenantId/algorand/asset/:assetId`,
    require('./algorandAsset').default,
  );

  app.get(
    `/tenant/:tenantId/algorand/pool/:address`,
    require('./algorandPool').default,
  );

  app.get(
    `/last-updated-time`,
    require('./algorandLastUpdate').default,
  );

  app.put(
    `/tenant/:tenantId/algorand/asset/:assetId`,
    require('./algorandAssetUpdate').default,
  );
};
