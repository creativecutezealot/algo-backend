import _ from 'lodash';
import moment from 'moment';
import { IRepositoryOptions } from './IRepositoryOptions';
import SequelizeRepository from './sequelizeRepository';

const ALGO_ASSET_ID = 0;

const makeOHLC = (arr, prev: any = null) => {
  let open = arr[0];
  if (prev) {
    open = prev[prev?.length - 1];
  }
  const sortedArr = _.sortBy(_.chain(arr).map((v) => v || 0).value());
  if (sortedArr.length === 1) return ({
    'open': sortedArr[0],
    'close': sortedArr[0],
    'high': sortedArr[0],
    'low': sortedArr[0],
  })
  else if (sortedArr.length === 2) {
    return ({
      'low': sortedArr[0],
      'open': open,
      'close': arr[1],
      'high': sortedArr[1],
    })
  }
  else if (sortedArr.length === 3) {
    return ({
      'low': sortedArr[0],
      'open': open,
      'close': arr[2],
      'high': sortedArr[2],
    })
  }
  else {
    return ({
      'low': sortedArr[0],
      'open': open,
      'close': arr[3],
      'high': sortedArr[3],
    });
  }
};

const makePairRates = (arr) => {
  let oneReserves: number[] = [];
  let twoReserves: number[] = [];

  _.forEach(arr, pair => {
    const [oneReserve, twoReserve] = [..._(_.split(pair, ','))];
    if (oneReserve === null || twoReserve === null || +oneReserve === 0 || +twoReserve === 0) {
      oneReserves.push(0.0);
      twoReserves.push(0.0);
    }
    else {
      oneReserves.push(twoReserve / oneReserve);
      twoReserves.push(oneReserve / twoReserve);
    }
  });

  return [makeOHLC(oneReserves), makeOHLC(twoReserves)];
}


export default class AlgorandRepository {

  // static async getStatistics(
  //   options: IRepositoryOptions,
  // ) {
  //   const {sequelize} = options.database;

  //   const from = moment().subtract(365, 'days').format('YYYY-MM-DD');
  //   const to = moment().format('YYYY-MM-DD');

  //   const daily_stats_statement = `select distinct on (date_trunc('day', "createdDate")) "totalLiquidity", "lastDayVolume", ` +
  //     `date("createdDate") as "createdDate" from "algoHistory" where date_trunc('day', "createdDate") in ` + 
  //     `(SELECT (generate_series('${from}', '${to}', '1 day'::interval))::DATE)`;
  //   const dailyData = await sequelize.query(daily_stats_statement, { type: sequelize.QueryTypes.SELECT });

  //   const weekly_stats_statement = `select sum("lastDayVolume") as "lastWeekVolume", date(date_trunc('week', "createdDate"::date)) as "week" ` +
  //     `from "algoHistory" where id in (select distinct on (date_trunc('day', "createdDate")) id from "algoHistory" ` +
  //     `where date_trunc('day', "createdDate") in (select (generate_series('${from}', '${to}', '1 day'::interval))::date)) group by "week" order by "week"`;
  //   const weeklyData = await sequelize.query(weekly_stats_statement, { type: sequelize.QueryTypes.SELECT });

  //   const top_assets_statement = `select * from "algoAssetHistory" where id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` + `
  //     order by "createdDate" desc limit 1) order by id limit 10;`;
  //   const topAssets = await sequelize.query(top_assets_statement, { type: sequelize.QueryTypes.SELECT });

  //   const top_pools_statement = `select * from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where ` +
  //     `"assetOneUnitName"='USDC' and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1) order by id limit 10;`;
  //   const topPools = await sequelize.query(top_pools_statement, { type: sequelize.QueryTypes.SELECT });

  //   return { dailyData, weeklyData, topAssets, topPools };
  // }

  static async getFavoritesAndShowcase(
    options: IRepositoryOptions,
    type
  ) {
    const { sequelize } = options.database;
    const currentUser = options.currentUser;

    let statement = `select(select(select array_agg("assetId") as "favoriteIds" from "algoAssetHistory" where ` +
      `(id >= (select id from "algoAssetHistory" where "unitName"='ALGO' order by "createdDate" desc limit 1)) ` +
      `and ("assetId" in (select "assetId" from "algoFavorites" where ${Number(type) === 1 ? `"userId"='${currentUser.id}' and "type"=${type}` : `"type"=${type}`})))), 
      (select "assetId" from "algoShowcases" where "userId"='${currentUser.id}' and "type"=${type}) as "assetId"`;
    let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const favoriteIds = result.length > 0 ? (result[0].favoriteIds || []) : [];
    const showcaseAssetId = result.length > 0 ? (result[0].assetId || ALGO_ASSET_ID) : ALGO_ASSET_ID;

    statement = `select * from "algoAssetHistory" where "assetId"='${showcaseAssetId}' order by "createdDate" desc`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const showcase = result[0];

    return { favoriteIds, showcase }
  }

  static async getOverview(
    options: IRepositoryOptions,
    {
      favoriteFilter,
      assetFilter,
      poolFilter,
      type
    },
  ) {
    const { sequelize } = options.database;
    const currentUser = options.currentUser;
    const from = moment().subtract(365, 'days').format('YYYY-MM-DD');
    const from1 = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const to = moment().format('YYYY-MM-DD');
    const currentTenant = options.currentTenant;
    // statement = `select distinct on (date_trunc('day', "createdDate")) "totalLiquidity", "lastDayVolume", ` +
    //   `date("createdDate") as "createdDate" from "algoHistory" where date_trunc('day', "createdDate") in ` + 
    //   `(SELECT (generate_series('${from}', '${to}', '1 day'::interval))::DATE)`;
    // const dailyData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    // statement = `select sum("lastDayVolume") as "lastWeekVolume", date(date_trunc('week', "createdDate"::date)) as "week" ` +
    //   `from "algoHistory" where id in (select distinct on (date_trunc('day', "createdDate")) id from "algoHistory" ` +
    //   `where date_trunc('day', "createdDate") in (select (generate_series('${from}', '${to}', '1 day'::interval))::date)) group by "week" order by "week"`;
    // const weeklyData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    let assets: any[] = [];
    let favorites: any[] = [];

    let statement = `select *, (select count("notes"."assetId") from "notes" where "notes"."assetId" = "algoAssetHistory"."assetId" and "notes"."deletedAt" isnull and "notes"."tenantId"='${currentUser.id}') as "noteCount" from "algoAssetHistory" where id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` +
      `order by "createdDate" desc limit 1) order by ${assetFilter.orderBy} limit ${assetFilter.limit} offset ${assetFilter.offset}`;
    // let statement = `select * from "algoAssetHistory" where "marketCap" >= '0' order by ${assetFilter.orderBy} limit ${assetFilter.limit} offset ${assetFilter.offset}`;
    let tempassets = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    tempassets = tempassets.map(async (asset) => {
      statement = `select count(*) from "algoAssetHistory" where "assetId" = ${asset.assetId} and "isVerified" = true`;
      let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", array_agg("price") as "prices" ` +
        `from "algoAssetHistory" where "assetId"='${asset.assetId}' and date_trunc('day', "createdDate") ` +
        `in (SELECT (generate_series('${from1}', '${to}', '1 day'::interval))) group by "date"`;
      let resultData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      const hourlyPrices = resultData.map((asset, index) => {
        const prev = index > 0 ? resultData[index - 1].prices : null;
        const { open, high, low, close } = makeOHLC(asset.prices, prev);
        return ({
          'timestamp': asset.date,
          open,
          high,
          low,
          close,
        });
      });
      asset.hourlyPrices = hourlyPrices;
      if (parseInt(result[0].count) > 0) {
        asset.isVerified = true;
      }
      return asset;
    });

    Promise.all(tempassets).then((results) => {
      assets = results;
    });

    statement = `select count(*) as count from "algoAssetHistory" where id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` +
      `order by "createdDate" desc limit 1)`;
    let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const assetCount = result.length > 0 ? result[0].count : 0;

    statement = `select *, *,(select count("poolNotes"."poolId") from "poolNotes" where "poolNotes"."poolId" = "algoPoolHistory"."id" and "poolNotes"."deletedAt" isnull and "poolNotes"."tenantId"='${currentTenant.id}') as "noteCount" from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where "assetOneUnitName"='USDC' and ` +
      `"assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1) ` +
      `order by ${poolFilter.orderBy} limit ${poolFilter.limit} offset ${poolFilter.offset}`;
    const pools = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select count(*) as count from "algoPoolHistory" where id >= (select id from "algoPoolHistory" ` +
      `where "assetOneUnitName"='USDC' and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1)`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const poolCount = result.length > 0 ? result[0].count : 0;

    statement = `select *, (select count("notes"."assetId") from "notes" where "notes"."assetId" = "algoAssetHistory"."assetId" and "notes"."deletedAt" isnull and "notes"."tenantId"='${currentUser.id}') as "noteCount" from "algoAssetHistory" where (id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` +
      `order by "createdDate" desc limit 1)) and ("assetId" in (select "assetId" from "algoFavorites" where ` +
      `${Number(type) === 1 ? `"userId"='${currentUser.id}' and "type"=${type}` : `"type"=${type}`} limit ${favoriteFilter.limit} offset ${favoriteFilter.offset})) order by ${favoriteFilter.orderBy}`;
    let tempfavorites = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    tempfavorites = tempfavorites.map(async (asset) => {
      statement = `select count(*) from "algoAssetHistory" where "assetId" = ${asset.assetId} and "isVerified" = true`;
      let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", array_agg("price") as "prices" ` +
        `from "algoAssetHistory" where "assetId"='${asset.assetId}' and date_trunc('day', "createdDate") ` +
        `in (SELECT (generate_series('${from1}', '${to}', '1 day'::interval))) group by "date"`;
      let resultData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      const hourlyPrices = await resultData.map((asset, index) => {
        const prev = index > 0 ? resultData[index - 1].prices : null;
        const { open, high, low, close } = makeOHLC(asset.prices, prev);
        return ({
          'timestamp': asset.date,
          open,
          high,
          low,
          close,
        });
      });
      asset.hourlyPrices = hourlyPrices;

      if (parseInt(result[0].count) > 0) {
        asset.isVerified = true;
      }
      return asset;
    });

    Promise.all(tempfavorites).then((results) => {
      favorites = results;
    });

    statement = `select count(*) as count from "algoAssetHistory" where ` +
      `(id >= (select id from "algoAssetHistory" where "unitName"='ALGO' order by "createdDate" desc limit 1)) ` +
      `and ("assetId" in (select "assetId" from "algoFavorites" where ${Number(type) === 1 ? `"userId"='${currentUser.id}' and "type"=${type}` : `"type"=${type}`}))`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const favoriteCount = result.length > 0 ? result[0].count : 0;

    statement = `select "assetId" from "algoShowcases" where "userId"='${currentUser.id}' and "type"=${type}`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const showcaseAssetId = result.length > 0 ? result[0].assetId : ALGO_ASSET_ID;

    statement = `select distinct on (date_trunc('hour', "createdDate")) "liquidity", "lastDayVolume", "marketCap", ` +
      `extract(epoch from date_trunc('hour', "createdDate")) as "date" ` +
      `from "algoAssetHistory" where "assetId"='${showcaseAssetId}' and date_trunc('hour', "createdDate") ` +
      `in (SELECT (generate_series('${from}', '${to}', '6 hours'::interval))::TIMESTAMP)`;

    const dailyData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", array_agg("price") as "prices" ` +
      `from "algoAssetHistory" where "assetId"='${showcaseAssetId}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${from}', '${to}', '1 day'::interval))) group by "date"`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const hourlyPrices = result.map((asset, index) => {
      const prev = index > 0 ? result[index - 1].prices : null;
      const { open, high, low, close } = makeOHLC(asset.prices, prev);
      return ({
        'timestamp': asset.date,
        open,
        high,
        low,
        close,
      });
    });

    const { favoriteIds, showcase } = await this.getFavoritesAndShowcase(options, type);
    let lastDayLiquidityChange = 100 * (dailyData[dailyData.length - 1]['liquidity'] - dailyData[dailyData.length - 2]['liquidity']) / dailyData[dailyData.length - 2]['liquidity'];
    let lastDayVolumeChange = 100 * (dailyData[dailyData.length - 1]['lastDayVolume'] - dailyData[dailyData.length - 2]['lastDayVolume']) / dailyData[dailyData.length - 2]['lastDayVolume'];

    showcase['lastDayLiquidityChange'] = lastDayLiquidityChange;
    showcase['lastDayVolumeChange'] = lastDayVolumeChange;

    return {
      hourlyPrices,
      dailyData,
      showcase,
      favoriteIds,
      favorites,
      assets,
      pools,
      favoriteCount,
      assetCount,
      poolCount,
    };
  }

  static async putFavorite(
    options: IRepositoryOptions,
    assetId,
    data
  ) {
    const currentUser = options.currentUser;
    const transaction = SequelizeRepository.getTransaction(options);

    const record = await options.database.algoFavorite.findOne(
      {
        where: {
          assetId,
          userId: currentUser.id,
          type: data.type
        },
        transaction,
      },
    );

    if (!record) {
      await options.database.algoFavorite.create(
        {
          assetId,
          userId: currentUser.id,
          type: data.type
        },
        {
          transaction,
        }
      )
    } else {
      await record.destroy({
        transaction,
      });
    }

    return { 'result': 'ok' };
  }

  static async putShowcase(
    options: IRepositoryOptions,
    assetId,
    data
  ) {
    const currentUser = options.currentUser;
    const transaction = SequelizeRepository.getTransaction(options);

    const record = await options.database.algoShowcase.findOne(
      {
        where: {
          userId: currentUser.id,
          type: data.type
        },
        transaction,
      },
    );

    if (record) {
      await record.destroy({
        transaction,
      });
    }

    await options.database.algoShowcase.create(
      {
        assetId,
        userId: currentUser.id,
        type: data.type
      },
      {
        transaction,
      }
    );

    return { 'result': 'ok' };
  }

  static async getFavoriteList(
    options: IRepositoryOptions,
    { orderBy, limit, offset, type }
  ) {
    const { sequelize } = options.database;
    const currentUser = options.currentUser;
    let rows: any[] = [];

    let statement = `select *, (select count("notes"."assetId") from "notes" where "notes"."assetId" = "algoAssetHistory"."assetId" and "notes"."deletedAt" isnull and "notes"."tenantId"='${currentUser.id}') as "noteCount" from "algoAssetHistory" where (id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` +
      `order by "createdDate" desc limit 1)) and ("assetId" in (select "assetId" from "algoFavorites" where ` +
      `${Number(type) === 1 ? `"userId"='${currentUser.id}' and "type"=${type}` : `"type"=${type}`} limit ${limit} offset ${offset})) order by ${orderBy}`;
    let tempassets = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    tempassets = tempassets.map(async (asset) => {
      statement = `select count(*) from "algoAssetHistory" where "assetId" = ${asset.assetId} and "isVerified" = true`;
      let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      if (parseInt(result[0].count) > 0) {
        asset.isVerified = true;
      }
      return asset;
    });

    Promise.all(tempassets).then((results) => {
      rows = results;
    });

    statement = `select count(*) as count from "algoAssetHistory" where ` +
      `(id >= (select id from "algoAssetHistory" where "unitName"='ALGO' order by "createdDate" desc limit 1)) ` +
      `and ("assetId" in (select "assetId" from "algoFavorites" where ${Number(type) === 1 ? `"userId"='${currentUser.id}' and "type"=${type}` : `"type"=${type}`}))`;
    const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const count = result.length > 0 ? result[0].count : 0;

    const { favoriteIds, showcase } = await this.getFavoritesAndShowcase(options, type);

    return { rows, count, favoriteIds, showcase };
  }

  static async getAssetList(
    options: IRepositoryOptions,
    { orderBy, limit, offset, type }
  ) {
    const { sequelize } = options.database;
    const currentUser = options.currentUser;
    let rows: any[] = [];

    let statement = `select *, (select count("notes"."assetId") from "notes" where "notes"."assetId" = "algoAssetHistory"."assetId" and "notes"."deletedAt" isnull and "notes"."tenantId"='${currentUser.id}') as "noteCount" from "algoAssetHistory" where id >= (select id from "algoAssetHistory" where "unitName"='ALGO' ` +
      `order by "createdDate" desc limit 1) order by ${orderBy} limit ${limit} offset ${offset}`;
    let tempassets = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    tempassets = tempassets.map(async (asset) => {
      statement = `select count(*) from "algoAssetHistory" where "assetId" = ${asset.assetId} and "isVerified" = true`;
      let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      if (parseInt(result[0].count) > 0) {
        asset.isVerified = true;
      }
      return asset
    });

    Promise.all(tempassets).then((results) => {
      rows = results;
    });

    statement = `select count(*) as count from "algoAssetHistory" where id >= (select id from "algoAssetHistory" ` +
      `where "unitName"='ALGO' order by "createdDate" desc limit 1)`;
    const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const count = result.length > 0 ? result[0].count : 0;

    const { favoriteIds, showcase } = await this.getFavoritesAndShowcase(options, type);

    return { rows, count, favoriteIds, showcase };
  }

  static async getPoolList(
    options: IRepositoryOptions,
    { orderBy, limit, offset }
  ) {
    const { sequelize } = options.database;
    const currentUser = options.currentUser;
    const currentTenant = options.currentTenant;
    let statement = `select *,(select count("poolNotes"."poolId") from "poolNotes" where "poolNotes"."poolId" = "algoPoolHistory"."id" and "poolNotes"."deletedAt" isnull and "poolNotes"."tenantId"='${currentTenant.id}') as "noteCount" from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where "assetOneUnitName"='USDC' ` +
      `and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1) order by ${orderBy} limit ${limit} offset ${offset}`;
    const rows = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select count(*) as count from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where ` +
      `"assetOneUnitName"='USDC' and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1)`;
    const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const count = result.length > 0 ? result[0].count : 0;

    return { rows, count };
  }

  static async getAsset(
    options: IRepositoryOptions,
    assetId,
    { orderBy, limit, offset }
  ) {
    const { sequelize } = options.database;

    const startDate = moment().subtract(365, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const startDateTime = moment().subtract(365, 'days').format('YYYY-MM-DD') + ` 08:00:00`;
    const endDateTime = moment().format('YYYY-MM-DD') + ` 08:00:00`;

    let statement = `select distinct on (date_trunc('day', "createdDate")) "liquidity", "lastDayVolume", "marketCap", ` +
      `extract(epoch from date_trunc('day', "createdDate")) as "date" ` +
      `from "algoAssetHistory" where "assetId"='${assetId}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))::DATE);`
    const dailyAssetData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select distinct on (date_trunc('hour', "createdDate")) "liquidity", "lastDayVolume", "marketCap", ` +
      `extract(epoch from date_trunc('hour', "createdDate")) as "date" ` +
      `from "algoAssetHistory" where "assetId"='${assetId}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))::DATE);`
    const hourlyAssetData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select date_trunc('hour', "createdDate") as "date", array_agg("price") as "prices" ` +
      `from "algoAssetHistory" where "assetId"='${assetId}' and date_trunc('hour', "createdDate") ` +
      `in (SELECT (generate_series('${startDateTime}', '${endDateTime}', '1 day'::interval))) group by "date"`;
    let result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const dailyPrices = result.map((asset, index) => {
      const prev = index > 0 ? result[index - 1].prices : null;
      const { open, high, low, close } = makeOHLC(asset.prices, prev);
      return ({
        'timestamp': asset.date,
        open,
        high,
        low,
        close,
      });
    });

    statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", array_agg("price") as "prices" ` +
      `from "algoAssetHistory" where "assetId"='${assetId}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))) group by "date"`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const hourlyPrices = result.map((asset, index) => {
      const prev = index > 0 ? result[index - 1].prices : null;
      const { open, high, low, close } = makeOHLC(asset.prices, prev);
      return ({
        'timestamp': asset.date,
        open,
        high,
        low,
        close,
      });
    });

    statement = `select * from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where` +
      `"assetOneUnitName"='USDC' and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1) and ` +
      `("assetOneId" = '${assetId}' or "assetTwoId"='${assetId}') order by ${orderBy} limit ${limit} offset ${offset}`;
    const pools = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    statement = `select count(*) from "algoPoolHistory" where id >= (select id from "algoPoolHistory" where` +
      `"assetOneUnitName"='USDC' and "assetTwoUnitName"='ALGO' order by "createdDate" desc limit 1) and ` +
      `("assetOneId" = '${assetId}' or "assetTwoId"='${assetId}')`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    const count = (result.length > 0) ? result[0].count : 0;

    statement = `select * from "algoAssetHistory" where "assetId"='${assetId}' ` +
      `order by "createdDate" desc limit 1`;
    result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    statement = `select count(*) from "algoAssetHistory" where "assetId" = ${assetId} and "isVerified" = true`;
    let verifiedAssets = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    if (parseInt(verifiedAssets[0].count) > 0 && result.length > 0) {
      result[0].isVerified = true;
    }
    let lastDayLiquidityChange = 100 * (dailyAssetData[dailyAssetData.length - 1]['liquidity'] - dailyAssetData[dailyAssetData.length - 2]['liquidity']) / dailyAssetData[dailyAssetData.length - 2]['liquidity'];
    let lastDayVolumeChange = 100 * (dailyAssetData[dailyAssetData.length - 1]['lastDayVolume'] - dailyAssetData[dailyAssetData.length - 2]['lastDayVolume']) / dailyAssetData[dailyAssetData.length - 2]['lastDayVolume'];
    const data = (result.length > 0) ? { ...result[0], lastDayLiquidityChange: lastDayLiquidityChange, lastDayVolumeChange: lastDayVolumeChange } : {};

    return { data, dailyAssetData, hourlyAssetData, dailyPrices, hourlyPrices, pools, count };
  }

  static async getPool(
    options: IRepositoryOptions,
    address,
  ) {
    const { sequelize } = options.database;

    const startDate = moment().subtract(365, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    const startDateTime = moment().subtract(365, 'days').format('YYYY-MM-DD') + ` 08:00:00`;
    const endDateTime = moment().format('YYYY-MM-DD') + ` 08:00:00`;

    let statement = `select distinct on (date_trunc('hour', "createdDate")) "liquidity", "lastDayVolume", ` +
      `extract(epoch from date_trunc('hour', "createdDate")) as "date" ` +
      `from "algoPoolHistory" where "address"='${address}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))::date);`
    const hourlyPoolData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select distinct on (date_trunc('day', "createdDate")) "liquidity", "lastDayVolume", ` +
      `extract(epoch from date_trunc('day', "createdDate")) as "date" ` +
      `from "algoPoolHistory" where "address"='${address}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))::date);`
    const dailyPoolData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    // statement = `select sum("lastDayVolume") as "lastWeekVolume", date(date_trunc('week', "createdDate"::date)) as "week" ` +
    //   `from "algoPoolHistory" where id in (select distinct on (date_trunc('day', "createdDate")) id from "algoPoolHistory" ` +
    //   `where date_trunc('day', "createdDate") in (select (generate_series('${startDate}', '${endDate}', '1 day'::interval))::date)) group by "week" order by "week"`;
    // const weeklyPoolData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select distinct on (date_trunc('day', "createdDate")) "liquidity", "lastWeekVolume", ` +
      `extract(epoch from date_trunc('day', "createdDate")) as "date" ` +
      `from "algoPoolHistory" where "address"='${address}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '7 day'::interval))::date);`
    const weeklyPoolData = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", ` +
      `array_agg(("assetOneReserves", "assetTwoReserves")) as "reservePairs" ` +
      `from "algoPoolHistory" where "address"='${address}' and date_trunc('hour', "createdDate") ` +
      `in (SELECT (generate_series('${startDateTime}', '${endDateTime}', '1 day'::interval))) group by "date"`;
    const dailyRatesResult = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    let dailyOneRates: any[] = [];
    let dailyTwoRates: any[] = [];
    dailyRatesResult.map(pool => {
      const [oneReserves, twoReserves] = makePairRates(pool.reservePairs);
      dailyOneRates.push({
        'timestamp': pool.date,
        ...oneReserves
      });
      dailyTwoRates.push({
        'timestamp': pool.date,
        ...twoReserves
      });
    });

    statement = `select extract(epoch from date_trunc('hour', "createdDate")) as "date", ` +
      `array_agg("assetOneReserves" || ',' || "assetTwoReserves") as "reservePairs" ` +
      `from "algoPoolHistory" where "address"='${address}' and date_trunc('day', "createdDate") ` +
      `in (SELECT (generate_series('${startDate}', '${endDate}', '1 day'::interval))) group by "date"`;
    const hourlyRatesResult = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });

    let hourlyOneRates: any[] = [];
    let hourlyTwoRates: any[] = [];
    hourlyRatesResult.map(pool => {
      const [oneReserves, twoReserves] = makePairRates(pool.reservePairs);
      hourlyOneRates.push({
        'timestamp': pool.date,
        ...oneReserves
      });
      hourlyTwoRates.push({
        'timestamp': pool.date,
        ...twoReserves
      });
    });

    statement = `select * from "algoPoolHistory" where "address"='${address}' order by "createdDate" desc limit 1`;
    const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
    let lastDayLiquidityChange = 100 * (dailyPoolData[dailyPoolData.length - 1]['liquidity'] - dailyPoolData[dailyPoolData.length - 2]['liquidity']) / dailyPoolData[dailyPoolData.length - 2]['liquidity'];
    let lastDayVolumeChange = 100 * (dailyPoolData[dailyPoolData.length - 1]['lastDayVolume'] - dailyPoolData[dailyPoolData.length - 2]['lastDayVolume']) / dailyPoolData[dailyPoolData.length - 2]['lastDayVolume'];
    let lastWeekVolumeChange = 100 * (weeklyPoolData[weeklyPoolData.length - 1]['lastWeekVolume'] - weeklyPoolData[weeklyPoolData.length - 2]['lastWeekVolume']) / weeklyPoolData[weeklyPoolData.length - 2]['lastWeekVolume'];
    const data = (result.length > 0) ? { ...result[0], lastDayLiquidityChange: lastDayLiquidityChange, lastDayVolumeChange: lastDayVolumeChange, lastWeekVolumeChange: lastWeekVolumeChange } : {};

    return { data, dailyPoolData, hourlyPoolData, dailyOneRates, dailyTwoRates, hourlyOneRates, hourlyTwoRates };
  }

  static async getLastUpdatedTime(
    options: IRepositoryOptions
  ) {
    const { sequelize } = options.database;

    try {
      let statement = `select "updatedTime" from "updateHistory" order by "updatedTime" desc limit 1`;
      const lastUpdatedTime = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      return { lastUpdatedTime };

    } catch (err) {
      console.log(err);

    }

  }

  static async updateAsset(assetId, data, options: IRepositoryOptions) {
    console.log('updateAsset2: ', assetId, data);
    const { sequelize } = options.database;
    try {
      let statement = `update "algoAssetHistory" set "isVerified"=${data.isVerified} where "assetId"=${assetId} returning "algoAssetHistory".*`;
      const updatedAsset = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
      return { updatedAsset };
    } catch (error) {
      console.log('updateAsset2 error: ', error);
    }
  }
}
